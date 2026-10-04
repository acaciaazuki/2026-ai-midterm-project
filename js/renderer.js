// 繪圖：只負責把遊戲狀態畫到 Canvas 上

// 暫時的配色，第 5 階段改由主題系統提供
const COLORS = {
  board: '#ffffff',
  snakeHead: '#2e7d32',
  snakeBody: '#66bb6a',
  food: '#e53935',
};

export function createRenderer(canvas, { cols, rows, cellSize }) {
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;
  const ctx = canvas.getContext('2d');

  // 畫一個格子，四周留 1 像素間隙讓蛇身看得出分節
  function drawCell(cell, color) {
    ctx.fillStyle = color;
    ctx.fillRect(cell.x * cellSize + 1, cell.y * cellSize + 1, cellSize - 2, cellSize - 2);
  }

  return function render(game) {
    ctx.fillStyle = COLORS.board;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (game.food) drawCell(game.food, COLORS.food);

    game.snake.forEach((part, i) => {
      drawCell(part, i === 0 ? COLORS.snakeHead : COLORS.snakeBody);
    });
  };
}
