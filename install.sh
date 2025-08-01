#!/bin/bash

echo "🚀 开始安装 Linode 服务器管理面板..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 请先安装 Node.js (https://nodejs.org/)"
    exit 1
fi

echo "✅ Node.js 已安装: $(node --version)"

# 安装根目录依赖
echo "📦 安装根目录依赖..."
npm install

# 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
npm install
cd ..

# 安装前端依赖
echo "📦 安装前端依赖..."
cd frontend
npm install
cd ..

# 创建环境变量文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp env.example .env
    echo "⚠️  请编辑 .env 文件，配置您的 Linode API Token"
fi

echo ""
echo "✅ 安装完成！"
echo ""
echo "📋 下一步操作："
echo "1. 编辑 .env 文件，配置您的 Linode API Token"
echo "2. 运行 'npm run dev' 启动开发服务器"
echo "3. 访问 http://localhost:3000 查看应用"
echo ""
echo "🔧 开发命令："
echo "- npm run dev          # 启动前后端开发服务器"
echo "- npm run server       # 仅启动后端服务器"
echo "- npm run client       # 仅启动前端服务器"
echo "- npm run build        # 构建生产版本" 