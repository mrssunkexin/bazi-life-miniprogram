#!/bin/bash

# 生成微信小程序 TabBar 图标
# 使用 SVG 转 PNG

cd "$(dirname "$0")"

echo "正在生成 TabBar 图标..."

# 黄历图标 SVG (日历样式)
cat > calendar.svg <<'EOF'
<svg width="81" height="81" xmlns="http://www.w3.org/2000/svg">
  <rect x="15" y="20" width="51" height="48" fill="none" stroke="COLOR" stroke-width="3"/>
  <rect x="25" y="15" width="3" height="10" fill="COLOR"/>
  <rect x="53" y="15" width="3" height="10" fill="COLOR"/>
  <text x="40.5" y="52" font-size="24" font-weight="bold" fill="COLOR" text-anchor="middle">30</text>
</svg>
EOF

# 运势图标 SVG (太极阴阳)
cat > fortune.svg <<'EOF'
<svg width="81" height="81" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40.5" cy="40.5" r="28" fill="none" stroke="COLOR" stroke-width="3"/>
  <path d="M 40.5 12.5 A 14 14 0 0 1 40.5 40.5 A 14 14 0 0 0 40.5 68.5 A 28 28 0 0 0 40.5 12.5" fill="COLOR"/>
  <circle cx="40.5" cy="26.5" r="5" fill="white"/>
  <circle cx="40.5" cy="54.5" r="5" fill="COLOR"/>
</svg>
EOF

# 我的图标 SVG (用户头像)
cat > user.svg <<'EOF'
<svg width="81" height="81" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40.5" cy="28" r="13" fill="none" stroke="COLOR" stroke-width="3"/>
  <path d="M 16.5 65 A 24 24 0 0 1 64.5 65" fill="none" stroke="COLOR" stroke-width="3"/>
  <line x1="16.5" y1="65" x2="16.5" y2="62" stroke="COLOR" stroke-width="3"/>
  <line x1="64.5" y1="65" x2="64.5" y2="62" stroke="COLOR" stroke-width="3"/>
</svg>
EOF

# 函数：生成PNG
generate_png() {
    local svg_file=$1
    local color=$2
    local output=$3

    # 替换颜色
    sed "s/COLOR/$color/g" "$svg_file" > temp.svg

    # 转换为PNG (如果系统有 rsvg-convert 或 convert)
    if command -v rsvg-convert &> /dev/null; then
        rsvg-convert -w 81 -h 81 temp.svg -o "$output"
    elif command -v convert &> /dev/null; then
        convert -background none temp.svg -resize 81x81 "$output"
    else
        echo "请安装 librsvg 或 ImageMagick"
        echo "macOS: brew install librsvg"
        rm temp.svg
        return 1
    fi

    rm temp.svg
}

# 生成所有图标
NORMAL_COLOR="%23999999"
ACTIVE_COLOR="%23667eea"

echo "生成黄历图标..."
generate_png calendar.svg "$NORMAL_COLOR" tab-calendar.png
generate_png calendar.svg "$ACTIVE_COLOR" tab-calendar-active.png

echo "生成运势图标..."
generate_png fortune.svg "$NORMAL_COLOR" tab-fortune.png
generate_png fortune.svg "$ACTIVE_COLOR" tab-fortune-active.png

echo "生成我的图标..."
generate_png user.svg "$NORMAL_COLOR" tab-my.png
generate_png user.svg "$ACTIVE_COLOR" tab-my-active.png

# 清理临时文件
rm calendar.svg fortune.svg user.svg

echo "✓ 所有图标生成完成！"
ls -lh tab-*.png
