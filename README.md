# ROS2 Humble 教学文档网站

一个带有AI聊天助手的ROS2 Humble交互式教学网站，集成完整的ROS2官方文档库。

## 功能特点

- 📚 **完整的ROS2教学内容** - 从入门到进阶的完整教学路径
- 📖 **官方文档集成** - 内嵌完整的ROS2官方文档，支持侧边栏导航
- 🤖 **智能AI助手** - 可拖拽的聊天窗口，支持多模型切换
- 📱 **响应式设计** - 适配桌面和移动设备
- 💻 **代码高亮** - 支持Python和C++代码语法高亮
- 🎯 **交互式教程** - 模态框展示详细教程内容
- 🔍 **文档搜索** - 快速搜索查找所需文档

## 在线访问

访问网站：[https://your-username.github.io/your-repo-name/](https://your-username.github.io/your-repo-name/)

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/your-username/your-repo-name.git

# 进入ROS2目录
cd ROS2

# 使用Python简单服务器运行
python3 -m http.server 8000

# 或者使用Node.js服务器
npx serve .

# 访问 http://localhost:8000
```

## 文件结构

```
ROS2/
├── index.html                 # 主页面
├── docs.html                  # 文档浏览页面（iframe集成）
├── assets/
│   ├── css/
│   │   └── styles.css        # 样式文件
│   ├── js/
│   │   ├── main.js           # 主要功能
│   │   └── chat-widget.js    # AI聊天功能
│   └── html/                  # ROS2官方文档库
│       ├── index.html        # 文档首页
│       ├── Installation.html # 安装指南
│       ├── Tutorials/        # 教程目录
│       ├── Concepts/         # 概念文档
│       └── ...               # 更多文档
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions 部署配置
├── README.md                 # 说明文档
└── LICENSE                   # 许可证
```

## 主要页面

1. **首页 (index.html)** - ROS2入门指南、基础概念、教程和代码示例
2. **文档页面 (docs.html)** - 集成的ROS2官方文档浏览器，带有侧边栏导航

## AI聊天助手功能

### 特性
- 🔄 **可拖拽** - 窗口可以自由拖拽移动
- 📏 **可最小化** - 支持最小化和恢复
- 🤖 **多模型支持** - GPT-4、GPT-3.5、Claude、Gemini
- 💬 **智能回复** - 针对ROS2问题的专业回答
- 📱 **响应式** - 移动端自适应

### 使用方法
1. 点击右下角的"AI助手"按钮打开聊天窗口
2. 在顶部选择想要使用的AI模型
3. 在输入框中输入ROS2相关问题
4. 可以拖拽窗口标题栏移动位置
5. 使用最小化按钮临时收起窗口

## 部署到GitHub Pages

1. **创建GitHub仓库**
```bash
# 初始化Git仓库
git init
git add .
git commit -m "Initial commit: ROS2 tutorial website"
```

2. **推送到GitHub**
```bash
# 添加远程仓库
git remote add origin https://github.com/your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

3. **启用GitHub Pages（推荐使用GitHub Actions）**
   - 进入仓库的 Settings 页面
   - 点击左侧 "Pages" 
   - 在 "Build and deployment" > "Source" 下选择 **"GitHub Actions"**
   - 项目已配置好 `.github/workflows/deploy.yml`，推送代码后会自动部署

4. **访问网站**
   - 部署完成后，GitHub会提供URL：`https://your-username.github.io/your-repo-name/`
   - 主页: `https://your-username.github.io/your-repo-name/index.html`
   - 文档页: `https://your-username.github.io/your-repo-name/docs.html`

## 技术栈

- **HTML5** - 网页结构
- **CSS3** - 样式和动画
- **JavaScript (ES6+)** - 交互功能
- **Highlight.js** - 代码语法高亮
- **GitHub Actions** - 自动化部署
- **GitHub Pages** - 静态网站托管

## 快速部署命令

```bash
cd /home/x/Xcode/ROS2
git add .
git commit -m "Add ROS2 documentation integration"
git push origin main
```

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
