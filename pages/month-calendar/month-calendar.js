// pages/month-calendar/month-calendar.js
const { getTianganWuxingPinyin, getWuxingColor, getWuxingRgba } = require('../../utils/wuxing-colors.js');
const config = require('../../config.js');

Page({
  data: {
    loading: true,
    year: 2026,
    month: 1,
    days: [], // 月份日期数据
    liuyueTiangan: '', // 流月天干，用于计算背景色
    monthBgColor: '#FFFFFF', // 月历背景色（动态设置）
    emptyDaysBefore: 0, // 月初前的空白格数
    emptyDaysAfter: 0, // 月末后的空白格数
    selectedDate: null, // 当前选中的日期
    touchStartX: 0,
    touchStartY: 0,
  },

  onLoad(options) {
    // 从参数获取年月，或使用当前日期
    const now = new Date();
    const year = options.year ? parseInt(options.year) : now.getFullYear();
    const month = options.month ? parseInt(options.month) : now.getMonth() + 1;

    // 判断是否是当前月
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

    // 获取月份标签（一月、二月等）
    const monthLabels = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const monthLabel = monthLabels[month - 1];

    this.setData({
      year,
      month,
      monthLabel,
      isCurrentMonth,
    });

    this.loadMonthData();
  },

  /**
   * 加载月份数据
   */
  loadMonthData() {
    const { year, month } = this.data;
    const that = this;

    this.setData({ loading: true });

    // 获取 API 地址
    const apiBase = config.current.apiBase || '';
    const url = `${apiBase}/api/calendar/month?year=${year}&month=${month}`;

    wx.request({
      url,
      method: 'GET',
      success(res) {
        if (!res.data || !res.data.success) {
          throw new Error(res.data?.error?.message || '加载失败');
        }

        const { liuyueTiangan, days } = res.data.data;

        // 计算月初是星期几（需要补几个空格）
        const firstDay = new Date(year, month - 1, 1);
        const emptyDaysBefore = firstDay.getDay(); // 0=周日, 1=周一, ...

        // 计算月末后需要补几个空格（凑满整周）
        const totalCells = emptyDaysBefore + days.length;
        const emptyDaysAfter = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

        // 处理每一天的数据
        const now = new Date();
        const todayString = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

        const processedDays = days.map((day) => {
          // 提取干支的天干和地支
          const ganZhiDay = day.ganZhi.day || '';
          const dayGan = ganZhiDay[0] || '';
          const dayZhi = ganZhiDay[1] || '';
          const jieQiName = day.jieQiTag?.name || '';
          const isShuJiu = /^[一二三四五六七八九]九$/.test(jieQiName);
          const liuriWuxing = getTianganWuxingPinyin(dayGan);

          return {
            ...day,
            ganZhi: {
              ...day.ganZhi,
              dayGan,
              dayZhi,
            },
            jieQiLabel: isShuJiu ? '' : jieQiName,
            liuriColor: getWuxingColor(liuriWuxing, 'primary'),
            isToday: day.date === todayString,
          };
        });

        // 设置背景色（基于流月天干的五行）
        let monthBgColor = '#FFFFFF';
        if (liuyueTiangan && liuyueTiangan.length >= 1) {
          const tiangan = liuyueTiangan[0];
          const wuxingPinyin = getTianganWuxingPinyin(tiangan);
          monthBgColor = getWuxingRgba(wuxingPinyin, 0.06, 'primary');
        }

        that.setData({
          days: processedDays,
          liuyueTiangan,
          monthBgColor,
          emptyDaysBefore,
          emptyDaysAfter,
          loading: false,
        });
      },
      fail(error) {
        console.error('加载月份数据失败:', error);
        wx.showToast({
          title: '加载失败',
          icon: 'none',
        });
        that.setData({ loading: false });
      },
    });
  },

  /**
   * 上一月
   */
  onPrevMonth() {
    let { year, month } = this.data;
    month -= 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }

    // 更新月份标签和是否当前月
    const now = new Date();
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
    const monthLabels = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const monthLabel = monthLabels[month - 1];

    this.setData({ year, month, monthLabel, isCurrentMonth });
    this.loadMonthData();
  },

  /**
   * 下一月
   */
  onNextMonth() {
    let { year, month } = this.data;
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }

    // 更新月份标签和是否当前月
    const now = new Date();
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
    const monthLabels = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const monthLabel = monthLabels[month - 1];

    this.setData({ year, month, monthLabel, isCurrentMonth });
    this.loadMonthData();
  },

  /**
   * 回到今天
   */
  goToToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthLabels = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const monthLabel = monthLabels[month - 1];

    this.setData({
      year,
      month,
      monthLabel,
      isCurrentMonth: true,
    });
    this.loadMonthData();
  },

  /**
   * 点击某一天
   */
  onDayClick(e) {
    const { date, day, index } = e.currentTarget.dataset;
    let targetDate = date;

    if (!targetDate && typeof index !== 'undefined') {
      const dayInfo = this.data.days[index];
      if (dayInfo && dayInfo.date) {
        targetDate = dayInfo.date;
      } else if (dayInfo && dayInfo.solar && dayInfo.solar.day) {
        const { year, month } = this.data;
        const mm = String(month).padStart(2, '0');
        const dd = String(dayInfo.solar.day).padStart(2, '0');
        targetDate = `${year}-${mm}-${dd}`;
      }
    }

    if (!targetDate && day) {
      const { year, month } = this.data;
      const mm = String(month).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      targetDate = `${year}-${mm}-${dd}`;
    }

    // TabBar 页面不能 navigateTo，使用 switchTab 并传递日期
    if (targetDate) {
      wx.setStorageSync('calendar_target_date', targetDate);
    }
    wx.switchTab({
      url: '/pages/calendar/calendar',
    });
  },

  /**
   * 择吉日按钮
   */
  onChooseAuspicious() {
    wx.showToast({
      title: '功能尚未完成',
      icon: 'none',
    });
  },

  /**
   * 滑动切换月份
   */
  onTouchStart(e) {
    this.setData({
      touchStartX: e.touches[0].pageX,
      touchStartY: e.touches[0].pageY,
    });
  },

  onTouchEnd(e) {
    const touchEndX = e.changedTouches[0].pageX;
    const touchEndY = e.changedTouches[0].pageY;
    const { touchStartX, touchStartY } = this.data;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // 判断是否为垂直滑动（纵向距离大于横向距离，且纵向距离大于 50）
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
      if (deltaY > 0) {
        // 向下滑动 - 下一月
        this.onNextMonth();
      } else {
        // 向上滑动 - 上一月
        this.onPrevMonth();
      }
    }
  },
});
