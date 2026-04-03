#!/usr/bin/env python3
"""
详细检查 docs.html 中所有 <a> 标签，找出哪些缺少 href 或 target
"""
import re
from pathlib import Path

docs_html = Path("/home/x/Xcode/ROS2/docs.html").read_text(encoding='utf-8')

# 找出所有 <a> 标签
a_tags = re.finditer(r'<a[^>]*(?:>|/>)', docs_html)

print("=" * 70)
print("docs.html 中所有 <a> 标签检查")
print("=" * 70)

missing_href = []
missing_target = []
target_document = []
all_tags = []

for match in a_tags:
    tag = match.group(0)
    all_tags.append(tag)
    
    # 检查 href
    has_href = 'href=' in tag
    # 检查 target
    has_target = 'target=' in tag
    
    # 获取内容
    href_match = re.search(r'href="([^"]*)"', tag)
    target_match = re.search(r'target="([^"]*)"', tag)
    text_before = docs_html[max(0, match.start()-50):match.start()]
    
    if not has_href:
        missing_href.append(tag)
    
    if 'docs-nav-item' in tag and not has_target:
        missing_target.append(tag)
    
    if target_match and target_match.group(1) == 'document':
        target_document.append((tag, href_match.group(1) if href_match else 'N/A'))

print(f"\n✅ 总共找到 {len(all_tags)} 个 <a> 标签\n")

# 显示导航链接
print("导航链接（docs-nav-item class）:")
nav_links = [t for t in all_tags if 'docs-nav-item' in t]
for i, tag in enumerate(nav_links[:5], 1):
    print(f"  {i}. {tag}")
if len(nav_links) > 5:
    print(f"  ... 还有 {len(nav_links)-5} 个\n")

# 显示缺少 href 的链接
if missing_href:
    print(f"\n⚠️  {len(missing_href)} 个缺少 href 的链接:")
    for tag in missing_href[:5]:
        print(f"  - {tag}")
else:
    print("\n✅ 所有链接都有 href 属性")

# 显示缺少 target 的导航链接
if missing_target:
    print(f"\n⚠️  {len(missing_target)} 个导航链接缺少 target:")
    for tag in missing_target[:5]:
        print(f"  - {tag}")
else:
    print("\n✅ 所有导航链接都有 target 属性")

# 显示 target="document" 的链接
if target_document:
    print(f"\n❌ {len(target_document)} 个链接的 target=\"document\":")
    for tag, href in target_document:
        print(f"  - href: {href}")
        print(f"    tag: {tag}")
else:
    print("\n✅ 没有 target=\"document\" 的链接")

# 分析导航链接的 target 值
print("\n导航链接的 target 值分析:")
nav_targets = {}
for tag in nav_links:
    target_match = re.search(r'target="([^"]*)"', tag)
    if target_match:
        target = target_match.group(1)
        href_match = re.search(r'href="([^"]*)"', tag)
        href = href_match.group(1) if href_match else 'N/A'
        nav_targets[target] = nav_targets.get(target, 0) + 1

for target, count in nav_targets.items():
    print(f"  - target=\"{target}\": {count} 个链接")

if not nav_targets:
    print("  ⚠️  导航链接没有 target 属性！")
