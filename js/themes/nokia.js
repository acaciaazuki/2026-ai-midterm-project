// Nokia 懷舊：淡綠色液晶底、深色方塊、細格線
import { cellRect, drawPixelMap, edges, eyePositions, fillBackground, strokeEdge } from './helpers.js';

const C = {
  outer: '#a9be86',
  board: '#b8cc8f',
  grid: 'rgba(42, 51, 32, 0.08)',
  ink: '#2a3320',
};

// 食物：菱形外框
const FOOD = ['..#..', '.#.#.', '#...#', '.#.#.', '..#..'];

export default {
  id: 'nokia',
  nameKey: 'theme.nokia',
  pixelated: true,

  palette: () => ({
    colors: C,
    ui: {
      bg: '#a9be86',
      surface: '#c4d6a0',
      text: '#1f261a',
      muted: '#3d4932',
      accent: '#2a3320',
      'accent-text': '#c4d6a0',
      border: '#2a3320',
      overlay: 'rgba(169, 190, 134, 0.85)',
      error: '#5a1a1a',
    },
  }),

  // 液晶底加上細格線
  drawBackground(ctx, view, c) {
    fillBackground(ctx, view, c.outer, c.board);
    ctx.fillStyle = c.grid;
    for (let x = 1; x < view.cols; x++) ctx.fillRect(x * view.cellSize, 0, 1, view.height);
    for (let y = 1; y < view.rows; y++) ctx.fillRect(0, y * view.cellSize, view.width, 1);
  },

  // 牆壁是粗實線，可穿越的邊界是點線
  drawBorder(ctx, view, wrap, c) {
    const dot = view.cellSize / 6;
    for (const edge of edges(view, wrap)) {
      strokeEdge(
        ctx,
        edge,
        edge.passable
          ? { color: c.ink, width: view.border / 3, dash: [dot, dot] }
          : { color: c.ink, width: view.border / 2, cap: 'square' },
      );
    }
  },

  // 障礙物：棋盤格
  drawObstacle(ctx, view, cell, c) {
    const rect = cellRect(view, cell, 2);
    const step = rect.size / 4;
    ctx.fillStyle = c.ink;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        if ((x + y) % 2 === 0) ctx.fillRect(rect.x + x * step, rect.y + y * step, step, step);
      }
    }
  },

  drawFood(ctx, view, cell, c) {
    drawPixelMap(ctx, cellRect(view, cell, 3), FOOD, { '#': c.ink });
  },

  // 蛇身是留細縫的深色方塊，蛇頭有兩個方形眼睛
  drawSnake(ctx, view, snake, direction, c) {
    ctx.fillStyle = c.ink;
    for (const part of snake) {
      const rect = cellRect(view, part, 2);
      ctx.fillRect(rect.x, rect.y, rect.size, rect.size);
    }

    const head = cellRect(view, snake[0]);
    const eye = head.size / 8;
    ctx.fillStyle = c.board;
    for (const p of eyePositions(head, direction)) {
      ctx.fillRect(p.x - eye / 2, p.y - eye / 2, eye, eye);
    }
  },
};
