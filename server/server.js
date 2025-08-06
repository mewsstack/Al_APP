require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const scoresRouter = require('./routes/scores');
const usersRouter = require('./routes/user');
const quizRouter = require('./routes/quiz');

const app = express();

// ตั้งค่า CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Debug environment variables
console.log('Database config:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '[REDACTED]' : 'undefined',
  database: process.env.DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET ? '[REDACTED]' : 'undefined',
  PORT: process.env.PORT,
});

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
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

// สร้างตาราง users, scores, และ questions
const initializeDatabase = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        score INT DEFAULT 0,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS scores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        quiz_mode VARCHAR(50) NOT NULL,
        subtopic VARCHAR(50),
        score INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_text VARCHAR(255) NOT NULL,
        options JSON NOT NULL,
        difficulty ENUM('easy', 'normal', 'hard') NOT NULL,
        subtopic VARCHAR(50) NOT NULL,
        correct_answer VARCHAR(255) NOT NULL,
        explanation VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await connection.end();
    console.log('Database initialized');
  } catch (error) {
    console.error('Database initialization error:', error.message);
  }
};

// เรียกใช้งาน initializeDatabase
initializeDatabase();

// Register
app.post('/api/register', authenticateToken, isAdmin, async (req, res) => {
  const { username, email, password, is_admin = false } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const hashedPassword = await bcrypt.hash(password, 10);
    await connection.execute(
      'INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, is_admin]
    );
    await connection.end();
    res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ' });
  } catch (err) {
    console.error('Register error:', err.message);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่แล้ว' });
    }
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT id, username, email, password, score, is_admin FROM users WHERE email = ?',
      [email]
    );
    await connection.end();

    if (rows.length === 0) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const token = jwt.sign(
      { userId: user.id, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        score: user.score,
        is_admin: user.is_admin,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการล็อกอิน' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  res.json({ message: 'ออกจากระบบสำเร็จ' });
});

// Profile
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Rank
app.get('/api/rank', authenticateToken, isAdmin, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT id, username, score, is_admin FROM users ORDER BY score DESC LIMIT 50'
    );
    await connection.end();
    res.json(rows);
  } catch (err) {
    console.error('Rank error:', err.message);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงอันดับ' });
  }
});

// Get scores
app.get('/api/scores', authenticateToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT quiz_mode, subtopic, score, created_at FROM scores WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    await connection.end();
    res.json(rows);
  } catch (err) {
    console.error('Get scores error:', err.message);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงคะแนน' });
  }
});

// Quiz Questions (ดึงทั้งหมดสำหรับ Admin)
app.get('/api/quiz/questions/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT id, question_text AS titleTh, options, difficulty, subtopic, correct_answer, explanation FROM questions'
    );
    console.log('Raw questions from DB:', rows); // ตรวจสอบข้อมูลดิบ
    const parsedRows = rows.map(row => ({
      ...row,
      options: JSON.parse(row.options), // ตรวจสอบการ parse JSON
    }));
    console.log('Parsed questions:', parsedRows); // ตรวจสอบหลัง parse
    await connection.end();
    res.json(parsedRows);
  } catch (err) {
    console.error('Get all questions error:', err.message);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลข้อสอบ' });
  }
});

// Add Question
app.post('/api/quiz/questions', authenticateToken, isAdmin, async (req, res) => {
  const { titleTh, options, difficulty, subtopic, correct_answer, explanation } = req.body;
  if (!titleTh || !options || !difficulty || !subtopic || !correct_answer) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO questions (question_text, options, difficulty, subtopic, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?)',
      [titleTh, JSON.stringify(options), difficulty, subtopic, correct_answer, explanation]
    );
    await connection.end();
    res.status(201).json({ message: 'เพิ่มข้อสอบสำเร็จ' });
  } catch (err) {
    console.error('Add question error:', err.message);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มข้อสอบ' });
  }
});

// Delete Question
app.delete('/api/quiz/questions/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'DELETE FROM questions WHERE id = ?',
      [req.params.id]
    );
    await connection.end();
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อสอบ' });
    }
    res.json({ message: 'ลบข้อสอบสำเร็จ' });
  } catch (err) {
    console.error('Delete question error:', err.message);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบข้อสอบ' });
  }
});

// Update Question
app.put('/api/quiz/questions/:id', authenticateToken, isAdmin, async (req, res) => {
  const { titleTh, options, difficulty, subtopic, correct_answer, explanation } = req.body;
  if (!titleTh || !options || !difficulty || !subtopic || !correct_answer) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'UPDATE questions SET question_text = ?, options = ?, difficulty = ?, subtopic = ?, correct_answer = ?, explanation = ? WHERE id = ?',
      [titleTh, JSON.stringify(options), difficulty, subtopic, correct_answer, explanation, req.params.id]
    );
    await connection.end();
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อสอบ' });
    }
    res.json({ message: 'แก้ไขข้อสอบสำเร็จ' });
  } catch (err) {
    console.error('Update question error:', err.message);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขข้อสอบ' });
  }
});

// Random Quiz
app.get('/api/quiz/random', async (req, res) => {
  const { mode } = req.query;
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM questions WHERE difficulty = ? ORDER BY RAND() LIMIT 10',
      [mode]
    );
    const parsedRows = rows.map(row => ({
      ...row,
      options: JSON.parse(row.options || '[]'),
    }));
    res.json(parsedRows);
  } catch (err) {
    console.error('Random quiz error:', err.message);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสุ่มโจทย์' });
  } finally {
    if (connection) await connection.end();
  }
});

// API สำหรับกำหนด Admin (ควรลบหลังใช้งาน)
app.post('/api/make-admin', authenticateToken, isAdmin, async (req, res) => {
  const { userId } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'UPDATE users SET is_admin = TRUE WHERE id = ?',
      [userId]
    );
    await connection.end();
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }
    res.json({ message: 'กำหนด Admin สำเร็จ' });
  } catch (err) {
    console.error('Make admin error:', err.message);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

// เพิ่มเส้นทางจาก usersRouter หรือกำหนดใน server.js
app.use('/api/scores', scoresRouter);
app.use('/api/users', usersRouter);
app.use('/api/quiz', quizRouter);

// เพิ่มการกำหนดเส้นทางถ้ายังไม่มีใน usersRouter
app.delete('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [user] = await connection.execute('SELECT is_admin FROM users WHERE id = ?', [req.params.id]);
    if (user[0]?.is_admin) {
      await connection.end();
      return res.status(403).json({ error: 'ไม่สามารถลบผู้ใช้ที่เป็น Admin ได้' });
    }
    await connection.execute('DELETE FROM scores WHERE user_id = ?', [req.params.id]);
    const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    await connection.end();
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }
    res.json({ message: 'ลบผู้ใช้สำเร็จ' });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบผู้ใช้' });
  }
});

app.put('/api/users/:id/score', authenticateToken, isAdmin, async (req, res) => {
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

app.put('/api/users/:id/role', authenticateToken, isAdmin, async (req, res) => {
  const { is_admin } = req.body;
  const { id } = req.params;

  if (typeof is_admin !== 'boolean') {
    return res.status(400).json({ error: 'is_admin ต้องเป็น boolean' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log(`Updating role for user ID ${id} to is_admin: ${is_admin}`);
    const [result] = await connection.execute(
      'UPDATE users SET is_admin = ? WHERE id = ?',
      [is_admin, id]
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

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

// ใน server.js
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }
  try {
    const connection = await mysql.createConnection(dbConfig);
    const hashedPassword = await bcrypt.hash(password, 10);
    await connection.execute(
      'INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, FALSE)',
      [username, email, hashedPassword]
    );
    await connection.end();
    res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ' });
  } catch (err) {
    console.error('Signup error:', err.message);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่แล้ว' });
    }
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
  }
});