// AI聊天窗口功能 - 支持OpenAI API、图片上传和对话历史
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
        this.imageUploadBtn = document.getElementById('image-upload-btn');
        this.imageInput = document.getElementById('image-input');
        this.clearHistoryBtn = document.getElementById('clear-history-btn');
        
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.isMinimized = false;
        
        // 拉伸相关
        this.isResizing = false;
        this.resizeHandle = null;
        this.startSize = { width: 0, height: 0 };
        this.startPos = { x: 0, y: 0 };
        this.startWidgetPos = { bottom: 0, right: 0 };
        
        // API配置（支持OpenAI格式的各种服务）
        this.isAdminMode = localStorage.getItem('ai_admin_mode') === 'true';
        this.adminPassword = 'ros2admin'; // 管理员密码
        
        // 尝试从加密配置加载API密钥
        this.loadEncryptedConfig();
        
        // 如果没有加密配置，则使用localStorage（管理员手动配置）
        if (!this.apiKey) {
            this.apiKey = localStorage.getItem('ai_api_key') || '';
            this.apiEndpoint = localStorage.getItem('ai_api_endpoint') || 'https://api.openai.com/v1/chat/completions';
            this.apiProvider = localStorage.getItem('ai_provider') || 'qwen';
        }
        
        // 对话历史（支持跨页面保存）
        this.conversationHistory = this.loadConversationHistory();
        this.uploadedImages = [];
        
        this.initEventListeners();
        this.initDragging();
        this.initResizing();
        this.updateModelOptions(); // 根据保存的provider加载模型
        this.restoreChatMessages();
        this.setupStorageListener(); // 监听跨页面同步
        this.checkApiKey();
    }
    
    checkApiKey() {
        if (!this.apiKey) {
            const msg = this.isAdminMode 
                ? '💡 未配置API密钥。当前使用模拟对话模式。'
                : '💡 当前使用模拟对话模式。需要智能AI回答请联系管理员配置API密钥。';
            this.addSystemMessage(msg);
        }
    }
    
    // 加载加密的API配置
    loadEncryptedConfig() {
        try {
            // 如果api-config.js已加载，则使用加密的配置
            if (typeof ENCRYPTED_CONFIG !== 'undefined' && typeof decryptApiKey === 'function') {
                // 验证域名
                if (!isAllowedDomain()) {
                    console.warn('当前域名未在白名单中，无法使用预配置的API密钥');
                    return;
                }
                
                // 解密API密钥
                const provider = localStorage.getItem('ai_provider') || 'qwen';
                const config = ENCRYPTED_CONFIG[provider];
                
                if (config && config.api_key) {
                    this.apiKey = decryptApiKey(config.api_key, ENCRYPTED_CONFIG.security.key);
                    this.apiEndpoint = config.endpoint + '/chat/completions';
                    this.apiProvider = provider;
                    
                    console.log('✅ 已加载预配置的API密钥');
                }
            }
        } catch (e) {
            console.warn('加载加密配置失败，将使用localStorage配置:', e);
        }
    }
    
    loadConversationHistory() {
        const saved = localStorage.getItem('ros2_chat_history');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [];
            }
        }
        return [{
            role: 'system',
            content: '你是一个专业的ROS2助手，精通ROS2 Humble的各个方面，包括安装、配置、节点、话题、服务、参数、launch文件等。请用清晰、准确的中文回答用户的问题。'
        }];
    }
    
    saveConversationHistory() {
        localStorage.setItem('ros2_chat_history', JSON.stringify(this.conversationHistory));
    }
    
    restoreChatMessages() {
        // 清空现有消息显示
        this.chatMessages.innerHTML = '';
        
        // 恢复显示的消息（跳过system消息）
        this.conversationHistory.forEach((msg, index) => {
            if (msg.role !== 'system' && index > 0) {
                if (msg.role === 'user') {
                    this.displayMessage(msg.content, 'user', msg.images);
                } else if (msg.role === 'assistant') {
                    this.displayMessage(msg.content, 'ai');
                }
            }
        });
    }
    
    // 监听其他页面的localStorage变化，实现跨页面同步
    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'ros2_chat_history' && e.newValue) {
                try {
                    this.conversationHistory = JSON.parse(e.newValue);
                    this.restoreChatMessages();
                } catch (err) {
                    console.error('Failed to sync chat history:', err);
                }
            }
        });
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
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // 图片上传
        if (this.imageUploadBtn && this.imageInput) {
            this.imageUploadBtn.addEventListener('click', () => this.imageInput.click());
            this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }
        
        // 模型选择
        if (this.modelSelect) {
            this.modelSelect.addEventListener('change', () => this.changeModel());
        }
        
        // 清除历史按钮
        if (this.clearHistoryBtn) {
            this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        }
        
        // 右键点击标题栏显示管理员设置
        this.chatHeader.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showAdminSettings();
        });
    }
    
    updateApiEndpoint() {
        const endpoints = {
            'qwen': 'https://dashscope.aliyuncs.com/compatible-mode/v1',
            'deepseek': 'https://api.deepseek.com/v1'
        };
        
        if (endpoints[this.apiProvider]) {
            this.apiEndpoint = endpoints[this.apiProvider];
            localStorage.setItem('ai_api_endpoint', this.apiEndpoint);
        }
    }
    
    showAdminSettings() {
        if (this.isAdminMode) {
            this.showSettings();
        } else {
            const password = prompt('请输入管理员密码：');
            if (password === this.adminPassword) {
                this.isAdminMode = true;
                localStorage.setItem('ai_admin_mode', 'true');
                this.showSettings();
            } else if (password !== null) {
                alert('❌ 密码错误！');
            }
        }
    }
    
    initDragging() {
        this.chatHeader.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT') return;
            
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
    
    initResizing() {
        const handles = this.chatWidget.querySelectorAll('.resize-handle');
        
        handles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                if (this.isMinimized) return;
                
                e.stopPropagation();
                this.isResizing = true;
                this.resizeHandle = handle;
                this.startPos = { x: e.clientX, y: e.clientY };
                
                const rect = this.chatWidget.getBoundingClientRect();
                this.startSize = { width: rect.width, height: rect.height };
                this.startWidgetPos = {
                    bottom: window.innerHeight - rect.bottom,
                    right: window.innerWidth - rect.right,
                    top: rect.top,
                    left: rect.left
                };
                
                document.addEventListener('mousemove', this.handleResize.bind(this));
                document.addEventListener('mouseup', this.handleResizeEnd.bind(this));
                
                this.chatWidget.style.transition = 'none';
                e.preventDefault();
            });
        });
    }
    
    handleResize(e) {
        if (!this.isResizing) return;
        
        const deltaX = e.clientX - this.startPos.x;
        const deltaY = e.clientY - this.startPos.y;
        
        const minWidth = 320;
        const minHeight = 400;
        const maxWidth = 800;
        const maxHeight = window.innerHeight * 0.9;
        
        // 只处理右下角拉伸
        const newWidth = Math.max(minWidth, Math.min(this.startSize.width + deltaX, maxWidth));
        const newHeight = Math.max(minHeight, Math.min(this.startSize.height + deltaY, maxHeight));
        
        this.chatWidget.style.width = newWidth + 'px';
        this.chatWidget.style.height = newHeight + 'px';
    }
    
    handleResizeEnd() {
        if (this.isResizing) {
            this.isResizing = false;
            this.resizeHandle = null;
            
            document.removeEventListener('mousemove', this.handleResize.bind(this));
            document.removeEventListener('mouseup', this.handleResizeEnd.bind(this));
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
        // 最小化直接变成初始触发按钮
        this.chatWidget.classList.remove('show');
        this.chatTrigger.classList.remove('hidden');
        this.isMinimized = false;
    }
    
    async handleImageUpload(e) {
        const files = Array.from(e.target.files);
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                const base64 = await this.fileToBase64(file);
                this.uploadedImages.push({
                    name: file.name,
                    base64: base64,
                    type: file.type
                });
                this.displayUploadedImage(file.name, base64);
            }
        }
        e.target.value = ''; // 重置input
    }
    
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    displayUploadedImage(name, base64) {
        const imagePreview = document.createElement('div');
        imagePreview.className = 'image-preview';
        imagePreview.innerHTML = `
            <img src="${base64}" alt="${name}">
            <button onclick="this.parentElement.remove()" class="remove-image">×</button>
        `;
        
        const inputContainer = document.querySelector('.chat-input-container');
        inputContainer.insertBefore(imagePreview, inputContainer.firstChild);
    }
    
    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message && this.uploadedImages.length === 0) return;
        
        // 构建用户消息
        const userMessage = {
            role: 'user',
            content: message
        };
        
        // 如果有图片，添加到消息中
        if (this.uploadedImages.length > 0) {
            userMessage.images = this.uploadedImages.map(img => img.base64);
            userMessage.content = [
                { type: 'text', text: message },
                ...this.uploadedImages.map(img => ({
                    type: 'image_url',
                    image_url: { url: img.base64 }
                }))
            ];
        }
        
        // 添加到历史记录
        this.conversationHistory.push(userMessage);
        this.saveConversationHistory();
        
        // 显示用户消息
        this.displayMessage(message, 'user', this.uploadedImages.map(img => img.base64));
        
        // 清空输入和图片
        this.chatInput.value = '';
        this.uploadedImages = [];
        document.querySelectorAll('.image-preview').forEach(el => el.remove());
        
        // 禁用发送按钮
        this.sendBtn.disabled = true;
        this.sendBtn.textContent = '发送中...';
        
        // 显示思考指示器
        this.showTypingIndicator();
        
        try {
            let response;
            
            // 如果没有配置API，使用硬编码对话
            if (!this.apiKey) {
                await new Promise(resolve => setTimeout(resolve, 800)); // 模拟延迟
                response = this.getHardcodedResponse(message);
            } else {
                // 调用真实API
                response = await this.callOpenAI();
            }
            
            this.hideTypingIndicator();
            
            // 添加AI响应到历史
            this.conversationHistory.push({
                role: 'assistant',
                content: response
            });
            this.saveConversationHistory();
            
            // 显示AI响应
            this.displayMessage(response, 'ai');
            
        } catch (error) {
            this.hideTypingIndicator();
            this.addSystemMessage(`❌ 错误: ${error.message}`);
        } finally {
            this.sendBtn.disabled = false;
            this.sendBtn.textContent = '发送';
        }
    }
    
    getHardcodedResponse(userMessage) {
        const msg = userMessage.toLowerCase();
        
        // ROS2相关问题的硬编码回答
        if (msg.includes('ros2') || msg.includes('ros 2')) {
            if (msg.includes('安装') || msg.includes('install')) {
                return `要安装ROS2 Humble，请按照以下步骤操作：

1. **设置locale**
\`\`\`bash
sudo locale-gen en_US en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
\`\`\`

2. **添加ROS2仓库**
\`\`\`bash
sudo apt update && sudo apt install curl -y
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
\`\`\`

3. **安装ROS2**
\`\`\`bash
sudo apt update
sudo apt install ros-humble-desktop
\`\`\`

4. **配置环境**
\`\`\`bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
source ~/.bashrc
\`\`\`

💡 **提示**: API未配置，这是模拟回答。配置API可获得更智能的响应！`;
            }
            if (msg.includes('节点') || msg.includes('node')) {
                return `ROS2节点是执行计算的进程。每个节点应负责单一的模块化功能。

**创建Python节点示例：**
\`\`\`python
import rclpy
from rclpy.node import Node

class MyNode(Node):
    def __init__(self):
        super().__init__('my_node')
        self.get_logger().info('节点已启动！')

def main(args=None):
    rclpy.init(args=args)
    node = MyNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()
\`\`\`

**运行节点：**
\`\`\`bash
ros2 run <package_name> <node_name>
\`\`\`

💡 这是模拟回答，配置API获得更详细的帮助！`;
            }
            if (msg.includes('话题') || msg.includes('topic')) {
                return `话题(Topic)是ROS2中节点间通信的主要方式，采用发布-订阅模式。

**查看所有话题：**
\`\`\`bash
ros2 topic list
\`\`\`

**发布消息到话题：**
\`\`\`bash
ros2 topic pub /my_topic std_msgs/msg/String "data: 'Hello ROS2'"
\`\`\`

**订阅话题：**
\`\`\`bash
ros2 topic echo /my_topic
\`\`\`

**查看话题信息：**
\`\`\`bash
ros2 topic info /my_topic
\`\`\`

💡 API未配置，这是基础示例。配置API可获得更多高级用法！`;
            }
            if (msg.includes('launch') || msg.includes('启动')) {
                return `Launch文件用于同时启动多个节点和配置参数。

**Python Launch文件示例：**
\`\`\`python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='demo_nodes_cpp',
            executable='talker',
            name='talker'
        ),
        Node(
            package='demo_nodes_cpp',
            executable='listener',
            name='listener'
        )
    ])
\`\`\`

**运行launch文件：**
\`\`\`bash
ros2 launch <package_name> <launch_file.py>
\`\`\`

💡 这是模拟回答，配置API获得更复杂的launch配置示例！`;
            }
        }
        
        if (msg.includes('你好') || msg.includes('hello') || msg.includes('hi')) {
            return '你好！👋 我是ROS2助手。我可以帮您解答ROS2相关的问题，包括：\\n\\n• 安装和配置\\n• 节点(Node)开发\\n• 话题(Topic)通信\\n• 服务(Service)调用\\n• Launch文件编写\\n• 参数配置\\n\\n💡 **提示**: 当前使用模拟对话模式。点击⚙️设置按钮配置API密钥可获得更智能的回答！';
        }
        
        if (msg.includes('帮助') || msg.includes('help')) {
            return '我可以帮助您了解：\\n\\n📚 **ROS2基础**\\n• 安装与环境配置\\n• 核心概念（节点、话题、服务）\\n\\n💻 **开发指南**\\n• 创建工作空间和包\\n• Python/C++节点开发\\n• Launch文件编写\\n\\n🔧 **进阶主题**\\n• 参数服务器\\n• 自定义消息类型\\n• DDS配置\\n\\n请直接提问，例如："如何安装ROS2？"或"什么是节点？"\\n\\n💡 当前为模拟模式，配置API可获得更准确的回答！';
        }
        
        // 默认回答
        return `感谢您的提问！我是ROS2教学助手。

您问到："${userMessage}"

💡 **当前状态**: 正在使用模拟对话模式。为了获得更准确和详细的回答，建议：

1. 点击右上角的⚙️设置按钮
2. ${this.isAdminMode ? '配置API密钥和端点' : '选择AI服务商（需管理员配置API）'}
3. 保存设置后重新提问

📖 您也可以直接浏览左侧的文档目录获取详细信息。

常见问题示例：
• "如何安装ROS2？"
• "什么是节点？"
• "如何创建launch文件？"
• "话题通信怎么用？"`;
    }
    
    async callOpenAI() {
        const model = this.modelSelect.value || 'gpt-4o-mini';
        
        // 构建请求头
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
        };
        
        // 为不同的API提供商添加特定的请求体配置
        const requestBody = {
            model: model,
            messages: this.conversationHistory,
            temperature: 0.7,
            max_tokens: 2000
        };
        
        // DeepSeek特殊配置
        if (this.apiProvider === 'deepseek' || model.includes('deepseek')) {
            // DeepSeek可能需要特定参数
        }
        
        // Qwen特殊配置
        if (this.apiProvider === 'qwen' || model.includes('qwen')) {
            // Qwen可能需要特定参数
            requestBody.result_format = 'message'; // 阿里云Qwen特定参数
        }
        
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || '请求失败');
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    displayMessage(content, sender, images = []) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // 显示图片
        if (images && images.length > 0) {
            const imagesContainer = document.createElement('div');
            imagesContainer.className = 'message-images';
            images.forEach(img => {
                const imgEl = document.createElement('img');
                imgEl.src = img;
                imagesContainer.appendChild(imgEl);
            });
            messageContent.appendChild(imagesContainer);
        }
        
        // 显示文本
        if (content) {
            const textDiv = document.createElement('div');
            if (sender === 'ai') {
                textDiv.innerHTML = this.parseMarkdown(content);
            } else {
                textDiv.textContent = content;
            }
            messageContent.appendChild(textDiv);
        }
        
        messageDiv.appendChild(messageContent);
        this.chatMessages.appendChild(messageDiv);
        
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    addSystemMessage(content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system-message';
        messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
        this.chatMessages.appendChild(messageDiv);
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
    
    parseMarkdown(text) {
        // 代码块
        text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code class="language-${lang || 'plaintext'}">${this.escapeHtml(code.trim())}</code></pre>`;
        });
        
        // 行内代码
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // 粗体
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // 斜体
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // 换行
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showSettings() {
        const modal = document.createElement('div');
        modal.className = 'settings-modal';
        
        if (this.isAdminMode) {
            // 管理员模式：完整配置
            const endpoints = {
                'qwen': 'https://dashscope.aliyuncs.com/compatible-mode/v1',
                'deepseek': 'https://api.deepseek.com/v1'
            };
            
            modal.innerHTML = `
                <div class="settings-content">
                    <h3>🔧 管理员设置</h3>
                    <div class="settings-form">
                        <label>AI服务提供商：</label>
                        <select id="provider-select" class="settings-input">
                            <option value="qwen" ${this.apiProvider === 'qwen' ? 'selected' : ''}>通义千问 (Qwen)</option>
                            <option value="deepseek" ${this.apiProvider === 'deepseek' ? 'selected' : ''}>DeepSeek</option>
                        </select>
                        
                        <label>API端点：</label>
                        <input type="text" id="endpoint-input" class="settings-input" 
                               value="${this.apiEndpoint}" placeholder="https://api.example.com/v1">
                        
                        <label>API Key：</label>
                        <input type="password" id="apikey-input" class="settings-input" 
                               value="${this.apiKey}" placeholder="sk-...">
                        
                        <div class="settings-presets">
                            <small>预设端点：<br>
                            • Qwen: dashscope.aliyuncs.com/compatible-mode/v1<br>
                            • DeepSeek: api.deepseek.com/v1
                            </small>
                        </div>
                        
                        <div class="settings-buttons">
                            <button class="btn-secondary" id="cancel-btn">取消</button>
                            <button class="btn-primary" id="save-btn">保存</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const providerSelect = document.getElementById('provider-select');
            const endpointInput = document.getElementById('endpoint-input');
            const apikeyInput = document.getElementById('apikey-input');
            
            providerSelect.addEventListener('change', (e) => {
                const provider = e.target.value;
                if (endpoints[provider]) {
                    endpointInput.value = endpoints[provider];
                }
                this.apiProvider = provider;
                this.updateModelOptions();
            });
            
            document.getElementById('cancel-btn').addEventListener('click', () => {
                modal.remove();
            });
            
            document.getElementById('save-btn').addEventListener('click', () => {
                this.apiProvider = providerSelect.value;
                this.apiEndpoint = endpointInput.value;
                this.apiKey = apikeyInput.value;
                
                localStorage.setItem('ai_provider', this.apiProvider);
                localStorage.setItem('ai_api_endpoint', this.apiEndpoint);
                localStorage.setItem('ai_api_key', this.apiKey);
                
                this.updateModelOptions();
                this.addSystemMessage('✅ 管理员设置已保存！');
                modal.remove();
            });
        } else {
            // 用户模式：只能选择服务商
            modal.innerHTML = `
                <div class="settings-content">
                    <h3>⚙️ 选择AI服务</h3>
                    <div class="settings-form">
                        <label>AI服务提供商：</label>
                        <select id="provider-select" class="settings-input">
                            <option value="qwen" ${this.apiProvider === 'qwen' ? 'selected' : ''}>通义千问 (Qwen)</option>
                            <option value="deepseek" ${this.apiProvider === 'deepseek' ? 'selected' : ''}>DeepSeek</option>
                        </select>
                        
                        <div class="settings-presets">
                            <small>💡 提示：服务提供商将决定AI模型的选择。</small>
                        </div>
                        
                        <div style="margin-top: 10px; text-align: center;">
                            <small style="color: #666;">管理员模式？
                                <a href="#" id="admin-link" style="color: #667eea;">点击登录</a>
                            </small>
                        </div>
                        
                        <div class="settings-buttons">
                            <button class="btn-secondary" id="cancel-btn">取消</button>
                            <button class="btn-primary" id="save-btn">保存</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const providerSelect = document.getElementById('provider-select');
            
            document.getElementById('admin-link').addEventListener('click', (e) => {
                e.preventDefault();
                const password = prompt('请输入管理员密码：');
                if (password === this.adminPassword) {
                    this.isAdminMode = true;
                    localStorage.setItem('ai_admin_mode', 'true');
                    modal.remove();
                    this.showSettings();
                } else if (password !== null) {
                    alert('❌ 密码错误！');
                }
            });
            
            document.getElementById('cancel-btn').addEventListener('click', () => {
                modal.remove();
            });
            
            document.getElementById('save-btn').addEventListener('click', () => {
                this.apiProvider = providerSelect.value;
                localStorage.setItem('ai_provider', this.apiProvider);
                this.updateModelOptions();
                this.addSystemMessage('✅ 服务选择已保存！');
                modal.remove();
            });
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    updateModelOptions() {
        // 合并所有模型到一个列表
        const allModels = [
            { value: 'qwen-max', label: '通义千问 Max' },
            { value: 'qwen-plus', label: '通义千问 Plus' },
            { value: 'qwen-turbo', label: '通义千问 Turbo' },
            { value: 'qwen-vl-max', label: '通义千问 VL-Max (视觉)' },
            { value: 'deepseek-chat', label: 'DeepSeek Chat' },
            { value: 'deepseek-coder', label: 'DeepSeek Coder' }
        ];
        
        this.modelSelect.innerHTML = allModels.map(m => 
            `<option value="${m.value}">${m.label}</option>`
        ).join('');
    }
    
    clearHistory() {
        if (confirm('确定要清除所有对话历史吗？')) {
            this.conversationHistory = [{
                role: 'system',
                content: '你是一个专业的ROS2助手，精通ROS2 Humble的各个方面。'
            }];
            this.saveConversationHistory();
            this.chatMessages.innerHTML = '';
            this.addSystemMessage('✅ 对话历史已清除');
        }
    }
    
    changeModel() {
        const selectedModel = this.modelSelect.value;
        this.addSystemMessage(`✅ 已切换到 ${selectedModel} 模型`);
    }
}

// 页面加载完成后初始化AI聊天
document.addEventListener('DOMContentLoaded', function() {
    // 检查聊天组件是否存在
    if (document.getElementById('ai-chat-widget')) {
        new AIChat();
    }
});
