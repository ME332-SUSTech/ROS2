#!/bin/bash

# ROS2教学网站部署和开发脚本

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数定义
print_header() {
    echo -e "${BLUE}"
    echo "=================================================="
    echo "       ROS2 Humble 教学网站 - 部署工具"
    echo "=================================================="
    echo -e "${NC}"
}

print_step() {
    echo -e "${GREEN}[步骤] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[警告] $1${NC}"
}

print_error() {
    echo -e "${RED}[错误] $1${NC}"
}

# 检查依赖
check_dependencies() {
    print_step "检查依赖..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git 未安装，请先安装 Git"
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null; then
        print_error "Python3 未安装，请先安装 Python3"
        exit 1
    fi
    
    print_step "依赖检查完成 ✓"
}

# 本地开发服务器
start_dev_server() {
    print_step "启动开发服务器..."
    echo -e "${YELLOW}访问地址: http://localhost:8000${NC}"
    echo -e "${YELLOW}按 Ctrl+C 停止服务器${NC}"
    echo ""
    python3 -m http.server 8000
}

# 初始化Git仓库
init_git() {
    print_step "初始化Git仓库..."
    
    if [ -d ".git" ]; then
        print_warning "Git仓库已存在"
    else
        git init
        git add .
        git commit -m "Initial commit: ROS2 tutorial website with AI chat"
        print_step "Git仓库初始化完成 ✓"
    fi
}

# 部署到GitHub Pages
deploy_github() {
    print_step "部署到GitHub Pages..."
    
    read -p "请输入GitHub用户名: " username
    read -p "请输入GitHub仓库名: " repo_name
    
    # 检查是否已添加远程仓库
    if git remote get-url origin &> /dev/null; then
        print_warning "远程仓库已存在"
    else
        git remote add origin "https://github.com/$username/$repo_name.git"
    fi
    
    git branch -M main
    git add .
    git commit -m "Update: ROS2 tutorial website $(date +%Y-%m-%d)"
    git push -u origin main
    
    print_step "代码已推送到GitHub ✓"
    echo -e "${GREEN}请在GitHub仓库设置中启用GitHub Pages${NC}"
    echo -e "${GREEN}你的网站将在: https://$username.github.io/$repo_name/${NC}"
}

# 更新README.md中的链接
update_readme() {
    read -p "请输入GitHub用户名: " username
    read -p "请输入GitHub仓库名: " repo_name
    
    # 更新README.md中的链接
    sed -i "s/your-username/$username/g" README.md
    sed -i "s/your-repo-name/$repo_name/g" README.md
    sed -i "s/your-email@example.com/your-email@example.com/g" README.md
    
    # 更新package.json中的链接
    sed -i "s/your-username/$username/g" package.json
    sed -i "s/your-repo-name/$repo_name/g" package.json
    
    print_step "链接更新完成 ✓"
}

# 主菜单
show_menu() {
    echo ""
    echo "请选择操作:"
    echo "1) 启动开发服务器"
    echo "2) 初始化Git仓库"
    echo "3) 更新配置链接"
    echo "4) 部署到GitHub Pages"
    echo "5) 查看项目结构"
    echo "6) 退出"
    echo ""
}

# 查看项目结构
show_structure() {
    print_step "项目结构:"
    tree -L 3 . 2>/dev/null || find . -type d -not -path "./.git*" | head -20
}

# 主程序
main() {
    print_header
    check_dependencies
    
    while true; do
        show_menu
        read -p "请输入选择 (1-6): " choice
        
        case $choice in
            1)
                start_dev_server
                ;;
            2)
                init_git
                ;;
            3)
                update_readme
                ;;
            4)
                deploy_github
                ;;
            5)
                show_structure
                ;;
            6)
                echo -e "${GREEN}再见！${NC}"
                exit 0
                ;;
            *)
                print_error "无效选择，请输入 1-6"
                ;;
        esac
    done
}

# 检查脚本是否在正确的目录中运行
if [ ! -f "index.html" ]; then
    print_error "请在ROS2项目根目录中运行此脚本"
    exit 1
fi

# 运行主程序
main