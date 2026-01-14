#!/usr/bin/env python3
"""
批量更新所有HTML文件，添加api-config.js引用
"""

import os
import re
from pathlib import Path

def update_html_files():
    """在chat-widget-enhanced.js之前添加api-config.js"""
    
    html_dir = Path(__file__).parent
    html_files = list(html_dir.glob('**/*.html'))
    
    updated = 0
    skipped = 0
    
    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 如果已经有api-config.js，跳过
            if 'api-config.js' in content:
                skipped += 1
                continue
            
            # 在chat-widget-enhanced.js之前插入api-config.js
            old_pattern = '<script src="./_static/js/chat-widget-enhanced.js"></script>'
            new_pattern = '<script src="./_static/js/api-config.js"></script>\n    <script src="./_static/js/chat-widget-enhanced.js"></script>'
            
            if old_pattern in content:
                content = content.replace(old_pattern, new_pattern)
                
                with open(html_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                updated += 1
            else:
                # 尝试其他可能的路径格式
                old_pattern2 = '<script src="_static/js/chat-widget-enhanced.js"></script>'
                new_pattern2 = '<script src="_static/js/api-config.js"></script>\n    <script src="_static/js/chat-widget-enhanced.js"></script>'
                
                if old_pattern2 in content:
                    content = content.replace(old_pattern2, new_pattern2)
                    
                    with open(html_file, 'w', encoding='utf-8') as f:
                        f.write(content)
                    
                    updated += 1
                    
        except Exception as e:
            print(f"❌ 错误处理 {html_file}: {e}")
    
    print(f"✅ 已更新 {updated} 个文件")
    print(f"⏭️  已跳过 {skipped} 个文件（已包含api-config.js）")

if __name__ == '__main__':
    print("📝 批量添加api-config.js引用...\n")
    update_html_files()
