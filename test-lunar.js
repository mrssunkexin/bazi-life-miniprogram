/**
 * lunar-javascript 数据准确性验证脚本
 * 用于验证 2025-12-27 和 2025-12-29 的黄历数据
 */

const { Solar } = require('lunar-javascript');

console.log('========================================');
console.log('lunar-javascript 数据验证');
console.log('========================================\n');

// 验证日期列表
const testDates = [
  { year: 2025, month: 12, day: 27, desc: '需求文档指定日期' },
  { year: 2025, month: 12, day: 29, desc: '今天' },
  { year: 2026, month: 1, day: 1, desc: '跨年测试' }
];

testDates.forEach(({ year, month, day, desc }) => {
  console.log(`\n========== ${year}-${month}-${day} (${desc}) ==========\n`);

  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  // 基本信息
  console.log('【基本信息】');
  console.log(`公历: ${solar.toFullString()}`);
  console.log(`星期: ${solar.getWeekInChinese()}`);
  console.log(`第几周: 第 ${solar.getWeek()} 周`);
  console.log(`农历: ${lunar.toString()}`);
  console.log(`农历月日: ${lunar.getMonthInChinese()}${lunar.getDayInChinese()}`);
  console.log(`生肖: ${lunar.getYearShengXiao()}`);

  // 干支信息
  console.log('\n【干支信息】');
  console.log(`年柱: ${lunar.getYearInGanZhi()}年`);
  console.log(`月柱: ${lunar.getMonthInGanZhi()}月`);
  console.log(`日柱: ${lunar.getDayInGanZhi()}日`);
  console.log(`时柱(子时): ${lunar.getTimeInGanZhi(0)}`);

  // 五行纳音
  console.log('\n【五行纳音】');
  console.log(`年纳音: ${lunar.getYearNaYin()}`);
  console.log(`月纳音: ${lunar.getMonthNaYin()}`);
  console.log(`日纳音: ${lunar.getDayNaYin()}`);

  // 节气
  console.log('\n【节气信息】');
  const prevJieQi = lunar.getPrevJieQi(true);
  const nextJieQi = lunar.getNextJieQi(true);
  console.log(`上一节气: ${prevJieQi.getName()} ${prevJieQi.getSolar().toYmdHms()}`);
  console.log(`下一节气: ${nextJieQi.getName()} ${nextJieQi.getSolar().toYmdHms()}`);

  // 数九
  console.log('\n【节令信息】');
  const shuJiu = lunar.getShuJiu();
  if (shuJiu) {
    console.log(`数九: ${shuJiu.toString()}`);
  } else {
    console.log('数九: 不在数九期间');
  }

  const fu = lunar.getFu();
  if (fu) {
    console.log(`三伏: ${fu.toString()}`);
  } else {
    console.log('三伏: 不在三伏期间');
  }

  // 节日
  console.log('\n【节日信息】');
  const festivals = lunar.getFestivals();
  const otherFestivals = lunar.getOtherFestivals();
  if (festivals.length > 0 || otherFestivals.length > 0) {
    console.log(`节日: ${[...festivals, ...otherFestivals].join(', ')}`);
  } else {
    console.log('节日: 无');
  }

  // 宜忌
  console.log('\n【宜忌】');
  const yi = lunar.getDayYi();
  const ji = lunar.getDayJi();
  console.log(`宜(${yi.length}项): ${yi.join('、')}`);
  console.log(`忌(${ji.length}项): ${ji.join('、')}`);

  // 冲煞
  console.log('\n【冲煞】');
  console.log(`冲: ${lunar.getDayChongDesc()}`);
  console.log(`煞: ${lunar.getDaySha()}`);
  console.log(`完整: 冲${lunar.getDayChongDesc()} ${lunar.getDaySha()}`);

  // 值日星神
  console.log('\n【值日星神】');
  console.log(`值日: ${lunar.getZhiXing()}`);
  const pengZu = lunar.getPengZuGan() + ' ' + lunar.getPengZuZhi();
  console.log(`彭祖百忌: ${pengZu}`);

  // 吉神方位
  console.log('\n【吉神方位】');
  console.log(`喜神方位: ${lunar.getDayPositionXi()}`);
  console.log(`福神方位: ${lunar.getDayPositionFu()}`);
  console.log(`财神方位: ${lunar.getDayPositionCai()}`);
  console.log(`阳贵神方位: ${lunar.getDayPositionYangGui()}`);
  console.log(`阴贵神方位: ${lunar.getDayPositionYinGui()}`);

  // 时辰信息（只显示前3个作为示例）
  console.log('\n【时辰吉凶（示例前3个）】');
  const times = lunar.getTimes();
  times.slice(0, 3).forEach(time => {
    const ganZhi = time.getGanZhi();
    const yi = time.getYi();
    const ji = time.getJi();
    console.log(`${time.toString()} (${ganZhi})`);
    console.log(`  宜: ${yi.length > 0 ? yi.join('、') : '无'}`);
    console.log(`  忌: ${ji.length > 0 ? ji.join('、') : '无'}`);
  });
  console.log('... 共12个时辰');
});

console.log('\n========================================');
console.log('验证完成');
console.log('========================================');
console.log('\n请对比以下来源验证数据准确性:');
console.log('1. 中华万年历 App');
console.log('2. 日历通 App');
console.log('3. 在线黄历: https://www.bmcx.com/');
console.log('4. 寿星万年历（权威来源）\n');
