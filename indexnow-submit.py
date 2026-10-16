#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 URL 提交给 IndexNow（Bing / Yandex / Seznam / Naver 等共用）。

用法：
    python indexnow-submit.py                       # 提交 sitemap.xml 里的全部 URL
    python indexnow-submit.py works.html about.html # 只提交指定页面（日常更新用这个）
    python indexnow-submit.py --dry-run             # 只列出将要提交的 URL，不发送

提交前必须先把本站部署到域名下，确保这个文件可访问：
    https://wiki.furry.beer/<KEY>.txt   （内容就是 KEY 本身）

注意：按官方建议，日常只提交“本次改动过的”页面，不要每次都推全站。
"""
import json
import os
import re
import sys
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
HOST = "wiki.furry.beer"
KEY = "49c3c07679354d2282bdd37c5ed20a44"
KEY_LOCATION = "https://%s/%s.txt" % (HOST, KEY)
ENDPOINT = "https://api.indexnow.org/indexnow"
# Cloudflare 会拦截 Python 默认 UA（直接返回 403），所以统一用浏览器 UA
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")


def load_sitemap_urls():
    xml = open(os.path.join(ROOT, "sitemap.xml"), encoding="utf-8").read()
    return [u.strip() for u in re.findall(r"<loc>([^<]+)</loc>", xml)]


def to_urls(args):
    """接受完整 URL 或站内相对路径（如 works.html / 编辑.html）。"""
    urls = []
    for a in args:
        if a.startswith("http"):
            urls.append(a)
        else:
            rel = a.lstrip("/")
            urls.append("https://%s/%s" % (HOST, urllib.parse.quote(rel)))
    return urls


def key_is_live():
    try:
        req = urllib.request.Request(KEY_LOCATION, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=15) as r:
            body = r.read().decode("utf-8", "replace").strip()
        return r.status == 200 and KEY in body
    except Exception as e:
        print("  密钥文件暂时不可访问：%s" % e)
        return False


def main():
    argv = [a for a in sys.argv[1:] if a != "--dry-run"]
    dry = "--dry-run" in sys.argv
    urls = to_urls(argv) if argv else load_sitemap_urls()
    print("待提交 %d 个 URL%s" % (len(urls), "（来自命令行）" if argv else "（来自 sitemap.xml）"))
    for u in urls:
        print("   ", u)

    if dry:
        print("\n[dry-run] 未发送任何请求。")
        return

    print("\n检查密钥文件:", KEY_LOCATION)
    if not key_is_live():
        print("""
密钥文件还不能访问，先不要提交。请确认：
  1. 站点已部署到 https://%s/
  2. 目录下存在 %s.txt，内容恰好是这段密钥：%s
部署完成后重新运行本脚本即可。""" % (HOST, KEY, KEY))
        sys.exit(1)

    payload = json.dumps({
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls,
    }).encode("utf-8")
    req = urllib.request.Request(
        ENDPOINT, data=payload,
        headers={"Content-Type": "application/json; charset=utf-8", "User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        print("提交完成，HTTP", r.status, "(200/202 表示成功接收)")
    print("已提交 %d 个 URL。" % len(urls))


if __name__ == "__main__":
    main()

