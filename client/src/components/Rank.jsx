import { useState, useEffect } from 'react';

function Rank() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/rank');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'ไม่สามารถดึงอันดับได้');
        setRankings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  if (loading) return <div className="text-center py-10">กำลังโหลด...</div>;
  if (error) return <div className="text-center py-10 text-red-600">ข้อผิดพลาด: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">อันดับผู้ใช้</h1>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-4 px-6">
            <div>อันดับ</div>
            <div>ชื่อผู้ใช้</div>
            <div className="text-right">คะแนน</div>
          </div>
          {rankings.map((user, index) => (
            <div
              key={user.id}
              className={`grid grid-cols-3 py-4 px-6 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                index < 3 ? 'font-semibold' : ''
              }`}
            >
              <div className="flex items-center">
                {index < 3 ? (
                  <span className={`text-2xl mr-2 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'}`}>
                    {index + 1}
                  </span>
                ) : (
                  index + 1
                )}
              </div>
              <div>{user.username}</div>
              <div className="text-right">{user.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Rank;