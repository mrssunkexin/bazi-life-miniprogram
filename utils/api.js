/**
 * API 封装模块
 * 统一管理所有后端 API 调用
 */

const config = require('../config.js');

// API 基础地址（从配置文件读取）
const API_BASE = config.current.apiBase;

/**
 * 通用请求封装
 */
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}${url}`,
      method: options.method || 'GET',
      data: options.data,
      timeout: 30000,  // 增加超时时间到30秒
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success(res) {
        console.log(`[API] ${options.method || 'GET'} ${url}`, res);

        // 检查 HTTP 状态码
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 检查业务逻辑成功标志
          if (res.data.success !== false) {
            resolve(res.data);
          } else {
            reject(new Error(res.data.error || '请求失败'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.data.error || '请求失败'}`));
        }
      },
      fail(err) {
        console.error(`[API] 请求失败 ${url}`, err);
        reject(new Error(err.errMsg || '网络请求失败'));
      }
    });
  });
}

/**
 * API 接口定义
 */
const api = {
  /**
   * 创建报告
   * @param {Object} data - 用户输入数据
   * @param {string} data.name - 姓名
   * @param {string} data.gender - 性别 (male/female)
   * @param {string} data.birthDate - 出生日期 (YYYY-MM-DD)
   * @param {string} data.birthTime - 出生时间 (HH:mm)
   * @param {string} data.city - 城市
   * @param {number} [data.longitude] - 经度（可选）
   * @param {number} [data.latitude] - 纬度（可选）
   */
  createReport(data) {
    return request('/api/reports', {
      method: 'POST',
      data
    });
  },

  /**
   * 获取报告详情
   * @param {string} id - 报告 ID
   */
  getReport(id) {
    return request(`/api/reports/${id}`);
  },

  /**
   * 获取报告生成状态
   * @param {string} id - 报告 ID
   */
  getReportStatus(id) {
    return request(`/api/reports/${id}/status`);
  },

  /**
   * 获取报告列表
   */
  getReportList() {
    return request('/api/reports');
  }
};

module.exports = api;
