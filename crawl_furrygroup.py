# -*- coding: utf-8 -*-
"""
爬取 furrygroup.cn 全部群组详情
1. 抓首页 https://furrygroup.cn/ 提取所有 /group/<region>/<id> 链接
2. 对每个详情页提取: name, 群号, 规模, 地区, 描述, 来源
3. 按省分组写入 chat-data.js
"""
import os, re, json, time, random, ssl, urllib.request, urllib.error, html as htmllib

BASE_DIR = r'd:\新建文件夹 (7)'
OUT_JS = os.path.join(BASE_DIR, 'chat-data.js')
PROGRESS = os.path.join(BASE_DIR, 'crawl_chat_progress.json')

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Accept-Encoding': 'identity',
}

def fetch(url, retries=3):
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=20, context=SSL_CTX) as resp:
                return resp.read().decode('utf-8', errors='replace')
        except Exception as e:
            if i == retries - 1: raise
            time.sleep(2 * (i + 1))

# 1. 抓首页
print('=== 抓首页 ===')
home = fetch('https://furrygroup.cn/')
print(f'首页 {len(home)} 字节')

# 提取地区锚点顺序（#links-5 北京, #links-31 天津...）
anchor_re = re.compile(r'href="#links-(\d+)"[^>]*>([^<]+)</a>')
anchors = anchor_re.findall(home)
print(f'锚点数: {len(anchors)}')
anchor_order = {int(k): v.strip() for k, v in anchors}

# 提取所有 /group/<region>/<id> 链接
link_re = re.compile(r'href="(https?://furrygroup\.cn/group/([a-z]+)/(\d+)(?:\.html)?)"')
links = link_re.findall(home)
# 去重保序
seen = set()
uniq = []
for url, region, gid in links:
    if url in seen: continue
    seen.add(url)
    uniq.append((url, region, gid))
print(f'群组链接: {len(uniq)}')

# 找出每个链接所属地区锚点
# 首页结构: <h2 id="links-5">北京</h2> ... <a href="group/...">name</a> ... <h2 id="links-31">天津</h2> ...
# 用每个 group 链接在 home 中的位置，向前找最近的 id="links-X"
def find_region_for_link(home_html, link_url):
    idx = home_html.find(link_url)
    if idx < 0: return None
    # 向前找最近 id="links-N"
    m = None
    for m2 in re.finditer(r'id="links-(\d+)"', home_html[:idx]):
        m = m2
    if not m: return None
    return int(m.group(1))

group_entries = []
for url, region, gid in uniq:
    anchor_id = find_region_for_link(home, url)
    region_name = anchor_order.get(anchor_id, region)
    group_entries.append({'url': url, 'region': region, 'region_name': region_name, 'id': gid})
print(f'分组的群组: {len(group_entries)}')

# 2. 抓详情页
# 进度文件
done = {}
if os.path.exists(PROGRESS):
    try:
        with open(PROGRESS, 'r', encoding='utf-8') as f: done = json.load(f)
    except: done = {}

print(f'\n=== 抓详情页 (已完成 {len(done)}) ===')
total = len(group_entries)
for i, g in enumerate(group_entries, 1):
    if g['url'] in done:
        continue
    print(f'  [{i}/{total}] {g["region_name"]} - {g["url"]}')
    try:
        page = fetch(g['url'])
    except Exception as e:
        print(f'    ERROR: {e}')
        time.sleep(1)
        continue

    # 解析详情页
    # 标题: <h1>xxx</h1> 或 <title>xxx</title>
    name = None
    m = re.search(r'<h1[^>]*>([^<]+)</h1>', page)
    if not m:
        m = re.search(r'<title>([^<]+)</title>', page)
    if m:
        name = htmllib.unescape(m.group(1).strip())

    # 群号: 群号 906578915 或 群号：xxx 或 qq 群 xxx
    qh = None
    for pat in [r'群号[:：]?\s*(\d{5,12})', r'QQ群[:：]?\s*(\d{5,12})', r'qq群[:：]?\s*(\d{5,12})', r'群号\s*</[^>]+>\s*(\d{5,12})']:
        m2 = re.search(pat, page, re.IGNORECASE)
        if m2:
            qh = m2.group(1)
            break

    # 规模: 群规模 524人 / 524位成员
    size = None
    m2 = re.search(r'群规模[^<]*?(\d+)\s*(?:人|位成员)', page)
    if m2:
        size = int(m2.group(1))

    # 描述: 第一个非标题段落（去掉导航）
    desc = None
    # 取 <div class="content"> 或主体段
    # 简化: 找 <p>...</p>
    paras = re.findall(r'<p[^>]*>(.*?)</p>', page, re.DOTALL)
    clean = []
    for p in paras:
        t = re.sub(r'<[^>]+>', '', p).strip()
        t = htmllib.unescape(t)
        if t and len(t) > 20 and not t.startswith('群号') and '相关地区' not in t and '信息来源' not in t:
            clean.append(t)
    if clean:
        desc = clean[0][:300]

    # 地区（详情页里也有，以详情页为准）
    region_in_page = g['region_name']
    m2 = re.search(r'地区[^<]*?([一-鿿]{2,6})', page)
    if m2:
        region_in_page = m2.group(1)

    done[g['url']] = {
        'name': name,
        'qq': qh,
        'size': size,
        'region': region_in_page,
        'desc': desc,
        'url': g['url']
    }
    time.sleep(random.uniform(0.3, 0.6))

    if i % 10 == 0:
        with open(PROGRESS, 'w', encoding='utf-8') as f:
            json.dump(done, f, ensure_ascii=False)

with open(PROGRESS, 'w', encoding='utf-8') as f:
    json.dump(done, f, ensure_ascii=False)
print(f'\n抓取完成,共 {len(done)} 个群组')

# 3. 写入 chat-data.js
# 按省分组,排除空地区
provinces = {}
for url, info in done.items():
    r = info.get('region') or '其他'
    if r not in provinces:
        provinces[r] = []
    provinces[r].append(info)

# 按首页锚点顺序排序省份
province_order = list(anchor_order.values())
ordered = []
for p in province_order:
    if p in provinces:
        ordered.append(p)
for p in provinces:
    if p not in ordered:
        ordered.append(p)

data_obj = {
    'provinces_order': ordered,
    'provinces': {p: provinces.get(p, []) for p in ordered}
}
out = 'var CHAT_DATA = ' + json.dumps(data_obj, ensure_ascii=False, indent=2) + ';\n'
with open(OUT_JS, 'w', encoding='utf-8') as f:
    f.write(out)
print(f'写入 {OUT_JS}: {sum(len(v) for v in provinces.values())} 条')

# 统计
have_qq = sum(1 for v in done.values() if v.get('qq'))
have_size = sum(1 for v in done.values() if v.get('size'))
have_desc = sum(1 for v in done.values() if v.get('desc'))
print(f'  有群号: {have_qq}, 有规模: {have_size}, 有描述: {have_desc}')
print(f'  省份数: {len(provinces)}')
for p in ordered:
    print(f'    {p}: {len(provinces[p])}')
