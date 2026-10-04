// 介面：切換主選單、開局提示、暫停、遊戲結束等畫面，並更新分數列
import { t } from './i18n.js';

const $ = (id) => document.getElementById(id);

// 穿牆規則的小圖示
const WRAP_ICONS = { both: '✥', vertical: '⇅', horizontal: '⇆', none: '▣' };

export function createUI({
  onStart,
  onMenuChange,
  onResume,
  onRestart,
  onNewLevel,
  onMenu,
  onPause,
}) {
  const screens = {
    menu: $('menu-screen'),
    intro: $('intro-screen'),
    pause: $('pause-screen'),
    over: $('over-screen'),
  };
  const menuForm = $('menu-form');
  const codeInput = $('level-code-input');
  const canvas = $('game');
  const pauseButton = $('pause-button');

  // 只顯示指定的畫面；name 為 null 時全部隱藏（遊戲進行中）
  function showScreen(name) {
    for (const [key, el] of Object.entries(screens)) {
      el.hidden = key !== name;
    }
    pauseButton.hidden = name !== null;
  }

  // 讀取主選單目前選擇的值
  function readMenu() {
    const data = new FormData(menuForm);
    return {
      mode: data.get('mode'),
      difficulty: data.get('difficulty'),
      language: data.get('language'),
      levelCode: data.get('mode') === 'random' ? data.get('levelCode').trim() : '',
    };
  }

  // 關卡代碼只在隨機關卡模式顯示
  function updateCodeField() {
    $('level-code-field').hidden = readMenu().mode !== 'random';
  }

  menuForm.addEventListener('submit', (e) => {
    e.preventDefault();
    onStart(readMenu());
  });
  menuForm.addEventListener('change', () => {
    updateCodeField();
    onMenuChange(readMenu());
  });
  codeInput.addEventListener('input', () => {
    $('level-code-error').hidden = true;
  });

  $('resume-button').addEventListener('click', onResume);
  $('pause-restart-button').addEventListener('click', onRestart);
  $('pause-menu-button').addEventListener('click', onMenu);
  $('retry-button').addEventListener('click', onRestart);
  $('new-level-button').addEventListener('click', onNewLevel);
  $('over-menu-button').addEventListener('click', onMenu);
  pauseButton.addEventListener('click', onPause);

  return {
    showMenu(settings, language, highScore) {
      menuForm.elements.mode.value = settings.mode;
      menuForm.elements.difficulty.value = settings.difficulty;
      menuForm.elements.language.value = language;
      $('menu-high-score').textContent = highScore;
      // 清空上次輸入的代碼，避免沒注意到而一直重玩同一關
      codeInput.value = '';
      $('level-code-error').hidden = true;
      updateCodeField();
      $('level-info').hidden = true;
      showScreen('menu');
      menuForm.querySelector('input:checked')?.focus();
    },

    setMenuHighScore(highScore) {
      $('menu-high-score').textContent = highScore;
    },

    // 關卡代碼格式錯誤時顯示提示，並把焦點移回輸入欄
    showCodeError() {
      $('level-code-error').hidden = false;
      codeInput.focus();
    },

    // 更新分數列上的關卡資訊：穿牆規則圖示與關卡代碼
    setLevelInfo({ wrapRule, code }) {
      const indicator = $('wrap-indicator');
      indicator.textContent = WRAP_ICONS[wrapRule];
      indicator.title = t(`wrap.${wrapRule}`);
      indicator.setAttribute('aria-label', t(`wrap.${wrapRule}`));
      $('hud-level-code').textContent = code ?? '';
      $('level-info').hidden = false;
    },

    showIntro({ mode, difficulty, wrapRule, code }) {
      $('intro-mode').textContent = t('intro.mode', {
        mode: t(`mode.${mode}`),
        difficulty: t(`difficulty.${difficulty}`),
      });
      $('intro-rule').textContent = t('intro.rule', { rule: t(`wrap.${wrapRule}`) });
      $('intro-code').textContent = code ? t('levelCode', { code }) : '';
      showScreen('intro');
      canvas.focus({ preventScroll: true });
    },

    showPlaying() {
      showScreen(null);
      // 把焦點移到遊戲畫面，鍵盤操作才不會被按鈕攔截
      canvas.focus({ preventScroll: true });
    },

    showPaused() {
      showScreen('pause');
      $('resume-button').focus();
    },

    showOver({ score, won, isRecord, code }) {
      $('over-title').textContent = t(won ? 'over.won' : 'over.title');
      $('over-score').textContent = score;
      $('over-record').hidden = !isRecord;
      $('over-code').hidden = !code;
      $('over-code').textContent = code ? t('levelCode', { code }) : '';
      $('new-level-button').hidden = !code;
      showScreen('over');
      $('retry-button').focus();
    },

    updateHud(score, highScore) {
      $('score').textContent = score;
      $('high-score').textContent = highScore;
    },

    // 透過 aria-live 區域讓螢幕閱讀器朗讀
    announce(text) {
      $('announcer').textContent = text;
    },
  };
}
