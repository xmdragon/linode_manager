#!/bin/bash

# Linode管理面板 Docker部署脚本

set -e

echo "🐳 开始部署 Linode 管理面板..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: 请先安装 Docker"
    exit 1
fi

# 检查Docker Compose是否可用
if ! docker compose version &> /dev/null; then
    echo "❌ 错误: Docker Compose 不可用"
    exit 1
fi

echo "✅ Docker 已安装: $(docker --version)"
echo "✅ Docker Compose 已安装: $(docker compose version)"

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp env.example .env
    echo "⚠️  请编辑 .env 文件，配置您的 Linode API Token"
    echo "   然后重新运行此脚本"
    exit 1
fi

# 检查LINODE_API_TOKEN是否配置
if ! grep -q "LINODE_API_TOKEN=" .env || grep -q "your_linode_api_token_here" .env; then
    echo "❌ 错误: 请在 .env 文件中配置 LINODE_API_TOKEN"
    exit 1
fi

echo "✅ 环境变量已配置"

# 创建必要的目录
mkdir -p logs
mkdir -p nginx/ssl

# 停止现有容器
echo "🛑 停止现有容器..."
docker compose down --remove-orphans

# 构建镜像
echo "🔨 构建 Docker 镜像..."
docker compose build --no-cache

# 启动服务
echo "🚀 启动服务..."
docker compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "📊 检查服务状态..."
docker compose ps

# 检查健康状态
echo "🏥 检查健康状态..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ 服务运行正常"
else
    echo "⚠️  服务可能还在启动中，请稍后检查"
fi

echo ""
echo "🎉 部署完成！"
echo ""
echo "📋 访问信息："
echo "- 应用地址: http://localhost:3001"
echo "- 健康检查: http://localhost:3001/health"
echo "- API文档: http://localhost:3001/api/servers"
echo ""
echo "🔧 常用命令："
echo "- 查看日志: docker compose logs -f"
echo "- 停止服务: docker compose down"
echo "- 重启服务: docker compose restart"
echo "- 更新服务: docker compose pull && docker compose up -d"
echo ""
echo "�� 日志文件位置: ./logs/" 