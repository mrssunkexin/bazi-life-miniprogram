// custom-tab-bar/index.js
Component({
  data: {
    selected: 0,
    color: "#999999",
    selectedColor: "#667eea",
    list: []
  },

  attached() {
    console.log('[CustomTabBar] attached 生命周期被调用');
    this.updateTabBarList();
  },

  ready() {
    console.log('[CustomTabBar] ready 生命周期被调用');
  },

  pageLifetimes: {
    show() {
      this.updateTabBarList();
    }
  },

  methods: {
    updateTabBarList() {
      console.log('[CustomTabBar] updateTabBarList 被调用');

      const list = [
        {
          pagePath: "/pages/month-calendar/month-calendar",
          text: "万年历",
          iconPath: "/images/tab-calendar.png",
          selectedIconPath: "/images/tab-calendar-active.png"
        },
        {
          pagePath: "/pages/calendar/calendar",
          text: "黄历",
          iconPath: "/images/tab-calendar.png",
          selectedIconPath: "/images/tab-calendar-active.png"
        },
        {
          pagePath: "/pages/zeji/zeji",
          text: "择吉",
          iconPath: "/images/tab-fortune.png",
          selectedIconPath: "/images/tab-fortune-active.png"
        }
      ];

      console.log('[CustomTabBar] 最终 list 长度:', list.length);
      console.log('[CustomTabBar] 最终 list:', list);

      this.setData({ list });
    },

    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;

      wx.switchTab({ url });
    },

    init() {
      const page = getCurrentPages().pop();
      const route = page ? `/${page.route}` : '';

      this.setData({
        selected: this.data.list.findIndex(item => item.pagePath === route)
      });
    }
  }
});
