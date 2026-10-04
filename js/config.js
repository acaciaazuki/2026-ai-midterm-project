// 遊戲常數：可調整的數值集中在這裡

// 地圖格數與每格的像素大小
export const GRID = { cols: 20, rows: 20, cellSize: 24 };

// 蛇的初始長度
export const START_LENGTH = 3;

// 輸入佇列最多暫存的方向數，防止快速連按時回頭撞到自己
export const MAX_QUEUED_INPUTS = 2;

// 穿牆規則：x 為 true 表示左右邊界相通，y 為 true 表示上下邊界相通
export const WRAP_RULES = {
  both: { x: true, y: true }, // 全部可穿越
  vertical: { x: false, y: true }, // 只能上下穿越
  horizontal: { x: true, y: false }, // 只能左右穿越
  none: { x: false, y: false }, // 全部是牆
};

// 難度設定
// startTickMs：初始移動間隔（毫秒），數值越小越快
// speedupEvery：每吃幾個食物加速一次，0 表示不加速
// speedupMs：每次加速縮短的毫秒數
// minTickMs：加速的上限（最短間隔）
// classicWrap：經典模式使用的穿牆規則
export const DIFFICULTIES = {
  easy: {
    startTickMs: 180,
    speedupEvery: 0,
    speedupMs: 0,
    minTickMs: 180,
    classicWrap: 'both',
  },
  normal: {
    startTickMs: 140,
    speedupEvery: 5,
    speedupMs: 10,
    minTickMs: 70,
    classicWrap: 'none',
  },
  hard: {
    startTickMs: 100,
    speedupEvery: 3,
    speedupMs: 8,
    minTickMs: 50,
    classicWrap: 'none',
  },
};

// 主選單的預設值
export const DEFAULT_SETTINGS = {
  difficulty: 'normal',
};
