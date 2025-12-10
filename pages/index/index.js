// pages/index/index.js
const api = require('../../utils/api.js');
const { CITIES } = require('../../utils/cities.js');

Page({
  data: {
    // 表单数据
    formData: {
      name: '',
      genderIndex: 0,
      birthDate: '',
      birthTime: '',
      city: '北京'  // 默认北京
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
    submitting: false
  },

  onLoad() {
    // 设置今天日期
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.setData({
      todayDate: `${year}-${month}-${day}`
    });
  },

  /**
   * 页面显示时触发
   */
  onShow() {
    // 在后台预加载报告列表(不阻塞UI,不影响用户体验)
    this.preloadReports();
  },

  /**
   * 预加载报告列表(后台静默加载)
   */
  async preloadReports() {
    try {
      console.log('[首页] 开始后台预加载报告列表...');
      const result = await api.getReportList();
      const reports = result.data || [];

      // 缓存到全局数据
      const app = getApp();
      app.globalData.cachedReports = reports;
      app.globalData.reportsCacheTime = Date.now();

      console.log('[首页] 预加载成功:', reports.length, '条报告');
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

  // 表单验证
  validateForm() {
    const { name, birthDate, birthTime, city } = this.data.formData;

    if (!name || !name.trim()) {
      wx.showToast({
        title: '请输入姓名',
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
    // 1. 验证表单
    if (!this.validateForm()) {
      return;
    }

    // 2. 设置提交状态
    this.setData({ submitting: true });

    try {
      // 3. 准备请求数据
      const { name, genderIndex, birthDate, birthTime, city } = this.data.formData;
      const requestData = {
        name: name.trim(),
        gender: genderIndex === 0 ? 'male' : 'female',
        birthDate,
        birthTime,
        city: city.trim()
      };

      console.log('[表单提交]', requestData);

      // 4. 调用 API 创建报告
      const result = await api.createReport(requestData);

      console.log('[创建报告成功]', result);

      // 5. 显示确认信息弹窗
      const genderText = this.data.formData.genderIndex === 0 ? '男' : '女';

      wx.showModal({
        title: '确认信息',
        content: `姓名：${name}
性别：${genderText}
出生日期：${birthDate}
出生时间：${birthTime}
出生城市：${city}

确认无误后，老师将开始处理您的报告`,
        confirmText: '确认',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 用户点击"确认"，直接跳转到报告处理页面
            wx.navigateTo({
              url: `/pages/result/result?reportId=${result.data.id}`
            });
          } else {
            // 用户点击"取消"，停留在当前页面
            // 可以选择是否删除已创建的报告（暂不删除）
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
  onGoHistory() {
    // 显示加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true  // 显示透明蒙层,防止触摸穿透
    });

    // 跳转到历史页面(不自动关闭loading,由历史页面自己关闭)
    wx.navigateTo({
      url: '/pages/history/history',
      fail: () => {
        // 跳转失败,立即关闭loading
        wx.hideLoading();
      }
    });
  }
});
