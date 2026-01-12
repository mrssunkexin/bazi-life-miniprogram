// pages/zeji-result/zeji-result.js
const config = require('../../config.js');

Page({
  data: {
    selectedItem: '', // 选择的事项
    startDate: '', // 起始日期
    endDate: '', // 结束日期
    dateRangeText: '', // 日期范围文本
    todayDate: '', // 今天日期
    maxEndDate: '', // 最大结束日期（起始日期+1年）

    results: [], // 搜索结果
    hasMore: false, // 是否有更多数据
    loading: false, // 加载状态
    searched: false, // 是否已经搜索过
    offset: 0, // 当前偏移量

    showDatePicker: false, // 是否显示日期选择器
    tempStartDate: '', // 临时起始日期
    tempEndDate: '', // 临时结束日期
  },

  onLoad(options) {
    const item = decodeURIComponent(options.item || '');
    console.log('[择吉结果页面] onLoad, item:', item);

    if (!item) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    // 初始化日期范围（默认未来1个月）
    const today = new Date();
    const startDate = this.formatDate(today);
    const endDate = this.formatDate(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000));
    const maxEndDate = this.formatDate(new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000));

    this.setData({
      selectedItem: item,
      startDate,
      endDate,
      todayDate: startDate,
      maxEndDate,
      tempStartDate: startDate,
      tempEndDate: endDate,
      dateRangeText: `${startDate} 至 ${endDate}`
    });

    // 开始搜索
    this.searchZeji();
  },

  // 格式化日期为 YYYY-MM-DD
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 搜索择吉日期
  searchZeji(loadMore = false) {
    if (this.data.loading) return;

    this.setData({ loading: true });

    const { selectedItem, startDate, endDate, offset } = this.data;
    const currentOffset = loadMore ? offset : 0;

    const requestUrl = `${config.current.apiBase}/api/zeji`;
    const requestData = {
      item: selectedItem,
      startDate,
      endDate,
      offset: currentOffset,
      limit: 30
    };

    console.log('[择吉结果] 开始搜索');
    console.log('[择吉结果] 请求URL:', requestUrl);
    console.log('[择吉结果] 请求参数:', requestData);
    console.log('[择吉结果] config.current:', config.current);

    wx.request({
      url: requestUrl,
      method: 'GET',
      data: requestData,
      success: (res) => {
        console.log('[择吉结果] HTTP状态码:', res.statusCode);
        console.log('[择吉结果] 响应头:', res.header);
        console.log('[择吉结果] 响应数据:', JSON.stringify(res.data));

        if (res.statusCode !== 200) {
          wx.showToast({
            title: `服务器错误: ${res.statusCode}`,
            icon: 'none'
          });
          this.setData({ loading: false, searched: true });
          return;
        }

        if (res.data.success) {
          const newResults = res.data.data.results || [];
          const hasMore = res.data.data.hasMore || false;
          const nextOffset = res.data.data.nextOffset || 0;

          console.log('[择吉结果] 解析成功，结果数量:', newResults.length);

          this.setData({
            results: loadMore ? [...this.data.results, ...newResults] : newResults,
            hasMore,
            offset: nextOffset,
            searched: true,
            loading: false
          });
        } else {
          console.error('[择吉结果] API返回失败:', res.data.error);
          wx.showToast({
            title: res.data.error || '搜索失败',
            icon: 'none',
            duration: 3000
          });
          this.setData({ loading: false, searched: true });
        }
      },
      fail: (err) => {
        console.error('[择吉结果] 请求失败:', err);
        console.error('[择吉结果] 错误详情:', JSON.stringify(err));
        wx.showToast({
          title: `网络错误: ${err.errMsg || '未知错误'}`,
          icon: 'none',
          duration: 3000
        });
        this.setData({ loading: false, searched: true });
      }
    });
  },

  // 加载更多
  onLoadMore() {
    if (this.data.loading || !this.data.hasMore) return;
    this.searchZeji(true);
  },

  // 打开日期选择器
  onChangeDateRange() {
    this.setData({
      showDatePicker: true,
      tempStartDate: this.data.startDate,
      tempEndDate: this.data.endDate
    });
  },

  // 关闭日期选择器
  onCloseDatePicker() {
    this.setData({ showDatePicker: false });
  },

  // 阻止事件冒泡
  onStopPropagation() {},

  // 起始日期变化
  onStartDateChange(e) {
    const startDate = e.detail.value;
    const startTime = new Date(startDate).getTime();
    const maxEndTime = startTime + 365 * 24 * 60 * 60 * 1000;
    const maxEndDate = this.formatDate(new Date(maxEndTime));

    // 如果当前结束日期超过了最大范围，自动调整
    let endDate = this.data.tempEndDate;
    if (new Date(endDate) > new Date(maxEndDate)) {
      endDate = maxEndDate;
    }

    this.setData({
      tempStartDate: startDate,
      tempEndDate: endDate,
      maxEndDate
    });
  },

  // 结束日期变化
  onEndDateChange(e) {
    this.setData({
      tempEndDate: e.detail.value
    });
  },

  // 确认日期选择
  onConfirmDatePicker() {
    const { tempStartDate, tempEndDate } = this.data;

    // 验证日期范围
    const start = new Date(tempStartDate);
    const end = new Date(tempEndDate);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
      wx.showToast({
        title: '结束日期不能早于开始日期',
        icon: 'none'
      });
      return;
    }

    if (daysDiff > 365) {
      wx.showToast({
        title: '日期范围不能超过1年',
        icon: 'none'
      });
      return;
    }

    // 更新日期并重新搜索
    this.setData({
      startDate: tempStartDate,
      endDate: tempEndDate,
      dateRangeText: `${tempStartDate} 至 ${tempEndDate}`,
      showDatePicker: false,
      results: [],
      offset: 0,
      hasMore: false
    });

    this.searchZeji();
  }
});
