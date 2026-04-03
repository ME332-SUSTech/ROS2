#!/usr/bin/env python3
"""
诊断 docs.html 链接和 iframe 配置
"""
import re
from pathlib import Path

docs_html = Path("/home/x/Xcode/ROS2/docs.html").read_text(encoding='utf-8')

# 检查 iframe 属性
iframe_match = re.search(r'<iframe[^>]*>', docs_html)
if iframe_match:
    iframe_tag = iframe_match.group(0)
    print("✅ iframe 标签:", iframe_tag)
    
    # 提取属性
    name_match = re.search(r'name="([^"]*)"', iframe_tag)
    id_match = re.search(r'id="([^"]*)"', iframe_tag)
    src_match = re.search(r'src="([^"]*)"', iframe_tag)
    
    if name_match:
        print(f"  - name: {name_match.group(1)}")
    if id_match:
        print(f"  - id: {id_match.group(1)}")
    if src_match:
        print(f"  - src: {src_match.group(1)}")

# 检查所有带 target="docs-frame" 的链接
nav_links = re.findall(r'<a[^>]*href="([^"]*)"[^>]*target="([^"]*)"[^>]*>([^<]*)</a>', docs_html)
print(f"\n✅ 找到 {len(nav_links)} 个带 target 属性的导航链接:")
print("  样本链接:")
for href, target, text in nav_links[:5]:
    print(f"    - href: {href}")
    print(f"      target: {target}")
    print(f"      text: {text.strip()}")

# 检查目标 target 值是否一致
target_values = set(t for _, t, _ in nav_links)
print(f"\n✅ 所有目标 target 值: {target_values}")

# 检查是否有指向 "document" 的链接
doc_links = re.findall(r'href="([^"]*)"', docs_html)
for link in doc_links:
    if 'document' in link.lower():
        print(f"⚠️  发现指向 'document' 的链接: {link}")

# 检查 target="document" 的链接
if 'target="document"' in docs_html:
    print("\n⚠️  发现 target=\"document\" 的链接!")
    matches = re.finditer(r'<a[^>]*target="document"[^>]*>([^<]*)</a>', docs_html)
    for match in matches:
        print(f"  - {match.group(1)}")
else:
    print("\n✅ 没有找到 target=\"document\" 的链接")

# 总结
print("\n" + "="*50)
print("诊断总结:")
print(f"  iframe 名称配置: {'✅' if name_match and id_match else '❌'}")
print(f"  导航链接数量: {len(nav_links)}")
print(f"  目标 target 值一致: {'✅' if len(target_values) == 1 else '❌'}")
print(f"  无 target=\"document\": {'✅' if 'target=\"document\"' not in docs_html else '❌'}")
