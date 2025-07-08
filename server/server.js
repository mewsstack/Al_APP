require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const scoresRouter = require('./routes/scores');

// Debug environment variables
console.log('Environment variables:', {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD ? '[REDACTED]' : 'undefined',
  DB_NAME: process.env.DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT,
});

const app = express();
app.use(cors());
app.use(express.json());

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
    console.log('Decoded token:', decoded); // Debug
    const connection = await mysql.createConnection(dbConfig);
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

// สร้างตาราง users และ scores
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
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    await connection.end();
    console.log('Database initialized');
  } catch (error) {
    console.error('Database initialization error:', error.message);
  }
};
initializeDatabase();

// Register
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const hashedPassword = await bcrypt.hash(password, 10);
    await connection.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    await connection.end();
    res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ' });
  } catch (err) {
    console.error('Register error:', err.message);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่แล้ว' });
    } else {
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
    }
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
    const [rows] = await connection.execute('SELECT id, username, email, password, score FROM users WHERE email = ?', [email]);
    await connection.end();

    if (rows.length === 0) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, score: user.score } });
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
app.get('/api/rank', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT id, username, score FROM users ORDER BY score DESC LIMIT 50'
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
    console.error('Get scores error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงคะแนน', details: err.message });
  }
});

// API สำหรับดึงคำถาม
app.get('/api/quiz/questions', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const { mode, subtopic, quizMode } = req.query;
  console.log('Request received:', { mode, subtopic, quizMode });

  if (!mode || !['easy', 'normal', 'hard'].includes(mode)) {
    return res.status(400).json({ error: 'ต้องระบุ mode ที่ถูกต้อง (easy, normal, hard)' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database successfully');

    let query = `
      SELECT id, question_text AS titleTh, options, difficulty, image_url, subtopic, correct_answer, explanation
      FROM questions
      WHERE difficulty = ?
    `;
    let params = [mode];

    const subtopicMapping = {
      'Linear DS': 'LS',
      'Sorting Algo': 'Sorting Algo',
      'Tree': 'Tree',
      'Merge Sort': 'Merge Sort',
      'Divide & Conquer': 'DivideConquer',
      'Greedy Algorithm': 'Greedy'
    };
    const dbSubtopic = subtopic ? subtopicMapping[subtopic] || subtopic : null;

    if (quizMode === 'random') {
      let subtopics;
      if (mode === 'hard') {
        subtopics = ['DivideConquer', 'Greedy'];
      } else if (mode === 'normal') {
        subtopics = ['Tree', 'Merge Sort'];
      } else {
        subtopics = ['LS', 'Sorting'];
      }
      query += ` AND subtopic IN (${subtopics.map(() => '?').join(',')}) ORDER BY RAND() LIMIT 10`;
      params.push(...subtopics);
      console.log('Random query:', { query, params, subtopics });
    } else if (dbSubtopic && Object.values(subtopicMapping).includes(dbSubtopic)) {
      query += ` AND subtopic = ?`;
      params.push(dbSubtopic);
      console.log('Subtopic query:', { query, params, dbSubtopic, originalSubtopic: subtopic });
    } else {
      return res.status(400).json({
        error: `ต้องระบุ subtopic (${Object.keys(subtopicMapping).join(', ')}) หรือ quizMode=random`,
        receivedSubtopic: subtopic,
        receivedQuizMode: quizMode
      });
    }

    const [rows] = await connection.execute(query, params);
    console.log('Query result:', rows);

    if (rows.length === 0) {
      const [debugRows] = await connection.execute(
        `SELECT subtopic, difficulty, COUNT(*) AS count FROM questions GROUP BY subtopic, difficulty`
      );
      console.log('Debug: Available questions:', debugRows);
      return res.status(404).json({
        error: `ไม่พบโจทย์สำหรับ subtopic=${subtopic || 'random'} และ mode=${mode}`,
        debug: debugRows
      });
    }

    const parsedRows = rows.map(row => {
      let parsedOptions = [];
      if (row.options) {
        try {
          parsedOptions = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;
        } catch (e) {
          console.error(`Invalid JSON in options for question ${row.id}:`, row.options);
          parsedOptions = [];
        }
      }
      return {
        ...row,
        options: parsedOptions
      };
    });

    res.setHeader('Content-Type', 'application/json');
    res.json(parsedRows);
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงโจทย์', details: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// API สำหรับสุ่มคำถาม
app.get('/api/quiz/random', async (req, res) => {
  const { mode } = req.query;
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database successfully');
    const [rows] = await connection.execute(
      `SELECT * FROM questions WHERE difficulty = ? ORDER BY RAND() LIMIT 10`,
      [mode]
    );
    const parsedRows = rows.map(row => ({
      ...row,
      options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options
    }));
    res.json(parsedRows);
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

app.use('/api/scores', scoresRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});