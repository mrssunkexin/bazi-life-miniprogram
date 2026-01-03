/**
 * 导出云数据库配置数据到 JSON 文件
 * 在电脑终端运行: node export-config-to-json.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// 本地后端服务地址
const API_URL = 'http://localhost:3000/api/config';

console.log('=== 开始导出配置数据 ===');
console.log('API 地址:', API_URL);
console.log('正在连接本地测试数据库...\n');

// 发起 HTTP 请求
http.get(API_URL, (res) => {
  let data = '';

  // 接收数据
  res.on('data', (chunk) => {
    data += chunk;
  });

  // 数据接收完成
  res.on('end', () => {
    try {
      // 解析 JSON
      const jsonData = JSON.parse(data);

      // 生成文件名（带时间戳）
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `config-export-${timestamp}.json`;
      const filepath = path.join(__dirname, filename);

      // 格式化并保存 JSON
      const prettyJson = JSON.stringify(jsonData, null, 2);
      fs.writeFileSync(filepath, prettyJson, 'utf8');

      console.log('✅ 配置数据导出成功！');
      console.log('📁 保存位置:', filepath);
      console.log('\n📋 配置数据预览:');

      // 打印配置项概览
      if (jsonData.data) {
        Object.keys(jsonData.data).forEach(key => {
          console.log(`  - ${key}: ${typeof jsonData.data[key]}`);
        });
      }

      console.log('\n完整数据已保存到文件中');

    } catch (err) {
      console.error('❌ 解析 JSON 失败:', err.message);
      console.error('原始数据:', data);
    }
  });

}).on('error', (err) => {
  console.error('❌ 请求失败:', err.message);
  console.error('\n可能的原因:');
  console.error('1. 网络连接问题');
  console.error('2. API 地址不正确');
  console.error('3. 后端服务未启动');
  console.error('\n当前配置的 API 地址:', API_URL);
});
