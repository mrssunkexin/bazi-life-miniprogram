// pages/history/history.js
const api = require('../../utils/api.js');

Page({
  data: {
    reports: [],
    loading: true
  },

  /**
   * 页面加载
   */
  onLoad(options) {
    this.loadReports();
  },

  /**
   * 加载报告列表
   */
  async loadReports() {
    this.setData({ loading: true });

    try {
      // 先检查是否有缓存数据(5分钟内有效)
      const app = getApp();
      const cached = app.globalData.cachedReports;
      const cacheTime = app.globalData.reportsCacheTime || 0;
      const cacheAge = Date.now() - cacheTime;
      const cacheValid = cacheAge < 5 * 60 * 1000; // 5分钟

      if (cached && cacheValid) {
        // 使用缓存数据,立即显示（缓存里已包含格式化字段）
        console.log(`[历史页] 使用缓存数据 (缓存${Math.round(cacheAge / 1000)}秒前)`);
        this.setData({
          reports: cached,
          loading: false
        });
        // 关闭首页的loading提示
        wx.hideLoading();
        return;
      }

      // 没有缓存或缓存过期,重新请求
      console.log('[历史页] 缓存无效,重新请求混合API');
      const result = await api.getMixedReportList();
      const reports = (result.data && result.data.reports) ? result.data.reports : [];
      // 在JS中预格式化创建时间，模板直接渲染字段
      const formatted = reports.map(item => {
        const ts = item.createdAt || item.publishAt || item.generatedAt || item.updatedAt || '';
        return {
          ...item,
          createdAtText: this.formatTime(ts)
        };
      });
      console.log(`[报告数量] ${formatted.length} 条`);

      // 更新缓存（存入已格式化的数据，避免下次显示缺字段）
      app.globalData.cachedReports = formatted;
      app.globalData.reportsCacheTime = Date.now();

      // 后端已排序,无需前端再排序
      // reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      this.setData({
        reports: formatted,
        loading: false
      });

      // 关闭首页的loading提示
      wx.hideLoading();
    } catch (error) {
      console.error('[加载报告列表失败]', error);
      // 关闭loading
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  /**
   * 卡片点击事件
   */
  onCardTap(e) {
    const report = e.currentTarget.dataset.report;
    console.log('[点击报告卡片]', report);

    const reportType = report.reportType || 'basic';
    const typeParam = reportType === 'fortune2026' ? '&type=fortune2026' : '';

    // 根据状态判断跳转行为
    if (report.status === 'published') {
      // 已发布:跳转到报告详情页
      wx.navigateTo({
        url: `/pages/result/result?reportId=${report.id}${typeParam}`
      });
    } else if (report.status === 'draft') {
      // 草稿状态:跳转到等待页面(复用result页面)
      wx.navigateTo({
        url: `/pages/result/result?reportId=${report.id}${typeParam}`
      });
    }
  },

  /**
   * 返回首页
   */
  onGoHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  /**
   * 格式化时间
   */
  formatTime(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  /**
   * 获取状态文本
   */
  getStatusText(report) {
    if (report.status === 'published') {
      return '已发布';
    } else if (report.status === 'draft') {
      // 判断是生成中还是草稿
      if (report.fullContent === '报告生成中...') {
        return '生成中';
      }
      return '草稿';
    }
    return '未知';
  },

  /**
   * 下拉刷新
   */
  async onPullDownRefresh() {
    // 清除缓存,强制重新加载
    const app = getApp();
    app.globalData.cachedReports = null;
    app.globalData.reportsCacheTime = 0;

    console.log('[下拉刷新] 清除缓存,重新加载');
    await this.loadReports();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面分享配置
   */
  onShareAppMessage() {
    return {
      title: '我的历史报告｜九思知白堂',
      path: '/pages/history/history'
    };
  }
});
