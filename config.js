// 小程序配置文件

module.exports = {
  // 开发环境
  development: {
    apiBase: 'http://192.168.31.75:3000',  // 小程序无法访问localhost,使用本机IP
    qrcodeUrl: '/images/qrcode.jpg'  // 本地图片
  },
  
  // 生产环境
  production: {
    apiBase: 'https://bazi-life-api.zeabur.app',
    qrcodeUrl: 'https://your-cdn.com/qrcode.jpg'  // 线上图片URL（替换为实际地址）
  }
};

// 当前环境（开发时改为 'development'，上线时改为 'production'）
const ENV = 'development';

// 导出当前环境配置
module.exports.current = module.exports[ENV];
