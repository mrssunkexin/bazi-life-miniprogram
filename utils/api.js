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
    // 如果配置了使用云托管调用 (生产环境)
    if (config.current.useCloudContainer) {
      wx.cloud.callContainer({
        config: {
          env: config.current.cloudEnvId
        },
        path: url, // 路径，如 /api/reports
        header: {
          'X-WX-SERVICE': config.current.serviceName, // 指定服务名称
          'Content-Type': 'application/json',
          ...options.header
        },
        method: options.method || 'GET',
        data: options.data,
        success(res) {
          console.log(`[Cloud API] ${options.method || 'GET'} ${url}`, res);

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
          console.error(`[Cloud API] 请求失败 ${url}`, err);
          reject(new Error(err.errMsg || '网络请求失败'));
        }
      });
      return;
    }

    // 开发环境或普通 HTTP 请求
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
   * 微信登录
   * @param {string} code - wx.login返回的code
   * @param {string} [nickname] - 可选，用户昵称
   * @param {string} [avatarUrl] - 可选，用户头像
   */
  wechatLogin(code, nickname, avatarUrl) {
    const data = { code };
    if (nickname) data.nickname = nickname;
    if (avatarUrl) data.avatarUrl = avatarUrl;

    return request('/api/auth/wechat', {
      method: 'POST',
      data
    });
  },

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
    const app = getApp();
    return request('/api/reports', {
      method: 'POST',
      data: {
        ...data,
        userId: app.globalData.userId
      }
    });
  },

  /**
   * 获取报告详情
   * @param {string} id - 报告 ID
   */
  getReport(id) {
    const app = getApp();
    return request(`/api/reports/${id}?userId=${app.globalData.userId}`);
  },

  /**
   * 获取报告生成状态
   * @param {string} id - 报告 ID
   */
  getReportStatus(id) {
    const app = getApp();
    return request(`/api/reports/${id}/status?userId=${app.globalData.userId}`);
  },

  /**
   * 获取报告列表
   */
  getReportList() {
    const app = getApp();
    return request(`/api/reports?userId=${app.globalData.userId}`);
  },

  /**
   * 激活报告（核销兑换码）
   * @param {string} reportId - 报告 ID
   * @param {string} voucherCode - 兑换码
   */
  activateReport(reportId, voucherCode) {
    return request(`/api/reports/${reportId}/activate`, {
      method: 'POST',
      data: { voucherCode }
    });
  },

  /**
   * 获取小程序配置
   * @param {string} [keys] - 可选，逗号分隔的配置key列表
   */
  getConfig(keys) {
    const url = keys ? `/api/config?keys=${keys}` : '/api/config';
    return request(url);
  },

  /**
   * 升级算法版报告为AI版（使用兑换码）
   * @param {string} algorithmReportId - 算法版报告 ID
   * @param {string} voucherCode - 兑换码
   */
  upgradeReportToAI(algorithmReportId, voucherCode) {
    return request(`/api/reports/${algorithmReportId}/upgrade`, {
      method: 'POST',
      data: { voucherCode }
    });
  },

  /**
   * 创建2026运势报告
   * @param {Object} data - 用户输入数据(格式同createReport)
   */
  createFortune2026Report(data) {
    const app = getApp();
    return request('/api/fortune-2026', {
      method: 'POST',
      data: {
        ...data,
        userId: app.globalData.userId
      }
    });
  },

  /**
   * 获取2026运势报告详情
   * @param {string} id - 报告ID
   */
  getFortune2026Report(id) {
    const app = getApp();
    return request(`/api/fortune-2026/${id}?userId=${app.globalData.userId}`);
  },

  /**
   * 获取混合报告列表(基础+2026)
   */
  getMixedReportList() {
    const app = getApp();
    return request(`/api/reports/mixed?userId=${app.globalData.userId}`);
  }
};

module.exports = api;
