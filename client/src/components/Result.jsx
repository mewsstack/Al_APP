// Result.js
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useEffect } from 'react';

function Result() {
  const { user, loading } = useAuth(); // เพิ่ม loading
  const { state } = useLocation();
  const { answers, score, questions, mode, subtopic } = state || {};
  const navigate = useNavigate();

  const subtopicMapping = {
    'Linear DS': 'LS',
    'Sorting Algo': 'Sorting Algo',
    'Tree': 'Tree',
    'Merge Sort': 'Merge Sort',
    'Divide & Conquer': 'DivideConquer',
    'Greedy Algorithm': 'Greedy',
  };

  useEffect(() => {
    if (loading) return; // รอจนกว่า AuthContext จะโหลดเสร็จ
    if (!user || !user.token) {
      navigate('/login');
      return;
    }

    const payload = {
      user_id: user.id,
      quiz_mode: mode, // ใช้ quiz_mode แทน quizMode
      subtopic: subtopicMapping[subtopic] || subtopic,
      score,
    };
    console.log('Sending to API:', payload); // Debug ข้อมูลที่ส่ง

    fetch('http://localhost:5000/api/scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => console.log('API response:', data))
      .catch((error) => console.error('Fetch error:', error));
  }, [user, loading, mode, subtopic, score, navigate]);

  if (loading) {
    return <div className="text-center py-10">กำลังโหลด...</div>;
  }

  if (!questions || !answers || !Array.isArray(questions) || !Array.isArray(answers)) {
    return <div className="text-center py-10">ไม่พบผลลัพธ์ควิซ</div>;
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">ผลลัพธ์ควิซ: {getQuizModeTitle()}</h1>
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <p className="text-xl font-semibold text-gray-800 mb-4">
            คะแนนของคุณ: {score} / {questions.length * 10}
          </p>
          {user ? (
            <p className="text-gray-600">คะแนนถูกบันทึกในโปรไฟล์ของคุณแล้ว</p>
          ) : (
            <p className="text-gray-600">กรุณาล็อกอินเพื่อบันทึกคะแนน</p>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">คำตอบของคุณ</h2>
        {questions.map((q, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ข้อ {index + 1}: {q.titleTh || q.question_text}
            </h3>
            {q.image_url && (
              <img
                src={q.image_url}
                alt="Question"
                className="w-full max-w-md mx-auto rounded-lg mb-4"
                onError={(e) => (e.target.src = 'https://via.placeholder.com/300x150?text=Image+Not+Found')}
              />
            )}
            <p className={`mb-2 ${answers[index] === q.correct_answer ? 'text-green-600' : 'text-red-600'}`}>
              คำตอบของคุณ: {q.options[answers[index]] || 'ไม่ได้ตอบ'} 
              {answers[index] === q.correct_answer ? ' (ถูกต้อง)' : ` (ผิด, คำตอบที่ถูกคือ: ${q.options[q.correct_answer]})`}
            </p>
            <p className="text-gray-600">คำอธิบาย: {q.explanation}</p>
          </div>
        ))}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700"
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    </div>
  );
}

export default Result;