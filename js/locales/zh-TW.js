// 台灣正體中文介面文字
// {名稱} 是會被代入的變數，例如 {score} 會換成分數
export default {
  title: '貪食蛇',

  // 分數列
  'hud.label': '遊戲資訊',
  'hud.score': '分數',
  'hud.highScore': '最高分',
  'hud.pause': '暫停',
  'board.label': '遊戲畫面',

  // 主選單
  'menu.title': '遊戲設定',
  'menu.mode': '關卡模式',
  'menu.difficulty': '難度',
  'menu.language': '語言',
  'menu.theme': '主題',
  'menu.levelCode': '關卡代碼（選填）',
  'menu.levelCodePlaceholder': '例如 N-4F7K2Q',
  'menu.levelCodeError': '關卡代碼格式不正確',
  'menu.highScore': '最高分：',
  'menu.start': '開始遊戲',
  'menu.hint': '方向鍵或 WASD 移動，空白鍵暫停',

  // 模式與難度
  'mode.classic': '經典',
  'mode.random': '隨機關卡',
  'difficulty.easy': '簡單',
  'difficulty.normal': '普通',
  'difficulty.hard': '困難',

  // 主題名稱
  'theme.flat': '簡約扁平',
  'theme.nokia': 'Nokia 懷舊',
  'theme.gameboy': 'Game Boy 四色',
  'theme.contrast': '高對比無障礙',

  // 穿牆規則
  'wrap.both': '全部可穿越',
  'wrap.vertical': '只能上下穿越',
  'wrap.horizontal': '只能左右穿越',
  'wrap.none': '全部是牆',

  // 開局提示
  'intro.mode': '{mode}・{difficulty}',
  'intro.rule': '本關：{rule}',
  levelCode: '關卡代碼 {code}',

  // 暫停畫面
  'pause.title': '暫停',
  'pause.resume': '繼續',
  'pause.restart': '重新開始',
  'common.menu': '回主選單',

  // 遊戲結束畫面
  'over.title': '遊戲結束',
  'over.won': '恭喜破關！',
  'over.score': '分數：',
  'over.record': '新紀錄！',
  'over.retry': '再玩一次',
  'over.newLevel': '新關卡',

  // 螢幕閱讀器朗讀的訊息
  'announce.score': '分數 {score}',
  'announce.over': '遊戲結束，分數 {score}',
  'announce.won': '恭喜破關，分數 {score}',
};
