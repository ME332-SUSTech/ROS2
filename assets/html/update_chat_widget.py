#!/usr/bin/env python3
"""
批量更新所有HTML文件中的AI聊天窗口组件
- 移除设置按钮
- 添加右下角拉伸手柄
- 更新模型选择器
- 移除"ROS2 AI 助手"文字
"""

import os
import re

# HTML目录
html_dir = '/home/x/Xcode/ROS2/assets/html'

# 旧的chat widget HTML模式（匹配各种变体）
old_widget_patterns = [
    # 完整匹配旧版本
    r'<!-- AI 聊天窗口 -->\s*<div id="ai-chat-widget" class="ai-chat-widget">.*?</div>\s*</div>\s*</div>\s*<!-- 聊天触发按钮 -->',
]

# 新的chat widget HTML
new_widget_html = '''<!-- AI 聊天窗口 -->
    <div id="ai-chat-widget" class="ai-chat-widget">
        <!-- 右下角拉伸手柄 -->
        <div class="resize-handle resize-handle-corner-br">
            <span class="resize-icon">⋰</span>
        </div>
        
        <div class="chat-header" id="chat-header">
            <div class="chat-title">
                <span class="ai-icon">🤖</span>
            </div>
            <div class="chat-controls">
                <select id="model-select" class="model-select" title="选择模型">
                    <option value="qwen-max">通义千问 Max</option>
                </select>
                <button id="clear-history-btn" class="control-btn" title="清除历史">🗑️</button>
                <button id="minimize-btn" class="control-btn" title="最小化">━</button>
                <button id="close-btn" class="control-btn" title="关闭">✕</button>
            </div>
        </div>
        
        <div class="chat-body" id="chat-body">
            <div class="chat-messages" id="chat-messages">
                <div class="message ai-message">
                    <div class="message-content">
                        <p>你好！我可以帮你解答ROS2相关的问题，支持文字和图片输入。</p>
                        <p><small>💡 提示：在标题栏右键点击可配置API</small></p>
                    </div>
                </div>
            </div>
            
            <div class="chat-input-container">
                <input type="file" id="image-input" accept="image/*" multiple style="display: none;">
                <button id="image-upload-btn" class="image-upload-btn" title="上传图片">📎</button>
                <input type="text" id="chat-input" placeholder="输入你的问题..." class="chat-input">
                <button id="send-btn" class="send-btn">发送</button>
            </div>
        </div>
    </div>

    <!-- 聊天触发按钮 -->'''

# 统计
updated = 0
failed = 0

for root, dirs, files in os.walk(html_dir):
    for filename in files:
        if filename.endswith('.html'):
            filepath = os.path.join(root, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # 检查是否有chat widget
                if 'ai-chat-widget' not in content:
                    continue
                
                original = content
                
                # 使用更灵活的正则替换
                # 匹配从 <!-- AI 聊天窗口 --> 到 <!-- 聊天触发按钮 -->
                pattern = r'<!-- AI 聊天窗口 -->.*?<!-- 聊天触发按钮 -->'
                
                if re.search(pattern, content, re.DOTALL):
                    content = re.sub(pattern, new_widget_html, content, flags=re.DOTALL)
                    
                    if content != original:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(content)
                        updated += 1
                        print(f"✓ 已更新: {filepath}")
                
            except Exception as e:
                failed += 1
                print(f"✗ 失败: {filepath} - {e}")

print(f"\n完成！已更新 {updated} 个文件，{failed} 个失败")
