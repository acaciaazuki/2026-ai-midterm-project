// 遊戲進入點：初始化各模組並串接起來
import { GRID, START_LENGTH, TICK_MS, MAX_QUEUED_INPUTS } from './config.js';
import { Game, STATE, startLoop } from './game.js';
import { bindKeyboard } from './input.js';
import { createRenderer } from './renderer.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');

const game = new Game({
  cols: GRID.cols,
  rows: GRID.rows,
  tickMs: TICK_MS,
  startLength: START_LENGTH,
  maxQueuedInputs: MAX_QUEUED_INPUTS,
  // 第 1 階段先固定為四周都是牆，第 2、3 階段再依難度與關卡決定
  wrap: { x: false, y: false },
});

const render = createRenderer(canvas, GRID);

bindKeyboard({
  onDirection: (direction) => game.queueDirection(direction),
  onConfirm: () => game.start(),
});

// 狀態文字（暫時寫死中文，第 4 階段改用語言檔）
function statusText() {
  switch (game.state) {
    case STATE.READY:
      return '按 Enter 開始，用方向鍵或 WASD 控制';
    case STATE.PLAYING:
      return `分數：${game.score}`;
    case STATE.OVER:
      return game.won
        ? `恭喜破關！分數：${game.score}，按 Enter 再玩一次`
        : `遊戲結束！分數：${game.score}，按 Enter 再玩一次`;
  }
}

startLoop(game, () => {
  render(game);

  // 只在文字改變時更新，避免螢幕閱讀器每一幀都重複朗讀
  const text = statusText();
  if (status.textContent !== text) status.textContent = text;
});
