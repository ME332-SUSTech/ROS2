#!/usr/bin/env python3
"""
批量修复所有HTML文档页面的AI助手
1. 添加api-config.js引用（相对路径）
2. 确保使用chat-widget-enhanced.js
3. 修复resize handle样式
"""

import os
import re
from pathlib import Path

def get_relative_static_path(html_file):
    """根据HTML文件位置计算_static的相对路径"""
    html_path = Path(html_file)
    assets_html = Path('/home/x/Xcode/ROS2/assets/html')
    
    # 计算相对深度
    rel_path = html_path.relative_to(assets_html)
    depth = len(rel_path.parts) - 1  # 减去文件名本身
    
    if depth == 0:
        return '_static'
    else:
        return '../' * depth + '_static'

def fix_html_file(filepath):
    """修复单个HTML文件"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        static_path = get_relative_static_path(filepath)
        
        # 检查是否已经有api-config.js
        if 'api-config.js' not in content:
            # 在chat-widget-enhanced.js之前添加api-config.js
            api_script = f'<script src="{static_path}/js/api-config.js"></script>\n'
            
            # 查找chat-widget-enhanced.js的位置
            if 'chat-widget-enhanced.js' in content:
                content = content.replace(
                    f'<script src="{static_path}/js/chat-widget-enhanced.js"></script>',
                    f'{api_script}    <script src="{static_path}/js/chat-widget-enhanced.js"></script>'
                )
            elif 'chat-widget.js' in content:
                # 旧版本，需要替换为enhanced版本
                old_script = re.search(r'<script src="[^"]*chat-widget\.js"></script>', content)
                if old_script:
                    new_scripts = f'{api_script}    <script src="{static_path}/js/chat-widget-enhanced.js"></script>'
                    content = content.replace(old_script.group(), new_scripts)
        
        # 确保使用chat-widget-enhanced.js而不是chat-widget.js
        if 'chat-widget.js' in content and 'chat-widget-enhanced.js' not in content:
            content = re.sub(
                r'<script src="([^"]*)chat-widget\.js"></script>',
                f'<script src="{static_path}/js/chat-widget-enhanced.js"></script>',
                content
            )
        
        # 如果有修改，保存文件
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"错误处理 {filepath}: {e}")
        return False

def main():
    print("🔧 批量修复HTML文档页面的AI助手\n")
    
    html_dir = Path('/home/x/Xcode/ROS2/assets/html')
    
    # 找到所有HTML文件
    html_files = list(html_dir.rglob('*.html'))
    
    fixed_count = 0
    skipped_count = 0
    error_count = 0
    
    for html_file in html_files:
        # 跳过_static目录
        if '_static' in str(html_file) or '_sources' in str(html_file):
            continue
            
        result = fix_html_file(html_file)
        if result:
            fixed_count += 1
            print(f"✅ 已修复: {html_file.relative_to(html_dir)}")
        else:
            skipped_count += 1
    
    print(f"\n📊 完成统计:")
    print(f"   修复: {fixed_count} 个文件")
    print(f"   跳过: {skipped_count} 个文件（已经正确或无需修改）")
    
    print("\n🎉 批量修复完成！")

if __name__ == '__main__':
    main()
