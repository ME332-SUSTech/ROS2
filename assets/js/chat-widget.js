// AI聊天窗口功能
class AIChat {
    constructor() {
        this.chatWidget = document.getElementById('ai-chat-widget');
        this.chatTrigger = document.getElementById('chat-trigger');
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('send-btn');
        this.minimizeBtn = document.getElementById('minimize-btn');
        this.closeBtn = document.getElementById('close-btn');
        this.modelSelect = document.getElementById('model-select');
        this.chatHeader = document.getElementById('chat-header');
        
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.isMinimized = false;
        
        this.initEventListeners();
        this.initDragging();
        
        // 模拟AI响应的预设回答
        this.responses = {
            'ros2': 'ROS2是Robot Operating System 2的缩写，是一个用于机器人开发的开源框架。它提供了通信中间件、工具和库来帮助开发复杂的机器人应用。',
            '节点': 'ROS2节点是系统中的基本计算单元。每个节点都是一个独立的进程，可以发布消息、订阅主题、提供服务或调用服务。',
            '话题': 'ROS2话题是节点间异步通信的命名通道。节点可以发布消息到话题，其他节点可以订阅该话题来接收消息。',
            '服务': 'ROS2服务提供同步的请求-响应通信模式。客户端发送请求给服务端，服务端处理请求并返回响应。',
            '安装': '要安装ROS2 Humble，首先更新系统，然后添加ROS2软件仓库，最后使用apt安装ros-humble-desktop包。',
            'launch': 'Launch文件用于同时启动多个ROS2节点，可以配置参数、重映射主题名称等。通常使用Python或XML格式编写。',
            '参数': 'ROS2参数允许在运行时配置节点的行为。节点可以声明参数、设置默认值，并在运行时动态修改这些参数。',
            'workspace': 'ROS2工作空间是包含ROS2包的目录结构。使用colcon工具可以构建工作空间中的所有包。',
            'default': '我是ROS2 AI助手！我可以帮你解答关于ROS2的各种问题，包括节点、话题、服务、参数、安装等。请问有什么具体问题吗？'
        };
    }
    
    initEventListeners() {
        // 聊天触发按钮
        this.chatTrigger.addEventListener('click', () => this.showChat());
        
        // 控制按钮
        this.minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        this.closeBtn.addEventListener('click', () => this.closeChat());
        
        // 发送消息
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // 模型选择
        this.modelSelect.addEventListener('change', () => this.changeModel());
    }
    
    initDragging() {
        this.chatHeader.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.dragOffset.x = e.clientX - this.chatWidget.offsetLeft;
            this.dragOffset.y = e.clientY - this.chatWidget.offsetTop;
            
            document.addEventListener('mousemove', this.handleDrag.bind(this));
            document.addEventListener('mouseup', this.handleDragEnd.bind(this));
            
            this.chatWidget.style.transition = 'none';
            e.preventDefault();
        });
    }
    
    handleDrag(e) {
        if (!this.isDragging) return;
        
        const newX = e.clientX - this.dragOffset.x;
        const newY = e.clientY - this.dragOffset.y;
        
        // 边界检查
        const maxX = window.innerWidth - this.chatWidget.offsetWidth;
        const maxY = window.innerHeight - this.chatWidget.offsetHeight;
        
        const clampedX = Math.max(0, Math.min(newX, maxX));
        const clampedY = Math.max(0, Math.min(newY, maxY));
        
        this.chatWidget.style.left = clampedX + 'px';
        this.chatWidget.style.top = clampedY + 'px';
        this.chatWidget.style.right = 'auto';
        this.chatWidget.style.bottom = 'auto';
    }
    
    handleDragEnd() {
        if (this.isDragging) {
            this.isDragging = false;
            this.chatWidget.style.transition = 'all 0.3s ease';
            
            document.removeEventListener('mousemove', this.handleDrag.bind(this));
            document.removeEventListener('mouseup', this.handleDragEnd.bind(this));
        }
    }
    
    showChat() {
        this.chatWidget.classList.add('show');
        this.chatTrigger.classList.add('hidden');
        this.chatInput.focus();
    }
    
    closeChat() {
        this.chatWidget.classList.remove('show');
        this.chatTrigger.classList.remove('hidden');
        this.isMinimized = false;
        this.chatWidget.classList.remove('minimized');
    }
    
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.chatWidget.classList.toggle('minimized', this.isMinimized);
        
        if (!this.isMinimized) {
            this.chatInput.focus();
        }
    }
    
    sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        // 添加用户消息
        this.addMessage(message, 'user');
        this.chatInput.value = '';
        
        // 禁用发送按钮
        this.sendBtn.disabled = true;
        this.sendBtn.textContent = '发送中...';
        
        // 模拟AI思考
        this.showTypingIndicator();
        
        // 模拟延迟后回复
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateResponse(message);
            this.addMessage(response, 'ai');
            
            // 重新启用发送按钮
            this.sendBtn.disabled = false;
            this.sendBtn.textContent = '发送';
        }, 1000 + Math.random() * 2000); // 1-3秒随机延迟
    }
    
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // 如果是AI消息，支持简单的markdown渲染
        if (sender === 'ai') {
            messageContent.innerHTML = this.parseMarkdown(content);
        } else {
            messageContent.textContent = content;
        }
        
        messageDiv.appendChild(messageContent);
        this.chatMessages.appendChild(messageDiv);
        
        // 滚动到底部
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.chatMessages.appendChild(typingDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    hideTypingIndicator() {
        const typingIndicator = this.chatMessages.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // 检查关键词
        for (const [keyword, response] of Object.entries(this.responses)) {
            if (keyword !== 'default' && lowerMessage.includes(keyword)) {
                return response;
            }
        }
        
        // 特殊问题处理
        if (lowerMessage.includes('你好') || lowerMessage.includes('hello')) {
            return '你好！我是ROS2 AI助手，很高兴为你服务！有什么ROS2相关的问题需要帮助吗？';
        }
        
        if (lowerMessage.includes('谢谢') || lowerMessage.includes('感谢')) {
            return '不客气！如果还有其他ROS2相关的问题，随时可以问我。';
        }
        
        if (lowerMessage.includes('如何') || lowerMessage.includes('怎么')) {
            return '这是一个很好的问题！对于ROS2的具体操作，我建议你查看官方文档或者参考我们网站上的教程。你可以点击页面上的教程按钮查看详细的代码示例。';
        }
        
        if (lowerMessage.includes('错误') || lowerMessage.includes('问题') || lowerMessage.includes('bug')) {
            return '遇到错误了？可以尝试以下步骤：\n1. 检查ROS2环境是否正确设置\n2. 确认所有依赖包已安装\n3. 查看终端输出的错误信息\n4. 检查代码语法是否正确\n\n如果需要更具体的帮助，请描述你遇到的具体错误信息。';
        }
        
        // 默认回复
        return this.responses.default;
    }
    
    parseMarkdown(text) {
        // 简单的markdown解析
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }
    
    changeModel() {
        const selectedModel = this.modelSelect.value;
        const modelInfo = {
            'gpt-4': 'GPT-4 - 最强大的语言模型',
            'gpt-3.5': 'GPT-3.5 - 快速响应',
            'claude': 'Claude - 擅长代码分析',
            'gemini': 'Gemini - Google最新模型'
        };
        
        this.addMessage(`已切换到${modelInfo[selectedModel]}模式。有什么可以帮助你的吗？`, 'ai');
    }
}

// 页面加载完成后初始化AI聊天
document.addEventListener('DOMContentLoaded', function() {
    new AIChat();
    
    // 添加一些交互提示
    setTimeout(() => {
        const chatTrigger = document.getElementById('chat-trigger');
        if (chatTrigger && !chatTrigger.classList.contains('hidden')) {
            chatTrigger.style.animation = 'pulse 2s infinite';
        }
    }, 3000);
});

// 添加脉冲动画样式
const pulseStyles = document.createElement('style');
pulseStyles.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(pulseStyles);