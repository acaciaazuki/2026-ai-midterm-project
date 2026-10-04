# 字型

## 俐方體11號（Cubic 11）

像素風主題（Nokia 懷舊、Game Boy 四色、復古像素 8-bit）的介面字型。

- 授權：SIL Open Font License 1.1，全文見 `OFL.txt`
- `cubic-11-subset.woff2` 只包含 `chars.txt` 裡的字，原始字型約 2.7 MB，擷取後約 10 KB

### 重新產生

新增或修改介面文字後，若出現字型裡沒有的字，該字會改用系統字型顯示。依下列步驟重新產生：

1. 把新的字加進 `chars.txt`
2. 下載原始字型 `Cubic_11.ttf`（俐方體11號官方儲存庫的 `fonts/ttf/` 資料夾）
3. 安裝 fonttools 後執行：

```bash
pip install fonttools brotli
pyftsubset Cubic_11.ttf --text-file=chars.txt --flavor=woff2 --layout-features='*' --output-file=cubic-11-subset.woff2
```
