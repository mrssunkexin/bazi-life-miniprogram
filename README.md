# 八字命理分析小程序

## 项目结构

```
miniprogram-1/
├── pages/
│   ├── index/              # 首页（输入表单）
│   │   ├── index.wxml     # 模板
│   │   ├── index.wxss     # 样式
│   │   ├── index.js       # 逻辑
│   │   └── index.json     # 配置
│   └── result/            # 报告展示页
│       ├── result.wxml
│       ├── result.wxss
│       ├── result.js
│       └── result.json
├── utils/
│   └── api.js             # API 封装
├── app.js                 # 小程序入口
├── app.json              # 全局配置
├── app.wxss              # 全局样式
├── sitemap.json          # 索引配置
└── project.config.json   # 项目配置
```

## 如何使用

### 1. 在微信开发者工具中打开项目

1. 打开微信开发者工具
2. 点击"导入项目"
3. 选择目录：`~/miniprogram-1`
4. AppID 选择：**测试号**（或填写您的正式 AppID）
5. 点击"导入"

### 2. 配置后端 API 地址

编辑 `utils/api.js` 文件，修改 API_BASE 变量：

```javascript
// 本地开发（确保后端在 http://localhost:3000 运行）
const API_BASE = 'http://localhost:3000';

// 或使用部署后的地址
// const API_BASE = 'https://your-api-domain.com';
```

**重要提示**：
- 使用测试号时，需要在微信开发者工具中勾选"不校验合法域名"
- 步骤：右上角"详情" > "本地设置" > 勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"

### 3. 确保后端服务运行

在 `bazi-life-mvp` 项目中启动后端：

```bash
cd ~/bazi-life-mvp
npm run dev
```

后端会运行在 `http://localhost:3000`

### 4. 在模拟器中测试

1. 点击微信开发者工具中的"编译"按钮
2. 在模拟器中测试：
   - 填写表单（姓名、性别、出生日期/时间、城市）
   - 点击"立即测算"
   - 等待报告生成（会看到进度条）
   - 查看完整报告

## 功能说明

### 首页（pages/index）

- 用户输入表单
- 字段验证
- 调用后端 API 创建报告
- 跳转到报告页面

### 报告页（pages/result）

- 显示用户基本信息
- 四柱展示（年、月、日、时）
- 五行分析（含可视化图表）
- 完整报告内容
- 异步生成 + 轮询机制（每秒查询一次生成状态）
- 分享功能

## API 接口

所有接口都通过 `utils/api.js` 统一管理：

- `createReport(data)` - 创建报告
- `getReport(id)` - 获取报告详情
- `getReportStatus(id)` - 查询报告生成状态
- `getReportList()` - 获取报告列表

## 调试技巧

### 查看控制台日志

微信开发者工具 > Console 面板，可以看到：
- `[API]` 开头的网络请求日志
- `[表单提交]` 表单数据
- `[报告数据]` 报告内容
- `[轮询状态]` 生成状态

### 查看网络请求

微信开发者工具 > Network 面板，可以看到：
- 请求 URL
- 请求参数
- 响应数据

### 常见问题

**1. 请求失败 "errMsg": "request:fail"**
- 检查后端是否运行
- 检查 API_BASE 地址是否正确
- 检查是否勾选"不校验合法域名"

**2. 报告一直显示"生成中"**
- 检查后端 AI_API_KEY 是否配置
- 查看后端控制台是否有错误
- 轮询最多 60 秒，超时会提示

**3. 页面样式异常**
- 清除缓存：详情 > 清除缓存
- 重新编译

## 下一步开发计划

### P0（已完成）
- ✅ 基础表单页面
- ✅ 报告展示页面
- ✅ API 对接
- ✅ 异步生成 + 轮询

### P1（待开发）
- ⏳ 用户登录/注册
- ⏳ 兑换码系统
- ⏳ 个人中心

### P2（待开发）
- ⏳ 管理后台增强
- ⏳ 数据统计分析

## 部署说明

### 开发环境
- 使用测试号 + 本地后端（localhost:3000）

### 生产环境
1. 后端部署到云平台（Zeabur/Vercel）
2. 修改 `utils/api.js` 中的 API_BASE
3. 申请正式小程序 AppID
4. 配置服务器域名白名单
5. 上传代码并提交审核

---

**创建时间**：2025-12-09
**版本**：P0 v1.0
