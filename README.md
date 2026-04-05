# 舊城時光色譜 (Old City Time Spectrum)

這是一個以手機瀏覽為考量的響應式網頁應用程式（Web App）。我們將採用 Vanilla HTML/CSS/JavaScript 進行實作，以保持專案結構的輕量與高彈性。全站依據 Figma 設計稿的美學，完整重現字型、間距與玻璃擬態 (Glassmorphism) 特效。

## 目錄結構
- `docs/`：存放專案相關原始文件（如計畫書、設計圖、設定檔與流程圖）。
- `css/`：樣式檔案存放區，包含主要的 `style.css` 且已建立基礎的變數設定。
- `js/`：JavaScript 邏輯指令碼，主要進入點為 `main.js`。
- `assets/`：圖片、字體等靜態資源檔案（目前為空資料夾）。
- `index.html`：網頁主架構。

## 技術架構與開發工具
- **設計流程 (Design)**：Figma
- **AI 程式開發助手**：Claude / ChatGPT / v0 / Antigravity
- **前端核心**：Vanilla HTML / CSS / JavaScript
- **後端資料庫 (Database)**：Supabase
- **部署與上線 (Deployment)**：Vercel

## 特色與實作說明
- 將 Figma 中的字體（`Noto Serif TC`, `Noto Sans TC`）、色票與間距轉為 CSS 變數 (`:root`) 進行統管，幫助未來開發的一致性。
- 預設容器 (`.app-container`) 最大寬度為 `480px`，並且在桌面端置中處理，以符合純手機瀏覽的視覺與操作體驗。
- **Glassmorphism 玻璃效果**：在設計文件中提到的陰影細節已經整合成 `.glass-effect` 類別供各元件共用。

## 開發規則
1. 確保所有前端元件（UI Component）語意正確，並保持程式碼的易讀性。
2. 開發對話與文件說明一律使用繁體中文（台灣）及技術術語。
3. 未來新增複雜的 JavaScript 邏輯時，需加入簡潔的中文註解進行說明。
