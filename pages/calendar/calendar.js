// pages/calendar/calendar.js
const api = require('../../utils/api');

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
    // 每次显示页面时更新当前时辰
    this.updateCurrentShiChen();

    // 控制 TabBar 显示/隐藏（延迟执行确保配置已加载）
    setTimeout(() => {
      const app = getApp();
      console.log('[黄历页] TabBar配置:', app.globalData.showTabBar);
      if (app.globalData.showTabBar) {
        wx.showTabBar({ animation: false });
      } else {
        wx.hideTabBar({ animation: false });
      }
    }, 100);
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

        this.setData({
          calendarData: calendarData,
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
   * 日历图标点击
   */
  onCalendarIconClick() {
    wx.showToast({
      title: '功能暂未开放',
      icon: 'none',
      duration: 2000
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
  }
});
