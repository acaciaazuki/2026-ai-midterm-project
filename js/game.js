// 遊戲狀態與主迴圈
import { createSnake, moveHead, isOpposite, occupies } from './snake.js';

export const STATE = {
  READY: 'ready', // 等待開始
  PLAYING: 'playing', // 遊戲中
  OVER: 'over', // 遊戲結束
};

export class Game {
  constructor({ cols, rows, tickMs, startLength, maxQueuedInputs, wrap, rng = Math.random }) {
    this.cols = cols;
    this.rows = rows;
    this.tickMs = tickMs;
    this.startLength = startLength;
    this.maxQueuedInputs = maxQueuedInputs;
    this.wrap = wrap;
    this.rng = rng;
    this.reset();
  }

  // 回到初始狀態：蛇放在地圖中央，朝右前進
  reset() {
    const head = { x: Math.floor(this.cols / 2), y: Math.floor(this.rows / 2) };
    this.direction = 'right';
    this.snake = createSnake(head, this.direction, this.startLength);
    this.inputQueue = [];
    this.score = 0;
    this.won = false;
    this.food = this.spawnFood();
    this.state = STATE.READY;
  }

  // 開始遊戲；遊戲結束後呼叫則重新開始
  start() {
    if (this.state === STATE.OVER) this.reset();
    if (this.state === STATE.READY) this.state = STATE.PLAYING;
  }

  // 把玩家輸入的方向放進佇列，下一次移動時才會套用
  queueDirection(direction) {
    if (this.state !== STATE.PLAYING) return;

    // 跟佇列最後一個方向比較，而不是目前的方向，
    // 否則在同一次移動前快速按「上、左」可能會變成直接回頭
    const last = this.inputQueue.at(-1) ?? this.direction;
    if (direction === last || isOpposite(direction, last)) return;
    if (this.inputQueue.length >= this.maxQueuedInputs) return;

    this.inputQueue.push(direction);
  }

  // 前進一格：處理轉向、碰撞與吃食物
  update() {
    if (this.state !== STATE.PLAYING) return;

    if (this.inputQueue.length > 0) {
      this.direction = this.inputQueue.shift();
    }

    const head = moveHead(this.snake[0], this.direction, this.cols, this.rows, this.wrap);
    if (!head) {
      this.state = STATE.OVER;
      return;
    }

    const eating = head.x === this.food.x && head.y === this.food.y;

    // 沒吃到食物時尾巴會同時移走，所以移動到目前尾巴的位置不算撞到自己
    const body = eating ? this.snake : this.snake.slice(0, -1);
    if (occupies(body, head)) {
      this.state = STATE.OVER;
      return;
    }

    this.snake.unshift(head);
    if (!eating) {
      this.snake.pop();
      return;
    }

    this.score += 1;
    this.food = this.spawnFood();
    if (!this.food) {
      // 蛇填滿整張地圖，沒有空格可以放食物
      this.won = true;
      this.state = STATE.OVER;
    }
  }

  // 在隨機的空格放食物；沒有空格時回傳 null
  spawnFood() {
    const empty = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (!occupies(this.snake, { x, y })) empty.push({ x, y });
      }
    }
    if (empty.length === 0) return null;
    return empty[Math.floor(this.rng() * empty.length)];
  }
}

// 主迴圈：用 requestAnimationFrame 搭配固定的更新間隔，
// 讓遊戲速度不受螢幕更新率影響
export function startLoop(game, onFrame) {
  let last = performance.now();
  let elapsed = 0;

  function frame(now) {
    elapsed += now - last;
    last = now;

    // 分頁切到背景再回來時，累積時間會很長，限制上限避免蛇一口氣衝好幾格
    elapsed = Math.min(elapsed, game.tickMs * 3);

    while (elapsed >= game.tickMs) {
      game.update();
      elapsed -= game.tickMs;
    }

    onFrame();
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
