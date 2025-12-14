// pages/result/result.js
const api = require('../../utils/api.js');
const config = require('../../config.js');

Page({
  data: {
    reportId: '',
    reportType: 'basic', // 新增: basic 或 fortune2026
    report: null,
    wuxing: null,
    wuxingList: [],
    formattedContent: '',
    qrcodeUrl: config.current.qrcodeUrl,
    loading: true,
    generating: false,
    progress: 0,
    isAlgorithmReport: false, // 是否为算法版报告
    showVoucherModal: false, // 是否显示兑换码弹窗
    voucherCode: '', // 兑换码输入值
    submittingVoucher: false // 是否正在提交兑换码
  },

  async onLoad(options) {
    if (!options.reportId) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    this.setData({
      reportId: options.reportId,
      reportType: options.type || 'basic' // 从URL参数获取类型
    });

    // 优先使用后台配置的二维码
    const app = getApp();
    if (app.globalData.officialAccountQrcode) {
      this.setData({
        qrcodeUrl: app.globalData.officialAccountQrcode
      });
    }

    await this.loadReport();
  },

  /**
   * 加载报告数据
   */
  async loadReport() {
    try {
      // 根据类型调用不同API
      const result = this.data.reportType === 'fortune2026'
        ? await api.getFortune2026Report(this.data.reportId)
        : await api.getReport(this.data.reportId);
      const report = result.data;

      console.log('[报告数据]', report);
      console.log('[报告状态]', report.status);
      console.log('[fullContent长度]', report.fullContent ? report.fullContent.length : 0);

      // 新逻辑：根据 status 字段判断，不再轮询
      if (report.status === 'published') {
        // 报告已发布，直接显示完整内容
        console.log('[报告已发布] 显示完整报告');
        this.displayReport(report);
      } else if (report.status === 'draft') {
        // 报告还在后台处理中，显示等待界面（不轮询，等待管理员发布）
        console.log('[报告草稿状态] 显示等待界面');
        this.setData({
          report,
          loading: false,
          generating: true,
          progress: 50  // 固定显示50%进度
        });
      } else {
        // 其他状态，提示异常
        console.error('[报告状态异常]', report.status);
        wx.showToast({
          title: '报告状态异常',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (error) {
      console.error('[加载报告失败]', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 手动刷新报告（用户在等待界面可以下拉刷新）
   */
  async onRefresh() {
    await this.loadReport();
  },

  /**
   * 页面卸载时清理
   */
  onUnload() {
    // 不再需要清理定时器
  },

  /**
   * 二维码加载失败处理
   */
  onQRCodeError(e) {
    console.error('[二维码加载失败]', e);
    wx.showToast({
      title: '二维码加载失败',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 显示报告内容
   */
  displayReport(report) {
    // 解析五行数据
    let wuxing = null;
    let wuxingList = [];

    try {
      wuxing = JSON.parse(report.wuxing);

      // 转换为数组格式用于渲染
      const elementNames = {
        wood: '木',
        fire: '火',
        earth: '土',
        metal: '金',
        water: '水'
      };

      // 安全检查: 确保wuxing和scores存在
      if (wuxing && wuxing.scores && typeof wuxing.scores === 'object') {
        wuxingList = Object.entries(wuxing.scores).map(([element, score]) => {
          const maxScore = Math.max(...Object.values(wuxing.scores));
          return {
            element,
            name: elementNames[element],
            score,
            percentage: (score / maxScore) * 100
          };
        });
      }
    } catch (error) {
      console.error('[解析五行数据失败]', error);
    }

    // 格式化报告内容（简单处理，将换行符转为 <br/>）
    const formattedContent = this.formatContent(report.fullContent);

    // 判断是否为算法版报告（通过检查内容中是否包含"纯算法解读"标识）
    const isAlgorithmReport = report.fullContent && report.fullContent.includes('纯算法解读');
    console.log('[报告类型判断]', isAlgorithmReport ? '算法版' : 'AI版');

    this.setData({
      report,
      wuxing,
      wuxingList,
      formattedContent,
      isAlgorithmReport,
      loading: false,
      generating: false,
      progress: 100
    });
  },

  /**
   * 格式化内容（将 Markdown 简单转换为 HTML）
   */
  formatContent(content) {
    if (!content) return '';

    // 简单的 Markdown 转换
    let html = content
      // 标题
      .replace(/^### (.+)$/gm, '<h3 style="font-size: 32rpx; font-weight: bold; margin: 30rpx 0 20rpx; color: #333;">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 style="font-size: 36rpx; font-weight: bold; margin: 40rpx 0 25rpx; color: #333;">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 style="font-size: 40rpx; font-weight: bold; margin: 50rpx 0 30rpx; color: #333;">$1</h1>')
      // 粗体
      .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: bold; color: #667eea;">$1</strong>')
      // 换行
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');

    return html;
  },

  /**
   * 分享报告
   */
  onShare() {
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  },

  /**
   * 返回首页
   */
  onBackHome() {
    wx.navigateBack();
  },

  /**
   * 升级为AI解读（打开兑换码弹窗）
   */
  onUpgradeToAI() {
    this.setData({
      showVoucherModal: true,
      voucherCode: ''
    });
  },

  /**
   * 关闭兑换码弹窗
   */
  onCloseVoucherModal() {
    this.setData({
      showVoucherModal: false,
      voucherCode: '',
      submittingVoucher: false
    });
  },

  /**
   * 兑换码输入
   */
  onVoucherCodeInput(e) {
    this.setData({
      voucherCode: e.detail.value
    });
  },

  /**
   * 提交兑换码，创建AI版报告
   */
  async onSubmitVoucher() {
    const { voucherCode, reportId, report } = this.data;

    // 验证兑换码
    if (!voucherCode || voucherCode.trim().length === 0) {
      wx.showToast({
        title: '请输入兑换码',
        icon: 'none'
      });
      return;
    }

    if (voucherCode.length !== 30) {
      wx.showToast({
        title: '兑换码应为30位',
        icon: 'none'
      });
      return;
    }

    this.setData({ submittingVoucher: true });

    try {
      // 调用后端API，基于当前算法版报告创建AI版报告
      const result = await api.upgradeReportToAI(reportId, voucherCode);
      console.log('[升级报告成功]', result);

      const newReportId = result.data.id;
      const voucherCodeFromResult = result.data.voucherCode;

      // 关闭弹窗
      this.onCloseVoucherModal();

      // 激活报告（核销兑换码，触发AI生成）
      try {
        await api.activateReport(newReportId, voucherCodeFromResult);
        console.log('[激活成功]');
      } catch (activateError) {
        console.error('[激活失败]', activateError);
        // 激活失败也继续跳转，让用户看到错误状态
      }

      // 直接跳转到新报告页面（显示等待界面）
      wx.redirectTo({
        url: `/pages/result/result?reportId=${newReportId}`
      });

    } catch (error) {
      console.error('[升级报告失败]', error);
      this.setData({ submittingVoucher: false });

      wx.showModal({
        title: '提交失败',
        content: error.message || '兑换码无效或已被使用，请检查后重试',
        showCancel: false,
        confirmText: '知道了'
      });
    }
  },

  /**
   * 页面分享配置
   */
  onShareAppMessage() {
    return {
      title: `${this.data.report?.name}的八字命理分析报告`,
      path: `/pages/result/result?reportId=${this.data.reportId}`
    };
  }
});
