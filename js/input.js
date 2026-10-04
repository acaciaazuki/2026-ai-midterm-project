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

export function bindKeyboard({ onDirection, onConfirm }) {
  window.addEventListener('keydown', (e) => {
    const direction = KEY_TO_DIRECTION[e.code];
    if (direction) {
      // 避免方向鍵捲動頁面
      e.preventDefault();
      onDirection(direction);
      return;
    }

    if ((e.code === 'Enter' || e.code === 'NumpadEnter') && !e.repeat) {
      e.preventDefault();
      onConfirm();
    }
  });
}
