const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const authenticateToken = require('../middleware/auth');

console.log('Database config:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '[REDACTED]' : 'undefined',
  database: process.env.DB_NAME,
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

router.post('/', authenticateToken, async (req, res) => {
  const { user_id: userIdRaw, quiz_mode, subtopic, score } = req.body;
  const user_id = parseInt(userIdRaw, 10); // แปลง user_id เป็น integer
  console.log('Received score data:', { user_id, quiz_mode, subtopic, score });
  console.log('Authenticated user:', req.user);

  try {
    if (!user_id || !quiz_mode || !subtopic || score === undefined) {
      return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
    }

    if (req.user.id !== user_id) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์บันทึกคะแนนสำหรับผู้ใช้คนอื่น' });
    }

    let connection;
    try {
      connection = await pool.getConnection();
      console.log('Database connection established');
      await connection.beginTransaction();

      const [result] = await connection.query(
        'INSERT INTO scores (user_id, quiz_mode, subtopic, score, created_at) VALUES (?, ?, ?, ?, NOW())',
        [user_id, quiz_mode, subtopic, score]
      );
      console.log('Score inserted:', result);

      await connection.query(
        'UPDATE users SET score = score + ? WHERE id = ?',
        [score, user_id]
      );
      console.log('User score updated');

      await connection.commit();
      res.status(201).json({
        message: 'บันทึกคะแนนสำเร็จ',
        scoreId: result.insertId,
      });
    } catch (error) {
      if (connection) {
        await connection.rollback();
        console.error('Database error during transaction:', error);
      }
      throw error;
    } finally {
      if (connection) {
        connection.release();
        console.log('Connection released');
      }
    }
  } catch (error) {
    console.error('Error in POST /api/scores:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกคะแนน', details: error.message });
  }
});

module.exports = router;