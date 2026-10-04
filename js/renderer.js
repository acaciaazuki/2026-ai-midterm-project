// 繪圖：依目前的主題把遊戲狀態畫到 Canvas 上，並套用介面配色

export function createRenderer(canvas, { cols, rows, cellSize }) {
  // 地圖四周留半格寬的外框，用來畫牆壁或可穿越的通道
  const border = Math.round(cellSize / 2);
  const view = { cols, rows, cellSize, border, width: cols * cellSize, height: rows * cellSize };

  // 邏輯尺寸：主題繪圖時使用的座標範圍，不受螢幕大小影響
  const logicalWidth = view.width + border * 2;
  const logicalHeight = view.height + border * 2;
  canvas.style.aspectRatio = `${logicalWidth} / ${logicalHeight}`;
  const ctx = canvas.getContext('2d');

  // 實際解析度 = 顯示大小 × 裝置像素比，手機等高解析度螢幕上才不會模糊
  // 繪圖時再用 scale 縮放回邏輯尺寸，主題的程式碼不用處理螢幕大小
  let scale = 1;
  function resize() {
    const displayWidth = canvas.clientWidth || logicalWidth;
    scale = (displayWidth * (window.devicePixelRatio || 1)) / logicalWidth;
    canvas.width = Math.round(logicalWidth * scale);
    canvas.height = Math.round(logicalHeight * scale);
  }
  resize();
  // 顯示大小改變（旋轉螢幕、調整視窗）或縮放頁面時重新計算
  new ResizeObserver(resize).observe(canvas);
  window.addEventListener('resize', resize);

  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let theme = null;
  let colors = null;

  // 取得主題配色，並把介面配色寫進 CSS 變數
  function applyTheme() {
    const palette = theme.palette({ dark: darkQuery.matches });
    colors = palette.colors;
    for (const [name, value] of Object.entries(palette.ui)) {
      document.documentElement.style.setProperty(`--color-${name}`, value);
    }
    // 主題有指定介面字型就套用，沒有的話移除，回到 CSS 預設的系統字型
    if (theme.font) {
      document.documentElement.style.setProperty('--font-ui', theme.font);
    } else {
      document.documentElement.style.removeProperty('--font-ui');
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
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.imageSmoothingEnabled = !theme.pixelated;
      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      // 動畫用的時間，以及系統是否開啟「減少動態效果」
      view.time = performance.now();
      view.reducedMotion = motionQuery.matches;

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
