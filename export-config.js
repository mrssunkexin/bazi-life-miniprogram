/**
 * 导出云数据库配置数据的脚本
 * 在微信开发者工具的控制台中运行此脚本
 */

console.log('=== 开始导出配置数据 ===');

const config = require('./config.js');

// 调用云托管获取配置
function exportConfig() {
  // 如果是生产环境，使用云托管调用
  if (config.current.useCloudContainer) {
    wx.cloud.callContainer({
      config: {
        env: config.current.cloudEnvId
      },
      path: '/api/config',
      header: {
        'X-WX-SERVICE': config.current.serviceName,
        'Content-Type': 'application/json'
      },
      method: 'GET',
      success(res) {
        console.log('✅ 获取配置成功:');
        console.log('==================== 配置数据开始 ====================');
        console.log(JSON.stringify(res.data, null, 2));
        console.log('==================== 配置数据结束 ====================');

        // 格式化输出配置项
        if (res.data && res.data.data) {
          console.log('\n📋 配置项详情:');
          const configData = res.data.data;
          Object.keys(configData).forEach(key => {
            console.log(`\n[${key}]`);
            console.log(`  值: ${JSON.stringify(configData[key], null, 2)}`);
          });
        }

        console.log('\n💡 提示: 可以复制上面的 JSON 数据保存为文件');
      },
      fail(err) {
        console.error('❌ 获取配置失败:', err);
      }
    });
  } else {
    // 开发环境使用 HTTP 请求
    wx.request({
      url: `${config.current.apiBase}/api/config`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json'
      },
      success(res) {
        console.log('✅ 获取配置成功:');
        console.log('==================== 配置数据开始 ====================');
        console.log(JSON.stringify(res.data, null, 2));
        console.log('==================== 配置数据结束 ====================');

        // 格式化输出配置项
        if (res.data && res.data.data) {
          console.log('\n📋 配置项详情:');
          const configData = res.data.data;
          Object.keys(configData).forEach(key => {
            console.log(`\n[${key}]`);
            console.log(`  值: ${JSON.stringify(configData[key], null, 2)}`);
          });
        }

        console.log('\n💡 提示: 可以复制上面的 JSON 数据保存为文件');
      },
      fail(err) {
        console.error('❌ 获取配置失败:', err);
      }
    });
  }
}

// 执行导出
exportConfig();
