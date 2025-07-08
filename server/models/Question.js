const { getConnection } = require('../config/db');

class Question {
  static async getQuestionsByModeAndTopic(mode, topic) {
    const connection = await getConnection();
    try {
      let query = `SELECT * FROM questions WHERE difficulty = ?`;
      let params = [mode];
      if (topic && topic !== 'random') {
        query += ` AND topic = ?`;
        params.push(topic);
      }
      const [rows] = await connection.execute(query, params);
      return rows;
    } finally {
      await connection.end();
    }
  }

  static async getRandomQuestions(mode, limit = 10) {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM questions WHERE difficulty = ? ORDER BY RAND() LIMIT ?`,
        [mode, limit]
      );
      return rows;
    } finally {
      await connection.end();
    }
  }
}

module.exports = Question;