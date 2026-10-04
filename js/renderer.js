// 繪圖：只負責把遊戲狀態畫到 Canvas 上

// 暫時的配色，第 5 階段改由主題系統提供
const COLORS = {
  background: '#f5f5f0',
  board: '#ffffff',
  wall: '#555555',
  passage: '#66bb6a',
  obstacle: '#8d8d8d',
  snakeHead: '#2e7d32',
  snakeBody: '#66bb6a',
  food: '#e53935',
};

export function createRenderer(canvas, { cols, rows, cellSize }) {
  // 地圖四周留半格寬的外框，用來畫牆壁或可穿越的通道
  const border = Math.round(cellSize / 2);
  const width = cols * cellSize;
  const height = rows * cellSize;
  canvas.width = width + border * 2;
  canvas.height = height + border * 2;
  const ctx = canvas.getContext('2d');

  // 畫一個格子，四周留 1 像素間隙讓蛇身看得出分節
  function drawCell(cell, color) {
    ctx.fillStyle = color;
    ctx.fillRect(cell.x * cellSize + 1, cell.y * cellSize + 1, cellSize - 2, cellSize - 2);
  }

  // 畫一條邊界：牆壁是實線，可穿越的邊界是虛線
  function drawEdge(x1, y1, x2, y2, passable) {
    ctx.save();
    ctx.lineWidth = border / 2;
    ctx.strokeStyle = passable ? COLORS.passage : COLORS.wall;
    ctx.setLineDash(passable ? [cellSize / 2, cellSize / 2] : []);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  function drawBorder(wrap) {
    const half = border / 2;
    drawEdge(-half, -half, width + half, -half, wrap.y); // 上
    drawEdge(-half, height + half, width + half, height + half, wrap.y); // 下
    drawEdge(-half, -half, -half, height + half, wrap.x); // 左
    drawEdge(width + half, -half, width + half, height + half, wrap.x); // 右
  }

  // game 為 null 時（例如在主選單）只畫空白的地圖
  return function render(game) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 之後的座標都以地圖左上角為原點
    ctx.translate(border, border);
    ctx.fillStyle = COLORS.board;
    ctx.fillRect(0, 0, width, height);
    if (!game) return;

    drawBorder(game.wrap);
    game.obstacles.forEach((cell) => drawCell(cell, COLORS.obstacle));
    if (game.food) drawCell(game.food, COLORS.food);
    game.snake.forEach((part, i) => {
      drawCell(part, i === 0 ? COLORS.snakeHead : COLORS.snakeBody);
    });
  };
}
