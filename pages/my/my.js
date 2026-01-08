// pages/my/my.js
Page({
  data: {
    userInfo: null
  },

  async onLoad() {
    const app = getApp();

    // 等待配置加载完成（最多等待3秒）
    let retryCount = 0;
    while (!app.globalData.configLoaded && retryCount < 30) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retryCount++;
    }

    // 检查是否应该拦截该页面
    console.log('[我的页] 检查拦截, configLoaded:', app.globalData.configLoaded, 'showTabBar:', app.globalData.showTabBar);
    if (!app.globalData.showTabBar) {
      // TabBar 隐藏时，拦截"我的"页面访问
      wx.showToast({
        title: '该功能暂未开发',
        icon: 'none',
        duration: 2000
      });
      // 延迟返回黄历页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/calendar/calendar'
        });
      }, 2000);
      return;
    }

    // 获取全局用户信息
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      });
    }
  },

  onShow() {
    const app = getApp();
    if (typeof app.applyTabBarVisibility === 'function') {
      app.applyTabBarVisibility();
    }
  },

  /**
   * 页面分享配置
   */
  onShareAppMessage() {
    return {
      title: '九思知白堂｜我的',
      path: '/pages/my/my'
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
  }
});
