// pages/calendar/calendar.js
const api = require('../../utils/api');
const { getWuxingColor, getWuxingRgba } = require('../../utils/wuxing-colors.js');

Page({
  data: {
    currentDate: '',        // 当前查看的日期（YYYY-MM-DD）
    calendarData: null,     // 黄历数据
    loading: false,
    currentShiChen: '',     // 当前时辰
    touchStartX: 0,         // 滑动起始位置
    touchEndX: 0,           // 滑动结束位置
    shiChenTimer: null,     // 时辰更新定时器
    isToday: true,          // 是否是今天
    showPosterModal: false, // 是否显示海报弹窗
    posterImage: '',        // 生成的海报图片路径
    wuxingColorMap: {},
    wuxingColorMapLight: {},
    wuxingTextColorMap: {},
  },

  onLoad() {
    // 初始化为今天
    const today = this.formatDate(new Date());
    this.setData({ currentDate: today });
    this.loadCalendarData();
    this.updateCurrentShiChen();

    // 每分钟更新一次当前时辰
    const timer = setInterval(() => {
      this.updateCurrentShiChen();
    }, 60000);

    this.setData({ shiChenTimer: timer });
  },

  onUnload() {
    // 清除定时器
    if (this.data.shiChenTimer) {
      clearInterval(this.data.shiChenTimer);
    }
  },

  onShow() {
    const targetDate = wx.getStorageSync('calendar_target_date');
    if (targetDate) {
      wx.removeStorageSync('calendar_target_date');
      this.setData({ currentDate: targetDate, isToday: false }, () => {
        this.loadCalendarData();
      });
    }

    // 每次显示页面时更新当前时辰
    this.updateCurrentShiChen();

    const app = getApp();
    if (typeof app.applyTabBarVisibility === 'function') {
      app.applyTabBarVisibility();
    }
  },

  /**
   * 加载黄历数据
   */
  async loadCalendarData() {
    this.setData({ loading: true });

    try {
      const result = await api.getCalendarData(this.data.currentDate);

      if (result.success) {
        // 转换时辰吉凶的中文为拼音类名
        const calendarData = result.data;
        if (calendarData.shiChen) {
          calendarData.shiChen = calendarData.shiChen.map(sc => ({
            ...sc,
            jiXiongClass: sc.jiXiong === '吉' ? 'ji' : (sc.jiXiong === '凶' ? 'xiong' : 'ping')
          }));
        }

        // 调试：检查五行能量数据
        console.log('=== 黄历数据加载成功 ===');
        console.log('完整数据:', calendarData);
        console.log('五行能量数据存在?', !!calendarData.wuxingEnergy);
        if (calendarData.wuxingEnergy) {
          console.log('流日数据:', calendarData.wuxingEnergy.liuri);
          console.log('时辰数量:', calendarData.wuxingEnergy.shiChen?.length);
          console.log('第一个时辰:', calendarData.wuxingEnergy.shiChen?.[0]);
        }

        const wuxingList = ['jin', 'mu', 'shui', 'huo', 'tu'];
        const wuxingColorMap = {};
        const wuxingColorMapLight = {};
        const wuxingTextColorMap = {};
        wuxingList.forEach((wuxing) => {
          wuxingColorMap[wuxing] = getWuxingColor(wuxing, 'primary');
          wuxingColorMapLight[wuxing] = getWuxingRgba(wuxing, 0.1, 'primary');
          wuxingTextColorMap[wuxing] = wuxing === 'jin' ? '#333333' : '#FFFFFF';
        });

        this.setData({
          calendarData: calendarData,
          wuxingColorMap,
          wuxingColorMapLight,
          wuxingTextColorMap,
          loading: false
        });
      } else {
        throw new Error(result.error?.message || '加载失败');
      }
    } catch (error) {
      console.error('加载黄历数据失败:', error);
      wx.showToast({
        title: '加载失败，请稍后重试',
        icon: 'none',
        duration: 2000
      });
      this.setData({ loading: false });
    }
  },

  /**
   * 更新当前时辰
   */
  updateCurrentShiChen() {
    const hour = new Date().getHours();
    const shiChenMap = {
      23: '子时', 0: '子时',
      1: '丑时', 2: '丑时',
      3: '寅时', 4: '寅时',
      5: '卯时', 6: '卯时',
      7: '辰时', 8: '辰时',
      9: '巳时', 10: '巳时',
      11: '午时', 12: '午时',
      13: '未时', 14: '未时',
      15: '申时', 16: '申时',
      17: '酉时', 18: '酉时',
      19: '戌时', 20: '戌时',
      21: '亥时', 22: '亥时'
    };
    this.setData({ currentShiChen: shiChenMap[hour] });
  },

  /**
   * 上一天（箭头点击）
   */
  onPrevDay() {
    this.changeDate(-1);
  },

  /**
   * 下一天（箭头点击）
   */
  onNextDay() {
    this.changeDate(1);
  },

  /**
   * 触摸开始
   */
  onTouchStart(e) {
    this.setData({ touchStartX: e.touches[0].clientX });
  },

  /**
   * 触摸结束 - 处理滑动切换日期
   */
  onTouchEnd(e) {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = this.data.touchStartX - touchEndX;

    // 滑动距离超过50px才触发
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // 左滑，下一天
        this.changeDate(1);
      } else {
        // 右滑，上一天
        this.changeDate(-1);
      }
    }
  },

  /**
   * 改变日期
   * @param {number} days 天数偏移量（正数为未来，负数为过去）
   */
  changeDate(days) {
    const currentDate = new Date(this.data.currentDate + ' 00:00:00');
    currentDate.setDate(currentDate.getDate() + days);

    const newDate = this.formatDate(currentDate);
    const today = this.formatDate(new Date());

    this.setData({
      currentDate: newDate,
      isToday: newDate === today
    });
    this.loadCalendarData();
  },

  /**
   * 格式化日期为 YYYY-MM-DD
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * 日历图标点击 - 跳转到月历页面
   */
  onCalendarIconClick() {
    const { year, month } = this.data.calendarData.solar;
    wx.navigateTo({
      url: `/pages/month-calendar/month-calendar?year=${year}&month=${month}`,
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadCalendarData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 返回今天
   */
  goToToday() {
    const today = this.formatDate(new Date());
    if (this.data.currentDate !== today) {
      this.setData({
        currentDate: today,
        isToday: true
      });
      this.loadCalendarData();
    }
  },

  /**
   * 页面分享配置
   */
  onShareAppMessage() {
    return {
      title: '老黄历 - 今日宜忌',
      path: '/pages/calendar/calendar'
    };
  },

  /**
   * 配置加载完成后触发
   * @param {boolean} showTabBar 是否显示 TabBar
   */
  onTabBarConfigChanged(showTabBar) {
    if (showTabBar) {
      wx.showTabBar({ animation: false });
    } else {
      wx.hideTabBar({ animation: false });
    }
  },

  /**
   * 分享按钮点击
   */
  async onShareBtnClick() {
    if (!this.data.calendarData) {
      wx.showToast({
        title: '数据加载中，请稍候',
        icon: 'none'
      });
      return;
    }

    // 显示弹窗
    this.setData({
      showPosterModal: true,
      posterImage: ''
    });

    // 生成海报
    try {
      const posterPath = await this.generatePoster();
      this.setData({ posterImage: posterPath });
    } catch (error) {
      console.error('生成海报失败:', error);
      wx.showToast({
        title: '生成海报失败',
        icon: 'none'
      });
      this.setData({ showPosterModal: false });
    }
  },

  /**
   * 关闭海报弹窗
   */
  onClosePosterModal() {
    this.setData({
      showPosterModal: false,
      posterImage: ''
    });
  },

  /**
   * 阻止事件冒泡
   */
  onStopPropagation() {
    // 阻止点击弹窗内容时关闭弹窗
  },

  /**
   * 保存海报到相册
   */
  async onSavePoster() {
    if (!this.data.posterImage) {
      wx.showToast({
        title: '海报生成中，请稍候',
        icon: 'none'
      });
      return;
    }

    try {
      // 请求用户授权
      const { authSetting } = await wx.getSetting();

      if (!authSetting['scope.writePhotosAlbum']) {
        await wx.authorize({ scope: 'scope.writePhotosAlbum' });
      }

      // 保存图片到相册
      await wx.saveImageToPhotosAlbum({
        filePath: this.data.posterImage
      });

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });

      // 关闭弹窗
      this.onClosePosterModal();
    } catch (error) {
      console.error('保存失败:', error);

      if (error.errMsg && error.errMsg.includes('auth deny')) {
        wx.showModal({
          title: '提示',
          content: '需要授权保存到相册',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting();
            }
          }
        });
      } else {
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    }
  },

  /**
   * 生成海报
   * @returns {Promise<string>} 海报临时文件路径
   */
  async generatePoster() {
    return new Promise((resolve, reject) => {
      const query = wx.createSelectorQuery();
      query.select('#posterCanvas')
        .fields({ node: true, size: true })
        .exec(async (res) => {
          if (!res || !res[0]) {
            reject(new Error('Canvas 节点未找到'));
            return;
          }

          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');

          // 设置画布尺寸（3:5比例，1080x1800）
          const canvasWidth = 1080;
          const canvasHeight = 1800;
          const dpr = wx.getSystemInfoSync().pixelRatio;

          canvas.width = canvasWidth * dpr;
          canvas.height = canvasHeight * dpr;
          ctx.scale(dpr, dpr);

          try {
            await this.loadPosterFonts();
            // 绘制海报（传入 canvas 用于创建图片）
            await this.drawPoster(ctx, canvas, canvasWidth, canvasHeight);

            // 导出图片
            wx.canvasToTempFilePath({
              canvas,
              success: (res) => {
                resolve(res.tempFilePath);
              },
              fail: (err) => {
                reject(err);
              }
            });
          } catch (error) {
            reject(error);
          }
        });
    });
  },

  /**
   * 加载海报字体
   */
  async loadPosterFonts() {
    if (this._posterFontsLoaded) {
      return;
    }

    const loadFont = (family, path) => new Promise((resolve) => {
      wx.loadFontFace({
        family,
        source: `url("${path}")`,
        success: resolve,
        fail: resolve
      });
    });

    await Promise.all([
      loadFont('Noto Serif SC', '/ziti/NotoSerifSC[wght].ttf'),
      loadFont('Ma Shan Zheng', '/ziti/MaShanZheng-Regular.ttf')
    ]);

    this._posterFontsLoaded = true;
  },

  /**
   * 绘制海报内容
   */
  async drawPoster(ctx, canvas, width, height) {
    const data = this.data.calendarData;

    // 定义尺寸
    const upperHeight = 1440;  // 上半区高度（3:4）
    const lowerHeight = height - upperHeight;        // 下半区高度
    const borderMargin = 20;
    const padding = 60;

    // 白色背景
    ctx.fillStyle = '#F9F9F7';
    ctx.fillRect(0, 0, width, height);

    // 外边框（圆角）
    this.drawRoundRectStroke(
      ctx,
      borderMargin,
      borderMargin,
      width - borderMargin * 2,
      height - borderMargin * 2,
      20,
      '#E0E0E0',
      2
    );

    // === 上半区 ===
    let y = padding;

    // 3.1 顶部日期行
    y = await this.drawDateHeader(ctx, data, width, y, padding);

    y += 40;

    // 3.2 宜忌（左右两列卡片）
    y = await this.drawYiJi(ctx, data, width, y, padding);

    y += 10;

    // 3.3 财神方位
    y = await this.drawCaiShen(ctx, data, width, y, padding);

    y += 105;

    // 3.4 吉时/凶时
    y = await this.drawJiXiongShi(ctx, data, width, y, padding);

    y += 20;

    // 3.5 流日
    y = await this.drawLiuRi(ctx, data, width, y, padding);

    y += 20;

    // 3.6 五行能量
    y = await this.drawWuXingEnergy(ctx, data, width, y, padding);

    y += 20;

    // 3.7 底部摘要
    y = await this.drawSummary(ctx, data, width, y, padding);
    y += 140;

    // 分割线
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(borderMargin, upperHeight);
    ctx.lineTo(width - borderMargin, upperHeight);
    ctx.stroke();

    // === 下半区 ===
    await this.drawBottomSection(ctx, canvas, width, height, upperHeight, padding);
  },

  /**
   * 绘制顶部日期行
   */
  async drawDateHeader(ctx, data, width, y, padding) {
    const solar = data.solar;
    const lunar = data.lunar;

    // 大号公历日期（左上角）
    ctx.font = '900 200px "Noto Serif SC"';
    ctx.fillStyle = '#C62828';
    ctx.textAlign = 'left';
    ctx.fillText(`${solar.month}月${solar.day}日`, padding, y + 150);

    // 农历日期（右上角）
    ctx.font = '48px "Noto Serif SC"';
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'right';
    ctx.fillText(lunar.monthDay, width - padding, y + 60);

    return y + 200;
  },

  /**
   * 绘制宜忌（左右两列）
   */
  async drawYiJi(ctx, data, width, y, padding) {
    const yiJi = data.yiJi;
    const gap = 40;
    const cardWidth = (width - padding * 2 - gap) / 2;
    const cardHeight = 400;
    const cardRadius = 32;
    const innerPadding = 40;

    // 左列卡片 - 宜（绿色边框，圆角）
    this.drawRoundRectStroke(ctx, padding, y, cardWidth, cardHeight, cardRadius, '#9CCC65', 4);

    // 宜标题
    ctx.font = '900 120px "Ma Shan Zheng"';
    ctx.textAlign = 'left';
    this.drawBoldText(ctx, '宜', padding + innerPadding, y + 120, '#6B8E23');

    // 宜事项
    ctx.font = '42px "Noto Serif SC"';
    ctx.fillStyle = '#333333';
    const yiText = yiJi.yi.length > 0 ? yiJi.yi.join(' ') : '—';
    const yiLines = this.wrapTextByWord(ctx, yiText, cardWidth - innerPadding * 2);
    const yiDisplay = yiLines.slice(0, 2);
    if (yiLines.length > 2) {
      yiDisplay[1] = this.truncateText(ctx, yiDisplay[1], cardWidth - innerPadding * 2 - 30);
      yiDisplay[1] = yiDisplay[1].replace(/\.{3}$/, '') + '...';
    }
    yiDisplay.forEach((line, index) => {
      ctx.fillText(line, padding + innerPadding, y + 240 + index * 80);
    });

    // 右列卡片 - 忌（红色边框，圆角）
    this.drawRoundRectStroke(ctx, padding + cardWidth + gap, y, cardWidth, cardHeight, cardRadius, '#A52A2A', 4);

    // 忌标题
    ctx.font = '900 120px "Ma Shan Zheng"';
    ctx.textAlign = 'left';
    this.drawBoldText(ctx, '忌', padding + cardWidth + gap + innerPadding, y + 120, '#A52A2A');

    // 忌事项
    ctx.font = '42px "Noto Serif SC"';
    ctx.fillStyle = '#333333';
    const jiText = yiJi.ji.length > 0 ? yiJi.ji.join(' ') : '—';
    const jiLines = this.wrapTextByWord(ctx, jiText, cardWidth - innerPadding * 2);
    const jiDisplay = jiLines.slice(0, 2);
    if (jiLines.length > 2) {
      jiDisplay[1] = this.truncateText(ctx, jiDisplay[1], cardWidth - innerPadding * 2 - 30);
      jiDisplay[1] = jiDisplay[1].replace(/\.{3}$/, '') + '...';
    }
    jiDisplay.forEach((line, index) => {
      ctx.fillText(line, padding + cardWidth + gap + innerPadding, y + 240 + index * 80);
    });

    return y + cardHeight;
  },

  /**
   * 绘制财神方位
   */
  async drawCaiShen(ctx, data, width, y, padding) {
    // 标题加粗
    ctx.font = 'bold 40px "Noto Serif SC"';
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'left';
    ctx.fillText('财神方位：', padding + 10, y + 95);

    // 内容不加粗
    ctx.font = '40px "Noto Serif SC"';
    const labelWidth = ctx.measureText('财神方位：').width;
    ctx.fillText(data.jiShenFangWei.caiShen, padding + 10 + labelWidth + 10, y + 95);

    return y + 70;
  },

  /**
   * 绘制吉时/凶时
   */
  async drawJiXiongShi(ctx, data, width, y, padding) {
    const shiChen = data.shiChen || [];
    const jiShi = shiChen.filter(s => s.jiXiong === '吉');
    const xiongShi = shiChen.filter(s => s.jiXiong === '凶');

    // 吉时标题加粗
    ctx.font = 'bold 40px "Noto Serif SC"';
    ctx.fillStyle = '#333333';
    const labelRight = padding + 10 + ctx.measureText('吉时：').width;
    ctx.textAlign = 'right';
    ctx.fillText('吉时：', labelRight, y + 28);

    ctx.textAlign = 'left';
    let x = labelRight + 20;
    const jiColor = '#EEF5E8';

    if (jiShi.length > 0) {
      for (const shi of jiShi) {
        const chipWidth = this.drawChip(ctx, shi.name, x, y - 5, jiColor, '#000000');
        x += chipWidth + 20;
        if (x > width - padding - 80) {
          break;
        }
      }
    } else {
      ctx.fillText('—', x, y + 28);
    }

    y += 95;

    // 凶时标题加粗
    ctx.font = 'bold 40px "Noto Serif SC"';
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'right';
    ctx.fillText('凶时：', labelRight, y + 28);

    ctx.textAlign = 'left';
    x = labelRight + 20;
    const xiongColor = '#F5E8E8';

    if (xiongShi.length > 0) {
      for (const shi of xiongShi) {
        const chipWidth = this.drawChip(ctx, shi.name, x, y - 5, xiongColor, '#000000');
        x += chipWidth + 20;
        if (x > width - padding - 80) {
          break;
        }
      }
    } else {
      ctx.fillText('—', x, y + 28);
    }

    return y + 95;
  },

  /**
   * 绘制时辰标签
   */
  drawChip(ctx, text, x, y, bgColor, textColor = '#000000') {
    ctx.font = '36px "Noto Serif SC"';
    const textWidth = ctx.measureText(text).width;
    const chipWidth = textWidth + 40;
    const chipHeight = 48;

    // 绘制圆角矩形背景
    this.drawRoundRect(ctx, x, y, chipWidth, chipHeight, 16, bgColor);
    ctx.strokeStyle = bgColor === '#EEF5E8' ? '#9CCC65' : '#E5A5A5';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 文字
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + chipWidth / 2, y + chipHeight / 2);

    return chipWidth;
  },

  drawBoldText(ctx, text, x, y, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  },

  /**
   * 绘制圆角矩形（填充）
   */
  drawRoundRect(ctx, x, y, width, height, radius, fillColor) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
  },

  /**
   * 绘制圆角矩形（描边）
   */
  drawRoundRectStroke(ctx, x, y, width, height, radius, strokeColor, lineWidth = 2) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  },

  /**
   * 绘制流日
   */
  async drawLiuRi(ctx, data, width, y, padding) {
    const ganZhi = data.ganZhi;

    // 标题加粗
    ctx.font = 'bold 40px "Noto Serif SC"';
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'left';
    ctx.fillText('流日：', padding + 10, y + 30);

    // 内容不加粗
    ctx.font = '40px "Noto Serif SC"';
    const labelWidth = ctx.measureText('流日：').width;
    ctx.fillText(ganZhi.day, padding + 10 + labelWidth + 10, y + 30);

    return y + 95;
  },

  /**
   * 绘制五行能量
   */
  async drawWuXingEnergy(ctx, data, width, y, padding) {
    const wuxing = data.wuxingEnergy;
    if (!wuxing || !wuxing.liuri) {
      return y;
    }

    // 标题加粗
    ctx.font = 'bold 40px "Noto Serif SC"';
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'left';
    ctx.fillText('五行能量：', padding + 10, y + 30);

    let x = padding + ctx.measureText('五行能量：').width + 25;

    // 第1块：天干
    const tiangan = wuxing.liuri.dayGan;
    const tianganWuxing = wuxing.liuri.dayGanWuxingPinyin;
    x += this.drawWuxingBlock(ctx, tiangan, '', tianganWuxing, x, y - 5) + 12;

    // 后续块：藏干
    const cangGan = wuxing.liuri.cangGan || [];
    const percentages = this.getCangGanPercentages(cangGan.length);

    cangGan.forEach((cg, index) => {
      if (x + 90 < width - padding) {
        x += this.drawWuxingBlock(ctx, cg.gan, `${percentages[index]}%`, cg.wuxingPinyin, x, y - 5) + 12;
      }
    });

    return y + 95;
  },

  /**
   * 获取藏干百分比
   */
  getCangGanPercentages(count) {
    if (count === 1) return [100];
    if (count === 2) return [70, 30];
    if (count === 3) return [60, 30, 10];
    return [];
  },

  /**
   * 绘制五行能量块
   */
  drawWuxingBlock(ctx, text, percent, wuxing, x, y) {
    const blockWidth = 100;
    const blockHeight = 60;

    // 绘制圆角矩形背景
    this.drawRoundRect(ctx, x, y, blockWidth, blockHeight, 16, getWuxingColor(wuxing, 'primary'));

    // 文字
    const textColor = wuxing === 'jin' ? '#333333' : '#FFFFFF';
    ctx.fillStyle = textColor;
    ctx.font = '24px "Noto Serif SC"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (percent) {
      ctx.fillText(text, x + blockWidth / 2, y + blockHeight / 2 - 8);
      ctx.font = '22px "Noto Serif SC"';
      ctx.fillText(percent, x + blockWidth / 2, y + blockHeight / 2 + 14);
    } else {
      ctx.fillText(text, x + blockWidth / 2, y + blockHeight / 2);
    }

    return blockWidth;
  },

  /**
   * 绘制底部摘要
   */
  async drawSummary(ctx, data, width, y, padding) {
    const zhiRi = data.zhiRiXingShen;
    const summaryText = `${zhiRi.zhiRi}  ${zhiRi.shiErJianChu}  ${zhiRi.shenSha}`;

    ctx.font = '44px "Noto Serif SC"';
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'left';
    const truncated = this.truncateText(ctx, summaryText, width - padding * 2);
    ctx.fillText(truncated, padding + 10, y + 30);

    return y + 60;
  },

  /**
   * 绘制下半区（二维码）
   */
  async drawBottomSection(ctx, canvas, width, height, upperHeight, padding) {
    const y = upperHeight + 40;

    // 左侧文案
    ctx.font = '48px "Noto Serif SC"';
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'left';
    ctx.fillText('今日详细解析查', padding, y + 80);
    ctx.fillText('看二维码', padding, y + 150);

    // 右侧文案和二维码区域
    const qrSize = 140;
    const qrX = width - padding - qrSize;
    const qrY = y + 70;

    // 二维码上方文字
    ctx.font = '38px "Noto Serif SC"';
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'center';
    ctx.fillText('小程序', qrX - 60, y + 80);

    // 绘制二维码
    await this.drawQRCode(ctx, canvas, qrX, qrY, qrSize);

    // 二维码下方文字
    ctx.font = '38px "Noto Serif SC"';
    ctx.fillStyle = '#333333';
    ctx.fillText('二维码', qrX - 60, y + 130);
  },

  /**
   * 绘制二维码
   */
  async drawQRCode(ctx, canvas, x, y, size = 140) {
    return new Promise((resolve, reject) => {
      const img = canvas.createImage();
      img.onload = () => {
        // 绘制二维码
        ctx.drawImage(img, x, y, size, size);

        // 绘制边框
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        this.drawRoundRectStroke(ctx, x, y, size, size, 20, '#333333', 2);

        resolve();
      };
      img.onerror = reject;
      img.src = '/images/xiaochengxuerweima.jpg';
    });
  },

  /**
   * 文本截断（超长显示...）
   */
  truncateText(ctx, text, maxWidth) {
    const width = ctx.measureText(text).width;
    if (width <= maxWidth) {
      return text;
    }

    let truncated = text;
    while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + '...';
  },

  /**
   * 文本换行
   */
  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const width = ctx.measureText(testLine).width;

      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  },

  /**
   * 多行文本换行（按字符）
   */
  wrapTextMultiLine(ctx, text, maxWidth) {
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < text.length; i++) {
      const testLine = currentLine + text[i];
      const width = ctx.measureText(testLine).width;

      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = text[i];
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  },

  /**
   * 按词换行（空格分隔的词组）
   */
  wrapTextByWord(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const width = ctx.measureText(testLine).width;

      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
});
