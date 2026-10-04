// 繪圖：依目前的主題把遊戲狀態畫到 Canvas 上，並套用介面配色

export function createRenderer(canvas, { cols, rows, cellSize }) {
  // 地圖四周留半格寬的外框，用來畫牆壁或可穿越的通道
  const border = Math.round(cellSize / 2);
  const view = { cols, rows, cellSize, border, width: cols * cellSize, height: rows * cellSize };
  canvas.width = view.width + border * 2;
  canvas.height = view.height + border * 2;
  const ctx = canvas.getContext('2d');

  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  let theme = null;
  let colors = null;

  // 取得主題配色，並把介面配色寫進 CSS 變數
  function applyTheme() {
    const palette = theme.palette({ dark: darkQuery.matches });
    colors = palette.colors;
    for (const [name, value] of Object.entries(palette.ui)) {
      document.documentElement.style.setProperty(`--color-${name}`, value);
    }
    // 像素風主題在畫面縮放時保持清晰的像素邊緣
    canvas.style.imageRendering = theme.pixelated ? 'pixelated' : 'auto';
  }

  // 系統切換淺色或深色模式時重新套用（目前只有簡約扁平會變化）
  darkQuery.addEventListener('change', () => {
    if (theme) applyTheme();
  });

  return {
    setTheme(next) {
      theme = next;
      applyTheme();
    },

    // game 為 null 時（例如在主選單）只畫空白的地圖與四周的牆
    render(game) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = !theme.pixelated;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 之後的座標都以地圖左上角為原點
      ctx.translate(border, border);
      theme.drawBackground(ctx, view, colors);
      theme.drawBorder(ctx, view, game ? game.wrap : { x: false, y: false }, colors);
      if (!game) return;

      for (const cell of game.obstacles) theme.drawObstacle(ctx, view, cell, colors);
      if (game.food) theme.drawFood(ctx, view, game.food, colors);
      theme.drawSnake(ctx, view, game.snake, game.direction, colors);
    },
  };
}
