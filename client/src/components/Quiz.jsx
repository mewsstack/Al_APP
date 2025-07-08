import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function Quiz({ onSubmit = () => {} }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mode, subtopic, questions: initialQuestions } = location.state || {};
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1500);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [viewMode, setViewMode] = useState('single');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Quiz.jsx state:', { subtopic, mode, initialQuestions });
    if (!mode || !subtopic) {
      setError('ไม่พบโหมดหรือหัวข้อที่เลือก');
      setLoading(false);
    }
  }, [subtopic, mode]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        if (!mode || !subtopic) {
          throw new Error('ไม่พบโหมดหรือหัวข้อที่เลือก');
        }
        const effectiveMode = mode || 'easy';
        let url;
        if (subtopic === 'random') {
          url = `http://localhost:5000/api/quiz/questions?quizMode=random&mode=${effectiveMode}`;
        } else {
          url = `http://localhost:5000/api/quiz/questions?subtopic=${encodeURIComponent(subtopic)}&mode=${effectiveMode}`;
        }
        console.log('Fetching URL:', url);
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error ${response.status}: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        console.log('Received questions:', data);
        if (data.length === 0) throw new Error('ไม่พบโจทย์สำหรับเงื่อนไขนี้');
        setQuestions(data);
        setAnswers(Array(data.length).fill(null));
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
      setAnswers(Array(initialQuestions.length).fill(null));
      setLoading(false);
    } else if (mode && subtopic) {
      fetchQuestions();
    } else {
      setError('ไม่พบโหมดหรือหัวข้อที่เลือก');
      setLoading(false);
      navigate('/');
    }
  }, [subtopic, mode, initialQuestions, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleSubmit();
    }
  }, [timeLeft]);

  const handleAnswer = (index, answer) => {
    const newAnswers = [...answers];
    newAnswers[index] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct_answer) score += 10; // 10 คะแนนต่อข้อ
    });

    if (user) {
      try {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:5000/api/scores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ quizMode: mode, subtopic, score })
        });
      } catch (err) {
        console.error('Score submission error:', err);
      }
    }

    onSubmit({ answers, score });
    navigate('/result', { state: { answers, score, questions, mode, subtopic } });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const answered = answers.filter(answer => answer !== null).length;
    return Math.round((answered / questions.length) * 100);
  };

  const getTimeColor = () => {
    if (timeLeft > 300) return 'text-green-600';
    if (timeLeft > 120) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getModeInfo = (mode) => {
    switch (mode) {
      case 'easy': return { title: 'โหมดง่าย', color: 'bg-green-100 text-green-600' };
      case 'normal': return { title: 'โหมดปกติ', color: 'bg-blue-100 text-blue-600' };
      case 'hard': return { title: 'โหมดยาก', color: 'bg-red-100 text-red-600' };
      default: return { title: 'โหมดง่าย', color: 'bg-green-100 text-green-600' };
    }
  };

  const getQuizModeTitle = () => {
    switch (subtopic) {
      case 'Linear DS': return 'โครงสร้างข้อมูลเชิงเส้น';
      case 'Sorting Algo': return 'อัลกอริทึมการเรียงลำดับ';
      case 'Tree': return 'โครงสร้างข้อมูลแบบต้นไม้';
      case 'Merge Sort': return 'อัลกอริทึม Merge Sort';
      case 'Divide & Conquer': return 'Divide & Conquer';
      case 'Greedy Algorithm': return 'อัลกอริทึมโลภ';
      case 'random':
        switch (mode) {
          case 'easy': return 'โครงสร้างข้อมูลเชิงเส้น & อัลกอริทึมการเรียงลำดับ (สุ่ม)';
          case 'normal': return 'โครงสร้างต้นไม้ & Merge Sort (สุ่ม)';
          case 'hard': return 'Divide & Conquer & อัลกอริทึมโลภ (สุ่ม)';
          default: return 'สุ่มทั้งหมด';
        }
      default: return subtopic || 'ไม่ระบุหัวข้อ';
    }
  };

  const modeInfo = getModeInfo(mode);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <p className="text-lg text-gray-600">กำลังโหลดโจทย์...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <p className="text-lg text-red-600">เกิดข้อผิดพลาด: {error}</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <p className="text-lg text-gray-600">ไม่พบโจทย์สำหรับโหมด {getQuizModeTitle()}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">Q</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800">{getQuizModeTitle()}</h1>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${modeInfo.color}`}>
                    {modeInfo.title}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                ข้อ {viewMode === 'single' ? currentQuestion + 1 : '1'}-{questions.length}
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgress()}%` }}
                ></div>
              </div>
              <div className="text-sm font-medium text-gray-700">{getProgress()}%</div>
              <div className={`flex items-center space-x-2 px-3 py-2 bg-white rounded-lg shadow-sm ${getTimeColor()}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('single')}
                  className={`px-3 py-1 text-sm rounded-md transition-all ${
                    viewMode === 'single' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-600'
                  }`}
                >
                  ทีละข้อ
                </button>
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-3 py-1 text-sm rounded-md transition-all ${
                    viewMode === 'all' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-600'
                  }`}
                >
                  ทั้งหมด
                </button>
              </div>
            </div>
          </div>
          <div className="md:hidden mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>ข้อ {currentQuestion + 1} จาก {questions.length}</span>
              <span>{getProgress()}% เสร็จสิ้น</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {viewMode === 'single' ? (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {currentQuestion + 1}
                  </div>
                  <div className="text-sm text-gray-500">คำถามที่ {currentQuestion + 1}</div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    answers[currentQuestion] !== null ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {answers[currentQuestion] !== null ? 'ตอบแล้ว' : 'ยังไม่ตอบ'}
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 leading-relaxed mb-4">
                {questions[currentQuestion]?.titleTh || questions[currentQuestion]?.question_text}
              </h2>
              {questions[currentQuestion]?.image || questions[currentQuestion]?.image_url ? (
                <div className="mb-6">
                  <img
                    src={questions[currentQuestion].image || questions[currentQuestion].image_url}
                    alt="Question illustration"
                    className="w-full max-w-md mx-auto rounded-lg shadow-md object-contain"
                    onError={(e) => {
                      console.error('Image load error:', e);
                      e.target.src = 'https://via.placeholder.com/300x150?text=Image+Not+Found';
                    }}
                  />
                </div>
              ) : (
                <div className="mb-6 w-full max-w-md mx-auto h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">ไม่มีรูปภาพ</span>
                </div>
              )}
            </div>
            <div className="space-y-3 mb-8">
              {Array.isArray(questions[currentQuestion]?.options) ? (
                questions[currentQuestion].options.map((option, i) => (
                  <label
                    key={i}
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                      answers[currentQuestion] === i ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={i}
                      checked={answers[currentQuestion] === i}
                      onChange={() => handleAnswer(currentQuestion, i)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                        answers[currentQuestion] === i ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                      }`}
                    >
                      {answers[currentQuestion] === i && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className="text-gray-700 flex-1">{option}</span>
                  </label>
                ))
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600">ข้อผิดพลาด: ตัวเลือกไม่ถูกต้อง</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                  currentQuestion === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                ก่อนหน้า
              </button>
              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={() => setShowConfirmDialog(true)}
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
                >
                  ส่งคำตอบ
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all transform hover:scale-105"
                >
                  ถัดไป
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="text-sm text-gray-500">คำถามที่ {index + 1}</div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      answers[index] !== null ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {answers[index] !== null ? 'ตอบแล้ว' : 'ยังไม่ตอบ'}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{q.titleTh || q.question_text}</h3>
                {q.image || q.image_url ? (
                  <div className="mb-6">
                    <img
                      src={q.image || q.image_url}
                      alt="Question illustration"
                      className="w-full max-w-md mx-auto rounded-lg shadow-md object-contain"
                      onError={(e) => {
                        console.error('Image load error:', e);
                        e.target.src = 'https://via.placeholder.com/300x150?text=Image+Not+Found';
                      }}
                    />
                  </div>
                ) : (
                  <div className="mb-6 w-full max-w-md mx-auto h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">ไม่มีรูปภาพ</span>
                  </div>
                )}
                <div className="space-y-2">
                  {Array.isArray(q.options) ? (
                    q.options.map((option, i) => (
                      <label
                        key={i}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                          answers[index] === i ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={i}
                          checked={answers[index] === i}
                          onChange={() => handleAnswer(index, i)}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                            answers[index] === i ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                          }`}
                        >
                          {answers[index] === i && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))
                  ) : (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">ข้อผิดพลาด: ตัวเลือกไม่ถูกต้อง</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="text-center pt-4">
              <button
                onClick={() => setShowConfirmDialog(true)}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg text-lg"
              >
                ส่งคำตอบทั้งหมด
                <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        )}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">ยืนยันการส่งคำตอบ</h3>
              <p className="text-gray-600 mb-6">คุณแน่ใจหรือไม่ว่าต้องการส่งคำตอบ?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    handleSubmit();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700"
                >
                  ส่งคำตอบ
                </button>
              </div>
            </div>
          </div>
        )}
        {viewMode === 'single' && questions.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">นำทางคำถาม</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {questions.map((_, index) => {
                const isCurrent = index === currentQuestion;
                const isAnswered = answers[index] !== null && answers[index] !== undefined;

                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                      isCurrent
                        ? 'bg-indigo-500 text-white'
                        : isAnswered
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Quiz;