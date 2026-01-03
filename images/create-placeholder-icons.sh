#!/bin/bash
# 创建简单的占位图标（使用 ImageMagick 或其他工具）
# 这个脚本仅用于生成临时占位图标

# 灰色占位图（未选中）
convert -size 81x81 xc:gray +antialias -fill white -draw "circle 40,40 40,10" tab-calendar.png 2>/dev/null || echo "ImageMagick not installed, please create icons manually"
convert -size 81x81 xc:gray +antialias -fill white -draw "circle 40,40 40,10" tab-fortune.png 2>/dev/null
convert -size 81x81 xc:gray +antialias -fill white -draw "circle 40,40 40,10" tab-my.png 2>/dev/null

# 紫色占位图（选中）
convert -size 81x81 xc:'#667eea' +antialias -fill white -draw "circle 40,40 40,10" tab-calendar-active.png 2>/dev/null
convert -size 81x81 xc:'#667eea' +antialias -fill white -draw "circle 40,40 40,10" tab-fortune-active.png 2>/dev/null
convert -size 81x81 xc:'#667eea' +antialias -fill white -draw "circle 40,40 40,10" tab-my-active.png 2>/dev/null

echo "Placeholder icons created (if ImageMagick is available)"
