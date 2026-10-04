// 遊戲進入點：初始化各模組並串接起來
import {
  GRID,
  START_LENGTH,
  MAX_QUEUED_INPUTS,
  WRAP_RULES,
  DIFFICULTIES,
  DEFAULT_SETTINGS,
} from './config.js';
import { Game, STATE, startLoop } from './game.js';
import { bindKeyboard } from './input.js';
import { createRenderer } from './renderer.js';
import { loadSettings, saveSettings, getHighScore, saveHighScore } from './storage.js';
import { createUI } from './ui.js';

// 目前只有經典模式，第 3 階段加入隨機關卡
const MODE = 'classic';

const settings = sanitizeSettings(loadSettings(DEFAULT_SETTINGS));
const render = createRenderer(document.getElementById('game'), GRID);

let game = null;
let lastState = null;
let lastScore = -1;

// 儲存的設定可能來自舊版本或被手動修改過，不合法的值改回預設
function sanitizeSettings(saved) {
  return {
    difficulty: saved.difficulty in DIFFICULTIES ? saved.difficulty : DEFAULT_SETTINGS.difficulty,
  };
}

function newGame() {
  const difficulty = DIFFICULTIES[settings.difficulty];
  game = new Game({
    cols: GRID.cols,
    rows: GRID.rows,
    startLength: START_LENGTH,
    maxQueuedInputs: MAX_QUEUED_INPUTS,
    speed: difficulty,
    wrap: WRAP_RULES[difficulty.classicWrap],
  });
  lastScore = -1;
  game.start();
  ui.showPlaying();
}

function backToMenu() {
  game = null;
  ui.showMenu(settings, getHighScore(MODE, settings.difficulty));
  ui.updateHud(0, getHighScore(MODE, settings.difficulty));
}

function togglePause() {
  if (!game) return;
  if (game.state === STATE.PLAYING) {
    game.pause();
  } else if (game.state === STATE.PAUSED) {
    game.resume();
    ui.showPlaying();
  }
}

const ui = createUI({
  onStart(choice) {
    Object.assign(settings, choice);
    saveSettings(settings);
    newGame();
  },
  onDifficultyChange(choice) {
    ui.setMenuHighScore(getHighScore(MODE, choice.difficulty));
  },
  onResume: togglePause,
  onRestart: newGame,
  onMenu: backToMenu,
  onPause: togglePause,
});

bindKeyboard({
  onDirection: (direction) => game?.queueDirection(direction),
  onPause: togglePause,
});

// 切換到其他分頁或縮小視窗時自動暫停
document.addEventListener('visibilitychange', () => {
  if (document.hidden && game?.state === STATE.PLAYING) game.pause();
});

// 遊戲狀態改變時（例如暫停、結束），切換對應的畫面
function handleStateChange() {
  if (game.state === STATE.PAUSED) {
    ui.showPaused();
  } else if (game.state === STATE.OVER) {
    const isRecord = saveHighScore(MODE, settings.difficulty, game.score);
    ui.showOver({ score: game.score, won: game.won, isRecord });
    ui.announce(`遊戲結束，分數 ${game.score}`);
  }
}

startLoop((dt) => {
  if (game) {
    game.step(dt);

    if (game.state !== lastState) {
      lastState = game.state;
      handleStateChange();
    }

    if (game.score !== lastScore) {
      lastScore = game.score;
      ui.updateHud(game.score, Math.max(game.score, getHighScore(MODE, settings.difficulty)));
      if (game.score > 0) ui.announce(`分數 ${game.score}`);
    }
  } else {
    lastState = null;
  }

  render(game);
});

backToMenu();
