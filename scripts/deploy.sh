#!/bin/bash

# 部署脚本
echo "🚀 开始部署客户端应用..."

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "❌ 错误: .env 文件不存在"
    echo "请复制 .env.example 为 .env 并配置相应的环境变量"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建生产版本
echo "🔨 构建生产版本..."
npm run build

# 检查构建是否成功
if [ ! -d "dist" ]; then
    echo "❌ 构建失败: dist 目录不存在"
    exit 1
fi

echo "✅ 构建完成!"
echo "📁 构建文件位于 dist/ 目录"
echo ""
echo "📋 接下来的步骤:"
echo "1. 将 dist/ 目录内容复制到你的Web服务器根目录"
echo "2. 配置Web服务器支持SPA路由"
echo "3. 确保SSL证书已配置"
echo "4. 更新Google OAuth重定向URI"
echo "5. 测试所有功能"