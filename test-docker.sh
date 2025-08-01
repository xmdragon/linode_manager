#!/bin/bash

# Docker配置测试脚本

echo "🧪 测试 Docker 配置..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请启动 Docker"
    exit 1
fi

echo "✅ Docker 正在运行"

# 检查环境变量
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件，创建示例文件..."
    cp env.example .env
    echo "请编辑 .env 文件配置 LINODE_API_TOKEN"
fi

# 测试Docker Compose语法
echo "🔍 检查 Docker Compose 配置..."
if docker compose config > /dev/null 2>&1; then
    echo "✅ Docker Compose 配置正确"
else
    echo "❌ Docker Compose 配置有误"
    docker compose config
    exit 1
fi

# 测试构建（不实际构建）
echo "🔨 测试构建配置..."
if docker compose build --dry-run > /dev/null 2>&1; then
    echo "✅ 构建配置正确"
else
    echo "⚠️  无法进行dry-run测试，跳过"
fi

echo ""
echo "🎉 Docker 配置测试完成！"
echo ""
echo "📋 下一步："
echo "1. 确保 .env 文件中配置了 LINODE_API_TOKEN"
echo "2. 运行 ./docker-deploy.sh 进行部署"
echo "3. 或者运行 docker compose up -d 手动部署" 