const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 取得家庭行事曆（以週為單位或時間區間）
router.get('/calendar', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { start, end } = req.query; // ISO 字串

    const familyRes = await pool.query(
      `SELECT fm.family_id FROM family_members fm WHERE fm.user_id = $1 LIMIT 1`,
      [userId]
    );
    if (familyRes.rows.length === 0) {
      return res.json({ familyId: null, events: [] });
    }
    const familyId = familyRes.rows[0].family_id;

    // 時間條件
    let eventsRes;
    if (start && end) {
      eventsRes = await pool.query(
        `SELECT id, family_id, author_user_id, title, content, start_time, end_time, color, created_at
         FROM calendar_events
         WHERE family_id = $1 AND start_time < $3 AND end_time > $2
         ORDER BY start_time ASC`,
        [familyId, new Date(start), new Date(end)]
      );
    } else {
      eventsRes = await pool.query(
        `SELECT id, family_id, author_user_id, title, content, start_time, end_time, color, created_at
         FROM calendar_events
         WHERE family_id = $1
         ORDER BY start_time ASC
        `,
        [familyId]
      );
    }

    return res.json({ familyId, events: eventsRes.rows });
  } catch (error) {
    console.error('取得家庭行事曆失敗:', error);
    return res.status(500).json({ error: '取得家庭行事曆失敗' });
  }
});

// 新增家庭行事曆事件
router.post('/calendar', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, start_time, end_time, color } = req.body;

    if (!title || !start_time || !end_time) {
      return res.status(400).json({ error: 'title, start_time, end_time 為必填' });
    }

    const familyRes = await pool.query(
      `SELECT fm.family_id FROM family_members fm WHERE fm.user_id = $1 LIMIT 1`,
      [userId]
    );
    if (familyRes.rows.length === 0) {
      return res.status(403).json({ error: '尚未加入任何家庭' });
    }
    const familyId = familyRes.rows[0].family_id;

    const insertRes = await pool.query(
      `INSERT INTO calendar_events (family_id, author_user_id, title, content, start_time, end_time, color)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, family_id, author_user_id, title, content, start_time, end_time, color, created_at`,
      [familyId, userId, title, content || null, new Date(start_time), new Date(end_time), color || null]
    );

    return res.status(201).json({ event: insertRes.rows[0] });
  } catch (error) {
    console.error('新增家庭行事曆事件失敗:', error);
    return res.status(500).json({ error: '新增家庭行事曆事件失敗' });
  }
});

// 編輯事件
router.patch('/calendar/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = Number(req.params.id);
    const { title, content, start_time, end_time, color } = req.body;

    if (!eventId) return res.status(400).json({ error: '事件ID無效' });

    // 驗證家庭關係
    const familyRes = await pool.query(`SELECT fm.family_id FROM family_members fm WHERE fm.user_id = $1 LIMIT 1`, [userId]);
    if (familyRes.rows.length === 0) return res.status(403).json({ error: '尚未加入任何家庭' });
    const familyId = familyRes.rows[0].family_id;

    const updateRes = await pool.query(
      `UPDATE calendar_events SET
         title = COALESCE($1, title),
         content = COALESCE($2, content),
         start_time = COALESCE($3, start_time),
         end_time = COALESCE($4, end_time),
         color = COALESCE($5, color)
       WHERE id = $6 AND family_id = $7
       RETURNING id, family_id, author_user_id, title, content, start_time, end_time, color, created_at`,
      [title ?? null, content ?? null, start_time ? new Date(start_time) : null, end_time ? new Date(end_time) : null, color ?? null, eventId, familyId]
    );

    if (updateRes.rows.length === 0) return res.status(404).json({ error: '事件不存在' });
    return res.json({ event: updateRes.rows[0] });
  } catch (error) {
    console.error('更新家庭行事曆事件失敗:', error);
    return res.status(500).json({ error: '更新家庭行事曆事件失敗' });
  }
});

// 刪除事件
router.delete('/calendar/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = Number(req.params.id);
    if (!eventId) return res.status(400).json({ error: '事件ID無效' });

    const familyRes = await pool.query(`SELECT fm.family_id FROM family_members fm WHERE fm.user_id = $1 LIMIT 1`, [userId]);
    if (familyRes.rows.length === 0) return res.status(403).json({ error: '尚未加入任何家庭' });
    const familyId = familyRes.rows[0].family_id;

    const delRes = await pool.query(`DELETE FROM calendar_events WHERE id = $1 AND family_id = $2 RETURNING id`, [eventId, familyId]);
    if (delRes.rows.length === 0) return res.status(404).json({ error: '事件不存在' });
    return res.json({ message: '已刪除' });
  } catch (error) {
    console.error('刪除家庭行事曆事件失敗:', error);
    return res.status(500).json({ error: '刪除家庭行事曆事件失敗' });
  }
});
// 取得目前使用者所屬家庭成員
router.get('/members', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const familyRes = await pool.query(
      `SELECT fm.family_id
       FROM family_members fm
       WHERE fm.user_id = $1
       LIMIT 1`,
      [userId]
    );

    if (familyRes.rows.length === 0) {
      return res.json({ familyId: null, members: [] });
    }

    const familyId = familyRes.rows[0].family_id;
    const membersRes = await pool.query(
      `SELECT u.id, u.username, u.email, u.full_name
       FROM family_members fm
       JOIN users u ON u.id = fm.user_id
       WHERE fm.family_id = $1
       ORDER BY u.id ASC`,
      [familyId]
    );

    return res.json({ familyId, members: membersRes.rows });
  } catch (error) {
    console.error('取得家庭成員失敗:', error);
    return res.status(500).json({ error: '取得家庭成員失敗' });
  }
});

// 取得目前使用者的邀請清單（待處理）
router.get('/invitations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const invitesRes = await pool.query(
      `SELECT fi.id, fi.family_id, fi.inviter_id, u.username AS inviter_username, fi.status, fi.created_at
       FROM family_invitations fi
       JOIN users u ON u.id = fi.inviter_id
       WHERE fi.invitee_id = $1 AND fi.status = 'pending'
       ORDER BY fi.created_at DESC`,
      [userId]
    );
    return res.json({ invitations: invitesRes.rows });
  } catch (error) {
    console.error('取得邀請清單失敗:', error);
    return res.status(500).json({ error: '取得邀請清單失敗' });
  }
});

// 邀請使用者加入家庭（傳入 inviteeId）。若尚未有家庭，先為邀請者建立家庭
router.post('/invite', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const inviterId = req.user.id;
    const { inviteeUsername } = req.body;

    if (!inviteeUsername || typeof inviteeUsername !== 'string' || inviteeUsername.trim().length === 0) {
      return res.status(400).json({ error: 'inviteeUsername 無效' });
    }

    // 以用戶名稱查詢被邀請者
    const inviteeRes = await client.query('SELECT id, username FROM users WHERE username = $1', [inviteeUsername.trim()]);
    if (inviteeRes.rows.length === 0) {
      return res.status(404).json({ error: '被邀請者不存在' });
    }
    const inviteeId = inviteeRes.rows[0].id;

    if (inviteeId === inviterId) {
      return res.status(400).json({ error: '不可邀請自己' });
    }

    await client.query('BEGIN');

    // 取得或建立邀請者的家庭
    let familyId;
    const inviterFamily = await client.query(
      `SELECT fm.family_id FROM family_members fm WHERE fm.user_id = $1 LIMIT 1`,
      [inviterId]
    );

    if (inviterFamily.rows.length === 0) {
      // 建立新家庭，owner 是 inviter
      const familyInsert = await client.query(
        `INSERT INTO families (name, owner_id) VALUES ($1, $2) RETURNING id`,
        ['我的家庭', inviterId]
      );
      familyId = familyInsert.rows[0].id;
      await client.query(
        `INSERT INTO family_members (family_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [familyId, inviterId]
      );
    } else {
      familyId = inviterFamily.rows[0].family_id;
    }

    // 已經是家庭成員就不需再邀請
    const existsMember = await client.query(
      `SELECT 1 FROM family_members WHERE family_id = $1 AND user_id = $2`,
      [familyId, inviteeId]
    );
    if (existsMember.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: '對方已是家庭成員' });
    }

    // 建立或復用 pending 邀請
    const inviteInsert = await client.query(
      `INSERT INTO family_invitations (family_id, inviter_id, invitee_id, status)
       VALUES ($1, $2, $3, 'pending')
       ON CONFLICT DO NOTHING
       RETURNING id, family_id, inviter_id, invitee_id, status, created_at`,
      [familyId, inviterId, inviteeId]
    );

    await client.query('COMMIT');
    return res.status(201).json({
      message: '邀請已送出',
      invitation: inviteInsert.rows[0] || null
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('送出邀請失敗:', error);
    return res.status(500).json({ error: '送出邀請失敗' });
  } finally {
    client.release();
  }
});

// 接受邀請（傳入 invitationId）
router.post('/accept', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const { invitationId } = req.body;

    if (!invitationId) {
      return res.status(400).json({ error: 'invitationId 必填' });
    }

    await client.query('BEGIN');

    // 取得邀請並檢查擁有權
    const inviteRes = await client.query(
      `SELECT id, family_id, invitee_id, status FROM family_invitations WHERE id = $1 FOR UPDATE`,
      [invitationId]
    );
    if (inviteRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: '邀請不存在' });
    }
    const invite = inviteRes.rows[0];
    if (invite.invitee_id !== userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: '無權接受此邀請' });
    }
    if (invite.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: '此邀請已處理' });
    }

    // 新增為家庭成員（無角色欄位）
    await client.query(
      `INSERT INTO family_members (family_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [invite.family_id, userId]
    );

    // 更新邀請狀態
    await client.query(
      `UPDATE family_invitations SET status = 'accepted' WHERE id = $1`,
      [invitationId]
    );

    await client.query('COMMIT');
    return res.json({ message: '已加入家庭', familyId: invite.family_id });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('接受邀請失敗:', error);
    return res.status(500).json({ error: '接受邀請失敗' });
  } finally {
    client.release();
  }
});

// 拒絕邀請（傳入 invitationId）
router.post('/decline', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { invitationId } = req.body;

    if (!invitationId) {
      return res.status(400).json({ error: 'invitationId 必填' });
    }

    const inviteRes = await pool.query(
      `UPDATE family_invitations
       SET status = 'declined'
       WHERE id = $1 AND invitee_id = $2 AND status = 'pending'
       RETURNING id`,
      [invitationId, userId]
    );

    if (inviteRes.rows.length === 0) {
      return res.status(404).json({ error: '邀請不存在或已處理' });
    }
    return res.json({ message: '已拒絕邀請' });
  } catch (error) {
    console.error('拒絕邀請失敗:', error);
    return res.status(500).json({ error: '拒絕邀請失敗' });
  }
});

module.exports = router;


