const { getConnection } = require('../config/db');

class Question {
  static async getQuestionsByModeAndTopic(mode, subtopic) {
    const connection = await getConnection();
    try {
      let query = `SELECT id, question_text AS titleTh, options, difficulty, subtopic, correct_answer, explanation, image_url FROM questions WHERE difficulty = ?`;
      let params = [mode];
      if (subtopic && subtopic !== 'random') {
        query += ` AND subtopic = ?`;
        params.push(subtopic);
      }
      const [rows] = await connection.execute(query, params);
      return rows;
    } finally {
      await connection.end();
    }
  }

  static async getRandomQuestions(mode, quizMode = null, limit = 30) {
    console.log('🎲 Question.getRandomQuestions - Called with:', { mode, quizMode, limit });
    const connection = await getConnection();
    try {
      let query = `SELECT id, question_text AS titleTh, options, difficulty, subtopic, correct_answer, explanation, image_url FROM questions WHERE difficulty = ?`;
      let params = [mode];
      
      if (quizMode && quizMode !== 'random') {
        query += ` AND subtopic = ?`;
        params.push(quizMode);
      }
      
      // บังคับใช้ limit = 30 สำหรับโหมดสุ่ม (ไม่สนใจ parameter ที่ส่งมา)
      const actualLimit = 30;
      query += ` ORDER BY RAND() LIMIT ?`;
      params.push(actualLimit);
      
      console.log('🎲 Question.getRandomQuestions - SQL Query:', query);
      console.log('🎲 Question.getRandomQuestions - SQL Params:', params);
      console.log('🎲 Question.getRandomQuestions - FORCING limit to 30 regardless of input');
      
      const [rows] = await connection.execute(query, params);
      console.log('🎲 Question.getRandomQuestions - Found rows:', rows.length);
      
      // ถ้าได้น้อยกว่า 30 ข้อ ให้ลองดึงใหม่
      if (rows.length < 30) {
        console.log('🎲 Question.getRandomQuestions - Got less than 30, retrying...');
        const [retryRows] = await connection.execute(query, params);
        console.log('🎲 Question.getRandomQuestions - Retry found rows:', retryRows.length);
        return retryRows;
      }
      
      return rows;
    } finally {
      await connection.end();
    }
  }

  static async updateQuestion(id, { titleTh, options, difficulty, subtopic, correct_answer, explanation }) {
    const connection = await getConnection();
    try {
      await connection.execute(
        `UPDATE questions SET titleTh=?, options=?, difficulty=?, subtopic=?, correct_answer=?, explanation=? WHERE id=?`,
        [titleTh, JSON.stringify(options), difficulty, subtopic, correct_answer, explanation, id]
      );
    } finally {
      await connection.end();
    }
  }

  static async getAllQuestions() {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(`SELECT id, question_text AS titleTh, options, difficulty, subtopic, correct_answer, explanation, image_url FROM questions`);
      return rows;
    } finally {
      await connection.end();
    }
  }

  // เพิ่มฟังก์ชันเพื่อตรวจสอบจำนวนข้อสอบในแต่ละ difficulty
  static async getQuestionCountByDifficulty(difficulty) {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT COUNT(*) as count FROM questions WHERE difficulty = ?`,
        [difficulty]
      );
      return rows[0].count;
    } finally {
      await connection.end();
    }
  }
}

module.exports = Question;