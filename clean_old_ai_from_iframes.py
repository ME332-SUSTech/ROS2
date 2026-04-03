#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从iframe中的HTML文件删除老AI助手代码
"""

import re
from pathlib import Path
from typing import List, Tuple

def remove_ai_widget_from_html(file_path: str) -> Tuple[bool, str]:
    """
    从HTML文件中移除AI助手widget代码
    
    参数:
        file_path: HTML文件路径
    
    返回:
        (是否发现AI代码, 处理消息)
    """
    
    file = Path(file_path)
    if not file.exists():
        return False, f"❌ 文件不存在: {file_path}"
    
    content = file.read_text(encoding='utf-8')
    original_len = len(content)
    
    # 匹配AI chat widget的HTML块（从 <div id="ai-chat-widget" 到 </div>）
    # 查找各个AI相关的组件
    patterns = [
        # 移除整个ai-chat-widget div（贪心匹配到对应的</div>）
        (r'<div id="ai-chat-widget"[^>]*>.*?</div>\s*', 'DOTALL'),
        # 移除chat-trigger按钮
        (r'<button id="chat-trigger"[^>]*>.*?</button>\s*', 'DOTALL'),
        # 移除learning-hint div
        (r'<div id="learning-hint"[^>]*>.*?</div>\s*', 'DOTALL'),
        # 移除chat-widget-enhanced.js脚本加载
        (r'<script[^>]*src="[^"]*chat-widget-enhanced\.js"[^>]*></script>\s*', ''),
        # 移除api-config.js脚本加载
        (r'<script[^>]*src="[^"]*api-config\.js"[^>]*></script>\s*', ''),
    ]
    
    modifications = 0
    for pattern, flags in patterns:
        if flags == 'DOTALL':
            matches = re.findall(pattern, content, re.DOTALL)
            content = re.sub(pattern, '', content, flags=re.DOTALL)
        else:
            matches = re.findall(pattern, content)
            content = re.sub(pattern, '', content)
        
        if matches:
            modifications += len(matches)
    
    if modifications > 0:
        file.write_text(content, encoding='utf-8')
        final_len = len(content)
        size_reduction = original_len - final_len
        return True, f"✓ {file.name}: 删除 {modifications} 个AI组件（减少 {size_reduction} 字节）"
    else:
        return False, f"⊘ {file.name}: 未发现AI助手代码"


def main():
    """主程序"""
    html_dir = Path('/home/x/Xcode/ROS2/assets/html')
    
    if not html_dir.exists():
        print(f"❌ 目录不存在: {html_dir}")
        return
    
    print("=" * 70)
    print("🧹 从iframe HTML文件删除老AI助手代码")
    print("=" * 70)
    print()
    
    # 找出所有包含AI代码的HTML文件
    html_files = list(html_dir.glob('*.html'))
    html_files.extend(html_dir.glob('*/*.html'))
    
    processed = 0
    found = 0
    
    for html_file in sorted(html_files):
        found_ai, message = remove_ai_widget_from_html(str(html_file))
        print(message)
        
        if found_ai:
            found += 1
        processed += 1
    
    print()
    print("=" * 70)
    print(f"📊 处理完成")
    print(f"  扫描文件: {processed}")
    print(f"  清理文件: {found}")
    print("=" * 70)


if __name__ == '__main__':
    main()
