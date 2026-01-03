// pages/index/index.js
const api = require('../../utils/api.js');
const { CITIES } = require('../../utils/cities.js');

Page({
  data: {
    // 表单数据
    formData: {
      name: '',
      genderIndex: -1, // 默认不选中
      birthDate: '',
      birthTime: '',
      city: '北京',  // 默认北京
      voucherCode: ''  // 兑换码（可选）
    },

    // 性别选项
    genderOptions: ['男', '女'],

    // 城市选择相关
    allCities: CITIES,
    filteredCities: [],
    showCityDropdown: false,

    // 今天日期（用于限制出生日期选择）
    todayDate: '',

    // 提交状态
    submitting: false,
    submittingFortune2026: false,

    // 配置项
    appTitle: '生辰五行报告',  // 默认标题
    showVoucherCode: true,      // 默认显示兑换码
    submitButtonText: '立即测算',
    showFortune2026Button: false,
    fortune2026ButtonText: '2026运势测算',
    showBasicReportButton: true,  // 默认显示基础报告按钮
    showFortunePage: false  // 默认不显示运势页面
  },

  async onLoad() {
    const app = getApp();

    // 等待配置加载完成（最多等待3秒）
    let retryCount = 0;
    while (!app.globalData.configLoaded && retryCount < 30) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retryCount++;
    }

    // 检查是否应该拦截该页面
    console.log('[运势页] 检查拦截, configLoaded:', app.globalData.configLoaded, 'showTabBar:', app.globalData.showTabBar);
    if (!app.globalData.showTabBar) {
      // TabBar 隐藏时，拦截运势页面访问
      wx.showToast({
        title: '该功能暂未开发',
        icon: 'none',
        duration: 2000
      });
      // 延迟返回黄历页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/calendar/calendar'
        });
      }, 2000);
      return;
    }

    // 设置今天日期
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.setData({
      todayDate: `${year}-${month}-${day}`
    });

    // 确保用户已登录
    app.ensureLogin().then(() => {
      console.log('✅ 用户已登录, userId:', app.globalData.userId);
      // 加载配置
      this.loadConfig();
    }).catch((err) => {
      console.error('❌ 登录失败:', err);
      wx.showModal({
        title: '提示',
        content: '登录失败，请重启小程序',
        showCancel: false
      });
    });
  },

  /**
   * 加载小程序配置
   */
  async loadConfig() {
    try {
      console.log('[首页] 开始加载配置...');
      // 增加获取新配置项
      const result = await api.getConfig('app_title,show_voucher_code,official_account_qrcode,submit_button_text,show_fortune_2026_button,fortune_2026_button_text,show_basic_report_button,show_fortune_page');
      const config = result.data || {};

      console.log('[首页] 配置加载成功:', config);

      // 如果后台配置了二维码，存入全局数据供结果页使用
      if (config.official_account_qrcode) {
        getApp().globalData.officialAccountQrcode = config.official_account_qrcode;
      }

      // 更新配置到页面
      this.setData({
        appTitle: config.app_title || '生辰五行报告',
        showVoucherCode: config.show_voucher_code !== false,  // 默认true
        submitButtonText: config.submit_button_text || '立即测算',
        showFortune2026Button: config.show_fortune_2026_button || false,
        fortune2026ButtonText: config.fortune_2026_button_text || '2026运势测算',
        showBasicReportButton: config.show_basic_report_button !== false,  // 默认true
        showFortunePage: config.show_fortune_page || false  // 默认false（不显示）
      });
    } catch (error) {
      console.log('[首页] 配置加载失败(使用默认值):', error.message || error);
      // 使用默认值,不影响功能
    }
  },

  /**
   * 页面显示时触发
   */
  onShow() {
    // 控制 TabBar 显示/隐藏（延迟执行确保配置已加载）
    setTimeout(() => {
      const app = getApp();
      console.log('[运势页] TabBar配置:', app.globalData.showTabBar);
      if (app.globalData.showTabBar) {
        wx.showTabBar({ animation: false });
      } else {
        wx.hideTabBar({ animation: false });
      }
    }, 100);

    // 确保登录后再预加载报告列表
    const app = getApp();
    if (app.globalData.userId) {
      // 已登录,直接预加载
      this.preloadReports();
    } else {
      // 等待登录完成后预加载
      app.ensureLogin().then(() => {
        this.preloadReports();
      }).catch(err => {
        console.log('[首页] 登录失败,跳过预加载:', err);
      });
    }
  },

  /**
   * 预加载报告列表(后台静默加载)
   */
  async preloadReports() {
    try {
      const app = getApp();
      if (!app.globalData.userId) {
        console.log('[首页] userId未就绪,跳过预加载');
        return;
      }

      console.log('[首页] 开始后台预加载报告列表...');
      const result = await api.getMixedReportList();
      const reports = result.data.reports || [];

      // 缓存到全局数据
      app.globalData.cachedReports = reports;
      app.globalData.reportsCacheTime = Date.now();

      console.log('[首页] 预加载成功:', reports.length, '条报告 (基础:', result.data.summary.basicCount, '条, 2026:', result.data.summary.fortune2026Count, '条)');
    } catch (error) {
      console.log('[首页] 预加载失败(不影响功能):', error.message || error);
    }
  },

  // 姓名输入
  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
    });
  },

  // 性别选择
  onGenderChange(e) {
    this.setData({
      'formData.genderIndex': parseInt(e.detail.value)
    });
  },

  // 城市输入（带搜索过滤）
  onCityInput(e) {
    const value = e.detail.value;
    this.setData({
      'formData.city': value
    });

    // 过滤城市列表
    if (value) {
      const filtered = this.data.allCities.filter(city =>
        city.includes(value)
      ).slice(0, 10); // 最多显示10个
      this.setData({
        filteredCities: filtered,
        showCityDropdown: true
      });
    } else {
      this.setData({
        filteredCities: [],
        showCityDropdown: false
      });
    }
  },

  // 城市输入框获得焦点
  onCityFocus() {
    const value = this.data.formData.city;
    if (value) {
      const filtered = this.data.allCities.filter(city =>
        city.includes(value)
      ).slice(0, 10);
      this.setData({
        filteredCities: filtered,
        showCityDropdown: true
      });
    }
  },

  // 选择城市
  onSelectCity(e) {
    const city = e.currentTarget.dataset.city;
    this.setData({
      'formData.city': city,
      showCityDropdown: false,
      filteredCities: []
    });
  },

  // 出生日期选择
  onBirthDateChange(e) {
    this.setData({
      'formData.birthDate': e.detail.value
    });
  },

  // 出生时间选择
  onBirthTimeChange(e) {
    this.setData({
      'formData.birthTime': e.detail.value
    });
  },

  // 兑换码输入
  onVoucherCodeInput(e) {
    this.setData({
      'formData.voucherCode': e.detail.value.trim().toUpperCase()
    });
  },

  // 表单验证
  validateForm() {
    const { name, genderIndex, birthDate, birthTime, city } = this.data.formData;

    if (!name || !name.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return false;
    }

    if (genderIndex === -1) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      });
      return false;
    }

    if (!birthDate) {
      wx.showToast({
        title: '请选择出生日期',
        icon: 'none'
      });
      return false;
    }

    if (!birthTime) {
      wx.showToast({
        title: '请选择出生时间',
        icon: 'none'
      });
      return false;
    }

    if (!city || !city.trim()) {
      wx.showToast({
        title: '请输入出生城市',
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 提交表单
  async onSubmit() {
    const app = getApp();

    // 0. 验证登录状态
    if (!app.globalData.userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      app.wechatLogin();
      return;
    }

    // 1. 验证表单
    if (!this.validateForm()) {
      return;
    }

    // 2. 设置提交状态
    this.setData({ submitting: true });

    try {
      // 3. 准备请求数据
      const { name, genderIndex, birthDate, birthTime, city, voucherCode } = this.data.formData;
      const gender =
        genderIndex === 0 ? 'male' :
        genderIndex === 1 ? 'female' : '';

      const requestData = {
        name: name.trim(),
        gender,
        birthDate,
        birthTime,
        city: city.trim(),
        buttonText: this.data.submitButtonText // 传递按钮文字
      };

      // 添加兑换码（如果有）
      if (voucherCode) {
        requestData.voucherCode = voucherCode;
      }

      console.log('[表单提交]', requestData);

      // 4. 调用 API 创建报告
      const result = await api.createReport(requestData);

      console.log('[创建报告成功]', result);

      const reportId = result.data.id;
      const voucherCodeFromResult = result.data.voucherCode;  // 获取返回的兑换码
      const generationMode = result.data.generationMode; // 新增：获取生成模式

      // 5. 显示信息确认弹窗（只确认基本信息）
      const genderText = this.data.formData.genderIndex === 0 ? '男' : '女';
      const infoContent = `姓名：${name}\n性别：${genderText}\n出生日期：${birthDate}\n出生时间：${birthTime}\n出生城市：${city}`;

      wx.showModal({
        title: '请确认信息',
        content: infoContent,
        confirmText: '信息无误',
        cancelText: '返回修改',
        success: async (res) => {
          if (res.confirm) {
            // 6. 判断生成模式
            if (generationMode === 'algorithm') {
              // 【算法模式】报告已生成，直接跳转
              console.log('[算法报告已生成] 直接跳转');
              wx.navigateTo({
                url: `/pages/result/result?reportId=${reportId}`
              });

            } else if (voucherCodeFromResult) {
              // 【AI模式 + 有兑换码】需要激活
              try {
                console.log('[开始激活报告]', reportId, voucherCodeFromResult);
                await api.activateReport(reportId, voucherCodeFromResult);
                console.log('[激活成功]');

                // 跳转到结果页（AI生成中）
                wx.navigateTo({
                  url: `/pages/result/result?reportId=${reportId}`
                });
              } catch (error) {
                console.error('[激活失败]', error);
                wx.showToast({
                  title: error.message || '激活失败',
                  icon: 'none',
                  duration: 2000
                });
              }
            }
          }
        }
      });

    } catch (error) {
      console.error('[创建报告失败]', error);

      wx.showToast({
        title: error.message || '生成失败，请重试',
        icon: 'none',
        duration: 2000
      });

    } finally {
      // 6. 重置提交状态
      this.setData({ submitting: false });
    }
  },

  /**
   * 跳转到历史报告列表
   */
  async onGoHistory() {
    try {
      // 显示加载提示
      wx.showLoading({
        title: '加载中...',
        mask: true
      });

      // 先检查是否有报告
      const result = await api.getReportList();
      const reports = result.data || [];

      // 关闭加载提示
      wx.hideLoading();

      // 如果没有报告,显示提示
      if (reports.length === 0) {
        wx.showToast({
          title: '暂无报告',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      // 有报告,跳转到历史页面
      wx.navigateTo({
        url: '/pages/history/history'
      });

    } catch (error) {
      console.error('[查看报告失败]', error);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 提交2026运势报告
   */
  async onSubmitFortune2026() {
    const app = getApp();

    // 验证登录状态
    if (!app.globalData.userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      app.wechatLogin();
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    this.setData({ submittingFortune2026: true });

    try {
      const { name, genderIndex, birthDate, birthTime, city, voucherCode } = this.data.formData;
      const gender =
        genderIndex === 0 ? 'male' :
        genderIndex === 1 ? 'female' : '';

      const requestData = {
        name: name.trim(),
        gender,
        birthDate,
        birthTime,
        city: city.trim(),
        buttonText: this.data.fortune2026ButtonText // 传递2026按钮文字
      };

      if (voucherCode) {
        requestData.voucherCode = voucherCode;
      }

      console.log('[提交2026报告]', requestData);

      const result = await api.createFortune2026Report(requestData);
      console.log('[创建2026报告成功]', result);

      const reportId = result.data.id;

      const genderText = genderIndex === 0 ? '男' : '女';
      const infoContent = `姓名:${name}\n性别:${genderText}\n出生日期:${birthDate}\n出生时间:${birthTime}\n出生城市:${city}`;

      wx.showModal({
        title: '请确认信息',
        content: infoContent,
        confirmText: '信息无误',
        cancelText: '返回修改',
        success: async (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: `/pages/result/result?reportId=${reportId}&type=fortune2026`
            });
          }
        }
      });

    } catch (error) {
      console.error('[创建2026报告失败]', error);
      wx.showToast({
        title: error.message || '生成失败',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ submittingFortune2026: false });
    }
  },

  /**
   * 页面分享配置
   */
  onShareAppMessage() {
    return {
      title: '九思知白堂｜生辰五行分析',
      path: '/pages/index/index'
    };
  }
});
