#!/usr/bin/env python3
"""
生成微信小程序 TabBar 图标
尺寸: 81x81px
"""

from PIL import Image, ImageDraw
import os

# 颜色定义
NORMAL_COLOR = '#999999'
ACTIVE_COLOR = '#667eea'
SIZE = 81

def draw_calendar(color_hex):
    """绘制黄历图标（日历样式）"""
    img = Image.new('RGBA', (SIZE, SIZE), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    # 转换颜色
    color = tuple(int(color_hex.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))

    # 日历外框
    draw.rectangle([15, 20, 66, 68], outline=color, width=3)

    # 顶部装订环
    draw.rectangle([25, 15, 28, 25], fill=color)
    draw.rectangle([53, 15, 56, 25], fill=color)

    # 日期数字 "30" (使用线条模拟)
    # 数字 3
    draw.arc([25, 32, 38, 45], 270, 90, fill=color, width=3)
    draw.arc([25, 42, 38, 55], 90, 270, fill=color, width=3)

    # 数字 0
    draw.ellipse([43, 32, 56, 55], outline=color, width=3)

    return img

def draw_fortune(color_hex):
    """绘制运势图标（太极阴阳样式）"""
    img = Image.new('RGBA', (SIZE, SIZE), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    color = tuple(int(color_hex.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))

    centerX, centerY = SIZE // 2, SIZE // 2
    radius = 28

    # 外圆
    draw.ellipse([centerX-radius, centerY-radius, centerX+radius, centerY+radius],
                 outline=color, width=3)

    # 上半部阳
    draw.pieslice([centerX-radius, centerY-radius, centerX+radius, centerY+radius],
                  90, 270, fill=color)

    # 小圆（阴中有阳）
    draw.ellipse([centerX-radius//2, centerY-radius-radius//2,
                  centerX+radius//2, centerY-radius+radius//2], fill=color)
    draw.ellipse([centerX-5, centerY-radius//2-5, centerX+5, centerY-radius//2+5],
                 fill=(255,255,255))

    # 下半部阴
    draw.ellipse([centerX-radius//2, centerY+radius//2-radius//2,
                  centerX+radius//2, centerY+radius//2+radius//2], fill=(255,255,255))
    draw.ellipse([centerX-5, centerY+radius//2-5, centerX+5, centerY+radius//2+5],
                 fill=color)

    return img

def draw_user(color_hex):
    """绘制我的图标（用户头像样式）"""
    img = Image.new('RGBA', (SIZE, SIZE), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    color = tuple(int(color_hex.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))

    centerX = SIZE // 2

    # 头部圆圈
    draw.ellipse([centerX-13, 15, centerX+13, 41], outline=color, width=3)

    # 身体（圆弧）
    draw.arc([centerX-24, 41, centerX+24, 89], 180, 360, fill=color, width=3)

    # 连接身体的竖线
    draw.line([centerX-24, 65, centerX-24, 62], fill=color, width=3)
    draw.line([centerX+24, 65, centerX+24, 62], fill=color, width=3)

    return img

def main():
    output_dir = os.path.dirname(os.path.abspath(__file__))

    # 生成黄历图标
    calendar_normal = draw_calendar(NORMAL_COLOR)
    calendar_active = draw_calendar(ACTIVE_COLOR)
    calendar_normal.save(os.path.join(output_dir, 'tab-calendar.png'))
    calendar_active.save(os.path.join(output_dir, 'tab-calendar-active.png'))
    print('✓ 黄历图标生成完成')

    # 生成运势图标
    fortune_normal = draw_fortune(NORMAL_COLOR)
    fortune_active = draw_fortune(ACTIVE_COLOR)
    fortune_normal.save(os.path.join(output_dir, 'tab-fortune.png'))
    fortune_active.save(os.path.join(output_dir, 'tab-fortune-active.png'))
    print('✓ 运势图标生成完成')

    # 生成我的图标
    my_normal = draw_user(NORMAL_COLOR)
    my_active = draw_user(ACTIVE_COLOR)
    my_normal.save(os.path.join(output_dir, 'tab-my.png'))
    my_active.save(os.path.join(output_dir, 'tab-my-active.png'))
    print('✓ 我的图标生成完成')

    print('\n所有图标已生成到:', output_dir)

if __name__ == '__main__':
    main()
