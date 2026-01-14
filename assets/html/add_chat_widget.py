#!/usr/bin/env python3
"""
为所有HTML文档页面添加AI聊天窗口组件
"""

import os
import re
from pathlib import Path

def create_chat_widget_html():
    """生成聊天窗口的HTML代码"""
    return '''
    <!-- AI 聊天窗口 -->
    <div id="ai-chat-widget" class="ai-chat-widget">
        <div class="chat-header" id="chat-header">
            <div class="chat-title">
                <span class="ai-icon">🤖</span>
                <span>ROS2 AI 助手</span>
            </div>
            <div class="chat-controls">
                <select id="model-select" class="model-select">
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o-mini</option>
                    <option value="gpt-4-turbo">GPT-4-turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5-turbo</option>
                </select>
                <button id="settings-btn" class="control-btn" title="设置API Key">⚙️</button>
                <button id="clear-history-btn" class="control-btn" title="清除历史">🗑️</button>
                <button id="minimize-btn" class="control-btn" title="最小化">-</button>
                <button id="close-btn" class="control-btn" title="关闭">×</button>
            </div>
        </div>
        
        <div class="chat-body" id="chat-body">
            <div class="chat-messages" id="chat-messages">
                <div class="message ai-message">
                    <div class="message-content">
                        <p>你好！我是ROS2 AI助手，支持文字和图片输入。我可以帮你解答ROS2相关的问题。</p>
                        <p><small>💡 提示：点击右上角⚙️设置你的OpenAI API Key</small></p>
                    </div>
                </div>
            </div>
            
            <div class="chat-input-container">
                <input type="file" id="image-input" accept="image/*" multiple style="display: none;">
                <button id="image-upload-btn" class="image-upload-btn" title="上传图片">📎</button>
                <input type="text" id="chat-input" placeholder="输入你的问题... (支持Shift+Enter换行)" class="chat-input">
                <button id="send-btn" class="send-btn">发送</button>
            </div>
        </div>
    </div>

    <!-- 聊天触发按钮 -->
    <button id="chat-trigger" class="chat-trigger">
        <span class="ai-icon">🤖</span>
        <span>AI助手</span>
    </button>
    '''

def add_chat_widget_to_file(html_file_path):
    """给单个HTML文件添加聊天窗口"""
    
    with open(html_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 检查是否已经添加过聊天窗口
    if 'ai-chat-widget' in content:
        return False, "已经包含聊天窗口"
    
    # 查找</body>标签前插入聊天窗口
    if '</body>' in content:
        chat_widget_html = create_chat_widget_html()
        
        # 计算相对路径深度
        depth = str(html_file_path).count(os.sep) - str(html_file_path).split(os.sep).index('html') - 1
        prefix = '../' * depth if depth > 0 else './'
        
        # 添加CSS和JS引用
        css_link = f'<link rel="stylesheet" href="{prefix}_static/css/chat-widget.css">'
        js_script = f'<script src="{prefix}_static/js/chat-widget-enhanced.js"></script>'
        
        # 在head中添加CSS
        if '</head>' in content:
            content = content.replace('</head>', f'    {css_link}\n</head>')
        
        # 在</body>前添加聊天窗口和JS
        content = content.replace('</body>', f'{chat_widget_html}\n    {js_script}\n</body>')
        
        with open(html_file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True, "成功添加聊天窗口"
    
    return False, "未找到</body>标签"


def main():
    html_dir = Path("/home/x/Xcode/ROS2/assets/html")
    
    if not html_dir.exists():
        print(f"错误：目录 {html_dir} 不存在")
        return
    
    # 获取所有HTML文件
    html_files = list(html_dir.glob("**/*.html"))
    
    print(f"找到 {len(html_files)} 个HTML文件")
    print("开始处理...")
    
    updated_count = 0
    failed_files = []
    
    for html_file in html_files:
        try:
            success, message = add_chat_widget_to_file(html_file)
            if success:
                print(f"✓ {html_file.name}: {message}")
                updated_count += 1
            else:
                print(f"- {html_file.name}: {message}")
        except Exception as e:
            print(f"✗ {html_file.name}: 处理失败 - {str(e)}")
            failed_files.append(html_file.name)
    
    print("\n" + "="*50)
    print(f"处理完成！")
    print(f"总文件数: {len(html_files)}")
    print(f"成功更新: {updated_count}")
    print(f"处理失败: {len(failed_files)}")
    
    if failed_files:
        print(f"失败的文件: {', '.join(failed_files[:5])}" + ("..." if len(failed_files) > 5 else ""))


if __name__ == "__main__":
    main()
