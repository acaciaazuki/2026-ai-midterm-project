// 介面：切換主選單、暫停、遊戲結束等畫面，並更新分數列

const $ = (id) => document.getElementById(id);

export function createUI({ onStart, onDifficultyChange, onResume, onRestart, onMenu, onPause }) {
  const screens = {
    menu: $('menu-screen'),
    pause: $('pause-screen'),
    over: $('over-screen'),
  };
  const menuForm = $('menu-form');
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
    return { difficulty: data.get('difficulty') };
  }

  menuForm.addEventListener('submit', (e) => {
    e.preventDefault();
    onStart(readMenu());
  });
  menuForm.addEventListener('change', () => onDifficultyChange(readMenu()));

  $('resume-button').addEventListener('click', onResume);
  $('pause-restart-button').addEventListener('click', onRestart);
  $('pause-menu-button').addEventListener('click', onMenu);
  $('retry-button').addEventListener('click', onRestart);
  $('over-menu-button').addEventListener('click', onMenu);
  pauseButton.addEventListener('click', onPause);

  return {
    showMenu(settings, highScore) {
      menuForm.elements.difficulty.value = settings.difficulty;
      $('menu-high-score').textContent = highScore;
      showScreen('menu');
      menuForm.querySelector('input:checked')?.focus();
    },

    setMenuHighScore(highScore) {
      $('menu-high-score').textContent = highScore;
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

    showOver({ score, won, isRecord }) {
      $('over-title').textContent = won ? '恭喜破關！' : '遊戲結束';
      $('over-score').textContent = score;
      $('over-record').hidden = !isRecord;
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
