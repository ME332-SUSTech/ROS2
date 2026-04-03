#!/usr/bin/env python3
"""
修复 docs.html 中被分割的导航链接
所有 <li class="docs-nav-item"> 应该在单独的行上
"""
import re
from pathlib import Path

docs_html = Path("/home/x/Xcode/ROS2/docs.html").read_text(encoding='utf-8')

# 找到所有被分割的导航项（包含多行的 <li class="docs-nav-item">）
# 匹配模式：<li class="docs-nav-item"><a...>...</a></li>（可能跨多行）
pattern = r'<li\s+class="docs-nav-item"><a[^>]*href="([^"]*)"[^>]*target="([^"]*)"[^>]*>([^<]*)</a></li>'

matches = list(re.finditer(pattern, docs_html, re.DOTALL))
print(f"找到 {len(matches)} 个导航项")

# 替换所有导航项，使用单行格式
def replace_nav_link(match):
    href = match.group(1)
    target = match.group(2)
    text = match.group(3)
    return f'                    <li class="docs-nav-item"><a href="{href}" target="{target}">{text}</a></li>'

fixed_html = re.sub(pattern, replace_nav_link, docs_html, flags=re.DOTALL)

# 保存修复后的文件
Path("/home/x/Xcode/ROS2/docs.html").write_text(fixed_html, encoding='utf-8')

print("✅ 已修复所有导航链接格式")
print("\n修复后的示例链接:")

# 显示修复后的前几个链接
nav_links = re.findall(r'<li class="docs-nav-item"><a href="([^"]*)" target="([^"]*)">([^<]*)</a></li>', fixed_html)
for href, target, text in nav_links[:3]:
    print(f"  href: {href}")
    print(f"  target: {target}")
    print(f"  text: {text}")
    print()
