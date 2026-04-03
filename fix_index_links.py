#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复index.html中缺少assets/html前缀的链接
"""

import re
from pathlib import Path
from typing import List, Tuple

def fix_index_links(file_path: str) -> Tuple[int, int]:
    """
    修复index.html中的所有链接
    
    参数:
        file_path: index.html的路径
    
    返回:
        (修复前链接数, 修复后链接数)
    """
    
    file = Path(file_path)
    if not file.exists():
        print(f"❌ 文件不存在: {file_path}")
        return 0, 0
    
    content = file.read_text(encoding='utf-8')
    original_count = len(re.findall(r'docs\.html\?page=', content))
    
    # 修复的正则表达式：匹配 docs.html?page= 后面不是assets/html的链接
    # 需要捕获?page=后面的内容，并在开头添加assets/html/
    pattern = r'(docs\.html\?page=)(?!assets/html/)([A-Za-z0-9\-_/\.]+\.html)'
    
    def add_prefix(match):
        prefix = match.group(1)  # docs.html?page=
        path = match.group(2)     # 文件路径
        return f"{prefix}assets/html/{path}"
    
    fixed_content = re.sub(pattern, add_prefix, content)
    fixed_count = len(re.findall(r'docs\.html\?page=assets/html/', fixed_content))
    
    # 保存修复后的文件
    file.write_text(fixed_content, encoding='utf-8')
    
    return original_count, fixed_count


def verify_fixes(file_path: str) -> bool:
    """
    验证所有链接都已正确修复
    """
    
    file = Path(file_path)
    content = file.read_text(encoding='utf-8')
    
    # 找出所有docs.html?page=的链接
    all_links = re.findall(r'docs\.html\?page=[^"\'>\s]+', content)
    
    print("\n🔍 链接验证结果:")
    print(f"  总链接数: {len(all_links)}")
    
    invalid_links = []
    for link in all_links:
        if 'assets/html/' not in link:
            invalid_links.append(link)
    
    if invalid_links:
        print(f"\n❌ 发现 {len(invalid_links)} 个格式不正确的链接:")
        for link in invalid_links[:5]:
            print(f"    - {link}")
        return False
    else:
        print(f"✓ 所有 {len(all_links)} 个链接格式都正确")
        return True


if __name__ == '__main__':
    # 修复index.html
    index_path = '/home/x/Xcode/ROS2/index.html'
    
    print("🔧 修复index.html中的链接前缀...")
    original, fixed = fix_index_links(index_path)
    
    print(f"\n📊 修复统计:")
    print(f"  修复前: {original} 个docs.html?page=链接")
    print(f"  修复后: {fixed} 个带assets/html/的链接")
    
    # 验证修复
    if verify_fixes(index_path):
        print("\n✅ 所有链接修复完成！")
    else:
        print("\n⚠️  仍有部分链接需要检查")
