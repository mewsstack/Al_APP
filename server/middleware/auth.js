// middleware/auth.js
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'กรุณาล็อกอิน' });

  try {
    const decoded = jwt.verify(token, 'superkey112');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    const [rows] = await connection.execute('SELECT id, username, email, score FROM users WHERE id = ?', [decoded.userId]);
    await connection.end();
    if (rows.length === 0) return res.status(401).json({ error: 'ผู้ใช้ไม่พบ' });
    req.user = rows[0];
    next();
  } catch (err) {
    console.error('Token error:', err.message);
    res.status(403).json({ error: 'Token ไม่ถูกต้อง' });
  }
};

module.exports = authenticateToken;