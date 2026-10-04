# 專案說明

學校期中專題：原生 JavaScript 貪食蛇網頁遊戲。完整規格與時程見 `docs/PLAN.md`。

## 語言規範

- 與使用者對話一律使用台灣用語的正體中文。
- 程式碼註解、文件、commit 訊息、PR 說明一律使用台灣正體中文。
- 變數、函式、檔案名稱使用英文。

## 開發原則

- 不使用框架與建置工具；ES Modules 直接在瀏覽器執行。
- 遊戲邏輯（`snake.js`、`level.js` 等）不得存取 DOM 或 Canvas，只處理格子座標資料。
- 可調整的數值集中於 `js/config.js`。
- `localStorage` 存取一律包在 try/catch 中，無法使用時遊戲仍須正常運作。
