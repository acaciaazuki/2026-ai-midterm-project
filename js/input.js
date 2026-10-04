// 鍵盤操作：把按鍵轉換成遊戲動作

// 使用 e.code（實體按鍵位置）而不是 e.key，
// 這樣開著注音等中文輸入法時 WASD 也能正常操作
const KEY_TO_DIRECTION = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
};

const PAUSE_KEYS = ['Space', 'KeyP', 'Escape'];

// 觸控滑動：手指移動超過門檻就判定方向（以移動量較大的軸為準）
// 判定後把起點重設到目前位置，同一次滑動不放開手指也能連續轉彎
const SWIPE_THRESHOLD = 24;

export function bindTouch(element, { onDirection }) {
  let start = null;

  element.addEventListener('pointerdown', (e) => {
    start = { x: e.clientX, y: e.clientY };
    // 手指滑出遊戲畫面時仍然持續接收移動事件
    element.setPointerCapture(e.pointerId);
  });

  element.addEventListener('pointermove', (e) => {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      onDirection(dx > 0 ? 'right' : 'left');
    } else {
      onDirection(dy > 0 ? 'down' : 'up');
    }
    start = { x: e.clientX, y: e.clientY };
  });

  const end = () => {
    start = null;
  };
  element.addEventListener('pointerup', end);
  element.addEventListener('pointercancel', end);
}

export function bindKeyboard({ onDirection, onPause }) {
  window.addEventListener('keydown', (e) => {
    // 在輸入框、下拉選單、單選按鈕上操作時，讓瀏覽器照原本的方式處理
    if (e.target.closest('input, select, textarea')) return;

    const direction = KEY_TO_DIRECTION[e.code];
    if (direction) {
      // 避免方向鍵捲動頁面
      e.preventDefault();
      onDirection(direction);
      return;
    }

    if (PAUSE_KEYS.includes(e.code) && !e.repeat) {
      // 焦點在按鈕上時，空白鍵是「按下按鈕」，不當作暫停
      if (e.code === 'Space' && e.target.closest('button')) return;
      e.preventDefault();
      onPause();
    }
  });
}
