# 🚀 快速配置指南

## 管理员配置API密钥（5分钟完成）

### 第1步：获取API密钥

**通义千问（推荐）：**
1. 访问：https://dashscope.console.aliyun.com/
2. 注册/登录阿里云账号
3. 进入"API-KEY管理"
4. 点击"创建新的API-KEY"
5. 复制密钥（sk-开头）

**DeepSeek：**
1. 访问：https://platform.deepseek.com/
2. 注册账号
3. 进入"API Keys"页面
4. 点击"Create API Key"
5. 复制密钥

### 第2步：创建配置文件

```bash
cd /home/x/Xcode/ROS2

# 复制配置模板
cp config.yaml.example config.yaml

# 编辑配置文件
nano config.yaml
```

**填入你的API密钥：**
```yaml
qwen:
  api_key: "sk-your-actual-qwen-key-here"  # 替换这里
  endpoint: "https://dashscope.aliyuncs.com/compatible-mode/v1"

deepseek:
  api_key: "sk-your-actual-deepseek-key-here"  # 替换这里
  endpoint: "https://api.deepseek.com/v1"

security:
  obfuscation_key: "my-random-secret-2026"  # 改成随机字符串
  allowed_domains:
    - "me332-sustech.github.io"
    - "localhost"
    - "127.0.0.1"
```

### 第3步：安装依赖并加密

```bash
# 安装PyYAML（如果还没安装）
pip install pyyaml

# 运行加密工具
python3 encrypt_config.py
```

**预期输出：**
```
🔐 ROS2教学网站 API密钥加密工具

✅ 已生成加密配置: /home/x/Xcode/ROS2/assets/js/api-config.js
✅ 已生成加密配置: /home/x/Xcode/ROS2/assets/html/_static/js/api-config.js

🎉 加密完成！
📝 说明:
  - API密钥已加密并保存到 api-config.js
  - config.yaml 不会被上传到Git（已在.gitignore中）
  - 用户无需配置API密钥即可使用

⚠️  安全提示:
  - 这是简单混淆加密，不是完全安全的加密
  - 建议在通义千问/DeepSeek控制台设置域名白名单
  - 定期更换API密钥
```

### 第4步：测试

```bash
# 启动测试服务器
python3 -m http.server 8080

# 在浏览器打开
# http://localhost:8080
```

**测试步骤：**
1. 点击右下角🤖 AI助手
2. 输入："你好"
3. 应该收到AI的真实回复（不是模拟回答）
4. 检查浏览器控制台是否有"✅ 已加载预配置的API密钥"

### 第5步：提交到Git

```bash
# 查看将要提交的文件
git status

# 应该看到：
# modified:   assets/js/api-config.js
# modified:   assets/html/_static/js/api-config.js
# 
# 不应该看到 config.yaml（已被.gitignore忽略）

# 提交加密配置
git add assets/js/api-config.js assets/html/_static/js/api-config.js
git commit -m "Update encrypted API configuration"
git push origin main
```

### 第6步：等待部署

1. 访问 https://github.com/ME332-SUSTech/ROS2/actions
2. 等待GitHub Actions完成部署（约2-3分钟）
3. 访问 https://me332-sustech.github.io/ROS2/
4. 测试AI助手功能

---

## 安全检查清单

在提交前，请确认：

- [ ] `config.yaml` 文件不在 `git status` 输出中
- [ ] `api-config.js` 文件内容是加密的（看不到明文API密钥）
- [ ] `.gitignore` 包含 `config.yaml`
- [ ] 本地测试AI功能正常
- [ ] 浏览器控制台无错误

---

## 高级：设置域名白名单（强烈推荐）

### 通义千问：

1. 登录 https://dashscope.console.aliyun.com/
2. 进入"API-KEY管理"
3. 点击你的API密钥旁边的"设置"
4. 添加允许的域名：
   ```
   me332-sustech.github.io
   localhost
   ```
5. 保存

### DeepSeek：

1. 登录 https://platform.deepseek.com/
2. 进入"API Keys"页面
3. 点击API密钥的设置
4. 添加域名限制（如果支持）

---

## 常见问题

### Q: 运行encrypt_config.py报错找不到yaml模块？
```bash
pip install pyyaml
# 或
pip3 install pyyaml
```

### Q: config.yaml不小心提交到Git了怎么办？
```bash
# 从Git历史中删除
git rm --cached config.yaml
git commit -m "Remove config.yaml from git"
git push origin main

# 然后立即更换API密钥！
```

### Q: 如何验证密钥是否加密？
```bash
# 查看api-config.js内容
cat assets/js/api-config.js

# 应该看到类似这样的加密内容：
# "api_key": "SGVsbG8gV29ybGQhIFRoaXMgaXMg..."
# 而不是: "api_key": "sk-abc123..."
```

### Q: 部署后AI还是用模拟模式？
检查：
1. GitHub上的`api-config.js`是否更新
2. 浏览器清除缓存（Ctrl+Shift+R）
3. 控制台是否有"域名未在白名单"警告
4. `config.yaml`中的`allowed_domains`是否包含实际域名

---

**配置完成！** 🎉

用户现在可以直接使用AI助手，无需任何配置。
