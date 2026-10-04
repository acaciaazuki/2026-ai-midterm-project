// Game Boy 四色：只用四種綠色的像素風
import { cellRect, drawPixelMap, edges, eyePositions, fillBackground, strokeEdge } from './helpers.js';

// 四種顏色由深到淺
const C = {
  darkest: '#0f380f',
  dark: '#306230',
  light: '#8bac0f',
  lightest: '#9bbc0f',
};

// 像素圖的字元：k 最深色、d 深色、l 淺色
const PIXELS = { k: C.darkest, d: C.dark, l: C.light };

// 食物：像素蘋果
const APPLE = [
  '....k...',
  '...k....',
  '.kkkkkk.',
  'kkllkkkk',
  'klkkkkkk',
  'kkkkkkkk',
  '.kkkkkk.',
  '..kk.kk.',
];

// 障礙物：磚塊
const BRICK = [
  'kkkkkkkk',
  'dddkdddd',
  'dddkdddd',
  'kkkkkkkk',
  'dkddddkd',
  'dkddddkd',
  'kkkkkkkk',
  'dddkdddd',
];

export default {
  id: 'gameboy',
  nameKey: 'theme.gameboy',
  pixelated: true,

  palette: () => ({
    colors: C,
    ui: {
      bg: C.light,
      surface: C.lightest,
      text: C.darkest,
      // 只有四種顏色，深色在淺底上對比不足，次要文字也用最深色
      muted: C.darkest,
      accent: C.darkest,
      'accent-text': C.lightest,
      border: C.darkest,
      overlay: 'rgba(139, 172, 15, 0.85)',
      error: C.darkest,
    },
  }),

  drawBackground(ctx, view, c) {
    fillBackground(ctx, view, c.light, c.lightest);
  },

  // 牆壁是最深色實線，可穿越的邊界是深色虛線
  drawBorder(ctx, view, wrap, c) {
    for (const edge of edges(view, wrap)) {
      strokeEdge(
        ctx,
        edge,
        edge.passable
          ? { color: c.dark, width: view.border / 2, dash: [view.cellSize / 3, view.cellSize / 4] }
          : { color: c.darkest, width: view.border / 2, cap: 'square' },
      );
    }
  },

  drawObstacle(ctx, view, cell) {
    drawPixelMap(ctx, cellRect(view, cell), BRICK, PIXELS);
  },

  drawFood(ctx, view, cell) {
    drawPixelMap(ctx, cellRect(view, cell, 1), APPLE, PIXELS);
  },

  // 蛇身是深色方塊加淺色中心，蛇頭是最深色加淺色眼睛
  drawSnake(ctx, view, snake, direction, c) {
    snake.forEach((part, i) => {
      const rect = cellRect(view, part, 1);
      ctx.fillStyle = i === 0 ? c.darkest : c.dark;
      ctx.fillRect(rect.x, rect.y, rect.size, rect.size);
      if (i > 0) {
        const inner = cellRect(view, part, view.cellSize * 0.35);
        ctx.fillStyle = c.light;
        ctx.fillRect(inner.x, inner.y, inner.size, inner.size);
      }
    });

    const head = cellRect(view, snake[0]);
    const eye = Math.round(head.size / 6);
    ctx.fillStyle = c.lightest;
    for (const p of eyePositions(head, direction)) {
      ctx.fillRect(Math.round(p.x - eye / 2), Math.round(p.y - eye / 2), eye, eye);
    }
  },
};
