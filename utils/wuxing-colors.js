/**
 * 五行颜色配置
 * 全局统一的五行配色方案，用于日历、海报等各个场景
 */

const WUXING_COLORS = {
  // 金 - 金色/白色系
  jin: {
    primary: '#FFD700',    // 金色
    light: '#FFF8DC',      // 极淡金色（用于月历背景）
    medium: '#FFE97F',     // 中等金色
    dark: '#DAA520',       // 深金色
  },
  // 木 - 绿色系
  mu: {
    primary: '#4CAF50',    // 绿色
    light: '#E8F5E9',      // 极淡绿色（用于月历背景）
    medium: '#81C784',     // 中等绿色
    dark: '#2E7D32',       // 深绿色
  },
  // 水 - 蓝色系
  shui: {
    primary: '#2196F3',    // 蓝色
    light: '#E3F2FD',      // 极淡蓝色（用于月历背景）
    medium: '#64B5F6',     // 中等蓝色
    dark: '#1565C0',       // 深蓝色
  },
  // 火 - 红色系
  huo: {
    primary: '#F44336',    // 红色
    light: '#FFEBEE',      // 极淡红色（用于月历背景）
    medium: '#E57373',     // 中等红色
    dark: '#C62828',       // 深红色
  },
  // 土 - 黄色/棕色系
  tu: {
    primary: '#FF9800',    // 橙黄色
    light: '#FFF3E0',      // 极淡黄色（用于月历背景）
    medium: '#FFB74D',     // 中等黄色
    dark: '#E65100',       // 深橙色
  },
};

/**
 * 根据天干获取对应的五行拼音
 * @param {string} tiangan - 天干（甲、乙、丙、丁等）
 * @returns {string} 五行拼音（jin/mu/shui/huo/tu）
 */
function getTianganWuxingPinyin(tiangan) {
  const map = {
    '甲': 'mu',
    '乙': 'mu',
    '丙': 'huo',
    '丁': 'huo',
    '戊': 'tu',
    '己': 'tu',
    '庚': 'jin',
    '辛': 'jin',
    '壬': 'shui',
    '癸': 'shui',
  };
  return map[tiangan] || 'tu';
}

/**
 * 根据五行拼音获取颜色
 * @param {string} wuxingPinyin - 五行拼音（jin/mu/shui/huo/tu）
 * @param {string} shade - 色调（primary/light/medium/dark）
 * @returns {string} 颜色值
 */
function getWuxingColor(wuxingPinyin, shade = 'primary') {
  if (!WUXING_COLORS[wuxingPinyin]) {
    return WUXING_COLORS.tu[shade]; // 默认返回土的颜色
  }
  return WUXING_COLORS[wuxingPinyin][shade];
}

function hexToRgba(hex, alpha) {
  const cleaned = hex.replace('#', '');
  const full = cleaned.length === 3
    ? cleaned.split('').map(ch => ch + ch).join('')
    : cleaned;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getWuxingRgba(wuxingPinyin, alpha = 1, shade = 'primary') {
  return hexToRgba(getWuxingColor(wuxingPinyin, shade), alpha);
}

module.exports = {
  WUXING_COLORS,
  getTianganWuxingPinyin,
  getWuxingColor,
  getWuxingRgba,
};
