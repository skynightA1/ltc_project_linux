const { Pool } = require('pg');
require('dotenv').config();

// 資料庫連線設定
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ltc_database',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // 最大連線數
  idleTimeoutMillis: 30000, // 閒置連線超時
  connectionTimeoutMillis: 2000, // 連線超時
});

// 測試資料庫連線
pool.on('connect', () => {
  console.log('✅ 資料庫連線成功');
});

pool.on('error', (err) => {
  console.error('❌ 資料庫連線錯誤:', err);
});

// 測試連線函數
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('📊 資料庫連線測試成功:', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ 資料庫連線測試失敗:', err.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};
