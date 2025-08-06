const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// ดึงข้อสอบแบบกรอง (mode, subtopic)
router.get('/questions', quizController.getQuestions);
// ดึงข้อสอบทั้งหมด (admin)
router.get('/questions/all', quizController.getAllQuestions);
// ดึงข้อสอบแบบสุ่ม (mode, quizMode)
router.get('/random', quizController.getRandomQuestions);
router.put('/questions/:id', quizController.updateQuestion);

module.exports = router;