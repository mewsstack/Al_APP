const Question = require('../models/Question');

exports.getQuestions = async (req, res) => {
  const { mode, topic } = req.query;
  try {
    const questions = await Question.getQuestionsByModeAndTopic(mode, topic);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRandomQuestions = async (req, res) => {
  const { mode } = req.query;
  try {
    const questions = await Question.getRandomQuestions(mode);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};