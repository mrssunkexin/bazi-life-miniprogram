// 小程序配置文件

module.exports = {
  // 开发环境
  development: {
    apiBase: 'http://192.168.31.75:3000',  // 真机调试：使用电脑局域网IP
    qrcodeUrl: '/images/qrcode.jpg'  // 本地图片
    //useCloudContainer: true,
    //cloudEnvId: 'zhibaitang-3g85tzfpc7281bc7', // 你的云托管环境ID
    //serviceName: 'test-bazi',       // 你的云托管服务名称
    //qrcodeUrl: '/images/qrcode.jpg'  // 默认使用本地图片，后台配置后会覆盖
  },
  
  // 生产环境
  production: {
    // 生产环境使用云托管内网调用，无需 apiBase
    useCloudContainer: true,
    cloudEnvId: 'zhibaitang-3g85tzfpc7281bc7', // 你的云托管环境ID
    serviceName: 'zhibaitang-bazisever',       // 你的云托管服务名称
    qrcodeUrl: '/images/qrcode.jpg'  // 默认使用本地图片，后台配置后会覆盖
  }
};

// 当前环境（开发时改为 'development'，上线时改为 'production'）
// 注意：体验版和正式版都应该使用 'production' 配置
const ENV = 'development';

// 导出当前环境配置
module.exports.current = module.exports[ENV];
