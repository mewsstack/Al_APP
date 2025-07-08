import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

function Profile() {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/scores', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'ไม่สามารถดึงคะแนนได้');
        setScores(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []);

  if (!user) return <div>กรุณาล็อกอิน</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">โปรไฟล์</h1>
          <div className="space-y-2">
            <p><strong>ชื่อผู้ใช้:</strong> {user.username}</p>
            <p><strong>อีเมล:</strong> {user.email}</p>
            <p><strong>คะแนนรวม:</strong> {user.score}</p>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">ประวัติคะแนน</h2>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-4 px-6">
              <div>วันที่</div>
              <div>โหมด</div>
              <div>หัวข้อ</div>
              <div className="text-right">คะแนน</div>
            </div>
            {scores.length === 0 ? (
              <div className="py-4 px-6 text-center text-gray-600">ยังไม่มีประวัติคะแนน</div>
            ) : (
              scores.map((score) => (
                <div key={score.id} className="grid grid-cols-4 py-4 px-6 border-b border-gray-200 hover:bg-gray-50">
                  <div>{new Date(score.created_at).toLocaleDateString()}</div>
                  <div>{score.quiz_mode}</div>
                  <div>{score.subtopic || 'สุ่ม'}</div>
                  <div className="text-right">{score.score}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;