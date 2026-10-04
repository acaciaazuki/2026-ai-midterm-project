// 復古像素 8-bit：紅白機風格的像素圖
import { PIXEL_FONT, cellRect, drawPixelMap, edges, fillBackground, rotateMap } from './helpers.js';

const C = {
  outer: '#000000',
  board: '#1d2b53',
  boardAlt: '#22315e',
  passage: '#ffec27',
};

// 像素圖的字元與顏色
const PIXELS = {
  G: '#00e436', // 綠
  g: '#008751', // 深綠
  W: '#fff1e8', // 白
  K: '#000000', // 黑
  R: '#ff004d', // 紅
  s: '#ab5236', // 蘋果梗
  L: '#00e436', // 葉子
  B: '#ab5236', // 磚塊
  M: '#5f574f', // 磚縫
};

// 蛇身：綠色鱗片
const BODY = [
  '.GGGGGG.',
  'GgGGgGGG',
  'GGGGGGgG',
  'GgGGGGGG',
  'GGGgGGgG',
  'GGGGGGGG',
  'GgGGgGGG',
  '.GGGGGG.',
];

// 蛇頭（朝右），繪製時依前進方向旋轉
const HEAD = [
  '.GGGGGG.',
  'GGGGGGGG',
  'GGGGWWGG',
  'GGGGWKGG',
  'GGGGGGGG',
  'GGGGWWGG',
  'GGGGWKGG',
  '.GGGGGG.',
];

// 食物：紅蘋果加綠葉
const APPLE = [
  '...s....',
  '....sL..',
  '.RRsRRL.',
  'RRWRRRRR',
  'RWRRRRRR',
  'RRRRRRRR',
  '.RRRRRR.',
  '..RR.RR.',
];

// 障礙物與牆壁：磚塊
const BRICK = [
  'BBBMBBBB',
  'BBBMBBBB',
  'MMMMMMMM',
  'BBBBBBMB',
  'BBBBBBMB',
  'MMMMMMMM',
  'BBBMBBBB',
  'BBBMBBBB',
];

export default {
  id: 'retro8bit',
  nameKey: 'theme.retro8bit',
  pixelated: true,
  font: PIXEL_FONT,

  palette: () => ({
    colors: C,
    ui: {
      bg: '#000000',
      surface: '#1d2b53',
      text: '#fff1e8',
      muted: '#c2c3c7',
      accent: '#ffec27',
      'accent-text': '#000000',
      border: '#83769c',
      overlay: 'rgba(0, 0, 0, 0.8)',
      error: '#ff77a8',
    },
  }),

  // 地圖用兩種深藍交錯的棋盤格
  drawBackground(ctx, view, c) {
    fillBackground(ctx, view, c.outer, c.board);
    ctx.fillStyle = c.boardAlt;
    for (let y = 0; y < view.rows; y++) {
      for (let x = 0; x < view.cols; x++) {
        if ((x + y) % 2 === 1) {
          ctx.fillRect(x * view.cellSize, y * view.cellSize, view.cellSize, view.cellSize);
        }
      }
    }
  },

  // 牆壁鋪滿磚塊，可穿越的邊界是黃色虛線
  drawBorder(ctx, view, wrap, c) {
    const b = view.border;
    for (const edge of edges(view, wrap)) {
      if (edge.passable) {
        ctx.save();
        ctx.strokeStyle = c.passage;
        ctx.lineWidth = b / 3;
        ctx.setLineDash([b / 2, b / 2]);
        ctx.beginPath();
        ctx.moveTo(edge.x1, edge.y1);
        ctx.lineTo(edge.x2, edge.y2);
        ctx.stroke();
        ctx.restore();
        continue;
      }

      // 牆壁的範圍：中心線往兩側各延伸半個外框寬
      const horizontal = edge.y1 === edge.y2;
      const x = edge.x1 - b / 2;
      const y = edge.y1 - b / 2;
      const length = horizontal ? edge.x2 - edge.x1 + b : edge.y2 - edge.y1 + b;
      for (let offset = 0; offset < length; offset += b) {
        const tile = horizontal
          ? { x: x + offset, y, size: b }
          : { x, y: y + offset, size: b };
        drawPixelMap(ctx, tile, BRICK, PIXELS);
      }
    }
  },

  drawObstacle(ctx, view, cell) {
    drawPixelMap(ctx, cellRect(view, cell), BRICK, PIXELS);
  },

  drawFood(ctx, view, cell) {
    drawPixelMap(ctx, cellRect(view, cell, 1), APPLE, PIXELS);
  },

  drawSnake(ctx, view, snake, direction) {
    snake.slice(1).forEach((part) => drawPixelMap(ctx, cellRect(view, part), BODY, PIXELS));
    drawPixelMap(ctx, cellRect(view, snake[0]), rotateMap(HEAD, direction), PIXELS);
  },
};
