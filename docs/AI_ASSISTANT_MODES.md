# ROS2 AI助手功能角色索引

本文档记录所有AI助手的功能角色、对应的命令和系统提示词位置。

## 快速导航

| 命令 | 模式 | 功能 | 快捷键 |
|------|------|------|--------|
| `/code` | 代码分析 | 优先定位问题根因、给出最小修复方案 | 按钮触发 |
| `/plan` | 计划模式 | 拆解目标、输出里程碑、依赖和风险  | 按钮触发 |
| `/teacher` | 教学模式 | 以易老师口吻循序渐进讲解 | 按钮触发 |
| `/normal` | 通用模式 | 按用户问题给出清晰准确回答 | 按钮触发 |
| `/sys <指令>` | 自定义系统指令 | 为当前会话执行自定义系统提示 | 文本输入 |
| `/relearn` | 重新学习 | 重置学习背景，重新开始学习流程 | 文本输入 |

---

## 详细信息

### 1. 代码分析模式 (`/code`)

**功能描述**: 专注于代码问题诊断和解决

**系统提示词**:
```
代码分析模式：优先定位问题根因、给出最小修复方案、补充可运行代码与验证步骤。
```

**代码位置**: [assets/js/chat-widget-enhanced.js](assets/js/chat-widget-enhanced.js#L128-L131)
- 函数: `getModeInstruction()` (第128-131行)
- 模式值: `code`
- 占位符文本: "代码分析模式：描述报错、贴代码片段或输入 /normal 退出"

**使用场景**:
- 调试 ROS2 节点代码
- 分析 Python/C++ 编译错误
- 代码检查和优化建议

**例子**:
```
用户: /code TypeError: 'NoneType' object is not subscriptable
[粘贴代码片段]
助手: [分析根因，给出修复方案]
```

---

### 2. 计划模式 (`/plan`)

**功能描述**: 帮助规划和分解任务

**系统提示词**:
```
计划模式：先拆解目标，再输出里程碑、依赖和风险，给出可执行清单。
```

**代码位置**: [assets/js/chat-widget-enhanced.js](assets/js/chat-widget-enhanced.js#L128-L131)
- 函数: `getModeInstruction()` (第128-131行)
- 模式值: `plan`
- 占位符文本: "计划模式：输入你的目标、周期、资源约束"

**使用场景**:
- 制定学习计划
- 规划 ROS2 项目
- 分解复杂任务

**例子**:
```
用户: /plan 我想使用 ROS2 实现一个移动机器人导航系统
助手: [拆解成子目标 → 里程碑 → 依赖 → 风险 → 清单]
```

---

### 3. 教学模式 (`/teacher`)

**功能描述**: 以教师角色进行循序渐进的教学

**系统提示词**:
```
教学模式：以易老师口吻循序渐进讲解，先直觉解释，再给例子和练习。
```

**代码位置**: [assets/js/chat-widget-enhanced.js](assets/js/chat-widget-enhanced.js#L128-L131)
- 函数: `getModeInstruction()` (第128-131行)
- 模式值: `teacher`
- 占位符文本: "教学模式：输入你想学的知识点，我会分层讲解"

**使用场景**:
- 学习 ROS2 基础概念
- 需要详细的讲解和例子
- 初学者学习

**例子**:
```
用户: /teacher ROS2 话题系统是什么
助手: [直觉解释 → 概念详解 → 代码例子 → 练习 → 深入讨论]
```

---

### 4. 通用模式 (`/normal`)

**功能描述**: 标准问答模式

**系统提示词**:
```
通用模式：按用户问题给出清晰、准确、可执行的回答。
```

**代码位置**: [assets/js/chat-widget-enhanced.js](assets/js/chat-widget-enhanced.js#L128-L131)
- 函数: `getModeInstruction()` (第128-131行)
- 模式值: `general`
- 占位符文本: "输入问题... 试试 /code /plan /teacher"

**使用场景**:
- 默认问答模式
- 从其他模式切换回通用模式
- 一般性问题

**例子**:
```
用户: /normal  [或直接切换模式]
助手: ✅ 已切换到通用模式。
```

---

### 5. 自定义系统指令 (`/sys`)

**功能描述**: 为当前会话设置自定义系统提示

**代码位置**: [assets/js/chat-widget-enhanced.js](assets/js/chat-widget-enhanced.js#L740-L753)
- 处理函数: `sendMessage()` (第740-753行)
- 命令格式: `/sys <自定义指令>`

**用法**:
```
/sys 你是一个 ROS2 性能优化专家，请从性能角度回答
```

**特性**:
- 保留学习背景信息
- 与模式系统相兼容
- 保存到 `localStorage.ros2_custom_system_prompt`

---

### 6. 重新学习 (`/relearn`)

**功能描述**: 重置学习背景和学习历程

**代码位置**: [assets/js/chat-widget-enhanced.js](assets/js/chat-widget-enhanced.js#L727-L737)
- 处理函数: `sendMessage()` (第727-737行)

**操作**:
```
输入: /relearn
结果: 
- 清空 ros2_learning_lesson
- 清空 ros2_learning_foundation
- 清空 ros2_learning_progress  
- 重启学习流程
```

---

## 系统提示词组合逻辑

### 基础系统提示

```javascript
baseSystemPrompt = '你是一个专业的ROS2助手，精通ROS2 Humble的各个方面，
包括安装、配置、节点、话题、服务、参数、launch文件等。
请用清晰、准确的中文回答用户的问题。'
```

**代码位置**: [assets/js/chat-widget-enhanced.js](assets/js/chat-widget-enhanced.js#L83)

### 完整系统提示构成

```javascript
// 从 getComposedSystemPrompt() 方法 (第88-110行)
系统提示 = [
  基础提示词,
  学习背景 (如果有),
  自定义指令 (如果有),
  模式指令
]
```

**代码位置**: [assets/js/chat-widget-enhanced.js](assets/js/chat-widget-enhanced.js#L88-L110)

---

## 模式检测和命令处理

### 命令解析

```javascript
// 正则表达式匹配
const modeCommandMatch = message.match(/^\/(code|plan|teacher|normal)\s*(.*)$/s);

// 模式映射
{
  code: 'code',
  plan: 'plan',
  teacher: 'teacher',
  normal: 'general'
}
```

**代码位置**: [assets/js/chat-widget-enhanced.js](assets/js/chat-widget-enhanced.js#L703-L720)

---

## UI交互

### 占位符文本动态更新

[assets/js/chat-widget-enhanced.js](assets/js/chat-widget-enhanced.js#L119-L125) - `getModePlaceholder()`

```javascript
{
  general: '输入问题... 试试 /code /plan /teacher',
  code: '代码分析模式：描述报错、贴代码片段或输入 /normal 退出',
  plan: '计划模式：输入你的目标、周期、资源约束',
  teacher: '教学模式：输入你想学的知识点，我会分层讲解'
}
```

### 按钮和命令提示

**HTML位置**: 
- [index.html](index.html#L180-L186)
- [docs.html](docs.html#L215-L222)

命令快捷按钮UI与 `.command-chip` 类绑定。

---

## 会话管理

### 模式存储

```javascript
localStorage.setItem('ros2_chat_mode', this.chatMode);
```

**支持的键值**:
- `general` - 通用模式
- `code` - 代码分析
- `plan` - 计划模式
- `teacher` - 教学模式

**代码位置**: [assets/js/chat-widget-enhanced.js](assets/js/chat-widget-enhanced.js#L133-L138)

### 历史记录

- 保存位置: `localStorage.ros2_conversation_history`
- 系统提示总是第一条消息
- 跨页面同步支持

---

## 维护与修改指南

### 修改模式指令

如需修改任何模式的系统提示词：

1. **编辑位置**: [assets/js/chat-widget-enhanced.js](assets/js/chat-widget-enhanced.js#L128-L131)
2. **函数**: `getModeInstruction()`
3. **修改对应的 `modeMap` 值**
4. **同时更新 `getModePlaceholder()` 的相应条目**

### 添加新模式

1. 在 `getModeInstruction()` 中添加新的 modeMap 条目
2. 在 `getModePlaceholder()` 中添加占位符文本
3. 在 `setChatMode()` 的 `allowed` 数组中添加新模式
4. 在命令解析正则表达式中添加新命令

---

## 版本信息

- **最后更新**: 2026年4月
- **AI助手版本**: chat-widget-enhanced.js
- **ROS2版本**: Humble

---

## 相关文件

- 🔧 [chat-widget-enhanced.js](assets/js/chat-widget-enhanced.js) - 核心实现
- 🎨 [index.html](index.html) - UI布局
- 📄 [docs.html](docs.html) - 文档查看器
- ⚙️ [config.yaml](config.yaml.example) - API配置
