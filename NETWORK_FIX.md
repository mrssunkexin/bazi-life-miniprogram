# 修复小程序网络请求问题

## 问题原因

微信小程序开发者工具默认不允许访问 `localhost`,需要关闭"不校验合法域名"选项。

## 解决方案

### 方法1: 关闭域名校验(推荐用于开发调试)

1. **在微信开发者工具右上角,点击"详情"按钮**
2. **在"本地设置"标签页中**
3. **勾选"不校验合法域名、web-view(业务域名)、TLS 版本以及 HTTPS 证书"**

![设置位置](https://res.wx.qq.com/wxdoc/dist/assets/img/debug.c2c76ed4.png)

完成后,重新编译小程序即可。

### 方法2: 使用 127.0.0.1 替代 localhost

如果方法1不生效,修改配置文件:

```javascript
// config.js
development: {
  apiBase: 'http://127.0.0.1:3000',  // 改用 127.0.0.1
  qrcodeUrl: '/images/qrcode.jpg'
}
```

### 方法3: 临时使用真实部署地址

```javascript
// config.js
development: {
  apiBase: 'https://bazi-life-api.zeabur.app',  // 使用线上地址
  qrcodeUrl: 'https://img.ikkyun.com/qrcode.jpg'
}
```

## 验证方法

1. 重新编译小程序(Command+B)
2. 打开控制台,切换到"Network"标签
3. 导航到报告页面
4. 应该能看到 API 请求记录

如果仍然看不到请求,检查:
- 是否勾选了"不校验合法域名"
- 后端服务是否在运行(`npm run dev`)
- 端口3000是否被占用

## 下一步

配置完成后,重新访问报告页面:
```
pages/result/result?reportId=cmiyevlji00059kkssz1jgail
```

应该能在控制台看到:
- `[报告数据]` 日志
- `[fullContent长度]` 日志
- `[状态判断]` 日志
