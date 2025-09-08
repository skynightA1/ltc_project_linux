const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// JWT 認證中間件
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: '缺少認證令牌' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 驗證使用者是否存在且啟用
    const result = await pool.query(
      'SELECT id, username, email, full_name, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: '使用者不存在' });
    }

    if (!result.rows[0].is_active) {
      return res.status(401).json({ error: '帳號已停用' });
    }

    // 將使用者資訊加到請求物件
    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '認證令牌已過期' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: '無效的認證令牌' });
    }
    console.error('JWT 驗證錯誤:', err);
    return res.status(500).json({ error: '認證過程發生錯誤' });
  }
};

// 可選的認證中間件（不強制要求登入）
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      'SELECT id, username, email, full_name, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length > 0 && result.rows[0].is_active) {
      req.user = result.rows[0];
    } else {
      req.user = null;
    }
  } catch (err) {
    req.user = null;
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
};
