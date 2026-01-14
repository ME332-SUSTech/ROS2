# ROS2 Humble 教学文档网站 🤖

一个带有智能AI助手的ROS2 Humble交互式教学网站，集成完整的ROS2官方文档（503个页面）。

## ✨ 功能特点

- 📚 **完整的ROS2官方文档** - 503个页面，涵盖安装、教程、概念、指南等
- 🤖 **智能AI助手** - 支持通义千问和DeepSeek，可拖拽、可拉伸
- 🔐 **安全的API密钥管理** - 加密存储，不会泄露到Git仓库
- 🔄 **跨页面对话同步** - 所有页面共享对话历史
- 📱 **响应式设计** - 完美适配桌面、平板和移动设备
- 💻 **代码高亮** - Python/C++/Bash语法高亮显示
- 🎯 **快速导航** - URL跳转工具，直接访问官方文档对应页面

## 📖 快速导航

- 🚀 [快速开始](#-快速开始) - 5分钟上手使用
- 🔐 [API密钥配置](SETUP_GUIDE.md) - 管理员配置指南
- 🔧 [开发者更新指南](UPDATE.md) - 后期维护和定制
- 📝 [使用说明](#-使用说明) - 功能详解

## ⚠️ 重要声明

### 非商用教学项目

本项目是**非商用、非盈利的教育项目**，仅用于ROS2教学和学习目的。

### 版权与授权

1. **ROS2官方文档**：本项目包含的ROS2 Humble官方文档HTML文件是从 [docs.ros.org](https://docs.ros.org/) 复制而来，遵循ROS2项目的开源许可证（Apache License 2.0）。

2. **文档版权**：所有ROS2文档内容的版权归Open Robotics和ROS2贡献者所有。本项目对文档内容未做任何修改，仅添加了交互式AI助手功能。

3. **AI助手代码**：本项目开发的AI助手集成代码采用MIT License开源。

4. **使用限制**：
   - ✅ 允许用于教育和学习
   - ✅ 允许个人非商业使用
   - ✅ 允许在遵守许可证的前提下修改和分发
   - ❌ 禁止用于商业用途
   - ❌ 禁止违反ROS2和相关组件的许可证

### 免责声明

- 本项目不对AI助手生成的内容准确性负责，建议以官方文档为准
- API密钥安全由用户自行负责，建议定期更换
- 本项目提供的加密方案仅为简单混淆，不保证绝对安全
- 使用本项目产生的任何问题和损失，开发者不承担责任

### 致谢与引用

如果本项目对您的学习有帮助，请引用：
```
ROS2 Humble Interactive Tutorial Website
https://github.com/ME332-SUSTech/ROS2
Built upon ROS2 official documentation (https://docs.ros.org/)
```

## 🌐 在线访问

**GitHub Pages**: https://me332-sustech.github.io/ROS2/

## 🚀 快速开始

### 方式一：直接使用（适合普通用户）

```bash
# 克隆仓库
git clone https://github.com/ME332-SUSTech/ROS2.git
cd ROS2

# 启动本地服务器
python3 -m http.server 8080

# 访问 http://localhost:8080
```

无需配置API密钥，网站会使用预配置的加密密钥（如果管理员已配置）或模拟对话模式。

### 方式二：配置自己的API密钥（适合管理员）

#### 步骤1: 创建配置文件

```bash
# 复制配置模板
cp config.yaml.example config.yaml

# 编辑配置文件，填入你的API密钥
nano config.yaml  # 或使用其他编辑器
```

**config.yaml 示例：**
```yaml
qwen:
  api_key: "sk-your-qwen-api-key-here"
  endpoint: "https://dashscope.aliyuncs.com/compatible-mode/v1"
  
deepseek:
  api_key: "sk-your-deepseek-api-key-here"  
  endpoint: "https://api.deepseek.com/v1"

security:
  obfuscation_key: "your-random-secret-key-change-this"
  allowed_domains:
    - "me332-sustech.github.io"
    - "localhost"
```

#### 步骤2: 安装依赖并加密

```bash
# 安装Python依赖
pip install pyyaml

# 运行加密工具
python3 encrypt_config.py
```

加密工具会：
- ✅ 读取`config.yaml`中的API密钥
- ✅ 使用XOR加密 + Base64编码
- ✅ 生成`assets/js/api-config.js`（加密后）
- ✅ 自动同步到文档目录

#### 步骤3: 测试和部署

```bash
# 启动测试服务器
python3 -m http.server 8080

# 打开浏览器测试
# http://localhost:8080

# 确认无误后提交（config.yaml不会被上传）
git add .
git commit -m "Update encrypted API config"
git push origin main
```

## 🔐 API密钥安全方案

### 方案架构

```
┌─────────────────────────────────────────────────┐
│ 管理员配置                                       │
├─────────────────────────────────────────────────┤
│  1. 在 config.yaml 填入真实API密钥              │
│  2. 运行 encrypt_config.py 加密                 │
│  3. 生成 api-config.js（仅包含加密内容）        │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ Git仓库                                          │
├─────────────────────────────────────────────────┤
│  ✅ api-config.js（加密后的密钥）                │
│  ✅ config.yaml.example（模板）                  │
│  ❌ config.yaml（真实密钥，已在.gitignore中）   │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ 用户浏览器                                       │
├─────────────────────────────────────────────────┤
│  1. 加载 api-config.js                           │
│  2. 检查域名白名单                               │
│  3. 使用JavaScript解密API密钥                    │
│  4. 调用AI API获得智能回答                       │
└─────────────────────────────────────────────────┘
```

### 安全特性

1. **🔒 简单混淆加密**
   - XOR加密 + Base64编码
   - 混淆密钥也被加密
   - 源代码中看不到明文密钥

2. **🌐 域名白名单**
   - 只在指定域名下解密
   - 配合API服务商的域名限制
   - 防止密钥在其他网站使用

3. **📦 Git安全**
   - `config.yaml`在`.gitignore`中
   - 只上传加密后的文件
   - 真实密钥永不进入仓库

4. **🛡️ 额外建议**
   - 在通义千问/DeepSeek控制台设置域名白名单
   - 设置API调用频率限制
   - 定期更换API密钥
   - 监控API使用情况

### 方案对比

| 方案 | 安全性 | 复杂度 | 成本 | 推荐指数 |
|------|--------|--------|------|----------|
| **方案1: Cloudflare Workers** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 免费 | ⭐⭐⭐⭐⭐ |
| **方案2: 简单加密（当前）** | ⭐⭐⭐ | ⭐ | 免费 | ⭐⭐⭐⭐ |
| 方案3: GitHub Secrets | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 免费 | ⭐⭐⭐ |

**当前使用方案2**，如需更高安全性，可升级到方案1（见下方）。

## 🌟 方案1: Cloudflare Workers代理（最安全）

如果需要完全隐藏API密钥，可使用Cloudflare Workers：

### 部署步骤

1. **注册Cloudflare账号**：https://dash.cloudflare.com/sign-up
2. **创建Worker**：Workers & Pages → Create application
3. **粘贴代码**：将`cloudflare-worker.js`内容复制进去
4. **配置环境变量**：
   - `QWEN_API_KEY`: 你的通义千问密钥
   - `DEEPSEEK_API_KEY`: 你的DeepSeek密钥
5. **获取Worker URL**：例如 `https://ros2-ai-proxy.xxx.workers.dev`
6. **修改前端代码**：在`chat-widget-enhanced.js`中将API请求指向Worker

**优点**：
- ✅ API密钥完全不暴露
- ✅ 免费10万次/天请求
- ✅ 全球CDN加速

**详细教程**：见仓库中的`cloudflare-worker.js`

## 📖 使用说明

### AI助手功能

1. **打开AI助手**
   - 点击右下角 **🤖 AI助手** 按钮

2. **发送消息**
   - 输入ROS2相关问题
   - 支持Markdown格式回复
   - 代码自动高亮

3. **窗口操作**
   - **拖拽**：按住标题栏移动
   - **拉伸**：拖拽右下角⋰图标
   - **最小化**：点击 ━ 按钮
   - **关闭**：点击 ✕ 按钮

4. **模型选择**
   - 顶部下拉菜单选择AI模型
   - 通义千问：Max / Plus / Turbo / VL-Max
   - DeepSeek：Chat / Coder

5. **跨页面同步**
   - 对话历史自动保存
   - 切换页面不丢失上下文
   - 支持多标签页实时同步

### 文档导航

- **主页**：课程目录和快速链接
- **文档浏览器**：点击"📚 官方文档"进入
- **URL跳转**：粘贴官方文档URL自动跳转对应页面
- **侧边栏**：点击 ‹ › 按钮折叠/展开

## 📁 项目结构

```
ROS2/
├── index.html                      # 主页
├── docs.html                       # 文档浏览器
├── config.yaml.example             # API配置模板
├── config.yaml                     # 真实配置（不上传Git）
├── encrypt_config.py               # 加密工具
├── cloudflare-worker.js            # Cloudflare代理脚本
├── .gitignore                      # Git忽略文件
├── assets/
│   ├── css/styles.css             # 全站样式
│   ├── js/
│   │   ├── main.js                # 主功能
│   │   ├── chat-widget-enhanced.js # AI助手核心
│   │   ├── api-config.js          # 加密的API配置
│   │   └── url-navigator.js       # URL导航
│   └── html/                       # 503个ROS2文档页面
│       ├── index.html
│       ├── Installation/
│       ├── Tutorials/
│       ├── Concepts/
│       ├── How-To-Guides/
│       └── _static/
│           ├── css/
│           └── js/
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions部署
└── README.md                      # 本文件
```

## 🛠️ 技术栈

- **前端框架**：原生HTML5/CSS3/JavaScript ES6+
- **代码高亮**：Highlight.js
- **文档系统**：Sphinx生成的HTML
- **AI集成**：OpenAI兼容API（通义千问/DeepSeek）
- **加密方案**：XOR + Base64
- **部署**：GitHub Actions + GitHub Pages
- **CDN**：jsDelivr加速

## 🔧 开发指南

### 本地开发

```bash
# 安装依赖（可选）
npm install  # 或 pip install -r requirements.txt

# 启动开发服务器
python3 -m http.server 8080

# 修改后刷新浏览器即可查看效果
```

### 修改AI回复逻辑

编辑`assets/js/chat-widget-enhanced.js`：

```javascript
// 硬编码回答（无API时）
getHardcodedResponse(message) {
    // 添加你的自定义回答
}

// API调用（有API时）
async callOpenAI() {
    // 修改API请求逻辑
}
```

### 添加新文档

1. 将HTML文件放入`assets/html/`对应目录
2. 在`docs.html`的侧边栏添加链接
3. 运行批量更新脚本：
   ```bash
   python3 assets/html/add_chat_widget.py
   ```

### 更新加密配置

```bash
# 修改config.yaml
nano config.yaml

# 重新加密
python3 encrypt_config.py

# 测试
python3 -m http.server 8080

# 提交
git add assets/js/api-config.js assets/html/_static/js/api-config.js
git commit -m "Update API config"
git push
```

## 🚀 部署

### GitHub Pages（自动部署）

1. **推送代码**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **启用GitHub Pages**
   - 仓库 Settings → Pages
   - Source 选择 **GitHub Actions**
   - 等待2-3分钟自动部署

3. **访问网站**
   - https://your-username.github.io/ROS2/

### 其他部署方式

- **Vercel**：连接GitHub自动部署
- **Netlify**：拖拽文件夹上传
- **自有服务器**：上传到Web根目录

## ❓ 常见问题

### Q: API密钥会泄露吗？
A: 使用方案2时，密钥经过加密且有域名验证，但有一定破解风险。建议配合API服务商的域名白名单和频率限制。使用方案1（Cloudflare Workers）则完全安全。

### Q: 如何获取API密钥？
A: 
- **通义千问**：https://dashscope.console.aliyun.com/
- **DeepSeek**：https://platform.deepseek.com/

### Q: 为什么AI没有回复？
A: 检查：
1. 是否配置了API密钥（运行`python3 encrypt_config.py`）
2. API密钥是否正确且有余额
3. 浏览器控制台是否有错误
4. 网络连接是否正常

### Q: 如何更换API密钥？
A:
```bash
# 编辑config.yaml
nano config.yaml

# 重新加密
python3 encrypt_config.py

# 提交更新
git add assets/js/api-config.js
git commit -m "Update API key"
git push
```

### Q: 可以不使用API吗？
A: 可以！未配置API时会使用模拟对话模式，支持常见ROS2问题的硬编码回答。

### Q: 如何自定义域名白名单？
A: 编辑`config.yaml`中的`security.allowed_domains`，然后重新运行`encrypt_config.py`。

## 📄 许可证

- **AI助手代码**: MIT License - 详见[LICENSE](LICENSE)文件
- **ROS2文档内容**: Apache License 2.0 (原始版权归Open Robotics所有)
- **本项目**: 非商用教育项目，仅供学习使用

## 🙏 致谢

- **ROS2项目**: https://www.ros.org/ 和 https://docs.ros.org/
- **Open Robotics**: ROS2的开发和维护组织
- 通义千问API：https://dashscope.aliyuncs.com/
- DeepSeek API：https://platform.deepseek.com/
- GitHub Pages：https://pages.github.com/
- 所有ROS2社区贡献者

## 📮 联系与贡献

- **仓库地址**：https://github.com/ME332-SUSTech/ROS2
- **问题反馈**：[GitHub Issues](https://github.com/ME332-SUSTech/ROS2/issues)
- **功能建议**：Pull Requests欢迎
- **开发指南**：[UPDATE.md](UPDATE.md) - 开发者维护文档

### 贡献指南

欢迎提交Issue和PR，请确保：
1. 遵守项目的非商用教育性质
2. 尊重ROS2和相关组件的许可证
3. 提交前测试代码功能
4. 遵循现有代码风格

---

**项目性质**: 🎓 非商用教育项目  
**更新日期**: 2026年1月14日  
**版本**: 3.0（加密API密钥）  
**维护状态**: ✅ 积极维护中
