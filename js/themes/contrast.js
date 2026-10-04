// 高對比無障礙：黑底高對比配色，並用形狀區分物件，色盲玩家也能分辨
//   蛇：黃色方塊（蛇頭加白色粗框）
//   食物：青色圓形
//   障礙物：白框方塊畫叉
//   邊界：牆壁是白色粗實線，可穿越的邊界是黃色虛線加上向外的箭頭
import { cellRect, edges, eyePositions, fillBackground, fillCircle, strokeEdge } from './helpers.js';

const C = {
  background: '#000000',
  wall: '#ffffff',
  passage: '#ffff00',
  obstacle: '#ffffff',
  snake: '#ffff00',
  headOutline: '#ffffff',
  eye: '#000000',
  food: '#00ffff',
};

// 箭頭往地圖外的方向
const OUTWARD = {
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export default {
  id: 'contrast',
  nameKey: 'theme.contrast',
  pixelated: false,

  palette: () => ({
    colors: C,
    ui: {
      bg: '#000000',
      surface: '#000000',
      text: '#ffffff',
      muted: '#e0e0e0',
      accent: '#ffff00',
      'accent-text': '#000000',
      border: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.88)',
      error: '#ff8080',
    },
  }),

  drawBackground(ctx, view, c) {
    fillBackground(ctx, view, c.background, c.background);
  },

  drawBorder(ctx, view, wrap, c) {
    for (const edge of edges(view, wrap)) {
      if (!edge.passable) {
        strokeEdge(ctx, edge, { color: c.wall, width: view.border * 0.6, cap: 'square' });
        continue;
      }
      strokeEdge(ctx, edge, {
        color: c.passage,
        width: view.border * 0.3,
        dash: [view.cellSize / 2, view.cellSize / 3],
      });
      drawArrow(ctx, edge, view.border * 0.45, c.passage);
    }
  },

  drawObstacle(ctx, view, cell, c) {
    const rect = cellRect(view, cell, 3);
    ctx.save();
    ctx.strokeStyle = c.obstacle;
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x, rect.y, rect.size, rect.size);
    ctx.beginPath();
    ctx.moveTo(rect.x, rect.y);
    ctx.lineTo(rect.x + rect.size, rect.y + rect.size);
    ctx.moveTo(rect.x + rect.size, rect.y);
    ctx.lineTo(rect.x, rect.y + rect.size);
    ctx.stroke();
    ctx.restore();
  },

  drawFood(ctx, view, cell, c) {
    const rect = cellRect(view, cell);
    fillCircle(ctx, rect.x + rect.size / 2, rect.y + rect.size / 2, rect.size * 0.38, c.food);
  },

  drawSnake(ctx, view, snake, direction, c) {
    ctx.fillStyle = c.snake;
    for (const part of snake.slice(1)) {
      const rect = cellRect(view, part, 2);
      ctx.fillRect(rect.x, rect.y, rect.size, rect.size);
    }

    const head = cellRect(view, snake[0], 2);
    ctx.fillRect(head.x, head.y, head.size, head.size);
    ctx.save();
    ctx.strokeStyle = c.headOutline;
    ctx.lineWidth = 3;
    ctx.strokeRect(head.x + 1.5, head.y + 1.5, head.size - 3, head.size - 3);
    ctx.restore();

    const eye = head.size / 6;
    ctx.fillStyle = c.eye;
    for (const p of eyePositions(cellRect(view, snake[0]), direction)) {
      ctx.fillRect(p.x - eye / 2, p.y - eye / 2, eye, eye);
    }
  },
};

// 在可穿越邊界的正中間畫一個朝外的三角形箭頭
function drawArrow(ctx, edge, size, color) {
  const dir = OUTWARD[edge.side];
  const cx = (edge.x1 + edge.x2) / 2;
  const cy = (edge.y1 + edge.y2) / 2;
  const side = { x: -dir.y, y: dir.x };
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx + dir.x * size, cy + dir.y * size);
  ctx.lineTo(cx - dir.x * size + side.x * size * 1.5, cy - dir.y * size + side.y * size * 1.5);
  ctx.lineTo(cx - dir.x * size - side.x * size * 1.5, cy - dir.y * size - side.y * size * 1.5);
  ctx.closePath();
  ctx.fill();
}
