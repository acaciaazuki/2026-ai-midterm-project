// 遊戲進入點：初始化各模組並串接起來
import {
  GRID,
  START_LENGTH,
  MAX_QUEUED_INPUTS,
  WRAP_RULES,
  DIFFICULTIES,
  LEVEL_INTRO_MS,
  DEFAULT_SETTINGS,
} from './config.js';
import { Game, STATE, startLoop } from './game.js';
import { bindKeyboard } from './input.js';
import { generateLevel, encodeLevelCode, decodeLevelCode } from './level.js';
import { mulberry32, randomSeed } from './random.js';
import { createRenderer } from './renderer.js';
import { loadSettings, saveSettings, getHighScore, saveHighScore } from './storage.js';
import { createUI } from './ui.js';

const MODES = ['classic', 'random'];

const settings = sanitizeSettings(loadSettings(DEFAULT_SETTINGS));
const render = createRenderer(document.getElementById('game'), GRID);

let game = null;
let seed = null; // 目前隨機關卡的種子，經典模式為 null
let lastState = null;
let lastScore = -1;

// 儲存的設定可能來自舊版本或被手動修改過，不合法的值改回預設
function sanitizeSettings(saved) {
  return {
    mode: MODES.includes(saved.mode) ? saved.mode : DEFAULT_SETTINGS.mode,
    difficulty: saved.difficulty in DIFFICULTIES ? saved.difficulty : DEFAULT_SETTINGS.difficulty,
  };
}

const currentHighScore = () => getHighScore(settings.mode, settings.difficulty);
const currentCode = () => (seed === null ? null : encodeLevelCode(settings.difficulty, seed));

// 依目前的設定與種子開一局新遊戲
function newGame() {
  const difficulty = DIFFICULTIES[settings.difficulty];
  const level = generateLevel({
    mode: settings.mode,
    difficulty: settings.difficulty,
    seed,
    cols: GRID.cols,
    rows: GRID.rows,
    startLength: START_LENGTH,
  });

  game = new Game({
    cols: GRID.cols,
    rows: GRID.rows,
    startLength: START_LENGTH,
    maxQueuedInputs: MAX_QUEUED_INPUTS,
    speed: difficulty,
    wrap: WRAP_RULES[level.wrapRule],
    level,
    introMs: LEVEL_INTRO_MS,
    // 隨機關卡的食物位置也由種子決定，同一個關卡代碼每次玩到的都一樣
    rng: seed === null ? Math.random : mulberry32(seed ^ 0x9e3779b9),
  });

  lastState = null;
  lastScore = -1;
  ui.setLevelInfo({ wrapRule: level.wrapRule, code: currentCode() });
  game.start();
}

function backToMenu() {
  game = null;
  ui.showMenu(settings, currentHighScore());
  ui.updateHud(0, currentHighScore());
}

function togglePause() {
  if (game?.state === STATE.PLAYING) {
    game.pause();
  } else if (game?.state === STATE.PAUSED) {
    game.resume();
  }
}

const ui = createUI({
  onStart(choice) {
    seed = null;
    if (choice.mode === 'random') {
      if (choice.levelCode) {
        // 輸入關卡代碼時，難度以代碼裡記錄的為準
        const decoded = decodeLevelCode(choice.levelCode);
        if (!decoded) {
          ui.showCodeError();
          return;
        }
        choice.difficulty = decoded.difficulty;
        seed = decoded.seed;
      } else {
        seed = randomSeed();
      }
    }

    settings.mode = choice.mode;
    settings.difficulty = choice.difficulty;
    saveSettings(settings);
    newGame();
  },
  onMenuChange(choice) {
    ui.setMenuHighScore(getHighScore(choice.mode, choice.difficulty));
  },
  onResume: togglePause,
  onRestart: newGame,
  onNewLevel() {
    seed = randomSeed();
    newGame();
  },
  onMenu: backToMenu,
  onPause: togglePause,
});

bindKeyboard({
  onDirection: (direction) => game?.queueDirection(direction),
  onPause: togglePause,
});

// 切換到其他分頁或縮小視窗時自動暫停
document.addEventListener('visibilitychange', () => {
  if (document.hidden) game?.pause();
});

// 遊戲狀態改變時切換對應的畫面
function handleStateChange() {
  switch (game.state) {
    case STATE.INTRO:
      ui.showIntro({
        mode: settings.mode,
        difficulty: settings.difficulty,
        wrapRule: game.wrapRule,
        code: currentCode(),
      });
      ui.announce(`本關：${ui.wrapName(game.wrapRule)}`);
      break;
    case STATE.PLAYING:
      ui.showPlaying();
      break;
    case STATE.PAUSED:
      ui.showPaused();
      break;
    case STATE.OVER: {
      const isRecord = saveHighScore(settings.mode, settings.difficulty, game.score);
      ui.showOver({ score: game.score, won: game.won, isRecord, code: currentCode() });
      ui.announce(`遊戲結束，分數 ${game.score}`);
      break;
    }
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
      ui.updateHud(game.score, Math.max(game.score, currentHighScore()));
      if (game.score > 0) ui.announce(`分數 ${game.score}`);
    }
  }

  render(game);
});

backToMenu();
