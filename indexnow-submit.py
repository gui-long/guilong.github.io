#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 sitemap.xml 里的全部 URL 提交给 IndexNow（Bing / Yandex / Seznam / Naver 等共用）。

用法：
    python indexnow-submit.py            # 先检查密钥文件是否已上线，再提交
    python indexnow-submit.py --dry-run  # 只列出将要提交的 URL，不真正发送

提交前必须先把本站部署到域名下，确保这个文件可访问：
    https://wiki.furry.beer/<KEY>.txt   （内容就是 KEY 本身）
"""
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
HOST = "wiki.furry.beer"
KEY = "e2bbead797b1fa963a7b359c73e22ff5"
KEY_LOCATION = "https://%s/%s.txt" % (HOST, KEY)
ENDPOINT = "https://api.indexnow.org/indexnow"


def load_urls():
    xml = open(os.path.join(ROOT, "sitemap.xml"), encoding="utf-8").read()
    return [u.strip() for u in re.findall(r"<loc>([^<]+)</loc>", xml)]


def key_is_live():
    try:
        with urllib.request.urlopen(KEY_LOCATION, timeout=15) as r:
            body = r.read().decode("utf-8", "replace").strip()
        return r.status == 200 and KEY in body
    except Exception as e:
        print("  密钥文件暂时不可访问：%s" % e)
        return False


def main():
    dry = "--dry-run" in sys.argv
    urls = load_urls()
    print("sitemap 中共 %d 个 URL" % len(urls))
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
        headers={"Content-Type": "application/json; charset=utf-8"})
    with urllib.request.urlopen(req, timeout=30) as r:
        print("提交完成，HTTP", r.status, "(200/202 表示成功接收)")
    print("已提交 %d 个 URL。" % len(urls))


if __name__ == "__main__":
    main()
