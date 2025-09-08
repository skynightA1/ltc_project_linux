# 長期照護平台 Web App

## 專案概述
這是一個響應式設計的長期照護平台 Web App，提供 AI 助理、健康紀錄、提醒行事曆等功能。

## 功能特色
- 🏠 **首頁/儀表板** - 健康數據概覽
- 🤖 **AI 助理** - 智能聊天介面
- 📊 **健康紀錄** - 健康數據追蹤與圖表
- 📅 **提醒/行事曆** - 事件管理與提醒
- 🆘 **緊急協助** - 緊急聯絡功能
- ⚙️ **設定** - 個人化設定

## 技術架構
- React 18 + TypeScript
- React Router DOM (路由管理)
- Recharts (圖表)
- React Hot Toast (通知)
- CSS Grid/Flexbox (RWD)

## 安裝與啟動

### 環境需求
- Node.js 16+
- npm 或 yarn

### 安裝依賴
```bash
npm install
```

### 啟動開發伺服器
```bash
npm start
```

應用程式將在 http://localhost:3000 啟動

## AI 助理 Webhook 設定

### Webhook URL
```
http://localhost:5678/webhook/d6fdcf14-6199-4401-b127-c90afcef4543
```

### 請求格式
```json
{
  "messages": [
    {"role": "user" | "assistant" | "system", "content": "string"}
  ],
  "metadata": {
    "client": "web",
    "locale": "zh-TW"
  }
}
```

### 回應格式
```json
{
  "reply": {"role":"assistant","content":"..."},
  "conversation_id": "optional-string",
  "error": null
}
```

## CORS 設定
如果遇到 CORS 錯誤，請在伺服器端設定以下 headers：

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## 專案結構
```
src/
├── components/     # 可重用元件
├── pages/         # 頁面元件
├── hooks/         # 自定義 Hooks
├── lib/           # 工具函數
├── types/         # TypeScript 型別定義
└── styles/        # 樣式檔案
```

## 無障礙設計
- 語意化 HTML 標籤
- 鍵盤導航支援
- ARIA 標籤
- 高對比度模式
- 字體大小調整

## 開發說明

### RWD 斷點
- 手機: < 768px
- 平板: 768px - 1024px
- 桌機: > 1024px

### 狀態管理
- 使用 React Context 管理全域狀態
- localStorage 保存使用者設定
- 會話資料本地儲存

## TODO
- [ ] 檔案上傳功能實作
- [ ] SSE 串流支援
- [ ] 離線模式
- [ ] PWA 支援
- [ ] 多語言支援
- [ ] 單元測試
- [ ] E2E 測試

## 授權
MIT License

