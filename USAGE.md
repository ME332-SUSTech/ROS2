# ROS2教学网站使用指南

## 🚀 快速开始

### 1. 本地运行网站

```bash
# 方法一：使用部署脚本（推荐）
./deploy.sh

# 方法二：直接启动服务器
python3 -m http.server 8000

# 方法三：使用npm脚本
npm start
```

访问 http://localhost:8000 查看网站。

### 2. AI聊天助手使用

1. **打开聊天窗口**：点击右下角的"AI助手"按钮
2. **选择模型**：在窗口顶部选择AI模型（目前为模拟模式）
3. **提问**：输入ROS2相关问题，如：
   - "什么是ROS2节点？"
   - "如何创建发布者？"
   - "ROS2安装步骤"
4. **拖拽窗口**：点击窗口标题栏拖拽移动位置
5. **最小化**：点击"-"按钮最小化窗口

### 3. 交互式教程

- 点击教程部分的"查看教程"按钮
- 在弹出的模态框中查看详细内容
- 包含完整的代码示例和说明

## 🛠️ 开发配置

### 项目结构
```
ROS2/
├── index.html              # 主页面
├── assets/
│   ├── css/styles.css      # 样式文件
│   └── js/
│       ├── main.js         # 主功能
│       └── chat-widget.js  # AI聊天功能
├── config.json             # AI配置文件
├── deploy.sh              # 部署脚本
└── package.json           # 项目配置
```

### 自定义配置

1. **修改AI回复内容**
   编辑 `assets/js/chat-widget.js` 中的 `responses` 对象

2. **添加新教程**
   在 `assets/js/main.js` 的 `tutorials` 对象中添加新内容

3. **修改样式**
   编辑 `assets/css/styles.css` 文件

4. **配置AI模型**
   编辑 `config.json` 文件（为将来集成真实API做准备）

## 📱 响应式设计

网站已针对以下设备优化：
- 🖥️ 桌面设备 (1200px+)
- 💻 平板设备 (768px - 1199px)
- 📱 手机设备 (< 768px)

在移动设备上，AI聊天窗口会全屏显示以提供更好的用户体验。

## 🎨 主题和样式

### 颜色方案
- 主色调：#667eea (蓝色渐变)
- 辅助色：#764ba2 (紫色)
- 背景色：#f8f9fa (浅灰)
- 文字色：#333 (深灰)

### 字体
- 主字体：'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- 代码字体：'Fira Code', 'Consolas', monospace

## 🔧 高级功能

### AI聊天窗口特性
- ✅ 可拖拽移动
- ✅ 最小化/展开
- ✅ 模型选择
- ✅ 输入历史记录
- ✅ 自动滚动
- ✅ 加载动画

### 代码高亮
使用 Highlight.js 支持：
- Python
- C++
- Bash/Shell
- JSON
- YAML

### 平滑滚动
页面导航链接支持平滑滚动到对应部分。

## 🚀 部署选项

### GitHub Pages（推荐）
1. 推送代码到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择源分支为 `main`
4. 网站将自动部署

### 其他部署平台
- **Netlify**: 拖拽文件夹到 netlify.com
- **Vercel**: 连接GitHub仓库自动部署
- **Firebase Hosting**: 使用 Firebase CLI 部署
- **自有服务器**: 上传文件到Web根目录

## 🐛 常见问题

### Q: AI聊天不工作？
A: 当前为模拟模式，检查浏览器控制台是否有JavaScript错误。

### Q: 样式显示异常？
A: 确保所有CSS和JS文件路径正确，检查网络连接。

### Q: 在移动设备上显示不正常？
A: 清除浏览器缓存，确保使用最新版本的文件。

### Q: 代码高亮不显示？
A: 确保Highlight.js库正常加载，检查网络连接。

## 📞 技术支持

如遇到问题，请：
1. 检查浏览器控制台错误信息
2. 查看GitHub Issues
3. 提交新的Issue描述问题

## 🔄 更新日志

### v1.0.0 (2024-11-10)
- ✅ 基础网站框架
- ✅ AI聊天窗口
- ✅ 响应式设计
- ✅ 代码高亮
- ✅ 交互式教程
- ✅ 部署脚本