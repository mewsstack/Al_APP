import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', is_admin: false });
  const [editScore, setEditScore] = useState({ userId: null, score: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    titleTh: '',
    options: '',
    difficulty: 'easy',
    subtopic: 'LS',
    correct_answer: '',
    explanation: '',
    image: null,
  });
  const [editQuestion, setEditQuestion] = useState(null);
  const [questionMode, setQuestionMode] = useState('easy');
  const [questionSubtopic, setQuestionSubtopic] = useState('LS');

  // Mapping ระหว่างโหมดกับ subtopic (ตรงตามความต้องการ)
  const subtopicOptions = {
    easy: [
      { value: 'LS', label: 'Linear DS' },
      { value: 'Sorting Algo', label: 'Sorting Algo' },
    ],
    normal: [
      { value: 'Tree', label: 'Tree' },
      { value: 'Merge Sort', label: 'Merge Sort' },
    ],
    hard: [
      { value: 'DivideConquer', label: 'Divide & Conquer' },
      { value: 'Greedy', label: 'Greedy Algorithm' },
    ],
  };

  // ตรวจสอบว่าเป็น Admin และดึงข้อมูลผู้ใช้และข้อสอบ
  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('กรุณาเข้าสู่ระบบ');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 401 || response.status === 403) {
          setError('เซสชันหมดอายุหรือไม่มีสิทธิ์ กรุณาเข้าสู่ระบบใหม่');
          localStorage.removeItem('token');
          setLoading(false);
          return;
        }
        if (!response.ok) throw new Error('ไม่สามารถตรวจสอบสิทธิ์ได้');
        const data = await response.json();
        if (!data.user.is_admin) {
          setError('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
          setLoading(false);
          return;
        }
        setIsAdmin(true);
        fetchUsers();
        fetchQuestions();
      } catch (err) {
        setError('เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์');
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rank', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.status === 401 || response.status === 403) {
        setError('เซสชันหมดอายุหรือไม่มีสิทธิ์ กรุณาเข้าสู่ระบบใหม่');
        localStorage.removeItem('token');
        return;
      }
      if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(`เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้: ${err.message}`);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/quiz/questions?mode=${questionMode}&subtopic=${encodeURIComponent(
          questionSubtopic
        )}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      if (response.status === 401 || response.status === 403) {
        setError('เซสชันหมดอายุหรือไม่มีสิทธิ์ กรุณาเข้าสู่ระบบใหม่');
        localStorage.removeItem('token');
        return;
      }
      if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลข้อสอบได้');
      const data = await response.json();
      setQuestions(data || []);
    } catch (err) {
      setError(`เกิดข้อผิดพลาดในการดึงข้อมูลข้อสอบ: ${err.message}`);
    }
  };

  // เพิ่มผู้ใช้ใหม่
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newUser),
      });
      if (response.status === 401 || response.status === 403) {
        setError('เซสชันหมดอายุหรือไม่มีสิทธิ์ กรุณาเข้าสู่ระบบใหม่');
        localStorage.removeItem('token');
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ไม่สามารถเพิ่มผู้ใช้ได้');
      }
      setSuccess('เพิ่มผู้ใช้สำเร็จ');
      setNewUser({ username: '', email: '', password: '', is_admin: false });
      fetchUsers();
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้');
    }
  };

  // ลบผู้ใช้
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('ยืนยันการลบผู้ใช้?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.status === 401 || response.status === 403) {
        setError('เซสชันหมดอายุหรือไม่มีสิทธิ์ กรุณาเข้าสู่ระบบใหม่');
        localStorage.removeItem('token');
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `ลบผู้ใช้ล้มเหลว: ${response.status}`);
      }
      setSuccess('ลบผู้ใช้สำเร็จ');
      fetchUsers();
    } catch (err) {
      setError(`เกิดข้อผิดพลาดในการลบผู้ใช้: ${err.message}`);
    }
  };

  // แก้ไขคะแนน
  const handleEditScore = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ score: parseInt(editScore.score) }),
      });
      if (response.status === 401 || response.status === 403) {
        setError('เซสชันหมดอายุหรือไม่มีสิทธิ์ กรุณาเข้าสู่ระบบใหม่');
        localStorage.removeItem('token');
        return;
      }
      if (!response.ok) throw new Error('ไม่สามารถแก้ไขคะแนนได้');
      setSuccess('แก้ไขคะแนนสำเร็จ');
      setEditScore({ userId: null, score: '' });
      fetchUsers();
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการแก้ไขคะแนน');
    }
  };

  // เปลี่ยนสถานะ Admin
  const handleChangeRole = async (userId, is_admin) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ is_admin }),
      });
      if (response.status === 401 || response.status === 403) {
        setError('เซสชันหมดอายุหรือไม่มีสิทธิ์ กรุณาเข้าสู่ระบบใหม่');
        localStorage.removeItem('token');
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `เปลี่ยนสถานะ Admin ล้มเหลว: ${response.status}`);
      }
      setSuccess('เปลี่ยนสถานะ Admin สำเร็จ');
      fetchUsers();
    } catch (err) {
      setError(`เกิดข้อผิดพลาดในการเปลี่ยนสถานะ Admin: ${err.message}`);
    }
  };

  // เพิ่มข้อสอบใหม่
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('titleTh', newQuestion.titleTh);
      formData.append('options', JSON.stringify(newQuestion.options.split(',').map((opt) => opt.trim())));
      formData.append('difficulty', newQuestion.difficulty);
      formData.append('subtopic', newQuestion.subtopic);
      formData.append('correct_answer', newQuestion.correct_answer);
      formData.append('explanation', newQuestion.explanation);
      if (newQuestion.image) {
        formData.append('image', newQuestion.image);
      }

      const response = await fetch('http://localhost:5000/api/quiz/questions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      if (response.status === 401 || response.status === 403) {
        setError('เซสชันหมดอายุหรือไม่มีสิทธิ์ กรุณาเข้าสู่ระบบใหม่');
        localStorage.removeItem('token');
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ไม่สามารถเพิ่มข้อสอบได้');
      }
      setSuccess('เพิ่มข้อสอบสำเร็จ');
      setNewQuestion({
        titleTh: '',
        options: '',
        difficulty: 'easy',
        subtopic: 'LS',
        correct_answer: '',
        explanation: '',
        image: null,
      });
      fetchQuestions();
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเพิ่มข้อสอบ');
    }
  };

  // ลบข้อสอบ
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('ยืนยันการลบข้อสอบ?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/quiz/questions/${questionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.status === 401 || response.status === 403) {
        setError('เซสชันหมดอายุหรือไม่มีสิทธิ์ กรุณาเข้าสู่ระบบใหม่');
        localStorage.removeItem('token');
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `ลบข้อสอบล้มเหลว: ${response.status}`);
      }
      setSuccess('ลบข้อสอบสำเร็จ');
      fetchQuestions();
    } catch (err) {
      setError(`เกิดข้อผิดพลาดในการลบข้อสอบ: ${err.message}`);
    }
  };

  // แก้ไขข้อสอบ
  const handleEditQuestion = async (e) => {
    e.preventDefault();
    if (!editQuestion) return;
    try {
      const formData = new FormData();
      formData.append('titleTh', editQuestion.titleTh);
      formData.append('options', JSON.stringify(editQuestion.options.split(',').map((opt) => opt.trim())));
      formData.append('difficulty', editQuestion.difficulty);
      formData.append('subtopic', editQuestion.subtopic);
      formData.append('correct_answer', editQuestion.correct_answer);
      formData.append('explanation', editQuestion.explanation);
      if (editQuestion.image) {
        formData.append('image', editQuestion.image);
      }

      const response = await fetch(`http://localhost:5000/api/quiz/questions/${editQuestion.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      if (response.status === 401 || response.status === 403) {
        setError('เซสชันหมดอายุหรือไม่มีสิทธิ์ กรุณาเข้าสู่ระบบใหม่');
        localStorage.removeItem('token');
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `แก้ไขข้อสอบล้มเหลว: ${response.status}`);
      }
      setSuccess('แก้ไขข้อสอบสำเร็จ');
      setEditQuestion(null);
      fetchQuestions();
    } catch (err) {
      setError(`เกิดข้อผิดพลาดในการแก้ไขข้อสอบ: ${err.message}`);
    }
  };

  // ล้างข้อความสถานะ
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // เมื่อเปลี่ยนโหมด ให้รีเซ็ต subtopic เป็นตัวแรกของโหมดนั้น
  const handleModeChange = (e) => {
    const mode = e.target.value;
    setQuestionMode(mode);
    setQuestionSubtopic(subtopicOptions[mode][0].value);
    setNewQuestion({ ...newQuestion, difficulty: mode, subtopic: subtopicOptions[mode][0].value });
  };

  // เมื่อเปลี่ยน subtopic
  const handleSubtopicChange = (e) => {
    setQuestionSubtopic(e.target.value);
  };

  // ดึงข้อสอบใหม่ทุกครั้งที่ questionMode หรือ questionSubtopic เปลี่ยน
  useEffect(() => {
    if (isAdmin && !loading) {
      fetchQuestions();
    }
    // eslint-disable-next-line
  }, [questionMode, questionSubtopic, isAdmin, loading]);

  if (loading) return <div>กำลังโหลด...</div>;
  if (!isAdmin) return <Navigate to="/login" />;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">แผงควบคุมแอดมิน</h1>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-2 mb-4">{success}</div>}

      {/* ส่วนเพิ่มผู้ใช้ */}
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">เพิ่มผู้ใช้ใหม่</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="ชื่อผู้ใช้"
            className="border p-2 rounded"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          />
          <input
            type="email"
            placeholder="อีเมล"
            className="border p-2 rounded"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            className="border p-2 rounded"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <select
            value={newUser.is_admin}
            onChange={(e) => setNewUser({ ...newUser, is_admin: e.target.value === 'true' })}
            className="border p-2 rounded"
          >
            <option value={false}>User</option>
            <option value={true}>Admin</option>
          </select>
          <button
            onClick={handleAddUser}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            เพิ่ม
          </button>
        </div>
      </div>

      {/* ส่วนรายการผู้ใช้ */}
      <div className="mb-8 bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-2">รายการผู้ใช้</h2>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">ชื่อผู้ใช้</th>
              <th className="p-2 text-left">คะแนน</th>
              <th className="p-2 text-left">สถานะ</th>
              <th className="p-2 text-left">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-2">{user.id}</td>
                <td className="p-2">{user.username}</td>
                <td className="p-2">
                  {editScore.userId === user.id ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={editScore.score}
                        onChange={(e) => setEditScore({ ...editScore, score: e.target.value })}
                        className="border p-1 rounded w-20"
                      />
                      <button
                        onClick={() => handleEditScore(user.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      >
                        บันทึก
                      </button>
                      <button
                        onClick={() => setEditScore({ userId: null, score: '' })}
                        className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  ) : (
                    <span>
                      {user.score}{' '}
                      <button
                        onClick={() => setEditScore({ userId: user.id, score: user.score })}
                        className="text-blue-500 hover:underline"
                      >
                        แก้ไข
                      </button>
                    </span>
                  )}
                </td>
                <td className="p-2">
                  <select
                    value={user.is_admin}
                    onChange={(e) => handleChangeRole(user.id, e.target.value === 'true')}
                    className="border p-1 rounded"
                  >
                    <option value={false}>User</option>
                    <option value={true}>Admin</option>
                  </select>
                </td>
                <td className="p-2">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    disabled={user.is_admin}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ส่วนเพิ่มข้อสอบ */}
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">เพิ่มข้อสอบใหม่</h2>
        <form onSubmit={handleAddQuestion} className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="คำถาม (ภาษาไทย)"
            className="border p-2 rounded"
            value={newQuestion.titleTh}
            onChange={(e) => setNewQuestion({ ...newQuestion, titleTh: e.target.value })}
          />
          <input
            type="text"
            placeholder="ตัวเลือก (คั่นด้วยเครื่องหมาย ,)"
            className="border p-2 rounded"
            value={newQuestion.options}
            onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value })}
          />
          <select
            value={newQuestion.difficulty}
            onChange={(e) => {
              const mode = e.target.value;
              setNewQuestion({
                ...newQuestion,
                difficulty: mode,
                subtopic: subtopicOptions[mode][0].value,
              });
            }}
            className="border p-2 rounded"
          >
            <option value="easy">ง่าย</option>
            <option value="normal">ปานกลาง</option>
            <option value="hard">ยาก</option>
          </select>
          <select
            value={newQuestion.subtopic}
            onChange={(e) => setNewQuestion({ ...newQuestion, subtopic: e.target.value })}
            className="border p-2 rounded"
          >
            {subtopicOptions[newQuestion.difficulty].map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="คำตอบที่ถูกต้อง"
            className="border p-2 rounded"
            value={newQuestion.correct_answer}
            onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
          />
          <input
            type="text"
            placeholder="คำอธิบาย"
            className="border p-2 rounded"
            value={newQuestion.explanation}
            onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
          />
          <input
            type="file"
            accept="image/*"
            className="border p-2 rounded"
            onChange={(e) => setNewQuestion({ ...newQuestion, image: e.target.files[0] })}
          />
          {newQuestion.image && (
            <img
              src={URL.createObjectURL(newQuestion.image)}
              alt="Preview"
              className="h-16 w-16 object-cover"
            />
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            เพิ่มข้อสอบ
          </button>
        </form>
      </div>

      {/* ส่วนรายการข้อสอบ */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-2">รายการข้อสอบ</h2>
        <div className="mb-2 flex gap-4 items-center">
          <div>
            <label className="mr-2">เลือกระดับความยาก:</label>
            <select
              value={questionMode}
              onChange={handleModeChange}
              className="border p-1 rounded"
            >
              <option value="easy">ง่าย</option>
              <option value="normal">ปานกลาง</option>
              <option value="hard">ยาก</option>
            </select>
          </div>
          <div>
            <label className="mr-2">เลือก Subtopic:</label>
            <select
              value={questionSubtopic}
              onChange={handleSubtopicChange}
              className="border p-1 rounded"
            >
              {subtopicOptions[questionMode].map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {(() => {
          const opt = subtopicOptions[questionMode].find((o) => o.value === questionSubtopic);
          const group = questions.filter((q) => q.subtopic === questionSubtopic);
          if (!opt || group.length === 0)
            return <div className="text-gray-500">ไม่มีข้อสอบในหัวข้อนี้</div>;
          return (
            <div key={opt.value} className="mb-6">
              <h3 className="text-lg font-bold mb-2">{opt.label}</h3>
              <table className="w-full mb-2">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">คำถาม</th>
                    <th className="p-2 text-left">ระดับความยาก</th>
                    <th className="p-2 text-left">Subtopic</th>
                    <th className="p-2 text-left">รูปภาพ</th>
                    <th className="p-2 text-left">การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {group.map((question) => (
                    <tr key={question.id} className="border-b">
                      <td className="p-2">{question.id}</td>
                      <td className="p-2">{question.titleTh}</td>
                      <td className="p-2">{question.difficulty}</td>
                      <td className="p-2">{question.subtopic}</td>
                      <td className="p-2">
                        {question.imageUrl ? (
                          <img
                            src={question.imageUrl}
                            alt="Question"
                            className="h-16 w-16 object-cover"
                          />
                        ) : (
                          'ไม่มีรูปภาพ'
                        )}
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() =>
                            setEditQuestion({
                              ...question,
                              options: Array.isArray(question.options)
                                ? question.options.join(', ')
                                : typeof question.options === 'string'
                                ? JSON.parse(question.options).join(', ')
                                : '',
                              image: null,
                              imageUrl: question.imageUrl,
                            })
                          }
                          className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>

      {/* แบบฟอร์มแก้ไขข้อสอบ */}
      {editQuestion && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">แก้ไขข้อสอบ</h2>
          <form onSubmit={handleEditQuestion} className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="คำถาม (ภาษาไทย)"
              className="border p-2 rounded"
              value={editQuestion.titleTh}
              onChange={(e) => setEditQuestion({ ...editQuestion, titleTh: e.target.value })}
            />
            <input
              type="text"
              placeholder="ตัวเลือก (คั่นด้วยเครื่องหมาย ,)"
              className="border p-2 rounded"
              value={editQuestion.options}
              onChange={(e) => setEditQuestion({ ...editQuestion, options: e.target.value })}
            />
            <select
              value={editQuestion.difficulty}
              onChange={(e) => {
                const mode = e.target.value;
                setEditQuestion({
                  ...editQuestion,
                  difficulty: mode,
                  subtopic: subtopicOptions[mode][0].value,
                });
              }}
              className="border p-2 rounded"
            >
              <option value="easy">ง่าย</option>
              <option value="normal">ปานกลาง</option>
              <option value="hard">ยาก</option>
            </select>
            <select
              value={editQuestion.subtopic}
              onChange={(e) => setEditQuestion({ ...editQuestion, subtopic: e.target.value })}
              className="border p-2 rounded"
            >
              {subtopicOptions[editQuestion.difficulty].map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="คำตอบที่ถูกต้อง"
              className="border p-2 rounded"
              value={editQuestion.correct_answer}
              onChange={(e) => setEditQuestion({ ...editQuestion, correct_answer: e.target.value })}
            />
            <input
              type="text"
              placeholder="คำอธิบาย"
              className="border p-2 rounded"
              value={editQuestion.explanation}
              onChange={(e) => setEditQuestion({ ...editQuestion, explanation: e.target.value })}
            />
            <input
              type="file"
              accept="image/*"
              className="border p-2 rounded"
              onChange={(e) => setEditQuestion({ ...editQuestion, image: e.target.files[0] })}
            />
            {editQuestion.imageUrl && (
              <div className="flex items-center gap-2">
                <img
                  src={editQuestion.imageUrl}
                  alt="Current Question"
                  className="h-16 w-16 object-cover"
                />
                <span>รูปภาพปัจจุบัน</span>
              </div>
            )}
            {editQuestion.image && (
              <img
                src={URL.createObjectURL(editQuestion.image)}
                alt="Preview"
                className="h-16 w-16 object-cover"
              />
            )}
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600"
            >
              บันทึก
            </button>
            <button
              onClick={() => setEditQuestion(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              ยกเลิก
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPage;