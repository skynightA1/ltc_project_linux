const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 取得使用者設定
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT font_size, high_contrast, language FROM user_settings WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      // 如果沒有設定，返回預設值
      return res.json({
        font_size: 'medium',
        high_contrast: false,
        language: 'zh-TW'
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('取得使用者設定錯誤:', err);
    res.status(500).json({ error: '取得設定失敗' });
  }
});

// 更新使用者設定
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const { font_size, high_contrast, language } = req.body;

    // 驗證設定值
    const validFontSizes = ['small', 'medium', 'large'];
    const validLanguages = ['zh-TW', 'zh-CN', 'en'];

    if (font_size && !validFontSizes.includes(font_size)) {
      return res.status(400).json({ error: '無效的字體大小' });
    }

    if (language && !validLanguages.includes(language)) {
      return res.status(400).json({ error: '無效的語言設定' });
    }

    // 使用 UPSERT 更新或插入設定
    const result = await pool.query(
      `INSERT INTO user_settings (user_id, font_size, high_contrast, language, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET 
         font_size = COALESCE(EXCLUDED.font_size, user_settings.font_size),
         high_contrast = COALESCE(EXCLUDED.high_contrast, user_settings.high_contrast),
         language = COALESCE(EXCLUDED.language, user_settings.language),
         updated_at = NOW()
       RETURNING font_size, high_contrast, language`,
      [
        req.user.id,
        font_size || 'medium',
        high_contrast !== undefined ? high_contrast : false,
        language || 'zh-TW'
      ]
    );

    res.json({
      message: '設定更新成功',
      settings: result.rows[0]
    });

  } catch (err) {
    console.error('更新使用者設定錯誤:', err);
    res.status(500).json({ error: '更新設定失敗' });
  }
});

// 取得使用者資料
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, full_name, phone, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '使用者不存在' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('取得使用者資料錯誤:', err);
    res.status(500).json({ error: '取得使用者資料失敗' });
  }
});

// 更新使用者資料
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { full_name, phone } = req.body;

    const result = await pool.query(
      'UPDATE users SET full_name = $1, phone = $2, updated_at = NOW() WHERE id = $3 RETURNING id, username, email, full_name, phone, role',
      [full_name, phone, req.user.id]
    );

    res.json({
      message: '使用者資料更新成功',
      user: result.rows[0]
    });

  } catch (err) {
    console.error('更新使用者資料錯誤:', err);
    res.status(500).json({ error: '更新使用者資料失敗' });
  }
});

module.exports = router;
