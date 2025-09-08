const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 取得聊天記錄
router.get('/messages', authenticateToken, async (req, res) => {
  try {
    const { conversation_id, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT id, conversation_id, role, content, timestamp
      FROM chat_messages 
      WHERE user_id = $1
    `;
    const params = [req.user.id];

    if (conversation_id) {
      query += ' AND conversation_id = $2';
      params.push(conversation_id);
    }

    query += ' ORDER BY timestamp DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    res.json({
      messages: result.rows.reverse(), // 反轉順序，最新的在最後
      total: result.rows.length
    });

  } catch (err) {
    console.error('取得聊天記錄錯誤:', err);
    res.status(500).json({ error: '取得聊天記錄失敗' });
  }
});

// 儲存聊天訊息
router.post('/messages', authenticateToken, async (req, res) => {
  try {
    const { conversation_id, role, content } = req.body;

    if (!role || !content) {
      return res.status(400).json({ error: '角色和內容為必填欄位' });
    }

    const validRoles = ['user', 'assistant', 'system'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: '無效的角色' });
    }

    const result = await pool.query(
      'INSERT INTO chat_messages (user_id, conversation_id, role, content) VALUES ($1, $2, $3, $4) RETURNING id, conversation_id, role, content, timestamp',
      [req.user.id, conversation_id || null, role, content]
    );

    res.status(201).json({
      message: '訊息儲存成功',
      chat_message: result.rows[0]
    });

  } catch (err) {
    console.error('儲存聊天訊息錯誤:', err);
    res.status(500).json({ error: '儲存訊息失敗' });
  }
});

// 取得對話列表
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT conversation_id, 
              MAX(timestamp) as last_message_time,
              COUNT(*) as message_count
       FROM chat_messages 
       WHERE user_id = $1 AND conversation_id IS NOT NULL
       GROUP BY conversation_id
       ORDER BY last_message_time DESC`,
      [req.user.id]
    );

    res.json({
      conversations: result.rows
    });

  } catch (err) {
    console.error('取得對話列表錯誤:', err);
    res.status(500).json({ error: '取得對話列表失敗' });
  }
});

// 刪除對話
router.delete('/conversations/:conversation_id', authenticateToken, async (req, res) => {
  try {
    const { conversation_id } = req.params;

    const result = await pool.query(
      'DELETE FROM chat_messages WHERE user_id = $1 AND conversation_id = $2',
      [req.user.id, conversation_id]
    );

    res.json({
      message: '對話刪除成功',
      deleted_count: result.rowCount
    });

  } catch (err) {
    console.error('刪除對話錯誤:', err);
    res.status(500).json({ error: '刪除對話失敗' });
  }
});

module.exports = router;
