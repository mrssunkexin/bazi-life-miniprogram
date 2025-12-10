# 小程序部署指南

## 📁 文件结构

```
miniprogram-1/
├── config.js           # 环境配置文件（重要！）
├── images/
│   └── qrcode.jpg     # 公众号二维码（本地开发用）
├── pages/
├── utils/
└── ...
```

---

## ⚙️ 环境配置

### 开发环境（本地测试）

编辑 `config.js`，设置 `ENV = 'development'`：

```javascript
const ENV = 'development';  // 本地开发

module.exports = {
  development: {
    apiBase: 'http://localhost:3000',
    qrcodeUrl: '/images/qrcode.jpg'  // 使用本地图片
  },
  production: {
    apiBase: 'https://bazi-life-api.zeabur.app',
    qrcodeUrl: 'https://your-cdn.com/qrcode.jpg'
  }
};
```

### 生产环境（上线发布）

#### 1. 上传二维码到 CDN/服务器

**选项 A：使用后端服务器**
```bash
# 将二维码上传到后端 public 目录
scp qrcode.jpg user@your-server:/path/to/public/images/
```

访问地址：`https://bazi-life-api.zeabur.app/images/qrcode.jpg`

**选项 B：使用对象存储（推荐）**
- 上传到阿里云 OSS / 腾讯云 COS / 七牛云
- 获得公网 URL：`https://cdn.example.com/qrcode.jpg`

**选项 C：使用微信服务器**
- 上传到微信公众平台
- 使用微信图片 URL（需配置域名白名单）

#### 2. 修改配置文件

编辑 `config.js`：

```javascript
const ENV = 'production';  // 切换到生产环境

module.exports = {
  development: { ... },
  production: {
    apiBase: 'https://bazi-life-api.zeabur.app',
    qrcodeUrl: 'https://your-cdn.com/qrcode.jpg'  // 替换为实际 URL
  }
};
```

#### 3. 配置域名白名单

登录微信公众平台 → 开发 → 开发管理 → 服务器域名

添加以下域名：

- **request 合法域名**：
  - `https://bazi-life-api.zeabur.app` （后端 API）

- **downloadFile 合法域名**（如果二维码是外部 URL）：
  - `https://your-cdn.com` （CDN 域名）
  - `https://mmbiz.qpic.cn` （微信图片服务器）

---

## 🚀 上线步骤

### 1. 本地测试

```bash
# 确保后端运行
cd /Users/huayin/bazi-life-mvp
npm run dev

# 在微信开发者工具中测试小程序
```

### 2. 切换到生产环境

```javascript
// config.js
const ENV = 'production';  // 改为 production
```

### 3. 上传代码

1. 在微信开发者工具中点击"上传"
2. 填写版本号（如 `1.0.0`）
3. 填写备注（如 `首次发布`）

### 4. 提交审核

1. 登录微信公众平台
2. 版本管理 → 开发版本 → 提交审核
3. 填写审核信息：
   - 类别：生活服务 / 娱乐
   - 标签：命理测算、娱乐
   - 添加测试账号

### 5. 审核通过后发布

审核通过后（通常 2-7 天）：
1. 版本管理 → 审核版本 → 发布
2. 用户即可搜索使用

---

## 🔄 快速切换环境

创建两个配置文件：

**config.dev.js**（开发环境）
```javascript
module.exports = {
  apiBase: 'http://localhost:3000',
  qrcodeUrl: '/images/qrcode.jpg'
};
```

**config.prod.js**（生产环境）
```javascript
module.exports = {
  apiBase: 'https://bazi-life-api.zeabur.app',
  qrcodeUrl: 'https://your-cdn.com/qrcode.jpg'
};
```

**config.js**（主配置文件）
```javascript
// 快速切换：修改这一行即可
module.exports = require('./config.dev.js');  // 开发
// module.exports = require('./config.prod.js');  // 生产
```

---

## 🔍 常见问题

### Q1: 二维码不显示

**检查清单**：
1. ✅ 图片路径是否正确
2. ✅ 本地：`/images/qrcode.jpg` 文件是否存在
3. ✅ 线上：URL 是否可访问（浏览器打开测试）
4. ✅ 域名是否在白名单中

**调试方法**：
```javascript
// 在 result.js 的 onLoad 中打印
console.log('[二维码URL]', this.data.qrcodeUrl);
```

### Q2: API 请求失败

**检查清单**：
1. ✅ `config.js` 中的 `ENV` 是否正确
2. ✅ 后端服务是否运行
3. ✅ 域名是否在白名单中
4. ✅ 开发工具中是否关闭域名验证

### Q3: 上传代码包过大

**优化方法**：
1. 压缩图片（二维码可压缩到 50KB 以下）
2. 删除 `node_modules`（小程序不需要）
3. 删除测试文件

---

## 📊 环境对比

| 项目 | 开发环境 | 生产环境 |
|------|----------|----------|
| ENV | `development` | `production` |
| API | `http://localhost:3000` | `https://bazi-life-api.zeabur.app` |
| 二维码 | `/images/qrcode.jpg` | `https://your-cdn.com/qrcode.jpg` |
| 域名验证 | ❌ 关闭 | ✅ 开启 |
| 数据库 | SQLite (本地) | MySQL/PostgreSQL (云端) |

---

## ✅ 上线前检查清单

- [ ] 修改 `config.js` 为 `production`
- [ ] 二维码已上传到 CDN/服务器
- [ ] 后端 API 已部署到线上
- [ ] 域名已添加到白名单
- [ ] 数据库已迁移到云端
- [ ] 测试所有功能正常
- [ ] 添加免责声明："本测算仅供娱乐参考"
- [ ] 准备好审核用的测试账号

---

**创建时间**：2025-12-09  
**版本**：v1.0
