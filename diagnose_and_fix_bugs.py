#!/usr/bin/env python3
"""
ROS2 教学网站 - Bug诊断和修复脚本
检测并修复常见问题：
1. 子页面中重复的AI助手
2. 子页面右边空白问题
3. 子页面左边导航显示问题
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Tuple

class ROS2BugDiagnoser:
    def __init__(self, root_path: str = '/home/x/Xcode/ROS2'):
        self.root_path = root_path
        self.issues = []
        self.fixes = []
        
    def check_duplicate_ai_helpers(self) -> Tuple[bool, str]:
        """检查是否存在重复的AI助手"""
        docs_file = os.path.join(self.root_path, 'docs.html')
        with open(docs_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 计算AI助手的数量
        ai_widget_count = content.count('id="ai-chat-widget"')
        
        if ai_widget_count > 1:
            issue = f"❌ 发现 {ai_widget_count} 个AI助手定义（应该只有1个）"
            self.issues.append(issue)
            return True, issue
        
        # 检查是否有iframe没有清除重复的AI助手
        if 'removeLegacyChatInFrame' in content:
            issue = "⚠️  检测到removeLegacyChatInFrame函数，可能仍有清理不完全的情况"
            self.issues.append(issue)
            return False, issue
        
        return False, "✓ AI助手检查通过"
    
    def check_iframe_width_fix(self) -> Tuple[bool, str]:
        """检查iframe宽度修复是否正确"""
        docs_file = os.path.join(self.root_path, 'docs.html')
        with open(docs_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否隐藏了左导航（可能导致ROS导航丧失）
        if "navSide.style.display = 'none'" in content:
            issue = "❌ 不应该隐藏iframe内的左导航！这会导致ROS目录丧失"
            self.issues.append(issue)
            self.fixes.append({
                'type': 'remove_nav_hiding',
                'file': docs_file,
                'reason': '隐藏iframe内容会破坏原有结构'
            })
            return True, issue
        
        return False, "✓ iframe宽度处理检查通过"
    
    def check_parameter_handling(self) -> Tuple[bool, str]:
        """检查URL参数处理"""
        docs_file = os.path.join(self.root_path, 'docs.html')
        with open(docs_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'URLSearchParams' not in content:
            issue = "⚠️  缺少URL参数处理代码"
            self.issues.append(issue)
            return False, issue
        
        return False, "✓ URL参数处理正常"
    
    def check_index_links(self) -> Tuple[bool, str]:
        """检查主页链接格式"""
        index_file = os.path.join(self.root_path, 'index.html')
        with open(index_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查link格式
        bad_links = re.findall(r'href="docs\.html\?page=([^"]+)"', content)
        if bad_links:
            # 检查是否有assets/html前缀
            bad_count = sum(1 for link in bad_links if not link.startswith('assets/html/'))
            if bad_count > 0:
                issue = f"⚠️  发现 {bad_count} 个缺少assets/html前缀的链接"
                self.issues.append(issue)
                return False, issue
        
        return False, "✓ 主页链接格式正确"
    
    def run_diagnostics(self) -> Dict:
        """运行完整诊断"""
        print("=" * 60)
        print("🔍 ROS2教学网站 Bug诊断工具")
        print("=" * 60)
        
        results = {
            '重复AI助手': self.check_duplicate_ai_helpers(),
            'iframe宽度处理': self.check_iframe_width_fix(),
            'URL参数处理': self.check_parameter_handling(),
            '主页链接格式': self.check_index_links(),
        }
        
        print("\n📋 诊断结果：\n")
        for test_name, (has_issue, message) in results.items():
            print(f"  {test_name}")
            print(f"    {message}\n")
        
        critical_issues = sum(1 for _, (has_issue, _) in results.items() if has_issue)
        print(f"\n总计：{len(self.issues)}个问题，其中{critical_issues}个严重问题")
        
        return results
    
    def suggest_fixes(self) -> None:
        """建议修复方案"""
        if not self.issues:
            print("\n✅ 没有发现问题")
            return
        
        print("\n" + "=" * 60)
        print("🛠️  推荐的修复方案")
        print("=" * 60)
        
        print("""
1️⃣  【隐藏左导航的问题】
   问题：navSide.style.display = 'none' 破坏了ROS文档的导航结构
   方案：改用CSS隐藏而不是修改DOM
   步骤：
   a) 移除JavaScript中隐藏navSide的代码
   b) 在docs.html的CSS中添加：
      .docs-frame {
        --nav-hide: true;
      }
      .docs-frame-container iframe {
        /* 通过作用域CSS隐藏导航 */
      }
   c) 使用CSS filter或visibility instead of display:none

2️⃣  【重复AI助手问题】
   问题：iframe中加载的文档本身包含AI助手，导致重复
   方案：
   a) 确保removeLegacyChatInFrame()正确清理
   b) 增加等待时间让iframe完全加载再清理
   c) 使用MutationObserver监听DOM变化进行清理

3️⃣  【右边空白问题】
   问题：不能直接修改iframe内容的结构
   方案：
   a) 保留iframe内的左导航（这是原设计）
   b) 调整docs-content的padding和margin
   c) 让flex布局自动撑满空间

推荐实施顺序：先恢复左导航 → 删除DOM修改代码 → 用CSS处理宽度
        """)
    
    def generate_fix_script(self) -> str:
        """生成修复脚本"""
        return '''
# 修复脚本：恢复iframe原有结构

1. 编辑 docs.html，找到 adjustIframeContentWidth() 函数
2. 删除以下行：
   - navSide.style.display = 'none';
   - grid.style.marginLeft = '0';
   
3. 改为CSS处理，在 docs.html <style> 中添加：
   
   /* 调整iframe容器但不修改内容结构 */
   .docs-frame-container {
       flex: 1;
       display: flex;
       flex-direction: column;
       overflow: hidden;
   }
   
   /* 让iframe宽度自适应 */
   .docs-frame {
       width: 100%;
       height: 100%;
       border: none;
   }
   
   /* docs-content自动填充空间 */
   .docs-content {
       flex: 1;
       overflow: hidden;
       display: flex;
   }
'''


def main():
    diagnoser = ROS2BugDiagnoser()
    
    # 运行诊断
    results = diagnoser.run_diagnostics()
    
    # 显示修复建议
    diagnoser.suggest_fixes()
    
    # 统计信息
    print("\n" + "=" * 60)
    print("📊 统计信息")
    print("=" * 60)
    print(f"💾 根路径：{diagnoser.root_path}")
    print(f"🐛 发现的问题：{len(diagnoser.issues)}")
    print(f"✏️  推荐修复数：{len(diagnoser.fixes)}")
    
    print("\n" + "=" * 60)
    print("🎯 关键要点")
    print("=" * 60)
    print("""
✓ NOT 不应该修改iframe内的DOM结构
✓ 不应该隐藏fram内的导航元素
✓ 应该通过外层CSS布局来解决宽度问题
✓ 清理重复AI助手需要等待iframe加载完成
✓ 修改前一定要备份原文件
    """)


if __name__ == '__main__':
    main()
