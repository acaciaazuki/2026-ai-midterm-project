// 遊戲狀態與主迴圈
import { createSnake, moveHead, isOpposite, occupies } from './snake.js';

export const STATE = {
  READY: 'ready', // 等待開始
  INTRO: 'intro', // 開局前顯示關卡規則
  PLAYING: 'playing', // 遊戲中
  PAUSED: 'paused', // 暫停
  OVER: 'over', // 遊戲結束
};

export class Game {
  // speed 的欄位說明見 config.js 的 DIFFICULTIES
  // level 由 level.js 的 generateLevel 產生，包含障礙物與出生位置
  constructor({
    cols,
    rows,
    startLength,
    maxQueuedInputs,
    speed,
    wrap,
    level,
    introMs = 0,
    rng = Math.random,
  }) {
    this.cols = cols;
    this.rows = rows;
    this.maxQueuedInputs = maxQueuedInputs;
    this.speed = speed;
    this.wrap = wrap;
    this.rng = rng;
    this.wrapRule = level.wrapRule;
    this.obstacles = level.obstacles;
    this.obstacleKeys = new Set(level.obstacles.map((cell) => `${cell.x},${cell.y}`));
    this.introMs = introMs;

    this.direction = level.spawn.direction;
    this.snake = createSnake(level.spawn.head, this.direction, startLength);
    this.inputQueue = [];
    this.score = 0;
    this.won = false;
    this.tickMs = speed.startTickMs;
    this.elapsed = 0;
    this.food = this.spawnFood();
    this.state = STATE.READY;
  }

  // 開始遊戲：有設定開局提示時間就先進入提示狀態
  start() {
    if (this.state !== STATE.READY) return;
    this.state = this.introMs > 0 ? STATE.INTRO : STATE.PLAYING;
  }

  pause() {
    if (this.state === STATE.PLAYING) this.state = STATE.PAUSED;
  }

  resume() {
    if (this.state === STATE.PAUSED) this.state = STATE.PLAYING;
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

  // 經過 dt 毫秒：累積時間，每滿一個移動間隔就前進一格
  step(dt) {
    if (this.state === STATE.INTRO) {
      this.introMs -= dt;
      if (this.introMs <= 0) this.state = STATE.PLAYING;
      return;
    }
    if (this.state !== STATE.PLAYING) return;

    this.elapsed += dt;
    while (this.elapsed >= this.tickMs && this.state === STATE.PLAYING) {
      this.elapsed -= this.tickMs;
      this.update();
    }
  }

  // 前進一格：處理轉向、碰撞與吃食物
  update() {
    if (this.state !== STATE.PLAYING) return;

    if (this.inputQueue.length > 0) {
      this.direction = this.inputQueue.shift();
    }

    const head = moveHead(this.snake[0], this.direction, this.cols, this.rows, this.wrap);
    if (!head || this.isObstacle(head)) {
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
    this.speedUp();
    this.food = this.spawnFood();
    if (!this.food) {
      // 蛇填滿整張地圖，沒有空格可以放食物
      this.won = true;
      this.state = STATE.OVER;
    }
  }

  isObstacle(cell) {
    return this.obstacleKeys.has(`${cell.x},${cell.y}`);
  }

  // 依難度設定，每吃到一定數量的食物就縮短移動間隔
  speedUp() {
    const { speedupEvery, speedupMs, minTickMs } = this.speed;
    if (speedupEvery > 0 && this.score % speedupEvery === 0) {
      this.tickMs = Math.max(minTickMs, this.tickMs - speedupMs);
    }
  }

  // 在隨機的空格（不是蛇身也不是障礙物）放食物；沒有空格時回傳 null
  spawnFood() {
    const empty = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const cell = { x, y };
        if (!occupies(this.snake, cell) && !this.isObstacle(cell)) empty.push(cell);
      }
    }
    if (empty.length === 0) return null;
    return empty[Math.floor(this.rng() * empty.length)];
  }
}

// 主迴圈：每一幀把經過的時間交給 onFrame，
// 遊戲依時間累積決定何時前進，速度不受螢幕更新率影響
export function startLoop(onFrame) {
  let last = performance.now();

  function frame(now) {
    // 分頁切到背景再回來時，經過時間會很長，限制上限避免蛇一口氣衝好幾格
    const dt = Math.min(now - last, 250);
    last = now;
    onFrame(dt);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
