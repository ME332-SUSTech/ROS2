#!/usr/bin/env python3
"""
全面修复所有HTML文档页面
1. 修复所有脚本的相对路径
2. 确保api-config.js正确引用
3. 确保chat-widget-enhanced.js正确引用
4. 修复resizable-sidebar.js路径
"""

import os
import re
from pathlib import Path

def get_relative_static_path(html_file, base_dir):
    """根据HTML文件位置计算_static的相对路径"""
    html_path = Path(html_file)
    
    # 计算相对深度
    rel_path = html_path.relative_to(base_dir)
    depth = len(rel_path.parts) - 1  # 减去文件名本身
    
    if depth == 0:
        return '_static'
    else:
        return '../' * depth + '_static'

def fix_html_file(filepath, base_dir):
    """修复单个HTML文件"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        correct_static_path = get_relative_static_path(filepath, base_dir)
        
        # 修复resizable-sidebar.js路径（错误的_static路径）
        content = re.sub(
            r'<script src="_static/js/resizable-sidebar\.js"',
            f'<script src="{correct_static_path}/js/resizable-sidebar.js"',
            content
        )
        
        # 修复api-config.js路径
        content = re.sub(
            r'<script src="_static/js/api-config\.js"',
            f'<script src="{correct_static_path}/js/api-config.js"',
            content
        )
        
        # 修复chat-widget-enhanced.js路径
        content = re.sub(
            r'<script src="_static/js/chat-widget-enhanced\.js"',
            f'<script src="{correct_static_path}/js/chat-widget-enhanced.js"',
            content
        )
        
        # 如果没有api-config.js，添加它
        if 'api-config.js' not in content and 'chat-widget-enhanced.js' in content:
            content = content.replace(
                f'<script src="{correct_static_path}/js/chat-widget-enhanced.js">',
                f'<script src="{correct_static_path}/js/api-config.js"></script>\n    <script src="{correct_static_path}/js/chat-widget-enhanced.js">'
            )
        
        # 如果有修改，保存文件
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"❌ 错误处理 {filepath}: {e}")
        return False

def main():
    print("🔧 全面修复HTML文档页面\n")
    
    html_dir = Path('/home/x/Xcode/ROS2/assets/html')
    
    # 找到所有HTML文件
    html_files = list(html_dir.rglob('*.html'))
    
    fixed_count = 0
    skipped_count = 0
    
    for html_file in html_files:
        # 跳过_static和_sources目录
        if '_static' in str(html_file) or '_sources' in str(html_file):
            continue
            
        result = fix_html_file(html_file, html_dir)
        if result:
            fixed_count += 1
            rel_path = html_file.relative_to(html_dir)
            print(f"✅ 修复: {rel_path}")
        else:
            skipped_count += 1
    
    print(f"\n📊 完成统计:")
    print(f"   修复: {fixed_count} 个文件")
    print(f"   跳过: {skipped_count} 个文件")
    
    print("\n🎉 批量修复完成！")

if __name__ == '__main__':
    main()
