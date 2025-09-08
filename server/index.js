const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');

// 載入環境變數
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);

// 健康檢查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '長期照護平台 API 伺服器運行中',
    timestamp: new Date().toISOString()
  });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('伺服器錯誤:', err);
  res.status(500).json({ 
    error: '內部伺服器錯誤',
    message: process.env.NODE_ENV === 'development' ? err.message : '請稍後再試'
  });
});

// 404 最終處理（不要使用 '*' 路徑，避免 path-to-regexp 錯誤）
app.use((req, res) => {
  res.status(404).json({ error: '找不到請求的資源' });
});

// 啟動伺服器
const startServer = async () => {
  try {
    // 測試資料庫連線
    console.log('🔍 測試資料庫連線...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ 資料庫連線失敗，伺服器無法啟動');
      process.exit(1);
    }
    
    // 啟動 HTTP 伺服器
    app.listen(PORT, () => {
      console.log(`🚀 後端 API 伺服器運行在 http://localhost:${PORT}`);
      console.log(`📊 健康檢查: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ 伺服器啟動失敗:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
