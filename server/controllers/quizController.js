const Question = require('../models/Question');

exports.getQuestions = async (req, res) => {
  const { mode, subtopic } = req.query;
  try {
    const questions = await Question.getQuestionsByModeAndTopic(mode, subtopic);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRandomQuestions = async (req, res) => {
  const { mode, quizMode, limit } = req.query;
  console.log('🎲 getRandomQuestions - Received params:', { mode, quizMode, limit });
  try {
    // ตรวจสอบจำนวนข้อสอบที่มีในฐานข้อมูล
    const totalQuestions = await Question.getQuestionCountByDifficulty(mode);
    console.log('🎲 getRandomQuestions - Total questions in DB for difficulty', mode, ':', totalQuestions);
    
    // บังคับใช้ limit = 30 สำหรับโหมดสุ่ม (ไม่สนใจ parameter ที่ส่งมา)
    const questionLimit = 30;
    console.log('🎲 getRandomQuestions - FORCING limit to:', questionLimit, '(ignoring request limit)');
    
    // ถ้าขอมากกว่าที่มี ให้ใช้จำนวนที่มี
    const actualLimit = Math.min(questionLimit, totalQuestions);
    console.log('🎲 getRandomQuestions - Actual limit to use:', actualLimit);
    
    // เรียกใช้ model โดยส่ง limit = 30 แบบแข็งแรง
    const questions = await Question.getRandomQuestions(mode, quizMode, 30);
    console.log('🎲 getRandomQuestions - Returned questions count:', questions.length);
    
    // ถ้าได้น้อยกว่า 30 ข้อ ให้ลองดึงใหม่
    if (questions.length < 30 && totalQuestions >= 30) {
      console.log('🎲 getRandomQuestions - Retrying to get 30 questions...');
      const retryQuestions = await Question.getRandomQuestions(mode, quizMode, 30);
      console.log('🎲 getRandomQuestions - Retry returned:', retryQuestions.length, 'questions');
      res.json(retryQuestions);
    } else {
      res.json(questions);
    }
  } catch (error) {
    console.error('🎲 getRandomQuestions - Error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  const { id } = req.params;
  const { titleTh, options, difficulty, subtopic, correct_answer, explanation } = req.body;
  try {
    await Question.updateQuestion(id, { titleTh, options, difficulty, subtopic, correct_answer, explanation });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.getAllQuestions();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};