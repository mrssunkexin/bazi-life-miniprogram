// 测试云调用的脚本
// 在小程序开发者工具的控制台中运行

// 测试云调用配置
console.log('测试云调用配置...');

wx.cloud.callContainer({
  config: {
    env: 'zhibaitang-3g85tzfpc7281bc7'
  },
  path: '/api/config',
  header: {
    'X-WX-SERVICE': 'zhibaitang-bazisever',
    'Content-Type': 'application/json'
  },
  method: 'GET',
  success(res) {
    console.log('✅ 云调用成功:', res);
  },
  fail(err) {
    console.error('❌ 云调用失败:', err);
  }
});
