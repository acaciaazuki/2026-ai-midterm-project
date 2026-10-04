// 主題共用的繪圖工具
import { DIRECTIONS } from '../snake.js';

// 像素風主題的介面字型（定義在 css/style.css 的 @font-face）
export const PIXEL_FONT = '"Cubic 11", system-ui, sans-serif';

// 取得格子的繪圖範圍，inset 是四周內縮的像素
export function cellRect(view, cell, inset = 0) {
  const s = view.cellSize;
  return { x: cell.x * s + inset, y: cell.y * s + inset, size: s - inset * 2 };
}

// 填滿外框區域與地圖區域
export function fillBackground(ctx, view, outerColor, boardColor) {
  const { width, height, border } = view;
  ctx.fillStyle = outerColor;
  ctx.fillRect(-border, -border, width + border * 2, height + border * 2);
  ctx.fillStyle = boardColor;
  ctx.fillRect(0, 0, width, height);
}

export function fillRoundRect(ctx, rect, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.size, rect.size, radius);
  ctx.fill();
}

export function fillCircle(ctx, x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

// 四條邊界的線段位置（畫在外框正中間）
// 牆壁的端點在角落中心，搭配 square 或 round 線頭剛好補滿角落；
// 可穿越的邊界只畫地圖範圍內
// 回傳時牆壁排在後面，畫在可穿越的邊界之上，角落才會是完整的牆
export function edges(view, wrap) {
  const { width: w, height: h, border: b } = view;
  const m = b / 2;
  const [x1, x2] = wrap.y ? [0, w] : [-m, w + m];
  const [y1, y2] = wrap.x ? [0, h] : [-m, h + m];
  return [
    { side: 'top', x1, y1: -m, x2, y2: -m, passable: wrap.y },
    { side: 'bottom', x1, y1: h + m, x2, y2: h + m, passable: wrap.y },
    { side: 'left', x1: -m, y1, x2: -m, y2, passable: wrap.x },
    { side: 'right', x1: w + m, y1, x2: w + m, y2, passable: wrap.x },
  ].sort((a, c) => Number(c.passable) - Number(a.passable));
}

export function strokeEdge(ctx, edge, { color, width, dash = [], cap = 'butt' }) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = cap;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(edge.x1, edge.y1);
  ctx.lineTo(edge.x2, edge.y2);
  ctx.stroke();
  ctx.restore();
}

// 依前進方向計算兩隻眼睛的位置（偏向蛇頭前方）
export function eyePositions(rect, direction) {
  const forward = DIRECTIONS[direction];
  const side = { x: -forward.y, y: forward.x };
  const cx = rect.x + rect.size / 2 + forward.x * rect.size * 0.15;
  const cy = rect.y + rect.size / 2 + forward.y * rect.size * 0.15;
  const gap = rect.size * 0.22;
  return [
    { x: cx + side.x * gap, y: cy + side.y * gap },
    { x: cx - side.x * gap, y: cy - side.y * gap },
  ];
}

// 畫像素圖：map 是等長字串組成的陣列，每個字元對應 palette 裡的顏色，「.」表示透明
export function drawPixelMap(ctx, rect, map, palette) {
  const px = rect.size / map.length;
  map.forEach((row, y) => {
    [...row].forEach((char, x) => {
      if (char === '.') return;
      ctx.fillStyle = palette[char];
      ctx.fillRect(rect.x + x * px, rect.y + y * px, Math.ceil(px), Math.ceil(px));
    });
  });
}

// 格子的中心點座標
export function cellCenter(view, cell) {
  return {
    x: cell.x * view.cellSize + view.cellSize / 2,
    y: cell.y * view.cellSize + view.cellSize / 2,
  };
}

// 把蛇身切成幾段連續的部分：穿牆時前後兩節不相鄰，線條要在那裡斷開
export function snakeRuns(snake) {
  const runs = [[snake[0]]];
  for (let i = 1; i < snake.length; i++) {
    const prev = snake[i - 1];
    const part = snake[i];
    if (Math.abs(prev.x - part.x) + Math.abs(prev.y - part.y) === 1) {
      runs.at(-1).push(part);
    } else {
      runs.push([part]);
    }
  }
  return runs;
}

// 依前進方向旋轉像素圖（原圖朝右，每次順時針轉 90 度）
const QUARTER_TURNS = { right: 0, down: 1, left: 2, up: 3 };

export function rotateMap(map, direction) {
  let result = map;
  for (let turn = 0; turn < QUARTER_TURNS[direction]; turn++) {
    const n = result.length;
    result = result.map((_, y) =>
      Array.from({ length: n }, (_, x) => result[n - 1 - x][y]).join(''),
    );
  }
  return result;
}
