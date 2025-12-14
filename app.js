// app.js
const api = require('./utils/api.js');

App({
  globalData: {
    userId: null,
    openid: null,
    hasAuthorized: false,
    userInfo: null,
    cloudEnvId: 'zhibaitang-3g85tzfpc7281bc7',
    cachedReports: null,        // 缓存的报告列表
    reportsCacheTime: 0,        // 缓存时间戳
    officialAccountQrcode: ''   // 公众号二维码地址（从后台配置获取）
  },

  onLaunch() {
    console.log('八字命理分析小程序启动');

    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: this.globalData.cloudEnvId,
        traceUser: true,
      });
    }

    // 自动登录
    this.wechatLogin();
  },

  /**
   * 微信静默登录（获取openid）
   */
  wechatLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            console.log('✅ wx.login成功，code:', res.code);

            // 调用后端接口换取openid
            api.wechatLogin(res.code)
              .then((response) => {
                console.log('✅ 微信登录成功:', response);
                const userData = response.data; // 解析 {success: true, data: {...}} 结构
                this.globalData.userId = userData.userId;
                this.globalData.openid = userData.openid;
                this.globalData.hasAuthorized = userData.hasAuthorized;

                console.log('✅ 已保存 userId:', this.globalData.userId);

                if (userData.nickname && userData.avatarUrl) {
                  this.globalData.userInfo = {
                    nickName: userData.nickname,
                    avatarUrl: userData.avatarUrl
                  };
                }

                // 触发登录成功事件（如果有监听）
                if (typeof this.onLoginSuccess === 'function') {
                  this.onLoginSuccess(userData);
                }

                resolve(userData);
              })
              .catch((err) => {
                console.error('❌ 微信登录失败:', err);
                wx.showToast({
                  title: '登录失败，请重试',
                  icon: 'none'
                });
                reject(err);
              });
          } else {
            console.error('❌ wx.login失败:', res.errMsg);
            reject(new Error(res.errMsg));
          }
        },
        fail: (err) => {
          console.error('❌ wx.login调用失败:', err);
          reject(err);
        }
      });
    });
  },

  /**
   * 检查并获取用户信息授权（可选）
   */
  checkAndGetAuth() {
    return new Promise((resolve, reject) => {
      // 如果已授权，直接返回
      if (this.globalData.hasAuthorized && this.globalData.userInfo) {
        resolve(this.globalData.userInfo);
        return;
      }

      // 弹出授权框
      wx.getUserProfile({
        desc: '用于完善个人信息',
        success: (res) => {
          console.log('✅ 用户授权成功:', res);
          const { nickName, avatarUrl } = res.userInfo;

          // 更新到后端
          wx.login({
            success: (loginRes) => {
              api.wechatLogin(loginRes.code, nickName, avatarUrl)
                .then((response) => {
                  const userData = response.data; // 解析响应结构
                  this.globalData.userId = userData.userId; // 更新 userId
                  this.globalData.hasAuthorized = true;
                  this.globalData.userInfo = { nickName, avatarUrl };
                  resolve(res.userInfo);
                })
                .catch(reject);
            },
            fail: reject
          });
        },
        fail: (err) => {
          console.log('⚠️ 用户拒绝授权:', err);
          reject(err);
        }
      });
    });
  },

  /**
   * 确保已登录（供页面调用）
   */
  ensureLogin() {
    if (this.globalData.userId) {
      return Promise.resolve(this.globalData.userId);
    }
    return this.wechatLogin().then(() => this.globalData.userId);
  }
});
