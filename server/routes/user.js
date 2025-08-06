const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Middleware สำหรับตรวจสอบ JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'กรุณาล็อกอิน' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT id, username, email, score, is_admin FROM users WHERE id = ?',
      [decoded.userId]
    );
    await connection.end();
    if (rows.length === 0) return res.status(401).json({ error: 'ผู้ใช้ไม่พบ' });
    req.user = rows[0];
    next();
  } catch (err) {
    console.error('Token error:', err.message);
    res.status(403).json({ error: 'Token ไม่ถูกต้องหรือหมดอายุ' });
  }
};

// Middleware สำหรับตรวจสอบว่าเป็น Admin
const isAdmin = async (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'เฉพาะผู้ดูแลระบบเท่านั้น' });
  }
  next();
};

// ลบผู้ใช้
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [user] = await connection.execute('SELECT is_admin FROM users WHERE id = ?', [req.params.id]);
    if (user[0]?.is_admin) {
      await connection.end();
      return res.status(403).json({ error: 'ไม่สามารถลบผู้ใช้ที่เป็น Admin ได้' });
    }
    await connection.execute('DELETE FROM scores WHERE user_id = ?', [req.params.id]);
    await connection.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    await connection.end();
    res.json({ message: 'ลบผู้ใช้สำเร็จ' });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบผู้ใช้' });
  }
});

// แก้ไขคะแนน
router.put('/:id/score', authenticateToken, isAdmin, async (req, res) => {
  const { score } = req.body;
  if (typeof score !== 'number') {
    return res.status(400).json({ error: 'คะแนนต้องเป็นตัวเลข' });
  }
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'UPDATE users SET score = ? WHERE id = ?',
      [score, req.params.id]
    );
    await connection.end();
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }
    res.json({ message: 'อัปเดตคะแนนสำเร็จ' });
  } catch (err) {
    console.error('Score update error:', err.message);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตคะแนน' });
  }
});

// เปลี่ยนสถานะ Admin
router.put('/:id/role', authenticateToken, isAdmin, async (req, res) => {
  const { is_admin } = req.body;
  const { id } = req.params;

  if (typeof is_admin !== 'boolean') {
    return res.status(400).json({ error: 'is_admin ต้องเป็น boolean' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
  'INSERT INTO admin_logs (admin_id, action, details) VALUES (?, ?, ?)',
  [req.user.id, 'change_role', `Changed role of user ${id} to ${is_admin}`]
    );
    await connection.end();
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }
    res.json({ message: 'อัปเดตสถานะ Admin สำเร็จ' });
  } catch (err) {
    console.error('Role update error:', err.message);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ Admin' });
  }
});

module.exports = router;