// 自动生成的加密配置文件
// 请勿手动编辑此文件
// 由 encrypt_config.py 从 config.yaml 生成

const ENCRYPTED_CONFIG = {
    "qwen": {
        "api_key": "AQReUEgWAFMCDFBXBB1CXUxWHBFXVkMHTRVSXE0eUVEFAUE=",
        "endpoint": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "models": [
            "qwen-max",
            "qwen-plus",
            "qwen-turbo",
            "qwen-vl-max"
        ]
    },
    "deepseek": {
        "api_key": "AQReBBtGVwRQWlgPAx0XXUZUHxIBVxZcTBVdAx9IAlVRBkE=",
        "endpoint": "https://api.deepseek.com/v1",
        "models": [
            "deepseek-chat",
            "deepseek-coder"
        ]
    },
    "security": {
        "key": "GwEHV18aBA1OAwwXSh9DW0IMQwcAERwEGAAAAAAAAAAAAA==",
        "domains": [
            "me332-sustech.github.io",
            "me332-sustech.github.io/ROS2",
            "localhost",
            "127.0.0.1"
        ]
    }
};

// 简单解密函数
function decryptApiKey(encrypted, keyEncrypted) {
    try {
        // 解密混淆密钥
        const keyBytes = atob(keyEncrypted);
        const internalKey = 'internal-key-2026';
        let obfuscationKey = '';
        for (let i = 0; i < keyBytes.length; i++) {
            obfuscationKey += String.fromCharCode(
                keyBytes.charCodeAt(i) ^ internalKey.charCodeAt(i % internalKey.length)
            );
        }
        
        // 解密API密钥
        const encryptedBytes = atob(encrypted);
        let decrypted = '';
        for (let i = 0; i < encryptedBytes.length; i++) {
            decrypted += String.fromCharCode(
                encryptedBytes.charCodeAt(i) ^ obfuscationKey.charCodeAt(i % obfuscationKey.length)
            );
        }
        return decrypted;
    } catch (e) {
        console.error('解密失败:', e);
        return null;
    }
}

// 验证域名
function isAllowedDomain() {
    const hostname = window.location.hostname;
    return ENCRYPTED_CONFIG.security.domains.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
    );
}

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ENCRYPTED_CONFIG, decryptApiKey, isAllowedDomain };
}
