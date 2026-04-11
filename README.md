# ROS2 Humble 交互式学习文档 🤖

> 集成503页ROS2官方文档 + AI智能助手，实现边看文档边提问的互动学习体验。

**在线体验**: https://me332-sustech.github.io/ROS2/

---

## ⚡ 快速使用

### 第一步：打开网站
```bash
# 本地运行
git clone https://github.com/ME332-SUSTech/ROS2.git
cd ROS2
python3 -m http.server 8080
# 访问 http://localhost:8080
```

### 第二步：使用功能

| 功能 | 操作 |
|------|------|
| 📚 **查看文档** | 点击主页课程表或侧边栏导航 |
| 🤖 **提问AI助手** | 点击右下角AI按钮，输入问题（试试 `/code` `/plan` `/teacher`） |
| 🔗 **快速导航** | 粘贴官方文档URL，自动跳转对应页面 |
| 💾 **保存对话** | 对话自动跨页面同步 |

### 第三步：AI助手命令

```
/code       → 代码分析模式（找bug、给修复方案）
/plan       → 计划模式（拆分目标、制定清单）
/teacher    → 教学模式（易老师口吻讲解）
/normal     → 通用模式（恢复默认回答模式）
/sys <指令> → 自定义系统提示（单次会话生效）
/relearn    → 重置学习进度
```

**详细说明**: 见 [AI助手模式索引](docs/AI_ASSISTANT_MODES.md)

---

## 🌍 三种使用方式

### 方式1：普通用户（推荐）
```bash
# 直接运行，无需配置API密钥
python3 -m http.server 8080
# 会自动进入模拟对话模式或使用预配置密钥
```

### 方式2：配置AI回答（管理员）

**快速步骤**：
```bash
# 1. 复制配置模板
cp config.yaml.example config.yaml

# 2. 编辑配置，填入你的API密钥
nano config.yaml

# 3. 安装依赖并加密
pip install pyyaml
python3 encrypt_config.py

# 4. 提交（config.yaml不会被上传）
git add .
git commit -m "Update API config"
git push
```

**config.yaml示例**：
```yaml
qwen:
  api_key: "sk-your-key-here"
deepseek:
  api_key: "sk-your-key-here"
security:
  obfuscation_key: "change-this-to-random"
```

详见: [SETUP_GUIDE.md](SETUP_GUIDE.md)

### 方式3：最高安全（Cloudflare Workers）
适合生产环境，密钥完全不暴露。见: [UPDATE.md](UPDATE.md)

---

## 📋 功能列表

✅ 503页ROS2官方文档  
✅ 智能AI助手（通义千问/DeepSeek）  
✅ 代码分析、计划制定、教学讲解3种模式  
✅ 学习进度自适应  
✅ 对话历史跨页面同步  
✅ 代码语法高亮  
✅ 响应式设计（桌面/平板/手机）  

---

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
```
├── index.html              # 主页  
├── docs.html               # 文档浏览器
├── config.yaml.example     # API配置模板
├── encrypt_config.py       # 加密工具
├── assets/
│   ├── css/styles.css
│   ├── js/chat-widget-enhanced.js (AI助手核心)
│   └── html/               # 503个ROS2文档页面
└── docs/
    └── AI_ASSISTANT_MODES.md  # AI模式与命令索引
```

---

## ⚖️ 许可证

| 部分 | 许可证 |
|------|--------|
| AI助手代码 | MIT License |
| ROS2文档 | Apache License 2.0（Open Robotics） |
| 项目 | 非商用教育用途 |

---

## 📚 更多文档

- **[AI助手模式详解](docs/AI_ASSISTANT_MODES.md)** - 四种模式的sysprompt和用法
- **[API配置指南](SETUP_GUIDE.md)** - 管理员密钥配置
- **[开发者指南](UPDATE.md)** - 扩展和维护

---

## 🤝 贡献

欢迎提交 Issue 和 PR！

- 遵守项目的教育非商用性质
- 尊重ROS2许可证
- 提交前测试功能

---

**项目状态**：✅ 积极维护  
**最后更新**：2026年4月  
**版本**：3.0
