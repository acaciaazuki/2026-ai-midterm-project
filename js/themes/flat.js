// 簡約扁平：圓角方塊、柔和配色，跟著系統的淺色或深色模式切換
import {
  cellRect,
  edges,
  eyePositions,
  fillBackground,
  fillCircle,
  fillRoundRect,
  strokeEdge,
} from './helpers.js';

const LIGHT = {
  colors: {
    outer: '#f5f5f0',
    board: '#ffffff',
    wall: '#5f6b73',
    passage: '#4caf50',
    obstacle: '#9aa5ad',
    snakeHead: '#2e7d32',
    snakeBody: '#66bb6a',
    eye: '#ffffff',
    pupil: '#1b1b1b',
    food: '#e53935',
  },
  ui: {
    bg: '#f5f5f0',
    surface: '#ffffff',
    text: '#222222',
    muted: '#5f6368',
    accent: '#2e7d32',
    'accent-text': '#ffffff',
    border: '#cccccc',
    overlay: 'rgba(245, 245, 240, 0.85)',
    error: '#c62828',
  },
};

const DARK = {
  colors: {
    outer: '#15181c',
    board: '#1f2329',
    wall: '#8a96a0',
    passage: '#66bb6a',
    obstacle: '#4a535c',
    snakeHead: '#81c784',
    snakeBody: '#43a047',
    eye: '#ffffff',
    pupil: '#111111',
    food: '#ff6b6b',
  },
  ui: {
    bg: '#15181c',
    surface: '#252a31',
    text: '#e8eaed',
    muted: '#a0a7af',
    accent: '#66bb6a',
    'accent-text': '#0d1a0e',
    border: '#3a414a',
    overlay: 'rgba(21, 24, 28, 0.85)',
    error: '#ff8a80',
  },
};

export default {
  id: 'flat',
  nameKey: 'theme.flat',
  pixelated: false,

  palette: ({ dark }) => (dark ? DARK : LIGHT),

  drawBackground(ctx, view, c) {
    fillBackground(ctx, view, c.outer, c.board);
  },

  // 牆壁是圓頭實線，可穿越的邊界是虛線
  drawBorder(ctx, view, wrap, c) {
    for (const edge of edges(view, wrap)) {
      strokeEdge(
        ctx,
        edge,
        edge.passable
          ? { color: c.passage, width: view.border / 2, dash: [view.cellSize / 2, view.cellSize / 3] }
          : { color: c.wall, width: view.border / 2, cap: 'round' },
      );
    }
  },

  drawObstacle(ctx, view, cell, c) {
    const rect = cellRect(view, cell, 2);
    fillRoundRect(ctx, rect, rect.size * 0.25, c.obstacle);
  },

  drawFood(ctx, view, cell, c) {
    const rect = cellRect(view, cell);
    fillCircle(ctx, rect.x + rect.size / 2, rect.y + rect.size / 2, rect.size * 0.36, c.food);
  },

  drawSnake(ctx, view, snake, direction, c) {
    snake.forEach((part, i) => {
      const rect = cellRect(view, part, 1);
      fillRoundRect(ctx, rect, rect.size * 0.3, i === 0 ? c.snakeHead : c.snakeBody);
    });

    const head = cellRect(view, snake[0]);
    for (const eye of eyePositions(head, direction)) {
      fillCircle(ctx, eye.x, eye.y, head.size * 0.12, c.eye);
      fillCircle(ctx, eye.x, eye.y, head.size * 0.06, c.pupil);
    }
  },
};
