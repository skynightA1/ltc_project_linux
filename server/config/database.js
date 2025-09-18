const { Pool } = require('pg');
require('dotenv').config();

// 資料庫連線設定
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ltc',
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

// 確保家庭功能相關資料表
const ensureFamilySchema = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // families
    await client.query(`
      CREATE TABLE IF NOT EXISTS families (
        id SERIAL PRIMARY KEY,
        name TEXT,
        owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // family_members
    await client.query(`
      CREATE TABLE IF NOT EXISTS family_members (
        id SERIAL PRIMARY KEY,
        family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(family_id, user_id)
      );
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_family_members_family ON family_members(family_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_family_members_user ON family_members(user_id);`);

    // family_invitations
    await client.query(`
      CREATE TABLE IF NOT EXISTS family_invitations (
        id SERIAL PRIMARY KEY,
        family_id INTEGER REFERENCES families(id) ON DELETE CASCADE,
        inviter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        invitee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_family_invite_invitee ON family_invitations(invitee_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_family_invite_status ON family_invitations(status);`);

    // calendar_events（家庭共用行事曆）
    await client.query(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id SERIAL PRIMARY KEY,
        family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
        author_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_calendar_events_family ON calendar_events(family_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_calendar_events_timerange ON calendar_events(start_time, end_time);`);

    // 兼容性：新增 color 欄位（事件顏色）
    await client.query(`ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS color TEXT;`);

    await client.query('COMMIT');
    console.log('🧩 家庭功能資料表已就緒');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 建立家庭功能資料表失敗:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  testConnection,
  ensureFamilySchema
};
