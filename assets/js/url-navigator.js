// URL导航工具 - 将官方文档URL转换为本地HTML路径
class URLNavigator {
    constructor() {
        this.input = document.getElementById('docs-url-input');
        this.button = document.getElementById('navigate-btn');
        this.result = document.getElementById('url-result');
        
        if (this.button && this.input) {
            this.button.addEventListener('click', () => this.navigate());
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.navigate();
                }
            });
        }
    }
    
    navigate() {
        const url = this.input.value.trim();
        
        if (!url) {
            this.showResult('请输入官方文档URL', 'error');
            return;
        }
        
        // 解析URL
        const localPath = this.convertToLocalPath(url);
        
        if (localPath) {
            this.showResult('✅ 正在跳转到本地文档...', 'success');
            setTimeout(() => {
                window.open(localPath, '_blank');
            }, 500);
        } else {
            this.showResult('❌ 无法识别该URL格式，请确保是 docs.ros.org/en/humble/ 开头的链接', 'error');
        }
    }
    
    convertToLocalPath(url) {
        try {
            // 匹配官方文档URL格式
            // 例如: https://docs.ros.org/en/humble/Tutorials/Intermediate/Rosdep.html
            const pattern = /docs\.ros\.org\/en\/humble\/(.+\.html)/;
            const match = url.match(pattern);
            
            if (match && match[1]) {
                // 提取路径部分
                const docPath = match[1];
                
                // 转换为本地路径
                const localPath = `/assets/html/${docPath}`;
                
                console.log('Original URL:', url);
                console.log('Converted to:', localPath);
                
                return localPath;
            }
            
            return null;
        } catch (error) {
            console.error('URL conversion error:', error);
            return null;
        }
    }
    
    showResult(message, type) {
        this.result.textContent = message;
        this.result.className = 'url-result show ' + type;
        
        // 3秒后自动隐藏
        setTimeout(() => {
            this.result.classList.remove('show');
        }, 3000);
    }
}

// 初始化URL导航器
document.addEventListener('DOMContentLoaded', () => {
    new URLNavigator();
});
