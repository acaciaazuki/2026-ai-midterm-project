// 主題清單：順序就是主選單下拉選單的顯示順序
import flat from './flat.js';
import nokia from './nokia.js';
import gameboy from './gameboy.js';
import neon from './neon.js';
import retro8bit from './retro8bit.js';
import notebook from './notebook.js';
import contrast from './contrast.js';

export const THEMES = [flat, nokia, gameboy, neon, retro8bit, notebook, contrast];

// 依 id 取得主題，找不到時回傳第一個
export function getTheme(id) {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}
