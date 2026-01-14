# 🔑 AI助手 API密钥配置指南

## 配置方式

### 方式一：通过浏览器右键菜单配置（推荐）

1. **打开网站**：访问 http://localhost:8080
2. **进入管理员模式**：在AI助手的标题栏（顶部蓝紫色区域）**右键点击**
3. **输入密码**：在弹出的对话框中输入管理员密码：`ros2admin`
4. **配置API密钥**：
   - **API Provider**: 选择服务商（通义千问 或 DeepSeek）
   - **API Key**: 输入你的API密钥
   - **API Endpoint**: 自动填充（也可自定义）
5. **保存设置**：点击"保存设置"按钮

---

## API密钥获取方式

### 通义千问（Qwen）

1. 访问 [阿里云通义千问控制台](https://dashscope.console.aliyun.com/)
2. 注册/登录阿里云账号
3. 在控制台中创建 API Key
4. **API Endpoint**: `https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation`

**支持的模型**：
- `qwen-max` - 通义千问 Max（最强能力）
- `qwen-plus` - 通义千问 Plus（平衡性能）
- `qwen-turbo` - 通义千问 Turbo（快速响应）
- `qwen-vl-max` - 通义千问 VL-Max（支持视觉输入）

### DeepSeek

1. 访问 [DeepSeek官网](https://platform.deepseek.com/)
2. 注册/登录账号
3. 在API Keys页面创建新的API密钥
4. **API Endpoint**: `https://api.deepseek.com/v1/chat/completions`

**支持的模型**：
- `deepseek-chat` - DeepSeek Chat（通用对话）
- `deepseek-coder` - DeepSeek Coder（代码专用）

---

## 配置文件位置（方式二：手动修改）

如果你想直接修改代码来设置默认API密钥，编辑以下文件：

### 主页配置
文件：`/home/x/Xcode/ROS2/assets/js/chat-widget-enhanced.js`

在 `constructor()` 方法中找到这些行（约第33-36行）：

```javascript
this.apiKey = localStorage.getItem('ai_api_key') || '';
this.apiEndpoint = localStorage.getItem('ai_api_endpoint') || 'https://api.openai.com/v1/chat/completions';
this.apiProvider = localStorage.getItem('ai_provider') || 'qwen';
```

修改为：

```javascript
this.apiKey = localStorage.getItem('ai_api_key') || 'YOUR_API_KEY_HERE';
this.apiEndpoint = localStorage.getItem('ai_api_endpoint') || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
this.apiProvider = localStorage.getItem('ai_provider') || 'qwen';
```

### 文档页面配置
同时需要同步到文档页面：
```bash
cp /home/x/Xcode/ROS2/assets/js/chat-widget-enhanced.js /home/x/Xcode/ROS2/assets/html/_static/js/chat-widget-enhanced.js
```

---

## 功能说明

### 右下角拉伸
- AI助手窗口的**右下角**有一个拉伸图标（⋰）
- 鼠标悬停时图标会高亮
- 拖拽可以调整窗口大小
- **最小尺寸**: 320x400 像素
- **最大尺寸**: 800x窗口高度90%

### 模型选择
- 用户可以直接在顶部选择任意模型
- 不需要先选择服务商（已自动识别）
- 支持的模型：
  - 通义千问 Max
  - 通义千问 Plus
  - 通义千问 Turbo
  - 通义千问 VL-Max (视觉)
  - DeepSeek Chat
  - DeepSeek Coder

### 跨页面同步
- 对话历史会自动保存到 localStorage
- 在不同页面之间切换时，对话会保持连续
- API配置也会跨页面保存

### 无API密钥模式
如果没有配置API密钥，系统会使用硬编码的模拟回答，支持以下关键词：
- 安装、setup、install
- 节点、node
- 话题、topic
- launch、启动
- 参数、parameter
- 服务、service
- 等等...

---

## 测试验证

配置完成后：
1. 刷新网页
2. 点击AI助手图标打开聊天窗口
3. 发送测试消息："你好"
4. 如果配置正确，会收到AI的真实回复
5. 如果未配置，会看到硬编码的提示信息

---

## 故障排查

### API调用失败
1. 检查API密钥是否正确
2. 检查API Endpoint是否正确
3. 打开浏览器开发者工具(F12)查看Console错误信息
4. 确认网络连接正常

### 模型选择器不显示
1. 清除浏览器缓存（Ctrl+Shift+R）
2. 检查是否有JavaScript错误
3. 确保文件已同步到 `_static/js/` 目录

### 拉伸功能无效
1. 确保鼠标悬停在右下角的 ⋰ 图标上
2. 窗口不能处于最小化状态
3. 检查CSS是否正确加载

---

## 管理员密码

- 默认密码：`ros2admin`
- 修改密码位置：`chat-widget-enhanced.js` 第35行
- 建议生产环境修改为更安全的密码

```javascript
this.adminPassword = 'ros2admin'; // 在这里修改密码
```
