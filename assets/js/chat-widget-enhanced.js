// AI聊天窗口功能 - 支持OpenAI API、图片上传和对话历史
const ROS2_LESSON_CATALOG = [
    { id: 1, title: 'ROS2 概况与特色' },
    { id: 2, title: 'ROS2 安装及设置' },
    { id: 3, title: '基本命令行工具' },
    { id: 4, title: '制作 ROS2 程序包' },
    { id: 5, title: 'ROS2 话题' },
    { id: 6, title: 'ROS2 服务' },
    { id: 7, title: '自定义接口' },
    { id: 8, title: 'ROS2 参数' },
    { id: 9, title: 'ROS2 启动文件' },
    { id: 10, title: 'ROS2 常用工具' },
    { id: 11, title: 'ROS2 依赖关系管理' },
    { id: 12, title: 'ROS2 动作' },
    { id: 13, title: 'ROS2 组件' },
    { id: 14, title: 'ROS2 动态参数' },
    { id: 15, title: 'TF2 坐标系' },
    { id: 16, title: 'RViz2 三维可视化' },
    { id: 17, title: 'URDF 机器人建模' },
    { id: 18, title: 'Gazebo 仿真' },
    { id: 19, title: 'Webots 仿真' },
    { id: 20, title: 'Topic Statistics' },
    { id: 21, title: '中间件（DDS / RMW）' },
    { id: 22, title: 'ROS2 安全' },
    { id: 23, title: '服务质量（QoS）' },
    { id: 24, title: 'Memory allocator' },
    { id: 25, title: '通信与日志' },
    { id: 26, title: 'Recording a bag from a node' }
];

class AIChat {
    constructor() {
        this.redirectLocalHostAlias();
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
        this.settingsBtn = document.getElementById('settings-btn');
        this.relearnBtn = document.getElementById('relearn-btn');
        this.learningHint = document.getElementById('learning-hint');
        
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.isMinimized = false;
        
        // 拉伸相关
        this.isResizing = false;
        this.resizeHandle = null;
        this.startSize = { width: 0, height: 0 };
        this.startPos = { x: 0, y: 0 };
        this.startWidgetPos = { bottom: 0, right: 0 };
        this.widthLimitScale = 1.78;

        // 绑定一次事件处理器，避免 add/removeEventListener 时引用不一致
        this.boundHandleDrag = this.handleDrag.bind(this);
        this.boundHandleDragEnd = this.handleDragEnd.bind(this);
        this.boundHandleResize = this.handleResize.bind(this);
        this.boundHandleResizeEnd = this.handleResizeEnd.bind(this);
        
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
        this.baseSystemPrompt = '你是一个专业的ROS2助手，精通ROS2 Humble的各个方面，包括安装、配置、节点、话题、服务、参数、launch文件等。请用清晰、准确的中文回答用户的问题。';
        this.customSystemPrompt = localStorage.getItem('ros2_custom_system_prompt') || '';
        this.learningFlowEnabled = localStorage.getItem('ros2_learning_flow_enabled') !== 'false';
        this.learningLesson = localStorage.getItem('ros2_learning_lesson') || localStorage.getItem('ros2_learning_progress') || '';
        this.learningFoundation = localStorage.getItem('ros2_learning_foundation') || '';
        this.waitingForLearningFoundation = false;
        this.chatFontScale = localStorage.getItem('ros2_chat_font_scale') || 'normal';
        this.chatTheme = localStorage.getItem('ros2_chat_theme') || 'control-blue';
        this.aiTextColor = localStorage.getItem('ros2_ai_text_color') || '#111111';
        this.userTextColor = localStorage.getItem('ros2_user_text_color') || '#29445b';
        this.chatSurfaceColor = localStorage.getItem('ros2_chat_surface_color') || '#eef4f9';
        this.learningGuideNoticeShown = false;
        this.chatMode = localStorage.getItem('ros2_chat_mode') || 'general';
        this.evaluationTurnInterval = Number(localStorage.getItem('ros2_evaluation_turn_interval') || 4);
        this.lastAutoEvaluationUserCount = Number(localStorage.getItem('ros2_last_auto_evaluation_user_count') || 0);
        this.lastEvaluationNudgeUserCount = Number(localStorage.getItem('ros2_last_eval_nudge_user_count') || 0);
        this.isRunningGuidedEvaluation = false;

        this.conversationHistory = this.loadConversationHistory();
        this.syncEvaluationStateFromHistory();
        this.uploadedImages = [];
        
        this.initEventListeners();
        this.initDragging();
        this.initResizing();
        this.updateModelOptions(); // 根据保存的provider加载模型
        this.restoreChatMessages();
        this.setupStorageListener(); // 监听跨页面同步
        this.applyChatAppearance();
        this.updateLearningHint();
        this.checkApiKey();
    }

    redirectLocalHostAlias() {
        if (window.location.hostname !== '0.0.0.0') {
            return;
        }

        const port = window.location.port ? `:${window.location.port}` : '';
        const target = `${window.location.protocol}//127.0.0.1${port}${window.location.pathname}${window.location.search}${window.location.hash}`;
        window.location.replace(target);
    }

    hasLearningProfile() {
        return Boolean(this.learningLesson && this.learningFoundation);
    }

    getLearningLessonNumber() {
        const lesson = Number(this.learningLesson);
        if (!Number.isInteger(lesson) || lesson < 1 || lesson > 26) {
            return null;
        }
        return lesson;
    }

    getHardLearningSystemPrompt() {
        const lesson = this.getLearningLessonNumber();
        if (!lesson) {
            return '';
        }

        const currentLesson = ROS2_LESSON_CATALOG.find((item) => item.id === lesson);
        const lessonTag = currentLesson ? `L${currentLesson.id}:${currentLesson.title}` : `L${lesson}:未命名章节`;

        return [
            '硬性学习上下文（Hard-SysPrompt，不可忽略）：',
            `- 当前学习章节（唯一主上下文）：${lessonTag}`,
            '- 回答约束：优先围绕“当前章节”内容回答，不默认依赖前序章节知识。',
            '- 若问题涉及其他章节：先标注“非本章节重点”，再给最小必要补充，并把重点拉回当前章节。',
            '- 讲解粒度：按当前章节目标组织回答，给本章节可直接执行的命令/步骤/练习。'
        ].join('\n');
    }

    getComposedSystemPrompt() {
        const sections = [this.baseSystemPrompt];

        // Hard-SysPrompt：由学习章节自动压缩生成，优先级高于软模式提示。
        const hardLearningPrompt = this.getHardLearningSystemPrompt();
        if (hardLearningPrompt) {
            sections.push(hardLearningPrompt);
        }

        if (this.hasLearningProfile()) {
            sections.push(
                '以下是用户学习背景（不可忽略）：',
                `- ROS2学习章节：第${this.learningLesson}节`,
                `- 当前学习基础：${this.learningFoundation}`,
                '请基于以上背景给出更贴合层级的讲解，优先给出分步骤说明与ROS2命令示例。'
            );
        }

        if (this.customSystemPrompt) {
            sections.push(`额外系统指令：${this.customSystemPrompt}`);
        }

        const modeInstruction = this.getModeInstruction();
        if (modeInstruction) {
            sections.push(`当前会话模式：${modeInstruction}`);
        }

        return sections.join('\n\n');
    }

    getModeInstruction() {
        const modeMap = {
            general: `通用模式：
角色：你是严谨、务实的ROS2助手。
目标：对用户问题提供清晰、准确、可执行的答案，优先解决当前任务。
行为规则：
1) 先给结论，再给关键步骤；避免空泛解释。
2) 涉及命令时给可直接运行的示例，必要时标注前置条件。
3) 若信息不足，先列出最小澄清问题；不要臆测环境细节。
4) 不确定时明确说明不确定点，并给验证方法。
输出偏好：短段落 + 要点列表；复杂问题给“结论/步骤/验证”结构。`,
            code: `代码分析模式：
角色：你是高级代码诊断与修复助手。
目标：快速定位根因，给最小可行修复，降低回归风险。
行为规则：
1) 先判断问题类型（语法/逻辑/依赖/路径/环境/并发/性能）。
2) 给出“根因 -> 修复点 -> 代码改动 -> 验证步骤”。
3) 修改建议遵循最小变更原则，不重构无关代码。
4) 对每个修复给失败兜底方案和排查顺序。
5) 输出命令或补丁时保持可复制执行。
输出偏好：
- 必须包含：根因摘要、最小修复、验证命令。
- 若有多个方案，按“风险/工作量/收益”排序。`,
            plan: `计划模式：
角色：你是项目执行规划助手。
目标：把目标转成可落地的里程碑和行动清单。
行为规则：
1) 先定义目标边界（成功标准、约束、截止时间）。
2) 拆分为阶段：准备 -> 实施 -> 验证 -> 交付。
3) 每阶段给产出物、依赖、风险、回滚点。
4) 识别关键路径并标注优先级（P0/P1/P2）。
5) 给出可执行的下一步（今天就能开始）。
输出偏好：
- 里程碑表格化描述（阶段、任务、负责人、预计时长、验收标准）。
- 最后附“风险清单 + 应对策略 + 复盘指标”。`,
            teacher: `教学模式：
角色：你是“易老师”风格的ROS2导师，耐心、循序渐进、强调理解与动手。
目标：让学习者真正理解原理并能独立完成练习。
教学规则：
1) 先用直觉解释概念，再给正式定义。
2) 采用“概念 -> 例子 -> 常见错误 -> 小练习 -> 标准答案思路”。
3) 根据用户当前基础控制难度，避免一次灌输过多信息。
4) 鼓励用户复述与实践，必要时用类比帮助记忆。
5) 对命令和代码逐行解释关键点，并说明为什么这么写。
输出偏好：
- 语言友好但不失严谨。
- 每次回答结尾给1个可执行小练习和1条进阶建议。`,
            think: `思维过程评价模式：
角色：你是学习过程评估助手，专门评价学生和 AI 的对话记录。
目标：判断学生是在复制粘贴 AI 内容，还是会对 AI 给出的内容进行自我筛选、比较、追问和反复澄清。
评价标准：
1) 关注是否有自己的理解、取舍、验证和复述，而不是整段照搬。
2) 关注问题是否连续、具体、针对性强，是否围绕同一个难点反复推进。
3) 识别“只要答案”“直接给结论”这类低主动性表达，以及“我试过/我认为/我想确认”这类主动表达。
4) 输出要明确区分：复制粘贴倾向高、部分筛选、主动学习明显。
输出偏好：评分 + 结论 + 证据 + 改进建议 + 下一轮更有效的提问示例。`,
            quality: `代码质量评价模式：
角色：你是代码评审助手，专门评价学生提交的代码质量。
目标：评价代码的可读性、结构、健壮性、可维护性和测试友好度，并给出改进建议。
评价标准：
1) 检查命名、结构、重复逻辑、函数边界和注释是否合理。
2) 检查输入校验、错误处理、调试残留、硬编码、魔法数字和潜在边界问题。
3) 如果代码片段信息不足，要明确说明限制，不要臆造运行环境。
4) 输出要给出总体评分、优点、主要问题和可执行建议。
输出偏好：评分 + 总评 + 优点 + 问题列表 + 修改建议 + 可选重构方向。`
        };
        return modeMap[this.chatMode] || modeMap.general;
    }

    getModePlaceholder() {
        const textMap = {
            general: '输入问题... 试试 /code /plan /teacher /think /quality',
            code: '代码分析模式：描述报错、贴代码片段或输入 /normal 退出',
            plan: '计划模式：输入你的目标、周期、资源约束',
            teacher: '教学模式：输入你想学的知识点，我会分层讲解',
            think: '思维过程评价：粘贴对话内容，我会判断是复制粘贴还是主动筛选追问',
            quality: '代码质量评价：粘贴代码，我会给评分、问题和建议'
        };
        return textMap[this.chatMode] || textMap.general;
    }

    setChatMode(mode, withNotice = true) {
        const allowed = ['general', 'code', 'plan', 'teacher', 'think', 'quality'];
        if (!allowed.includes(mode)) {
            return false;
        }

        this.chatMode = mode;
        localStorage.setItem('ros2_chat_mode', this.chatMode);
        this.ensureSystemPromptInHistory();
        this.saveConversationHistory();
        this.updateCommandHintUI();

        if (withNotice) {
            const labelMap = {
                general: '通用模式',
                code: '代码分析模式',
                plan: '计划模式',
                teacher: '教学模式（易老师口吻）',
                think: '思维过程评价模式',
                quality: '代码质量评价模式'
            };
            this.addSystemMessage(`✅ 已切换到${labelMap[mode]}。`);
        }

        return true;
    }

    updateCommandHintUI() {
        if (this.chatInput) {
            this.chatInput.placeholder = this.getModePlaceholder();
        }

        const modeLabel = document.getElementById('chat-command-mode');
        if (modeLabel) {
            const labelMap = {
                general: '当前模式：通用',
                code: '当前模式：代码分析',
                plan: '当前模式：计划',
                teacher: '当前模式：教学',
                think: '当前模式：思维过程评价',
                quality: '当前模式：代码质量评价'
            };
            modeLabel.textContent = labelMap[this.chatMode] || labelMap.general;
        }
    }

    ensureSystemPromptInHistory() {
        const content = this.getComposedSystemPrompt();

        if (!Array.isArray(this.conversationHistory) || this.conversationHistory.length === 0) {
            this.conversationHistory = [{ role: 'system', content }];
            return;
        }

        if (this.conversationHistory[0].role !== 'system') {
            this.conversationHistory.unshift({ role: 'system', content });
            return;
        }

        this.conversationHistory[0].content = content;
    }

    saveLearningSettings() {
        localStorage.setItem('ros2_learning_flow_enabled', String(this.learningFlowEnabled));
        localStorage.setItem('ros2_learning_lesson', this.learningLesson || '');
        localStorage.removeItem('ros2_learning_progress');
        localStorage.setItem('ros2_learning_foundation', this.learningFoundation || '');
        localStorage.setItem('ros2_custom_system_prompt', this.customSystemPrompt || '');
        localStorage.setItem('ros2_chat_font_scale', this.chatFontScale);
        localStorage.setItem('ros2_chat_theme', this.chatTheme);
        localStorage.setItem('ros2_ai_text_color', this.aiTextColor);
        localStorage.setItem('ros2_user_text_color', this.userTextColor);
        localStorage.setItem('ros2_chat_surface_color', this.chatSurfaceColor);
        localStorage.setItem('ros2_chat_mode', this.chatMode);
    }

    applyChatAppearance() {
        this.chatWidget.dataset.fontScale = this.chatFontScale;
        this.chatWidget.dataset.theme = this.chatTheme;
        this.chatWidget.style.setProperty('--ai-text-color', this.aiTextColor);
        this.chatWidget.style.setProperty('--user-text-color', this.userTextColor);
        this.chatWidget.style.setProperty('--chat-surface-color', this.chatSurfaceColor);
        this.updateCommandHintUI();
    }

    updateLearningHint() {
        if (!this.learningHint) return;

        const dismissedOnce = sessionStorage.getItem('ros2_learning_hint_dismissed') === 'true';
        const shouldShow = this.learningFlowEnabled && !this.hasLearningProfile() && !dismissedOnce;

        this.learningHint.classList.toggle('show', shouldShow);
    }

    showLearningProgressSelector() {
        const wrapper = document.createElement('div');
        wrapper.className = 'message system-message learning-system-message';

        wrapper.innerHTML = `
            <div class="message-content learning-card">
                <p><strong>学习引导 · 阶段1</strong></p>
                <p>你现在学到 ROS2 第几节？（1-26）</p>
                <div class="learning-lesson-row">
                    <input type="number" min="1" max="26" class="learning-lesson-input" id="learning-lesson-input" value="${this.learningLesson || ''}" placeholder="例如 8">
                    <button class="learning-level-btn" id="learning-lesson-confirm">确认</button>
                </div>
                <div class="learning-level-grid">
                    <button class="learning-level-btn" data-lesson="1">第1节</button>
                    <button class="learning-level-btn" data-lesson="6">第6节</button>
                    <button class="learning-level-btn" data-lesson="12">第12节</button>
                    <button class="learning-level-btn" data-lesson="18">第18节</button>
                    <button class="learning-level-btn" data-lesson="26">第26节</button>
                </div>
            </div>
        `;

        this.chatMessages.appendChild(wrapper);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    startLearningFlow() {
        if (!this.learningFlowEnabled || this.hasLearningProfile()) return;

        const hasSelector = this.chatMessages.querySelector('.learning-system-message');
        if (!hasSelector) {
            this.showLearningProgressSelector();
        }
    }

    startRelearning() {
        this.learningLesson = '';
        this.learningFoundation = '';
        this.waitingForLearningFoundation = false;
        this.learningGuideNoticeShown = false;
        this.conversationHistory = [];
        this.lastAutoEvaluationUserCount = 0;
        localStorage.setItem('ros2_last_auto_evaluation_user_count', '0');
        this.lastEvaluationNudgeUserCount = 0;
        localStorage.setItem('ros2_last_eval_nudge_user_count', '0');
        this.chatMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-content">
                    <p>你好！我可以帮你解答ROS2相关的问题，支持文字和图片输入。</p>
                    <p><small>💡 提示：在标题栏右键点击可配置API</small></p>
                </div>
            </div>
        `;
        this.saveLearningSettings();
        this.saveConversationHistory();
        this.uploadedImages = [];
        document.querySelectorAll('.image-preview').forEach(el => el.remove());
        this.startLearningFlow();
    }

    setLearningLesson(lessonValue) {
        const lesson = Number(lessonValue);
        if (!Number.isInteger(lesson) || lesson < 1 || lesson > 26) {
            this.addSystemMessage('⚠️ 请输入 1 到 26 之间的章节数字。');
            return;
        }

        this.learningLesson = String(lesson);
        this.waitingForLearningFoundation = true;
        this.saveLearningSettings();
        this.ensureSystemPromptInHistory();
        this.saveConversationHistory();

        this.addSystemMessage(`✅ 已记录学习进度：ROS2 第${this.learningLesson}节`);
        this.addSystemMessage('学习引导 · 阶段2：请描述你在该阶段已有的基础。\n例如：你做过哪些ROS2项目、熟悉哪些命令、最想补哪块。');
    }

    completeLearningFoundation(inputText) {
        this.learningFoundation = inputText;
        this.waitingForLearningFoundation = false;

        this.ensureSystemPromptInHistory();
        this.saveLearningSettings();
        this.saveConversationHistory();
        this.updateLearningHint();

        this.addSystemMessage('✅ 学习引导已完成，本次会话将按你的基础定制讲解。');
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
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            } catch (e) {
                console.warn('解析对话历史失败，使用默认system prompt。', e);
            }
        }
        return [{ role: 'system', content: this.getComposedSystemPrompt() }];
    }
    
    saveConversationHistory() {
        this.ensureSystemPromptInHistory();
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
                    this.displayMessage(msg.content, 'ai', [], {
                        variant: msg.meta?.kind === 'evaluation' ? 'evaluation' : 'assistant'
                    });
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
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        const commandShell = document.getElementById('chat-command-hints');
        if (commandShell) {
            commandShell.addEventListener('click', (e) => {
                const chip = e.target.closest('.command-chip');
                if (!chip) return;

                const cmd = chip.dataset.cmd;
                if (!cmd) return;

                if (cmd === '/normal') {
                    this.setChatMode('general');
                } else {
                    this.chatInput.value = `${cmd} `;
                    this.chatInput.focus();
                }
            });
        }
        
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

        // 重新学习按钮
        if (this.relearnBtn) {
            this.relearnBtn.addEventListener('click', () => this.startRelearning());
        }

        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => this.showSettings());
        }

        if (this.learningHint) {
            const closeBtn = document.getElementById('learning-hint-close');
            const openSettingsBtn = document.getElementById('learning-hint-open-settings');

            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    sessionStorage.setItem('ros2_learning_hint_dismissed', 'true');
                    this.updateLearningHint();
                });
            }

            if (openSettingsBtn) {
                openSettingsBtn.addEventListener('click', () => this.showSettings());
            }
        }

        this.chatMessages.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('.message-action-btn');
            if (actionBtn) {
                const action = actionBtn.dataset.action;
                const messageDiv = actionBtn.closest('.message.ai-message');
                this.handleAIMessageAction(action, messageDiv);
                return;
            }

            const confirmBtn = e.target.closest('#learning-lesson-confirm');
            if (confirmBtn) {
                const lessonInput = this.chatMessages.querySelector('#learning-lesson-input');
                const lessonValue = lessonInput ? lessonInput.value : '';
                this.setLearningLesson(lessonValue);
                if (this.waitingForLearningFoundation) {
                    confirmBtn.closest('.learning-system-message')?.remove();
                }
                return;
            }

            const lessonBtn = e.target.closest('.learning-level-btn[data-lesson]');
            if (!lessonBtn) return;

            const selectedLesson = lessonBtn.dataset.lesson;
            if (!selectedLesson) return;

            lessonBtn.closest('.learning-system-message')?.remove();
            this.setLearningLesson(selectedLesson);
        });
        
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
            
            document.addEventListener('mousemove', this.boundHandleDrag);
            document.addEventListener('mouseup', this.boundHandleDragEnd);
            this.toggleIframePointerEvents(false);
            
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
            
            document.removeEventListener('mousemove', this.boundHandleDrag);
            document.removeEventListener('mouseup', this.boundHandleDragEnd);
            this.toggleIframePointerEvents(true);
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
                
                document.addEventListener('mousemove', this.boundHandleResize);
                document.addEventListener('mouseup', this.boundHandleResizeEnd);
                this.toggleIframePointerEvents(false);
                
                this.chatWidget.style.transition = 'none';
                e.preventDefault();
            });
        });
    }
    
    handleResize(e) {
        if (!this.isResizing) return;
        
        const deltaX = e.clientX - this.startPos.x;
        const deltaY = e.clientY - this.startPos.y;
        
        const minWidth = 420;
        const minHeight = 400;
        const baseMaxWidth = 1100;
        const maxWidth = Math.min(window.innerWidth - 20, Math.floor(baseMaxWidth * this.widthLimitScale));
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
            
            document.removeEventListener('mousemove', this.boundHandleResize);
            document.removeEventListener('mouseup', this.boundHandleResizeEnd);
            this.toggleIframePointerEvents(true);
        }
    }

    toggleIframePointerEvents(enabled) {
        document.querySelectorAll('iframe').forEach((frame) => {
            frame.style.pointerEvents = enabled ? '' : 'none';
        });
    }
    
    showChat() {
        this.chatWidget.classList.add('show');
        this.chatTrigger.classList.add('hidden');

        if (this.learningFlowEnabled && !this.hasLearningProfile()) {
            this.startLearningFlow();
        } else if (this.learningFlowEnabled && this.hasLearningProfile() && !this.learningGuideNoticeShown) {
            this.addSystemMessage(`📌 当前学习进度：第${this.learningLesson}节。若需重新引导，输入 /relearn`);
            this.learningGuideNoticeShown = true;
        }

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
        let message = this.chatInput.value.trim();
        if (!message && this.uploadedImages.length === 0) return;

        const modeCommandMatch = message.match(/^\/(code|plan|teacher|think|quality|normal)\s*(.*)$/s);
        if (modeCommandMatch) {
            const cmd = modeCommandMatch[1];
            const remainText = (modeCommandMatch[2] || '').trim();
            const modeMap = {
                code: 'code',
                plan: 'plan',
                teacher: 'teacher',
                think: 'think',
                quality: 'quality',
                normal: 'general'
            };

            this.setChatMode(modeMap[cmd]);

            if (!remainText) {
                this.chatInput.value = '';
                return;
            }

            message = remainText;
            this.chatInput.value = remainText;
        }

        if (message === '/relearn') {
            this.learningLesson = '';
            this.learningFoundation = '';
            this.waitingForLearningFoundation = false;
            this.learningGuideNoticeShown = false;
            this.ensureSystemPromptInHistory();
            this.saveLearningSettings();
            this.saveConversationHistory();
            this.chatInput.value = '';
            this.startLearningFlow();
            return;
        }

        if (message.startsWith('/sys ')) {
            const promptText = message.slice(5).trim();
            if (!promptText) {
                this.addSystemMessage('⚠️ 用法：/sys 你的系统指令');
            } else {
                this.customSystemPrompt = promptText;
                this.ensureSystemPromptInHistory();
                this.saveLearningSettings();
                this.saveConversationHistory();
                this.addSystemMessage('✅ 自定义系统指令已更新（学习背景部分保持不变）。');
            }
            this.chatInput.value = '';
            return;
        }

        if (this.waitingForLearningFoundation) {
            this.chatInput.value = '';
            this.displayMessage(message, 'user');
            this.completeLearningFoundation(message);
            return;
        }
        
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
        this.sendBtn.textContent = '⟳';
        
        try {
            let response;
            
            // 如果没有配置API，使用硬编码对话
            if (!this.apiKey) {
                // 显示思考指示器
                this.showTypingIndicator();
                await new Promise(resolve => setTimeout(resolve, 800)); // 模拟延迟
                response = this.getHardcodedResponse(message);
                this.hideTypingIndicator();
                
                // 添加AI响应到历史
                this.conversationHistory.push({
                    role: 'assistant',
                    content: response
                });
                this.saveConversationHistory();
                
                // 显示AI响应
                this.displayMessage(response, 'ai');
            } else {
                // 调用流式API
                const streamingMsg = this.displayStreamingMessage();
                
                response = await this.callOpenAIStream((chunk) => {
                    streamingMsg.appendChunk(chunk);
                });
                
                // 添加AI响应到历史
                this.conversationHistory.push({
                    role: 'assistant',
                    content: response
                });
                this.saveConversationHistory();
                streamingMsg.finalize(response);
            }

            this.triggerGuidedEvaluation({ force: false, source: 'auto' });
            this.maybeNudgeEvaluation();
            
        } catch (error) {
            this.hideTypingIndicator();
            this.addSystemMessage(`❌ 错误: ${error.message}`);
        } finally {
            this.sendBtn.disabled = false;
            this.sendBtn.textContent = '↑';
        }
    }
    
    getHardcodedResponse(userMessage) {
        if (this.chatMode === 'think') {
            return this.getThinkingProcessEvaluation(userMessage);
        }

        if (this.chatMode === 'quality') {
            return this.getCodeQualityEvaluation(userMessage);
        }

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

    getThinkingProcessEvaluation(inputText) {
        const text = inputText.trim();
        if (!text) {
            return '请先粘贴学生和 AI 的对话内容，我会根据文本判断是否偏向复制粘贴，还是存在主动筛选和反复追问。';
        }

        const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
        const questionCount = (text.match(/[？?]/g) || []).length;
        const reflectiveSignals = [
            '我想确认', '我认为', '我觉得', '我理解', '我试过', '我尝试', '为什么', '怎么', '能否', '有没有', '如果', '但是', '不过', '对比', '区别', '原因'
        ];
        const passiveSignals = [
            '直接给我', '帮我写', '照着做', '复制', '粘贴', '完整答案', '不用解释', '原封不动', '一步到位'
        ];

        let score = 52;
        let reflectiveHits = 0;
        let passiveHits = 0;

        reflectiveSignals.forEach((signal) => {
            if (text.includes(signal)) reflectiveHits += 1;
        });
        passiveSignals.forEach((signal) => {
            if (text.includes(signal)) passiveHits += 1;
        });

        score += Math.min(18, reflectiveHits * 6);
        score -= Math.min(30, passiveHits * 10);

        if (questionCount >= 3) score += 10;
        else if (questionCount >= 1) score += 5;

        if (lines.length >= 4) score += 5;
        if (text.length > 1200 && questionCount <= 1) score -= 8;
        if (text.length < 120) score -= 8;

        score = Math.max(0, Math.min(100, score));

        let verdict = '有一定筛选，但仍偏被动';
        if (score >= 75) {
            verdict = '主动筛选和追问较明显';
        } else if (score < 45) {
            verdict = '更像复制粘贴，主动学习痕迹较弱';
        }

        const evidence = [];
        if (reflectiveHits > 0) {
            evidence.push(`出现了 ${reflectiveHits} 类主动表达或追问信号`);
        }
        if (passiveHits > 0) {
            evidence.push(`出现了 ${passiveHits} 类偏被动/复制粘贴信号`);
        }
        if (questionCount > 0) {
            evidence.push(`文本中有 ${questionCount} 个问号，说明存在提问或追问动作`);
        }
        if (lines.length > 1) {
            evidence.push(`内容分成了 ${lines.length} 行，通常更适合展示多轮筛选或对话过程`);
        }

        const suggestions = [
            '先用一句话写出你自己的理解，再把最不确定的点单独问出来。',
            '每次只问一个最关键的问题，并说明你为什么卡住。',
            '在 AI 回答后补一句“我比较的是 A 和 B，差异在于什么”，这样更能体现筛选和追问。'
        ];

        return [
            '### 思维过程评价',
            `- 结论：${verdict}`,
            `- 评分：${score}/100`,
            `- 评价依据：${evidence.length ? evidence.map((item) => `  - ${item}`).join('\n') : '  - 文本中缺少明显的主动筛选、复述或反问信号'}`,
            '- 建议：',
            ...suggestions.map((item) => `  - ${item}`),
            '- 下一轮更有效的提问示例：',
            '  - “我目前理解到这里，请帮我检查是否有漏洞，然后只指出最关键的一个问题。”',
            '  - “这两个方案我都看过了，但我想确认它们的差异和适用条件分别是什么。”'
        ].join('\n');
    }

    getCodeQualityEvaluation(inputText) {
        const code = inputText.trim();
        if (!code) {
            return '请先粘贴代码，我会从可读性、结构、健壮性和可维护性几个维度给出评价。';
        }

        const lines = code.split(/\r?\n/);
        const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
        const functionLikeCount = (code.match(/\b(function|def|class)\b|=>|\bpublic\b|\bprivate\b|\bprotected\b/g) || []).length;
        const commentCount = (code.match(/\/\/|#|\/\*/g) || []).length;
        const todoCount = (code.match(/\bTODO\b|\bFIXME\b|\bHACK\b/g) || []).length;
        const debugCount = (code.match(/console\.log\(|print\(|std::cout|logger\.(debug|info|warn|error)\(/g) || []).length;
        const longLineCount = lines.filter((line) => line.length > 120).length;
        const hardcodeCount = (code.match(/['"][^'"]*(?:\/tmp|localhost|127\.0\.0\.1|8080|3000|1234)[^'"]*['"]|\b\d{2,}\b/g) || []).length;
        const hasErrorHandling = /try\s*\{|except\s*\(|catch\s*\(|raise\b|throw\b|assert\b/.test(code);
        const hasValidation = /if\s*\(|validate|check|guard|require|assert/.test(code);

        let score = 64;
        if (functionLikeCount > 0) score += 8;
        if (commentCount > 0) score += 4;
        if (hasErrorHandling) score += 8;
        if (hasValidation) score += 6;
        if (nonEmptyLines.length > 30) score += 2;

        score -= Math.min(20, todoCount * 8);
        score -= Math.min(18, debugCount * 6);
        score -= Math.min(14, longLineCount * 3);
        score -= Math.min(12, hardcodeCount > 4 ? 12 : hardcodeCount * 2);

        score = Math.max(0, Math.min(100, score));

        const rating = score >= 80 ? '优秀' : score >= 65 ? '良好' : score >= 50 ? '一般' : '偏弱';

        const strengths = [];
        if (functionLikeCount > 0) strengths.push('有一定的函数或类结构，说明不是完全平铺的脚本');
        if (commentCount > 0) strengths.push('包含注释，阅读成本更低');
        if (hasErrorHandling) strengths.push('存在错误处理或断言，健壮性意识较好');
        if (hasValidation) strengths.push('包含输入检查或防御性判断');

        const issues = [];
        if (todoCount > 0) issues.push(`存在 ${todoCount} 处 TODO/FIXME/HACK，说明功能可能未收尾`);
        if (debugCount > 0) issues.push(`存在 ${debugCount} 处调试输出，提交前建议清理`);
        if (longLineCount > 0) issues.push(`有 ${longLineCount} 行过长，影响可读性`);
        if (hardcodeCount > 0) issues.push(`存在一些硬编码值/魔法数字，建议抽成常量或配置`);
        if (!hasErrorHandling) issues.push('未看到明显的错误处理，出错时可能不够稳健');

        const suggestions = [];
        if (todoCount > 0) suggestions.push('补完 TODO/FIXME 对应逻辑，或明确标注为后续工作');
        if (debugCount > 0) suggestions.push('移除临时打印，改为正式日志或测试断言');
        if (longLineCount > 0) suggestions.push('拆分过长语句或提取辅助函数，提升可读性');
        if (hardcodeCount > 0) suggestions.push('把硬编码参数提取到常量、配置或参数文件中');
        if (!hasErrorHandling) suggestions.push('补充输入校验和异常处理，减少边界条件失败');
        if (functionLikeCount === 0) suggestions.push('如果代码逻辑较长，考虑拆分成更小的函数或模块');

        const languageHint = /\bimport\s+|\bdef\s+|\bclass\s+|#include/.test(code)
            ? '从语法特征看，代码更像 Python/C++ 风格片段。'
            : '当前代码片段的语言特征不够明显，以下评价基于文本本身。';

        return [
            '### 代码质量评价',
            `- 总体评分：${score}/100（${rating}）`,
            `- 语言提示：${languageHint}`,
            '- 优点：',
            ...(strengths.length ? strengths.map((item) => `  - ${item}`) : ['  - 片段中没有明显的结构性问题，但也缺少能体现设计质量的信号']),
            '- 主要问题：',
            ...(issues.length ? issues.map((item) => `  - ${item}`) : ['  - 没有发现特别突出的质量问题，但仍建议结合上下文代码继续检查']),
            '- 改进建议：',
            ...suggestions.map((item) => `  - ${item}`),
            '- 评价结果：',
            `  - ${rating === '优秀' ? '代码整体质量较好，重点放在细节优化和测试补强。' : rating === '良好' ? '代码质量整体可用，但仍有少量可维护性或健壮性问题。' : rating === '一般' ? '代码可运行的可能性较高，但还需要明显的结构或质量提升。' : '代码质量偏弱，建议优先处理结构、校验和错误处理。'}`
        ].join('\n');
    }

    async callOpenAIStream(onChunk, messages = this.conversationHistory) {
        const model = this.modelSelect.value || 'gpt-4o-mini';
        
        // 构建请求头
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
        };
        
        // 为不同的API提供商添加特定的请求体配置
        const requestBody = {
            model: model,
            messages,
            temperature: 0.7,
            max_tokens: 2000,
            stream: true  // 启用流式响应
        };
        
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || '请求失败');
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';
        
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                
                // 保留最后一行（可能不完整）
                buffer = lines[lines.length - 1];
                
                // 处理完整的行
                for (let i = 0; i < lines.length - 1; i++) {
                    const line = lines[i].trim();
                    
                    if (!line || line === '[DONE]') continue;
                    if (!line.startsWith('data: ')) continue;
                    
                    try {
                        const data = JSON.parse(line.slice(6));
                        
                        // 从不同的API提供商提取内容
                        let chunk = '';
                        
                        // OpenAI 格式
                        if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                            chunk = data.choices[0].delta.content;
                        }
                        // Qwen/阿里云格式
                        else if (data.output && data.output.choices && data.output.choices[0] && data.output.choices[0].delta) {
                            chunk = data.output.choices[0].delta;
                        }
                        
                        if (chunk) {
                            fullContent += chunk;
                            onChunk(chunk);
                        }
                    } catch (e) {
                        // 跳过无效的 JSON 行
                        continue;
                    }
                }
            }
            
            // 处理最后的 buffer
            if (buffer && buffer.startsWith('data: ')) {
                try {
                    const data = JSON.parse(buffer.slice(6));
                    let chunk = '';
                    if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                        chunk = data.choices[0].delta.content;
                    } else if (data.output && data.output.choices && data.output.choices[0] && data.output.choices[0].delta) {
                        chunk = data.output.choices[0].delta;
                    }
                    if (chunk) {
                        fullContent += chunk;
                        onChunk(chunk);
                    }
                } catch (e) {
                    // 忽略
                }
            }
        } finally {
            reader.releaseLock();
        }
        
        return fullContent;
    }
    
    async callOpenAI(messages = this.conversationHistory) {
        const model = this.modelSelect.value || 'gpt-4o-mini';
        
        // 构建请求头
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
        };
        
        // 为不同的API提供商添加特定的请求体配置
        const requestBody = {
            model: model,
            messages,
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
    
    displayStreamingMessage() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        messageDiv.id = 'streaming-message-' + Date.now();
        messageDiv.dataset.plaintext = '';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const textDiv = document.createElement('div');
        textDiv.className = 'streaming-text';
        textDiv.innerHTML = '';
        
        messageContent.appendChild(textDiv);
        messageDiv.appendChild(messageContent);
        this.chatMessages.appendChild(messageDiv);
        
        // 自动滚动到底部
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        const aiChat = this;
        return {
            messageDiv: messageDiv,
            textDiv: textDiv,
            content: '',
            appendChunk(chunk) {
                this.content += chunk;
                // 渲染为HTML（支持markdown）
                textDiv.innerHTML = aiChat.parseMarkdown(this.content);
                aiChat.chatMessages.scrollTop = aiChat.chatMessages.scrollHeight;
            },
            finalize(content, options = {}) {
                const finalContent = content || this.content;
                messageDiv.dataset.plaintext = finalContent;
                aiChat.decorateAIMessage(messageDiv, finalContent, options);
            }
        };
    }
    
    displayMessage(content, sender, images = [], options = {}) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.dataset.plaintext = typeof content === 'string' ? content : '';
        
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

        if (sender === 'ai') {
            this.decorateAIMessage(messageDiv, content, options);
        }

        this.chatMessages.appendChild(messageDiv);
        
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    decorateAIMessage(messageDiv, content, options = {}) {
        const messageContent = messageDiv.querySelector('.message-content');
        if (!messageContent || messageContent.querySelector('.message-actions')) {
            return;
        }

        const actionBar = document.createElement('div');
        actionBar.className = 'message-actions';
        actionBar.innerHTML = `
            <button class="message-action-btn" data-action="copy" type="button">复制</button>
            <button class="message-action-btn" data-action="share" type="button">分享</button>
            <button class="message-action-btn" data-action="retry" type="button">重试</button>
            <button class="message-action-btn message-action-evaluate" data-action="evaluate" type="button">评价</button>
        `;

        messageContent.appendChild(actionBar);
        if (options.variant === 'evaluation') {
            messageDiv.classList.add('evaluation-message');
        }
    }
    
    addSystemMessage(content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system-message';
        messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    handleAIMessageAction(action, messageDiv) {
        const content = messageDiv?.dataset?.plaintext || '';

        if (action === 'copy') {
            this.copyToClipboard(content);
            this.addSystemMessage('✅ 已复制回答内容');
            return;
        }

        if (action === 'share') {
            this.shareText(content);
            return;
        }

        if (action === 'retry') {
            this.retryLastAssistantResponse();
            return;
        }

        if (action === 'evaluate') {
            this.triggerGuidedEvaluation({ force: true, source: 'manual' });
        }
    }

    copyToClipboard(text) {
        if (!text) {
            this.addSystemMessage('⚠️ 当前消息没有可复制内容');
            return;
        }

        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(text).catch(() => {
                this.addSystemMessage('⚠️ 复制失败，请手动选中内容');
            });
            return;
        }

        const tempInput = document.createElement('textarea');
        tempInput.value = text;
        tempInput.style.position = 'fixed';
        tempInput.style.opacity = '0';
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
    }

    shareText(text) {
        if (!text) {
            this.addSystemMessage('⚠️ 当前消息没有可分享内容');
            return;
        }

        if (navigator.share) {
            navigator.share({
                title: 'ROS2 AI 助手回答',
                text
            }).catch(() => {
                this.copyToClipboard(text);
                this.addSystemMessage('✅ 分享未完成，已改为复制内容');
            });
            return;
        }

        this.copyToClipboard(text);
        this.addSystemMessage('✅ 当前环境不支持系统分享，已复制内容');
    }

    retryLastAssistantResponse() {
        const lastUserIndex = [...this.conversationHistory].map((item, index) => ({ item, index }))
            .reverse()
            .find(({ item }) => item.role === 'user');

        if (!lastUserIndex) {
            this.addSystemMessage('⚠️ 没有找到可重试的用户消息');
            return;
        }

        this.conversationHistory = this.conversationHistory.slice(0, lastUserIndex.index);
        this.saveConversationHistory();
        this.restoreChatMessages();

        const lastUserMessage = lastUserIndex.item.content;
        const plainText = typeof lastUserMessage === 'string'
            ? lastUserMessage
            : this.extractTextFromStructuredContent(lastUserMessage);

        if (!plainText) {
            this.addSystemMessage('⚠️ 无法提取可重试的文本内容');
            return;
        }

        this.uploadedImages = Array.isArray(lastUserIndex.item.images)
            ? lastUserIndex.item.images.map((image) => ({ name: 'retry-image', base64: image, type: 'image/png' }))
            : [];
        this.chatInput.value = plainText;
        this.sendMessage();
    }

    extractTextFromStructuredContent(content) {
        if (typeof content === 'string') {
            return content;
        }

        if (Array.isArray(content)) {
            return content
                .map((item) => (item && typeof item === 'object' && item.text) ? item.text : '')
                .join('\n')
                .trim();
        }

        return '';
    }

    countUserMessages(sinceIndex = 0) {
        return this.conversationHistory
            .slice(sinceIndex)
            .filter((msg) => msg.role === 'user').length;
    }

    getLastEvaluationIndex() {
        for (let index = this.conversationHistory.length - 1; index >= 0; index -= 1) {
            const entry = this.conversationHistory[index];
            if (entry.role === 'assistant' && entry.meta?.kind === 'evaluation') {
                return index;
            }
        }
        return -1;
    }

    syncEvaluationStateFromHistory() {
        const lastEvaluationIndex = this.getLastEvaluationIndex();
        if (lastEvaluationIndex < 0) {
            this.lastAutoEvaluationUserCount = 0;
            localStorage.setItem('ros2_last_auto_evaluation_user_count', '0');
            return;
        }

        const userCountBeforeLastEvaluation = this.conversationHistory
            .slice(0, lastEvaluationIndex)
            .filter((msg) => msg.role === 'user').length;

        this.lastAutoEvaluationUserCount = userCountBeforeLastEvaluation;
        localStorage.setItem('ros2_last_auto_evaluation_user_count', String(userCountBeforeLastEvaluation));
    }

    getRecentConversationTranscript(mode = this.chatMode) {
        const lastEvaluationIndex = this.getLastEvaluationIndex();
        let recentEntries = this.conversationHistory
            .slice(lastEvaluationIndex + 1)
            .filter((msg) => msg.role !== 'system');

        if (mode === 'quality') {
            recentEntries = recentEntries.filter((msg) => msg.role === 'user');
        }

        return recentEntries.map((msg, index) => {
            const label = msg.role === 'user' ? '学生' : 'AI';
            const text = this.extractTextFromStructuredContent(msg.content);
            return `${label}${index + 1}: ${text}`;
        }).join('\n');
    }

    inferEvaluationMode(transcript) {
        if (this.chatMode === 'think' || this.chatMode === 'quality') {
            return this.chatMode;
        }

        const codeSignals = [
            '```', 'function', 'class ', 'def ', 'import ', '#include', 'console.log', 'print(', 'std::', 'return '
        ];
        const matchedCodeSignals = codeSignals.filter((signal) => transcript.includes(signal)).length;
        return matchedCodeSignals >= 2 ? 'quality' : 'think';
    }

    shouldAutoEvaluateConversation() {
        if (this.isRunningGuidedEvaluation) {
            return false;
        }

        if (!['think', 'quality'].includes(this.chatMode)) {
            return false;
        }

        const currentUserCount = this.countUserMessages();
        return currentUserCount >= this.evaluationTurnInterval &&
            currentUserCount - this.lastAutoEvaluationUserCount >= this.evaluationTurnInterval;
    }

    shouldNudgeEvaluation() {
        if (this.isRunningGuidedEvaluation) {
            return false;
        }

        if (['think', 'quality'].includes(this.chatMode)) {
            return false;
        }

        const currentUserCount = this.countUserMessages();
        return currentUserCount >= this.evaluationTurnInterval &&
            currentUserCount - this.lastEvaluationNudgeUserCount >= this.evaluationTurnInterval;
    }

    maybeNudgeEvaluation() {
        if (!this.shouldNudgeEvaluation()) {
            return;
        }

        this.lastEvaluationNudgeUserCount = this.countUserMessages();
        localStorage.setItem('ros2_last_eval_nudge_user_count', String(this.lastEvaluationNudgeUserCount));
        this.addSystemMessage('🔔 可点击任意 AI 回复下的“评价”，获得 ROS2 知识 / 代码 / 思维 的三维反馈。');
    }

    async triggerGuidedEvaluation({ force = false, source = 'auto' } = {}) {
        if (this.isRunningGuidedEvaluation) {
            return;
        }

        const transcript = this.getRecentConversationTranscript();
        if (!transcript) {
            this.addSystemMessage('⚠️ 暂时没有足够的对话内容可用于评价');
            return;
        }

        const evalMode = this.inferEvaluationMode(transcript);
        if (!force && !this.shouldAutoEvaluateConversation()) {
            return;
        }

        this.isRunningGuidedEvaluation = true;
        try {
            const title = '阶段性学习评价';
            const prefix = source === 'auto' ? `📍 ${title}` : `🔎 ${title}`;
            const header = `${prefix}\n\n`;
            let fullContent = header;
            let streamingMsg = null;

            if (this.apiKey) {
                streamingMsg = this.displayStreamingMessage();
                streamingMsg.appendChunk(header);

                try {
                    await this.callGuidedEvaluationAPIStream(evalMode, transcript, (chunk) => {
                        fullContent += chunk;
                        streamingMsg.appendChunk(chunk);
                    });
                } catch (error) {
                    console.warn('评价API调用失败，改用本地评价:', error);
                    this.addSystemMessage('⚠️ 评价API调用失败，已切换为本地评价结果。');
                    const fallback = this.getCompositeEvaluation(transcript, evalMode);
                    fullContent += fallback;
                    streamingMsg.appendChunk(fallback);
                }
            } else {
                const text = this.getCompositeEvaluation(transcript, evalMode);
                fullContent += text;
                this.displayMessage(fullContent, 'ai', [], { variant: 'evaluation' });
            }

            this.conversationHistory.push({
                role: 'assistant',
                content: fullContent,
                meta: { kind: 'evaluation', mode: evalMode, source }
            });
            this.saveConversationHistory();

            if (streamingMsg) {
                streamingMsg.finalize(fullContent, { variant: 'evaluation' });
            }

            if (source === 'auto') {
                this.lastAutoEvaluationUserCount = this.countUserMessages();
            }

            if (source !== 'auto') {
                this.lastAutoEvaluationUserCount = this.countUserMessages();
            }

            localStorage.setItem('ros2_last_auto_evaluation_user_count', String(this.lastAutoEvaluationUserCount));
        } finally {
            this.isRunningGuidedEvaluation = false;
        }
    }

    async callGuidedEvaluationAPIStream(evalMode, transcript, onChunk) {
        const focusHint = evalMode === 'quality'
            ? '注意重点放在代码能力，但仍需覆盖ROS知识与思维过程。'
            : evalMode === 'think'
                ? '注意重点放在思维过程，但仍需覆盖ROS知识与代码能力。'
                : '保持三方面均衡评价。';

        const evaluationPrompt = [
            '你现在要对学生的阶段性学习做评价。必须从三方面给出反馈：',
            '1) ROS2知识掌握',
            '2) 代码能力（若无代码片段要说明信息不足）',
            '3) 思维过程（是否有主动筛选、追问、验证）',
            '每个维度给出0-100分、证据要点、改进建议。最后给总体结论与下一步建议。',
            focusHint
        ].join('\n');

        const messages = [
            {
                role: 'system',
                content: `${this.getComposedSystemPrompt()}\n\n${evaluationPrompt}\n\n只根据下面提供的对话内容做阶段性评价，不要扩展到无关教学。`
            },
            {
                role: 'user',
                content: transcript
            }
        ];

        return this.callOpenAIStream(onChunk, messages);
    }

    getCompositeEvaluation(inputText, evalMode = 'general') {
        const text = inputText.trim();
        if (!text) {
            return '请先提供对话内容，我会从 ROS2 知识、代码能力与思维过程三个维度做评价。';
        }

        const ros = this.evaluateRosKnowledge(text);
        const code = this.evaluateCodeSignals(text);
        const thinking = this.evaluateThinkingSignals(text);

        if (evalMode === 'quality') {
            code.score = Math.min(100, code.score + 6);
        } else if (evalMode === 'think') {
            thinking.score = Math.min(100, thinking.score + 6);
        }

        const overall = Math.round((ros.score + code.score + thinking.score) / 3);
        const overallLabel = overall >= 80 ? '稳定进阶' : overall >= 60 ? '基础扎实但需强化' : '需要重点补强';

        return [
            '### 三维学习评价（ROS2 / 代码 / 思维）',
            `- 总体评分：${overall}/100（${overallLabel}）`,
            `- ROS2知识掌握：${ros.score}/100`,
            ...ros.evidence.map((item) => `  - 证据：${item}`),
            ...ros.suggestions.map((item) => `  - 建议：${item}`),
            `- 代码能力：${code.score}/100`,
            ...code.evidence.map((item) => `  - 证据：${item}`),
            ...code.suggestions.map((item) => `  - 建议：${item}`),
            `- 思维过程：${thinking.score}/100`,
            ...thinking.evidence.map((item) => `  - 证据：${item}`),
            ...thinking.suggestions.map((item) => `  - 建议：${item}`),
            `- 总结：${overallLabel}。建议围绕本章核心概念补充1-2个命令/代码练习，先验证再追问。`
        ].join('\n');
    }

    evaluateRosKnowledge(text) {
        const lower = text.toLowerCase();
        const rosKeywords = [
            'ros2', 'ros 2', 'node', '节点', 'topic', '话题', 'service', '服务', 'parameter', '参数',
            'launch', 'rclpy', 'rclcpp', 'colcon', 'ament', 'rmw', 'dds', 'qos', 'tf2', 'rviz',
            'urdf', 'gazebo', 'bag', 'workspace', 'package'
        ];
        const hits = rosKeywords.filter((keyword) => lower.includes(keyword)).length;
        const score = Math.max(0, Math.min(100, 45 + hits * 6));

        const evidence = [];
        if (hits > 0) {
            evidence.push(`出现 ${hits} 个 ROS2 关键词或概念线索`);
        } else {
            evidence.push('对话中缺少明确的 ROS2 概念或命令细节');
        }

        const suggestions = [];
        if (hits < 2) {
            suggestions.push('补充具体概念名或命令（如节点、话题、参数、launch）来定位问题。');
        }
        if (hits < 4) {
            suggestions.push('给出你已尝试的ROS2命令或输出，帮助更精准判断。');
        }

        return { score, evidence, suggestions };
    }

    evaluateCodeSignals(text) {
        const codeSignals = [
            '```', 'def ', 'class ', 'function', '#include', 'import ', 'ros2 run', 'ros2 launch',
            'std::', 'rclpy', 'rclcpp'
        ];
        const hits = codeSignals.filter((signal) => text.includes(signal)).length;
        const score = hits === 0 ? 35 : Math.max(0, Math.min(100, 50 + hits * 7));

        const evidence = [];
        if (hits > 0) {
            evidence.push(`检测到 ${hits} 处代码/命令信号`);
        } else {
            evidence.push('未提供明确代码或命令片段');
        }

        const suggestions = [];
        if (hits === 0) {
            suggestions.push('贴出关键代码或命令片段，便于评价代码质量与问题定位。');
        } else {
            suggestions.push('补充运行结果或报错信息，验证代码理解与可执行性。');
        }

        return { score, evidence, suggestions };
    }

    evaluateThinkingSignals(text) {
        const reflectiveSignals = [
            '我想确认', '我认为', '我觉得', '我理解', '我试过', '我尝试', '为什么', '怎么', '能否',
            '有没有', '如果', '但是', '不过', '对比', '区别', '原因'
        ];
        const passiveSignals = [
            '直接给我', '帮我写', '照着做', '复制', '粘贴', '完整答案', '不用解释', '原封不动', '一步到位'
        ];
        const questionCount = (text.match(/[？?]/g) || []).length;

        let reflectiveHits = 0;
        let passiveHits = 0;
        reflectiveSignals.forEach((signal) => {
            if (text.includes(signal)) reflectiveHits += 1;
        });
        passiveSignals.forEach((signal) => {
            if (text.includes(signal)) passiveHits += 1;
        });

        let score = 52 + Math.min(18, reflectiveHits * 6) - Math.min(30, passiveHits * 10);
        if (questionCount >= 3) score += 10;
        else if (questionCount >= 1) score += 5;
        score = Math.max(0, Math.min(100, score));

        const evidence = [];
        if (reflectiveHits > 0) {
            evidence.push(`出现 ${reflectiveHits} 类主动表达或追问信号`);
        }
        if (passiveHits > 0) {
            evidence.push(`出现 ${passiveHits} 类偏被动表达`);
        }
        if (questionCount > 0) {
            evidence.push(`包含 ${questionCount} 个问号，体现追问动作`);
        }
        if (evidence.length === 0) {
            evidence.push('未看到明显的主动筛选或追问信号');
        }

        const suggestions = [
            '先写一句自己的理解，再指出一个最不确定点。',
            '对比两个方案的差异并说明你倾向哪一个。'
        ];

        return { score, evidence, suggestions };
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

        const generalSettingsHtml = `
            <div class="settings-group">
                <h4>🧭 学习引导与对话样式</h4>
                <label class="settings-inline">
                    <input type="checkbox" id="learning-flow-enabled" ${this.learningFlowEnabled ? 'checked' : ''}>
                    开启学习进度引导（阶段选择 + 学习基础输入）
                </label>

                <label>默认自定义系统指令（可用 /sys 临时更新）：</label>
                <textarea id="custom-system-prompt" class="settings-input" rows="3" placeholder="例如：请优先用表格总结，再给最短可运行示例。">${this.customSystemPrompt}</textarea>

                <label>聊天字体大小：</label>
                <select id="chat-font-scale" class="settings-input">
                    <option value="compact" ${this.chatFontScale === 'compact' ? 'selected' : ''}>紧凑</option>
                    <option value="normal" ${this.chatFontScale === 'normal' ? 'selected' : ''}>标准</option>
                    <option value="comfortable" ${this.chatFontScale === 'comfortable' ? 'selected' : ''}>舒适</option>
                </select>

                <label>聊天背景风格：</label>
                <select id="chat-theme" class="settings-input">
                    <option value="control-blue" ${this.chatTheme === 'control-blue' ? 'selected' : ''}>控制蓝</option>
                    <option value="industrial-light" ${this.chatTheme === 'industrial-light' ? 'selected' : ''}>工业浅色</option>
                    <option value="terminal-dark" ${this.chatTheme === 'terminal-dark' ? 'selected' : ''}>终端深色</option>
                </select>

                <label>AI回复字体颜色：</label>
                <input type="color" id="ai-text-color" class="settings-input" value="${this.aiTextColor}">

                <label>用户消息字体颜色：</label>
                <input type="color" id="user-text-color" class="settings-input" value="${this.userTextColor}">

                <label>对话区背景色：</label>
                <input type="color" id="chat-surface-color" class="settings-input" value="${this.chatSurfaceColor}">
            </div>
        `;
        
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
                        ${generalSettingsHtml}

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
                this.learningFlowEnabled = document.getElementById('learning-flow-enabled').checked;
                this.customSystemPrompt = document.getElementById('custom-system-prompt').value.trim();
                this.chatFontScale = document.getElementById('chat-font-scale').value;
                this.chatTheme = document.getElementById('chat-theme').value;
                this.aiTextColor = document.getElementById('ai-text-color').value;
                this.userTextColor = document.getElementById('user-text-color').value;
                this.chatSurfaceColor = document.getElementById('chat-surface-color').value;
                this.apiProvider = providerSelect.value;
                this.apiEndpoint = endpointInput.value;
                this.apiKey = apikeyInput.value;
                
                localStorage.setItem('ai_provider', this.apiProvider);
                localStorage.setItem('ai_api_endpoint', this.apiEndpoint);
                localStorage.setItem('ai_api_key', this.apiKey);

                this.ensureSystemPromptInHistory();
                this.saveLearningSettings();
                this.applyChatAppearance();
                this.updateLearningHint();
                
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
                        ${generalSettingsHtml}

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
                this.learningFlowEnabled = document.getElementById('learning-flow-enabled').checked;
                this.customSystemPrompt = document.getElementById('custom-system-prompt').value.trim();
                this.chatFontScale = document.getElementById('chat-font-scale').value;
                this.chatTheme = document.getElementById('chat-theme').value;
                this.aiTextColor = document.getElementById('ai-text-color').value;
                this.userTextColor = document.getElementById('user-text-color').value;
                this.chatSurfaceColor = document.getElementById('chat-surface-color').value;
                this.apiProvider = providerSelect.value;
                localStorage.setItem('ai_provider', this.apiProvider);

                this.ensureSystemPromptInHistory();
                this.saveLearningSettings();
                this.applyChatAppearance();
                this.updateLearningHint();

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
            this.conversationHistory = [{ role: 'system', content: this.getComposedSystemPrompt() }];
            this.lastAutoEvaluationUserCount = 0;
            localStorage.setItem('ros2_last_auto_evaluation_user_count', '0');
            this.lastEvaluationNudgeUserCount = 0;
            localStorage.setItem('ros2_last_eval_nudge_user_count', '0');
            this.saveConversationHistory();
            this.chatMessages.innerHTML = '';
            this.addSystemMessage('✅ 对话历史已清除');
            this.startLearningFlow();
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
