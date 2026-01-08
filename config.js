// 小程序配置文件

module.exports = {
  // 开发环境
  development: {
    apiBase: 'http://localhost:3000',  // 本地后端服务
    qrcodeUrl: '/images/qrcode.jpg'  // 本地图片
  },
  
  // 生产环境
  production: {
    apiBase: 'https://www.dralexlp.com',
    qrcodeUrl: '/images/qrcode.jpg'
  }
};

// 当前环境（开发时改为 'development'，上线时改为 'production'）
// 注意：体验版和正式版都应该使用 'production' 配置
const ENV = 'production';

// 导出当前环境配置
module.exports.current = module.exports[ENV];
