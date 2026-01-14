#!/usr/bin/env python3
"""
API密钥加密工具
将config.yaml中的API密钥加密并生成JavaScript配置文件
"""

import yaml
import base64
import json
import os
from pathlib import Path

def simple_encrypt(text, key):
    """简单的XOR加密（用于混淆，不是真正的安全加密）"""
    key_bytes = key.encode('utf-8')
    text_bytes = text.encode('utf-8')
    
    encrypted = bytearray()
    for i, byte in enumerate(text_bytes):
        encrypted.append(byte ^ key_bytes[i % len(key_bytes)])
    
    # 转为base64使其可安全存储
    return base64.b64encode(encrypted).decode('utf-8')

def generate_encrypted_config():
    """读取config.yaml并生成加密的JavaScript配置"""
    
    config_path = Path(__file__).parent / 'config.yaml'
    
    if not config_path.exists():
        print("❌ 错误: config.yaml 文件不存在")
        print("请复制 config.yaml.example 为 config.yaml 并填入你的API密钥")
        return False
    
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)
        
        obfuscation_key = config['security']['obfuscation_key']
        
        # 加密API密钥
        encrypted_config = {
            'qwen': {
                'api_key': simple_encrypt(config['qwen']['api_key'], obfuscation_key),
                'endpoint': config['qwen']['endpoint'],
                'models': config['qwen']['models']
            },
            'deepseek': {
                'api_key': simple_encrypt(config['deepseek']['api_key'], obfuscation_key),
                'endpoint': config['deepseek']['endpoint'],
                'models': config['deepseek']['models']
            },
            'security': {
                'key': simple_encrypt(obfuscation_key, 'internal-key-2026'),
                'domains': config['security']['allowed_domains']
            }
        }
        
        # 生成JavaScript文件
        js_content = f"""// 自动生成的加密配置文件
// 请勿手动编辑此文件
// 由 encrypt_config.py 从 config.yaml 生成

const ENCRYPTED_CONFIG = {json.dumps(encrypted_config, indent=4, ensure_ascii=False)};

// 简单解密函数
function decryptApiKey(encrypted, keyEncrypted) {{
    try {{
        // 解密混淆密钥
        const keyBytes = atob(keyEncrypted);
        const internalKey = 'internal-key-2026';
        let obfuscationKey = '';
        for (let i = 0; i < keyBytes.length; i++) {{
            obfuscationKey += String.fromCharCode(
                keyBytes.charCodeAt(i) ^ internalKey.charCodeAt(i % internalKey.length)
            );
        }}
        
        // 解密API密钥
        const encryptedBytes = atob(encrypted);
        let decrypted = '';
        for (let i = 0; i < encryptedBytes.length; i++) {{
            decrypted += String.fromCharCode(
                encryptedBytes.charCodeAt(i) ^ obfuscationKey.charCodeAt(i % obfuscationKey.length)
            );
        }}
        return decrypted;
    }} catch (e) {{
        console.error('解密失败:', e);
        return null;
    }}
}}

// 验证域名
function isAllowedDomain() {{
    const hostname = window.location.hostname;
    return ENCRYPTED_CONFIG.security.domains.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
    );
}}

// 导出配置
if (typeof module !== 'undefined' && module.exports) {{
    module.exports = {{ ENCRYPTED_CONFIG, decryptApiKey, isAllowedDomain }};
}}
"""
        
        # 写入到两个位置
        output_paths = [
            Path(__file__).parent / 'assets' / 'js' / 'api-config.js',
            Path(__file__).parent / 'assets' / 'html' / '_static' / 'js' / 'api-config.js'
        ]
        
        for output_path in output_paths:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(js_content)
            print(f"✅ 已生成加密配置: {output_path}")
        
        print("\n🎉 加密完成！")
        print("📝 说明:")
        print("  - API密钥已加密并保存到 api-config.js")
        print("  - config.yaml 不会被上传到Git（已在.gitignore中）")
        print("  - 用户无需配置API密钥即可使用")
        print("\n⚠️  安全提示:")
        print("  - 这是简单混淆加密，不是完全安全的加密")
        print("  - 建议在通义千问/DeepSeek控制台设置域名白名单")
        print("  - 定期更换API密钥")
        
        return True
        
    except Exception as e:
        print(f"❌ 错误: {e}")
        return False

if __name__ == '__main__':
    print("🔐 ROS2教学网站 API密钥加密工具\n")
    generate_encrypted_config()
