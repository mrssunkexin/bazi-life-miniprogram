# 小程序调试指南 - 修复"生成超时"错误

## 问题现状

小程序在加载已完成的报告时，错误地进入轮询状态，最终显示"生成超时"错误。

## 测试步骤

### 1. 在微信开发者工具中测试

1. 打开微信开发者工具
2. 在控制台(Console)中添加日志监听
3. 使用已知完成的报告ID测试：`cmiyevlji00059kkssz1jgail`

### 2. 检查关键日志

在 `pages/result/result.js` 的第 42 行，应该看到：
```
[报告数据] {id: "...", fullContent: "# 🌙 张三..."}
```

**关键检查点：**
- `report.fullContent` 的实际值是什么？
- 是否等于字符串 `"报告生成中..."`？
- 还是包含完整的报告内容？

### 3. 测试API返回格式

在小程序中添加临时调试代码：

```javascript
// 在 loadReport 函数中的第 39-42 行之后添加
const result = await api.getReport(this.data.reportId);
const report = result.data;

console.log('[API返回]', JSON.stringify(result));
console.log('[报告对象]', report);
console.log('[fullContent类型]', typeof report.fullContent);
console.log('[fullContent长度]', report.fullContent ? report.fullContent.length : 0);
console.log('[fullContent前100字]', report.fullContent ? report.fullContent.substring(0, 100) : 'null');
console.log('[是否等于"报告生成中..."]', report.fullContent === '报告生成中...');
```

### 4. 后端API验证

在终端中执行以下命令，验证API返回格式：

```bash
# 检查已完成报告
curl -s http://localhost:3000/api/reports/cmiyevlji00059kkssz1jgail | jq '{
  success: .success,
  has_data: (.data != null),
  fullContent_length: (.data.fullContent | length),
  fullContent_start: (.data.fullContent[:100])
}'

# 检查生成中报告
curl -s http://localhost:3000/api/reports/cmiyj7kxv00079kksaazm9q6j | jq '{
  success: .success,
  has_data: (.data != null),
  fullContent: .data.fullContent
}'
```

## 可能的问题原因

### 原因1：API响应格式不一致

**症状：** 小程序API调用返回的格式与后端不同
**检查：** 微信小程序的 `wx.request` 可能对响应做了额外处理

**解决方案：** 在 `utils/api.js` 中添加详细日志

```javascript
success(res) {
  console.log('[API原始响应]', res);
  console.log('[状态码]', res.statusCode);
  console.log('[响应数据类型]', typeof res.data);
  console.log('[响应数据]', JSON.stringify(res.data).substring(0, 200));

  if (res.statusCode >= 200 && res.statusCode < 300) {
    if (res.data.success !== false) {
      resolve(res.data);
    } else {
      reject(new Error(res.data.error || '请求失败'));
    }
  }
}
```

### 原因2：字符串比较失败

**症状：** `fullContent` 包含了额外的空格或换行符
**检查：** 使用 `.trim()` 清理字符串后再比较

**解决方案：** 修改判断逻辑

```javascript
//  pages/result/result.js 第 45 行
if (report.fullContent.trim() === '报告生成中...') {
```

### 原因3：Unicode或编码问题

**症状：** 字符看起来相同但实际不同
**检查：** 打印字符码

```javascript
console.log('[fullContent字符码]',
  Array.from(report.fullContent.substring(0, 10))
    .map(c => c.charCodeAt(0))
);
```

## 快速修复方案

如果以上检查无法定位问题，使用更宽松的判断条件：

```javascript
// pages/result/result.js 第 44-52 行替换为：

// 检查报告是否生成完成
const isGenerating = report.fullContent.includes('生成中');
const isFailed = report.fullContent.includes('生成失败');
const isComplete = !isGenerating && !isFailed && report.fullContent.length > 100;

if (isGenerating) {
  this.setData({
    report,
    loading: false,
    generating: true,
    progress: 10
  });
  this.startPolling();
} else if (isFailed) {
  wx.showModal({
    title: '生成失败',
    content: '报告生成失败，请联系管理员',
    showCancel: false,
    success: () => {
      wx.navigateBack();
    }
  });
} else if (isComplete) {
  // 报告已生成完成
  this.displayReport(report);
} else {
  // 内容异常，显示错误
  wx.showToast({
    title: '报告内容异常',
    icon: 'none'
  });
}
```

## 测试用报告ID

- **已完成报告**：`cmiyevlji00059kkssz1jgail`
- **生成中报告**：`cmiyj7kxv00079kksaazm9q6j`

使用这两个ID在小程序中分别测试，观察日志输出的差异。

## 联系支持

如果问题仍然存在，请提供：
1. 微信开发者工具Console中的完整日志
2. Network标签中API请求的详细响应
3. 具体触发错误的步骤
