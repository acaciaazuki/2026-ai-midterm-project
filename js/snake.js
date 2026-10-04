// 蛇的移動與碰撞判定：只處理格子座標，不碰 DOM 與 Canvas

// 各方向每次移動的位移量
export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

// 判斷兩個方向是否相反（蛇不能直接回頭）
export function isOpposite(a, b) {
  const da = DIRECTIONS[a];
  const db = DIRECTIONS[b];
  return da.x + db.x === 0 && da.y + db.y === 0;
}

// 建立蛇身陣列：第一個元素是蛇頭，身體往前進方向的反方向延伸
export function createSnake(head, direction, length) {
  const { x: dx, y: dy } = DIRECTIONS[direction];
  const body = [];
  for (let i = 0; i < length; i++) {
    body.push({ x: head.x - dx * i, y: head.y - dy * i });
  }
  return body;
}

// 計算蛇頭移動後的位置
// wrap.x 為 true 時左右邊界相通，wrap.y 為 true 時上下邊界相通
// 撞到不能穿越的邊界時回傳 null
export function moveHead(head, direction, cols, rows, wrap) {
  const { x: dx, y: dy } = DIRECTIONS[direction];
  let x = head.x + dx;
  let y = head.y + dy;

  if (x < 0 || x >= cols) {
    if (!wrap.x) return null;
    x = (x + cols) % cols;
  }
  if (y < 0 || y >= rows) {
    if (!wrap.y) return null;
    y = (y + rows) % rows;
  }
  return { x, y };
}

// 判斷某個格子是否被蛇身佔用
export function occupies(body, cell) {
  return body.some((part) => part.x === cell.x && part.y === cell.y);
}
