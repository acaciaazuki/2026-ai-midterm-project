// 霓虹賽博：黑底、發光的螢光線條
// 系統開啟「減少動態效果」時，食物不閃爍、通道虛線不流動
import { cellCenter, cellRect, edges, fillBackground, fillCircle, snakeRuns } from './helpers.js';

const C = {
  outer: '#05030d',
  board: '#0a0618',
  grid: 'rgba(140, 90, 255, 0.12)',
  snake: '#00f0ff',
  head: '#b3fcff',
  food: '#ff2bd6',
  obstacle: '#ff8a00',
  wall: '#ff3c8e',
  passage: '#00f0ff',
};

// 設定發光效果；記得用 save()／restore() 包起來，避免影響其他繪圖
function glow(ctx, color, blur) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
}

export default {
  id: 'neon',
  nameKey: 'theme.neon',
  pixelated: false,

  palette: () => ({
    colors: C,
    ui: {
      bg: '#05030d',
      surface: '#140d2b',
      text: '#f2eaff',
      muted: '#b9a8e0',
      accent: '#00f0ff',
      'accent-text': '#05030d',
      border: '#5b3fa8',
      overlay: 'rgba(5, 3, 13, 0.85)',
      error: '#ff7aa8',
    },
  }),

  drawBackground(ctx, view, c) {
    fillBackground(ctx, view, c.outer, c.board);
    ctx.fillStyle = c.grid;
    for (let x = 1; x < view.cols; x++) ctx.fillRect(x * view.cellSize, 0, 1, view.height);
    for (let y = 1; y < view.rows; y++) ctx.fillRect(0, y * view.cellSize, view.width, 1);
  },

  // 牆壁是粉紅發光實線，可穿越的邊界是青色發光虛線（會往前流動）
  drawBorder(ctx, view, wrap, c) {
    for (const edge of edges(view, wrap)) {
      ctx.save();
      ctx.lineWidth = view.border / 3;
      ctx.lineCap = edge.passable ? 'butt' : 'round';
      ctx.strokeStyle = edge.passable ? c.passage : c.wall;
      glow(ctx, ctx.strokeStyle, 12);
      if (edge.passable) {
        ctx.setLineDash([view.cellSize / 2, view.cellSize / 3]);
        ctx.lineDashOffset = view.reducedMotion ? 0 : -view.time / 40;
      }
      ctx.beginPath();
      ctx.moveTo(edge.x1, edge.y1);
      ctx.lineTo(edge.x2, edge.y2);
      ctx.stroke();
      ctx.restore();
    }
  },

  drawObstacle(ctx, view, cell, c) {
    const rect = cellRect(view, cell, 4);
    ctx.save();
    ctx.strokeStyle = c.obstacle;
    ctx.lineWidth = 2;
    glow(ctx, c.obstacle, 10);
    ctx.strokeRect(rect.x, rect.y, rect.size, rect.size);
    ctx.restore();
  },

  // 食物像呼吸一樣忽大忽小
  drawFood(ctx, view, cell, c) {
    const pulse = view.reducedMotion ? 1 : 0.85 + 0.15 * Math.sin(view.time / 200);
    const center = cellCenter(view, cell);
    ctx.save();
    glow(ctx, c.food, 18 * pulse);
    fillCircle(ctx, center.x, center.y, view.cellSize * 0.28 * pulse, c.food);
    ctx.restore();
  },

  // 蛇身畫成一條連續的發光線條，穿牆的地方斷開
  drawSnake(ctx, view, snake, direction, c) {
    ctx.save();
    ctx.strokeStyle = c.snake;
    ctx.fillStyle = c.snake;
    ctx.lineWidth = view.cellSize * 0.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    glow(ctx, c.snake, 14);

    for (const run of snakeRuns(snake)) {
      const points = run.map((part) => cellCenter(view, part));
      if (points.length === 1) {
        fillCircle(ctx, points[0].x, points[0].y, ctx.lineWidth / 2, c.snake);
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (const p of points.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    // 蛇頭用更亮的顏色
    const head = cellCenter(view, snake[0]);
    glow(ctx, c.head, 20);
    fillCircle(ctx, head.x, head.y, view.cellSize * 0.32, c.head);
    ctx.restore();
  },
};
