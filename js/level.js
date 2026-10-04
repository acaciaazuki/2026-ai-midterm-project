// 關卡生成：經典模式與隨機關卡，只處理格子座標資料
import {
  DIFFICULTIES,
  WRAP_RULES,
  SPAWN_SAFE_DISTANCE,
  MAX_LEVEL_ATTEMPTS,
} from './config.js';
import { mulberry32, weightedPick, SEED_RANGE } from './random.js';
import { DIRECTIONS, createSnake, moveHead } from './snake.js';

const DIFFICULTY_LETTERS = { easy: 'E', normal: 'N', hard: 'H' };

// 關卡代碼格式：難度字母 + 6 位 36 進位種子，例如 N-4F7K2Q
export function encodeLevelCode(difficulty, seed) {
  const seedText = seed.toString(36).toUpperCase().padStart(6, '0');
  return `${DIFFICULTY_LETTERS[difficulty]}-${seedText}`;
}

// 解析關卡代碼，格式不正確時回傳 null；大小寫與連字號可省略
export function decodeLevelCode(code) {
  const match = /^([ENH])-?([0-9A-Z]{6})$/.exec(code.trim().toUpperCase());
  if (!match) return null;

  const difficulty = Object.keys(DIFFICULTY_LETTERS).find(
    (key) => DIFFICULTY_LETTERS[key] === match[1],
  );
  const seed = parseInt(match[2], 36);
  if (seed >= SEED_RANGE) return null;
  return { difficulty, seed };
}

const cellKey = (cell) => `${cell.x},${cell.y}`;

// 產生關卡資料：穿牆規則、障礙物、蛇的出生位置與方向
export function generateLevel({ mode, difficulty, seed, cols, rows, startLength }) {
  const config = DIFFICULTIES[difficulty];

  // 蛇一律從地圖中央朝右出發，前方到右側邊界至少有半張地圖的距離，
  // 所以即使右側是牆，也不會一開局就撞上
  const spawn = {
    head: { x: Math.floor(cols / 2), y: Math.floor(rows / 2) },
    direction: 'right',
  };

  if (mode === 'classic') {
    return { wrapRule: config.classicWrap, obstacles: [], spawn };
  }

  const rng = mulberry32(seed);
  const wrapRule = weightedPick(rng, config.wrapWeights);
  const wrap = WRAP_RULES[wrapRule];
  const reserved = reservedCells(spawn, startLength, cols, rows, wrap);
  const target = Math.round(cols * rows * config.obstacleRatio);

  // 地圖有封閉區域時重新生成；同一個種子的重試順序固定，結果仍然可以重現
  for (let attempt = 0; attempt < MAX_LEVEL_ATTEMPTS; attempt++) {
    const obstacles = placeObstacles(rng, target, reserved, cols, rows);
    if (isConnected(obstacles, cols, rows, wrap)) {
      return { wrapRule, obstacles, spawn };
    }
  }

  // 正常情況下不會走到這裡；萬一都失敗，就給一張沒有障礙物的地圖
  return { wrapRule, obstacles: [], spawn };
}

// 出生點保護：蛇身與蛇頭前方幾格不能放障礙物
function reservedCells(spawn, startLength, cols, rows, wrap) {
  const reserved = new Set(createSnake(spawn.head, spawn.direction, startLength).map(cellKey));
  let cell = spawn.head;
  for (let i = 0; i < SPAWN_SAFE_DISTANCE; i++) {
    cell = moveHead(cell, spawn.direction, cols, rows, wrap);
    if (!cell) break;
    reserved.add(cellKey(cell));
  }
  return reserved;
}

// 放置障礙物：以 1 到 4 格長的橫向或直向短牆為單位，看起來比散落的單格自然
function placeObstacles(rng, target, reserved, cols, rows) {
  const placed = new Map();
  let guard = 0;

  while (placed.size < target && guard++ < target * 20) {
    const start = { x: Math.floor(rng() * cols), y: Math.floor(rng() * rows) };
    const step = rng() < 0.5 ? DIRECTIONS.right : DIRECTIONS.down;
    const length = 1 + Math.floor(rng() * 4);

    for (let i = 0; i < length && placed.size < target; i++) {
      const cell = { x: start.x + step.x * i, y: start.y + step.y * i };
      if (cell.x >= cols || cell.y >= rows) break;
      const key = cellKey(cell);
      if (!reserved.has(key)) placed.set(key, cell);
    }
  }

  return [...placed.values()];
}

// 用 BFS 檢查所有空格是否連通；可以穿越的邊界也算相連
function isConnected(obstacles, cols, rows, wrap) {
  const blocked = new Set(obstacles.map(cellKey));
  const freeCount = cols * rows - blocked.size;

  let start = null;
  for (let y = 0; y < rows && !start; y++) {
    for (let x = 0; x < cols && !start; x++) {
      if (!blocked.has(cellKey({ x, y }))) start = { x, y };
    }
  }
  if (!start) return false;

  const visited = new Set([cellKey(start)]);
  const queue = [start];
  while (queue.length > 0) {
    const cell = queue.shift();
    for (const direction of Object.keys(DIRECTIONS)) {
      const next = moveHead(cell, direction, cols, rows, wrap);
      if (!next) continue;
      const key = cellKey(next);
      if (blocked.has(key) || visited.has(key)) continue;
      visited.add(key);
      queue.push(next);
    }
  }

  return visited.size === freeCount;
}
