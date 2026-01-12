// pages/zeji/zeji.js
const config = require('../../config.js');

Page({
  data: {
    loading: false,
    // 按类别分组的事项
    hotItems: [
      '嫁娶', '入宅', '移徙', '开市', '交易', '安床', '订盟', '纳采'
    ],
    businessItems: [
      '立券', '纳财', '出货财', '开仓', '进人口', '赴任'
    ],
    constructionItems: [
      '动土', '修造', '上梁', '盖屋', '起基', '竖柱'
    ],
    dailyItems: [
      '祭祀', '祈福', '沐浴', '理发', '扫舍', '裁衣', '会亲友', '出行'
    ],
    otherItems: [
      '安葬', '安门', '安香', '安机械', '补垣', '成服', '出火', '除服',
      '冠笄', '挂匾', '坏垣', '纳畜', '架马', '结网', '解除', '掘井', '开池',
      '开光', '开厕', '开渠', '开生坟', '启钻', '取渔', '破屋', '破土', '平治道涂',
      '栽种', '塞穴', '塑绘', '求嗣', '求医', '伐木', '放水', '畋猎', '拆卸',
      '断蚁', '定磉', '斋醮', '筑堤', '治病', '针灸', '整手足甲', '置产', '捕捉',
      '经络', '教牛马', '牧养', '立碑', '谢土', '修坟', '修门', '修饰垣墙', '移柩',
      '入殓', '入学', '造仓', '造畜稠', '造船', '作梁', '作灶'
    ]
  },

  onLoad(options) {
    console.log('[择吉页面] onLoad');
  },

  onShow() {
    // 更新 tabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      });
    }
  },

  // 选择事项
  onSelectItem(e) {
    const item = e.currentTarget.dataset.item;
    console.log('[择吉页面] 选择事项:', item);

    // 跳转到日期选择和结果页面
    wx.navigateTo({
      url: `/pages/zeji-result/zeji-result?item=${encodeURIComponent(item)}`
    });
  }
});
