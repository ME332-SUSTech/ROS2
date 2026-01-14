# ROS2教学网站 AI助手使用指南 🤖

## 功能概述

ROS2教学网站已集成智能AI助手，支持：
- ✅ **跨页面持久化** - 对话历史在所有页面间共享
- ✅ **双模式访问** - 管理员模式和用户模式分离
- ✅ **多AI服务支持** - 通义千问(Qwen)和DeepSeek
- ✅ **图片上传** - 支持上传图片进行视觉问答（需视觉模型）
- ✅ **对话历史** - 自动保存，刷新不丢失
- ✅ **全文档覆盖** - 503个HTML页面全部集成

---

## 用户模式（普通访问者）

### 如何使用

1. **打开AI助手**
   - 点击页面右下角的 **🤖 AI助手** 按钮
   - 助手窗口会从右下角弹出

2. **选择AI服务**
   - 点击右上角的 **⚙️** 设置按钮
   - 选择AI服务提供商：
     - **通义千问 (Qwen)** - 阿里巴巴AI服务
     - **DeepSeek** - 深度求索AI服务
   - 点击"保存"

3. **开始对话**
   - 在输入框输入问题
   - 点击发送或按 `Enter`
   - AI会根据选择的服务商回答

4. **切换页面**
   - 对话历史会自动保存
   - 跳转到其他文档页面时，历史对话仍然存在
   - 所有页面共享同一个AI助手

### 用户界面说明

```
┌─────────────────────────────────┐
│  🤖 ROS2 AI助手      ⚙️ 📋 - ✕  │  ← 标题栏（可拖动）
├─────────────────────────────────┤
│                                 │
│  [对话消息区域]                 │  ← 显示对话历史
│                                 │
├─────────────────────────────────┤
│  模型选择: [Qwen-Max ▼]        │  ← 选择具体模型
├─────────────────────────────────┤
│  [输入消息...] 📎 ➤            │  ← 输入区（图片 + 发送）
└─────────────────────────────────┘
```

### 图标说明

- **⚙️** - 设置（选择AI服务商）
- **📋** - 清除对话历史
- **-** - 最小化窗口
- **✕** - 关闭窗口
- **📎** - 上传图片
- **➤** - 发送消息

---

## 管理员模式

### 登录管理员

1. 点击 **⚙️** 设置按钮
2. 在设置界面底部，点击 **"管理员模式？点击登录"**
3. 输入管理员密码：`ros2admin`
4. 登录成功后进入管理员设置界面

### 管理员功能

管理员可以配置：
- **AI服务提供商** - Qwen或DeepSeek
- **API端点** - 自定义API地址
- **API Key** - 配置服务密钥

### 配置示例

#### 通义千问 (Qwen) 配置
```
服务商: 通义千问 (Qwen)
API端点: https://dashscope.aliyuncs.com/compatible-mode/v1
API Key: sk-xxxxxxxxxxxxxxxxxxxxx
```

#### DeepSeek 配置
```
服务商: DeepSeek
API端点: https://api.deepseek.com/v1
API Key: sk-xxxxxxxxxxxxxxxxxxxxx
```

### 获取API密钥

1. **通义千问（阿里云）**
   - 访问：https://dashscope.aliyuncs.com/
   - 注册/登录阿里云账号
   - 创建API密钥

2. **DeepSeek**
   - 访问：https://platform.deepseek.com/
   - 注册账号
   - 在控制台获取API Key

---

## 技术架构

### 数据存储

所有配置和对话历史存储在浏览器的 `localStorage` 中：

```javascript
// 存储键值
ai_provider          // 服务商选择 (qwen/deepseek)
ai_api_endpoint      // API端点地址
ai_api_key          // API密钥（仅管理员）
ai_admin_mode       // 管理员模式标志
ros2_chat_history   // 对话历史
sidebar-width       // 侧边栏宽度
```

### 跨页面持久化原理

1. **localStorage共享**
   - 同域名下所有页面共享localStorage
   - 每次页面加载时自动读取历史对话

2. **自动保存**
   - 每次发送消息后自动保存到localStorage
   - 刷新页面或跳转不会丢失数据

3. **同步机制**
   - 所有503个HTML页面使用相同的聊天组件
   - 统一从localStorage读写数据

### API集成

聊天助手使用 **OpenAI兼容格式** 的API：

```javascript
// API请求格式
POST /v1/chat/completions
Content-Type: application/json
Authorization: Bearer sk-xxxxx

{
  "model": "qwen-max",
  "messages": [
    {"role": "system", "content": "系统提示"},
    {"role": "user", "content": "用户问题"}
  ]
}
```

支持的模型：
- **Qwen**: qwen-max, qwen-plus, qwen-turbo, qwen-vl-max
- **DeepSeek**: deepseek-chat, deepseek-coder

---

## 常见问题

### Q: 为什么看不到AI响应？
A: 检查：
1. 管理员是否已配置API密钥
2. 网络连接是否正常
3. API余额是否充足

### Q: 对话历史能保存多久？
A: localStorage数据永久保存，除非：
- 清除浏览器缓存
- 点击"清除历史"按钮
- 手动删除localStorage数据

### Q: 如何切换AI服务？
A: 
- **用户**：点击⚙️设置 → 选择服务商 → 保存
- **管理员**：需要同时更新API Key和端点

### Q: 图片上传后看不到AI分析？
A: 确保选择的是支持视觉的模型：
- Qwen: `qwen-vl-max`
- 其他文本模型不支持图片

### Q: 如何退出管理员模式？
A: 清除浏览器localStorage或使用开发者工具：
```javascript
localStorage.removeItem('ai_admin_mode')
```

### Q: 多个标签页会互相影响吗？
A: 不会。虽然共享localStorage，但每个标签页的UI状态独立。
历史记录会在所有标签页中同步。

---

## 开发者信息

### 文件结构

```
ROS2/
├── index.html                          # 主页（已集成AI）
├── assets/
│   ├── js/
│   │   └── chat-widget-enhanced.js    # AI助手核心代码
│   └── css/
│       └── styles.css                  # 样式（含AI组件）
└── assets/html/
    ├── _static/
    │   ├── js/
    │   │   ├── chat-widget-enhanced.js  # 复制到此供文档使用
    │   │   └── resizable-sidebar.js     # 侧边栏功能
    │   └── css/
    │       ├── chat-widget.css           # AI组件样式
    │       └── resizable-sidebar.css     # 侧边栏样式
    ├── add_chat_widget.py                # 批量注入脚本
    └── [503个HTML文档]                   # 所有已集成AI助手
```

### 修改管理员密码

编辑 `chat-widget-enhanced.js` 第23行：

```javascript
this.adminPassword = 'ros2admin'; // 修改此处
```

### 添加新的AI服务商

1. 修改 `showSettings()` 函数中的服务商列表
2. 更新 `updateModelOptions()` 中的模型列表
3. 如需特殊请求格式，修改 `callOpenAI()` 函数

---

## 许可证

本AI助手组件基于 ROS2 教学网站项目开发。

---

**更新日期**: 2026年1月13日  
**版本**: 2.0 (双模式)  
**状态**: ✅ 已部署到503个HTML页面
