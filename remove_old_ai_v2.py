#!/usr/bin/env python3
"""
Remove old AI widget code from HTML files.
Uses line-filtering approach instead of regex.
"""
import os
import subprocess
from pathlib import Path

# Keywords that indicate old AI code should be removed
REMOVAL_PATTERNS = [
    'id="ai-chat-widget"',
    'id="chat-trigger"',
    'id="learning-hint"',
    'class="ai-chat-widget"',
    'chat-widget-enhanced.js',
    'chat-widget.css',
]

# Only remove lines that contain ENTIRE patterns - not just parts
DANGEROUS_PATTERNS = [
    'api-config.js',  # Only remove if it's in script src
]

def is_dangerous_line(line):
    """Check if line should definitely be removed"""
    if 'ai-chat-widget' in line:
        return True
    if 'chat-trigger' in line:
        return True
    if 'learning-hint' in line:
        return True
    if 'chat-widget-enhanced.js' in line:
        return True
    # Only remove api-config if it's in a script tag
    if 'api-config.js' in line and '<script' in line:
        return True
    # Remove chat-widget.css only if it's a link tag
    if 'chat-widget.css' in line and '<link' in line:
        return True
    return False

def clean_file(filepath):
    """Remove old AI code lines from a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
        
        cleaned_lines = [line for line in lines if not is_dangerous_line(line)]
        
        if len(cleaned_lines) < len(lines):
            # File was modified
            with open(filepath, 'w', encoding='utf-8') as f:
                f.writelines(cleaned_lines)
            return len(lines) - len(cleaned_lines)
        return 0
    except Exception as e:
        print(f"ERROR processing {filepath}: {e}")
        return -1

def main():
    html_dir = Path("/home/x/Xcode/ROS2/assets/html")
    
    if not html_dir.exists():
        print(f"Directory not found: {html_dir}")
        return
    
    # Find all HTML files with ai-chat-widget
    cmd = f"find {html_dir} -name '*.html' -exec grep -l 'ai-chat-widget' {{}} \\;"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    files_to_clean = [f.strip() for f in result.stdout.strip().split('\n') if f.strip()]
    
    print(f"Found {len(files_to_clean)} files with old AI code")
    
    total_removed = 0
    cleaned_count = 0
    
    for filepath in files_to_clean:
        removed = clean_file(filepath)
        if removed > 0:
            cleaned_count += 1
            total_removed += removed
            print(f"✓ {os.path.basename(filepath)}: removed {removed} lines")
        elif removed == 0:
            print(f"⊘ {os.path.basename(filepath)}: no removable lines found")
    
    print(f"\n清理完成:")
    print(f"  扫描文件: {len(files_to_clean)}")
    print(f"  清理文件: {cleaned_count}")
    print(f"  删除行数: {total_removed}")

if __name__ == '__main__':
    main()
