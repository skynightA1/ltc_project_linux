const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 註冊
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, full_name, phone } = req.body;

    // 驗證必填欄位
    if (!username || !email || !password) {
      return res.status(400).json({ error: '使用者名稱、電子郵件和密碼為必填欄位' });
    }

    // 檢查使用者名稱和電子郵件是否已存在
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: '使用者名稱或電子郵件已存在' });
    }

    // 建立新使用者（使用原始密碼，如你要求）
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, full_name, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, full_name, role',
      [username, email, password, full_name || null, phone || null]
    );

    const user = result.rows[0];

    // 建立使用者設定
    await pool.query(
      'INSERT INTO user_settings (user_id) VALUES ($1)',
      [user.id]
    );

    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '註冊成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      token
    });

  } catch (err) {
    console.error('註冊錯誤:', err);
    res.status(500).json({ error: '註冊失敗，請稍後再試' });
  }
});

// 登入
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '使用者名稱和密碼為必填欄位' });
    }

    // 查詢使用者
    const result = await pool.query(
      'SELECT id, username, email, password_hash, full_name, role, is_active FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: '使用者名稱或密碼錯誤' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ error: '帳號已停用' });
    }

    // 驗證密碼（使用原始密碼比較）
    if (user.password_hash !== password) {
      return res.status(401).json({ error: '使用者名稱或密碼錯誤' });
    }

    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '登入成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      token
    });

  } catch (err) {
    console.error('登入錯誤:', err);
    res.status(500).json({ error: '登入失敗，請稍後再試' });
  }
});

// 取得目前使用者資訊
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: req.user
  });
});

// 登出（前端處理，這裡只是確認）
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: '登出成功' });
});

module.exports = router;
