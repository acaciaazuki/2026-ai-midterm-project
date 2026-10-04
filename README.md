# 貪食蛇網頁遊戲

學校期中專題：以原生 JavaScript 與 HTML5 Canvas 製作的貪食蛇網頁遊戲。

## 特色（開發中）

- 經典模式（無障礙物）與隨機關卡模式
- 簡單、普通、困難三種難度
- 隨機關卡含種子碼、障礙物與穿牆規則
- 七種可切換的畫面風格
- 支援台灣正體中文與英文
- 支援鍵盤與手機觸控操作

## 本機執行

本專案使用 ES Modules，必須透過本機伺服器開啟，無法直接雙擊 `index.html`。

擇一即可：

```bash
# 使用 Node.js
npx serve .

# 使用 Python
python3 -m http.server 8000
```

或在 VS Code 安裝 Live Server 擴充功能，對 `index.html` 按右鍵選「Open with Live Server」。

## 文件

- [技術棧與實作計畫](docs/PLAN.md)
