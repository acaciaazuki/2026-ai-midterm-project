// 遊戲常數：可調整的數值集中在這裡

// 地圖格數與每格的像素大小
export const GRID = { cols: 20, rows: 20, cellSize: 20 };

// 蛇的初始長度
export const START_LENGTH = 3;

// 每次移動的間隔（毫秒），數值越小移動越快
export const TICK_MS = 130;

// 輸入佇列最多暫存的方向數，防止快速連按時回頭撞到自己
export const MAX_QUEUED_INPUTS = 2;
