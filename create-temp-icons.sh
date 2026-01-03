#!/bin/bash

# 快速创建临时 TabBar 图标的脚本
# 这个脚本会使用 qrcode.jpg 作为临时占位图标

echo "========================================"
echo "创建临时 TabBar 图标"
echo "========================================"
echo ""
echo "⚠️  注意：这只是临时方案，用于快速测试"
echo "📝 发布前请替换成专业设计的图标"
echo ""

cd "$(dirname "$0")/images" || exit 1

if [ ! -f "qrcode.jpg" ]; then
  echo "❌ 错误：找不到 qrcode.jpg"
  echo "请确保在 /images/ 目录下有 qrcode.jpg 文件"
  exit 1
fi

echo "📋 开始创建临时图标..."

# 复制 qrcode.jpg 作为临时图标
cp qrcode.jpg tab-calendar.png
cp qrcode.jpg tab-calendar-active.png
cp qrcode.jpg tab-fortune.png
cp qrcode.jpg tab-fortune-active.png
cp qrcode.jpg tab-my.png
cp qrcode.jpg tab-my-active.png

echo "✅ 临时图标创建完成！"
echo ""
echo "创建的文件："
ls -lh tab-*.png
echo ""
echo "========================================"
echo "下一步操作："
echo "========================================"
echo "1. 打开 /Users/huayin/miniprogram-1/app.json"
echo "2. 在 tabBar.list 中添加图标路径（参考 QUICK_START_GUIDE.md）"
echo "3. 在微信开发者工具中：工具 → 构建 npm"
echo "4. 编译并测试小程序"
echo ""
echo "🎨 发布前记得替换成专业图标！"
echo "========================================"
