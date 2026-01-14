# 🔧 开发者更新指南

本文档汇总了后期开发维护时可能需要修改的关键位置，帮助开发者快速定位和更新。

---

## 📝 系统提示词（System Prompt）

### 位置
- **主文件**：`assets/js/chat-widget-enhanced.js`
- **文档副本**：`assets/html/_static/js/chat-widget-enhanced.js`

### 查找方法
```bash
# 搜索 system prompt 定义
grep -n "role.*system" assets/js/chat-widget-enhanced.js
```

### 修改位置
在 `loadConversationHistory()` 方法中（约第60-75行）：

```javascript
loadConversationHistory() {
    // ... 
    return [{
        role: 'system',
        content: '你是一个专业的ROS2助手，精通ROS2 Humble的各个方面...'  // 👈 修改这里
    }];
}
```

### 同步更新
```bash
# 修改后同步到文档目录
cp assets/js/chat-widget-enhanced.js assets/html/_static/js/chat-widget-enhanced.js
```

---

## 🔐 API密钥加密配置

### 加密工具位置
- **脚本**：`encrypt_config.py`
- **配置文件**：`config.yaml`（本地，不上传Git）
- **配置模板**：`config.yaml.example`

### 加密算法
**当前方案**：简单XOR加密 + Base64编码

**代码位置**：`encrypt_config.py` 第13-22行
```python
def simple_encrypt(text, key):
    """简单的XOR加密（用于混淆，不是真正的安全加密）"""
    key_bytes = key.encode('utf-8')
    text_bytes = text.encode('utf-8')
    
    encrypted = bytearray()
    for i, byte in enumerate(text_bytes):
        encrypted.append(byte ^ key_bytes[i % len(key_bytes)])
    
    return base64.b64encode(encrypted).decode('utf-8')
```

### 升级到更强加密
如需使用AES等强加密，修改：
1. 安装依赖：`pip install cryptography`
2. 替换 `simple_encrypt()` 函数
3. 修改 `assets/js/api-config.js` 中的 `decryptApiKey()` 函数

**前端解密位置**：`assets/js/api-config.js` 第8-25行

---

## 🤖 API服务配置

### 位置
- **配置源**：`config.yaml`
- **加密输出**：`assets/js/api-config.js`

### 添加新的AI服务商

**步骤1**：修改 `config.yaml.example` 添加新服务：
```yaml
# 新增服务商
new_service:
  api_key: "your-key-here"
  endpoint: "https://api.newservice.com/v1"
  models:
    - "model-1"
    - "model-2"
```

**步骤2**：修改 `encrypt_config.py` 第50-60行，添加加密逻辑：
```python
encrypted_config = {
    'qwen': {...},
    'deepseek': {...},
    'new_service': {  # 👈 添加这里
        'api_key': simple_encrypt(config['new_service']['api_key'], obfuscation_key),
        'endpoint': config['new_service']['endpoint'],
        'models': config['new_service']['models']
    },
    # ...
}
```

**步骤3**：修改 `assets/js/chat-widget-enhanced.js`

在 `updateModelOptions()` 方法中添加模型（约第400-450行）：
```javascript
updateModelOptions() {
    const allModels = [
        {value: 'qwen-max', label: '通义千问 Max', provider: 'qwen'},
        // ... 其他模型
        {value: 'new-model', label: '新服务模型', provider: 'new_service'}  // 👈 添加这里
    ];
    // ...
}
```

在 `callOpenAI()` 方法中处理API调用（约第650-750行）：
```javascript
async callOpenAI() {
    let apiEndpoint = this.apiEndpoint;
    
    // 根据provider确定endpoint
    if (this.apiProvider === 'qwen') {
        apiEndpoint = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    } else if (this.apiProvider === 'deepseek') {
        apiEndpoint = 'https://api.deepseek.com/v1/chat/completions';
    } else if (this.apiProvider === 'new_service') {  // 👈 添加这里
        apiEndpoint = 'https://api.newservice.com/v1/chat/completions';
    }
    // ...
}
```

**步骤4**：重新加密并部署
```bash
python3 encrypt_config.py
git add assets/js/api-config.js assets/js/chat-widget-enhanced.js
git commit -m "Add new AI service provider"
git push
```

---

## 🎯 模型选择器

### 位置
`assets/js/chat-widget-enhanced.js` 的 `updateModelOptions()` 方法（约第400-450行）

### 当前模型列表
```javascript
const allModels = [
    // 通义千问
    {value: 'qwen-max', label: '通义千问 Max', provider: 'qwen'},
    {value: 'qwen-plus', label: '通义千问 Plus', provider: 'qwen'},
    {value: 'qwen-turbo', label: '通义千问 Turbo', provider: 'qwen'},
    {value: 'qwen-vl-max', label: '通义千问 VL-Max (视觉)', provider: 'qwen'},
    
    // DeepSeek
    {value: 'deepseek-chat', label: 'DeepSeek Chat', provider: 'deepseek'},
    {value: 'deepseek-coder', label: 'DeepSeek Coder', provider: 'deepseek'}
];
```

### 修改模型
1. **添加模型**：在 `allModels` 数组中添加新条目
2. **删除模型**：删除对应条目
3. **修改显示名**：修改 `label` 字段
4. **同步到文档**：
   ```bash
   cp assets/js/chat-widget-enhanced.js assets/html/_static/js/chat-widget-enhanced.js
   ```

---

## 💬 硬编码回复（模拟模式）

### 位置
`assets/js/chat-widget-enhanced.js` 的 `getHardcodedResponse()` 方法（约第750-850行）

### 当前支持的关键词
```javascript
getHardcodedResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    // 安装相关
    if ((lowerMsg.includes('安装') || lowerMsg.includes('install')) && 
        (lowerMsg.includes('ros2') || lowerMsg.includes('ros 2'))) {
        return '这里是安装步骤...';
    }
    
    // 节点相关
    if ((lowerMsg.includes('节点') || lowerMsg.includes('node')) && 
        (lowerMsg.includes('ros2') || lowerMsg.includes('ros 2'))) {
        return '这里是节点说明...';
    }
    
    // ... 更多关键词
}
```

### 添加新的硬编码回复
在方法中添加新的 `if` 条件块：
```javascript
// 新增话题
if (lowerMsg.includes('自定义关键词')) {
    return '你的自定义回复内容...';
}
```

---

## 🌐 域名白名单

### 位置
- **配置源**：`config.yaml` 第29-33行
- **前端验证**：`assets/js/api-config.js` 第31-35行

### 修改白名单
**方法1**：修改 `config.yaml`
```yaml
security:
  allowed_domains:
    - "me332-sustech.github.io"
    - "me332-sustech.github.io/ROS2"
    - "your-new-domain.com"  # 👈 添加新域名
    - "localhost"
```

然后重新加密：
```bash
python3 encrypt_config.py
```

**方法2**：直接修改 `assets/js/api-config.js`
```javascript
const ENCRYPTED_CONFIG = {
    // ...
    "security": {
        "domains": [
            "me332-sustech.github.io",
            "me332-sustech.github.io/ROS2",
            "your-new-domain.com",  // 👈 添加新域名
            "localhost"
        ]
    }
};
```

---

## 📦 批量更新文档页面

### 工具位置
- **主脚本**：`assets/html/add_chat_widget.py`
- **更新脚本**：`assets/html/update_chat_widget.py`

### 批量更新AI组件
```bash
cd assets/html
python3 update_chat_widget.py
```

### 自定义批量更新
修改 `update_chat_widget.py` 中的替换逻辑（第40-80行）：
```python
def update_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 定义你的替换规则
    old_pattern = r'<!-- 旧的HTML结构 -->'
    new_html = '<!-- 新的HTML结构 -->'
    
    content = re.sub(old_pattern, new_html, content, flags=re.DOTALL)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
```

---

## 🎨 样式定制

### 主样式文件
- **全局样式**：`assets/css/styles.css`
- **AI组件样式**：`assets/css/styles.css` 第287-650行

### 常用修改

**修改AI窗口颜色**（第300-320行）：
```css
.chat-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);  /* 👈 修改渐变色 */
    color: white;
    padding: 15px;
}
```

**修改窗口大小**（第290-300行）：
```css
.ai-chat-widget {
    width: 380px;      /* 👈 修改默认宽度 */
    height: 550px;     /* 👈 修改默认高度 */
    min-width: 320px;  /* 👈 修改最小宽度 */
    min-height: 400px; /* 👈 修改最小高度 */
}
```

---

## 🚀 部署配置

### GitHub Actions
**配置文件**：`.github/workflows/deploy.yml`

**修改部署分支**（第5行）：
```yaml
on:
  push:
    branches: [ main ]  # 👈 修改触发分支
```

**修改上传路径**（第31行）：
```yaml
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: '.'  # 👈 修改上传目录
```

---

## 📋 更新检查清单

每次重要更新后，确认以下内容：

- [ ] 修改 `chat-widget-enhanced.js` 后同步到 `_static/js/`
- [ ] 修改 `config.yaml` 后运行 `encrypt_config.py`
- [ ] 修改样式后清除浏览器缓存测试
- [ ] 批量更新文档页面后检查至少3个页面
- [ ] 推送前确认 `config.yaml` 不在 `git status` 中
- [ ] 部署后访问线上网站测试AI功能
- [ ] 检查浏览器控制台无错误

---

## 🔍 调试技巧

### 查看加密配置是否加载
```javascript
// 在浏览器控制台运行
console.log(typeof ENCRYPTED_CONFIG);  // 应输出 "object"
console.log(ENCRYPTED_CONFIG);         // 查看加密配置
```

### 查看API调用
```javascript
// 在 chat-widget-enhanced.js 的 callOpenAI() 方法中添加
console.log('API Endpoint:', apiEndpoint);
console.log('API Key (first 10 chars):', this.apiKey.substring(0, 10));
console.log('Request body:', requestBody);
```

### 测试域名验证
```javascript
// 在浏览器控制台运行
console.log('Current hostname:', window.location.hostname);
console.log('Is allowed:', isAllowedDomain());
```

---

## 📚 相关文档

- [快速配置指南](SETUP_GUIDE.md)
- [主README](README.md)
- [ROS2官方文档](https://docs.ros.org/en/humble/)

---

**最后更新**: 2026年1月14日  
**维护者**: ME332-SUSTech 团队
