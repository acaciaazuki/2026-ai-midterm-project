// 手繪筆記本：方格紙背景、鉛筆筆觸
// 手繪的抖動由格子座標算出固定值，所以畫面不會一直閃動
import { cellCenter, cellRect, edges, fillBackground, snakeRuns } from './helpers.js';

const C = {
  outer: '#f3eedf',
  board: '#fdfbf4',
  grid: '#d3e2f2',
  pencil: '#3b3b3b',
  pencilLight: 'rgba(59, 59, 59, 0.5)',
  redPen: '#d93636',
  leaf: '#3a8f3a',
};

// 依座標產生 -1 到 1 之間的固定亂數（同樣的輸入永遠得到同樣的結果）
function jitter(x, y, seed) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

// 把點稍微偏移，模擬手畫的不精準
function wobble(point, amount, seed) {
  return {
    x: point.x + jitter(point.x, point.y, seed) * amount,
    y: point.y + jitter(point.y, point.x, seed + 1) * amount,
  };
}

// 用抖動過的點畫一條折線
function pencilLine(ctx, points, amount, seed) {
  const shaky = points.map((p, i) => wobble(p, amount, seed + i));
  ctx.beginPath();
  ctx.moveTo(shaky[0].x, shaky[0].y);
  for (const p of shaky.slice(1)) ctx.lineTo(p.x, p.y);
  ctx.stroke();
}

export default {
  id: 'notebook',
  nameKey: 'theme.notebook',
  pixelated: false,

  palette: () => ({
    colors: C,
    ui: {
      bg: '#f3eedf',
      surface: '#fffdf7',
      text: '#2b2b2b',
      muted: '#555555',
      accent: '#2f5fa7',
      'accent-text': '#ffffff',
      border: '#b9c7d8',
      overlay: 'rgba(243, 238, 223, 0.85)',
      error: '#c62828',
    },
  }),

  // 方格紙：淡藍色格線
  drawBackground(ctx, view, c) {
    fillBackground(ctx, view, c.outer, c.board);
    ctx.fillStyle = c.grid;
    for (let x = 1; x < view.cols; x++) ctx.fillRect(x * view.cellSize, 0, 1, view.height);
    for (let y = 1; y < view.rows; y++) ctx.fillRect(0, y * view.cellSize, view.width, 1);
  },

  // 牆壁是兩條平行的鉛筆線，可穿越的邊界是鉛筆虛線
  drawBorder(ctx, view, wrap, c) {
    ctx.save();
    ctx.strokeStyle = c.pencil;
    ctx.lineCap = 'round';
    for (const edge of edges(view, wrap)) {
      const start = { x: edge.x1, y: edge.y1 };
      const end = { x: edge.x2, y: edge.y2 };
      if (edge.passable) {
        ctx.lineWidth = 1.5;
        ctx.setLineDash([view.cellSize / 3, view.cellSize / 4]);
        pencilLine(ctx, [start, end], 1.5, 3);
        ctx.setLineDash([]);
        continue;
      }
      const horizontal = edge.y1 === edge.y2;
      const gap = view.border / 5;
      ctx.lineWidth = 2;
      for (const sign of [-1, 1]) {
        const dx = horizontal ? 0 : gap * sign;
        const dy = horizontal ? gap * sign : 0;
        pencilLine(
          ctx,
          [
            { x: start.x + dx, y: start.y + dy },
            { x: end.x + dx, y: end.y + dy },
          ],
          1.5,
          sign + 7,
        );
      }
    }
    ctx.restore();
  },

  // 障礙物：歪歪的方框加斜線排線
  drawObstacle(ctx, view, cell, c) {
    const r = cellRect(view, cell, 3);
    ctx.save();
    ctx.strokeStyle = c.pencil;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    const corners = [
      { x: r.x, y: r.y },
      { x: r.x + r.size, y: r.y },
      { x: r.x + r.size, y: r.y + r.size },
      { x: r.x, y: r.y + r.size },
      { x: r.x, y: r.y },
    ];
    pencilLine(ctx, corners, 1.2, cell.x * 31 + cell.y);
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const t = (r.size / 4) * i;
      pencilLine(
        ctx,
        [
          { x: r.x + t, y: r.y + r.size },
          { x: r.x + r.size, y: r.y + t },
        ],
        0.8,
        i,
      );
      pencilLine(
        ctx,
        [
          { x: r.x, y: r.y + t },
          { x: r.x + t, y: r.y },
        ],
        0.8,
        i + 5,
      );
    }
    ctx.restore();
  },

  // 食物：紅筆畫兩圈的塗鴉蘋果，加上梗和葉子
  drawFood(ctx, view, cell, c) {
    const center = cellCenter(view, cell);
    const radius = view.cellSize * 0.3;
    ctx.save();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = c.redPen;
    for (const offset of [0, 1.2]) {
      ctx.beginPath();
      ctx.ellipse(center.x + offset, center.y + 1, radius, radius * 0.92, offset, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = c.pencil;
    ctx.beginPath();
    ctx.moveTo(center.x, center.y - radius + 1);
    ctx.lineTo(center.x + 1, center.y - radius - 4);
    ctx.stroke();
    ctx.strokeStyle = c.leaf;
    ctx.beginPath();
    ctx.ellipse(center.x + 4, center.y - radius - 2, 3, 1.5, -0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  // 蛇身是鉛筆粗線，蛇頭是圓形加點點眼睛
  drawSnake(ctx, view, snake, direction, c) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const run of snakeRuns(snake)) {
      const points = run.map((part) => cellCenter(view, part));
      if (points.length === 1) points.push(points[0]);
      // 先畫一條粗的淡線當作底色，再畫兩條細線模擬鉛筆來回塗
      ctx.strokeStyle = c.pencilLight;
      ctx.lineWidth = view.cellSize * 0.6;
      pencilLine(ctx, points, 1, 11);
      ctx.strokeStyle = c.pencil;
      ctx.lineWidth = 2;
      pencilLine(ctx, points, 2.5, 13);
      pencilLine(ctx, points, 2.5, 17);
    }

    const head = cellCenter(view, snake[0]);
    ctx.fillStyle = c.board;
    ctx.strokeStyle = c.pencil;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(head.x, head.y, view.cellSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 眼睛朝前進方向
    const forward = { right: [1, 0], left: [-1, 0], up: [0, -1], down: [0, 1] }[direction];
    const side = [-forward[1], forward[0]];
    ctx.fillStyle = c.pencil;
    for (const sign of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(
        head.x + forward[0] * 4 + side[0] * 4 * sign,
        head.y + forward[1] * 4 + side[1] * 4 * sign,
        1.8,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  },
};
