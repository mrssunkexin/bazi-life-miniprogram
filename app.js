// app.js
App({
  onLaunch() {
    console.log('八字命理分析小程序启动');
  },

  globalData: {
    apiBase: 'http://localhost:3000',
    cachedReports: null,        // 缓存的报告列表
    reportsCacheTime: 0         // 缓存时间戳
  }
});
