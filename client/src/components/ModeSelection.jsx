import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from './AuthContext';

function ModeSelection({ onSelect }) {
  // const navigate = useNavigate();
  const modes = [
    {
      id: 'easy',
      title: 'ง่าย',
      subtitle: 'Easy Mode',
      description: 'เหมาะสำหรับผู้เริ่มต้น ข้อสอบพื้นฐาน',
      features: ['25 ข้อสอบ', 'เวลา 25 นาที', 'แนวคิดพื้นฐาน'],
      icon: '📚',
      color: 'from-green-400 to-green-600',
      hoverColor: 'hover:from-green-500 hover:to-green-700',
      difficulty: '⭐',
      bgPattern: 'bg-green-50'
    },
    {
      id: 'normal',
      title: 'ปกติ',
      subtitle: 'Normal Mode',
      description: 'สำหรับผู้ที่มีพื้นฐานแล้ว ระดับความยากปานกลาง',
      features: ['25 ข้อสอบ', 'เวลา 25 นาที', 'Algorithm & Structure'],
      icon: '🎯',
      color: 'from-blue-400 to-blue-600',
      hoverColor: 'hover:from-blue-500 hover:to-blue-700',
      difficulty: '⭐⭐',
      bgPattern: 'bg-blue-50'
    },
    {
      id: 'hard',
      title: 'ยาก',
      subtitle: 'Hard Mode',
      description: 'ท้าทายสำหรับผู้เชี่ยวชาญ ข้อสอบระดับสูง',
      features: ['20 ข้อสอบ', 'เวลา 15 นาที', 'Advanced Concepts'],
      icon: '🚀',
      color: 'from-red-400 to-red-600',
      hoverColor: 'hover:from-red-500 hover:to-red-700',
      difficulty: '⭐⭐⭐',
      bgPattern: 'bg-red-50'
    }
  ];

  const handleSelect = (modeId) => {
    onSelect(modeId); // ส่ง modeId ไปยัง App.jsx
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <span className="text-3xl">💾</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Data Structure Quiz
          </h1>
          <p className="text-xl text-gray-600 mb-2">ระบบคลังข้อสอบวิชาโครงสร้างข้อมูล</p>
          <p className="text-lg text-gray-500">เลือกระดับที่เหมาะกับคุณ</p>
          
          <div className="flex justify-center space-x-8 mt-8 p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">120+</div>
              <div className="text-sm text-gray-600">ข้อสอบ</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">1-3</div>
              <div className="text-sm text-gray-600">ระดับความยาก</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">100+</div>
              <div className="text-sm text-gray-600">ผู้เข้าสอบ</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {modes.map((mode) => (
            <div
              key={mode.id}
              className={`${mode.bgPattern} rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-white/50 backdrop-blur-sm group relative overflow-hidden`}
              onClick={() => handleSelect(mode.id)}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${mode.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="text-5xl">{mode.icon}</div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">ระดับความยาก</div>
                    <div className="text-lg">{mode.difficulty}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-3xl font-bold text-gray-800 mb-1">{mode.title}</h3>
                  <p className="text-lg text-gray-600 font-medium">{mode.subtitle}</p>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">{mode.description}</p>

                <div className="space-y-3 mb-8">
                  {mode.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mr-3"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  className={`w-full py-4 px-6 bg-gradient-to-r ${mode.color} ${mode.hoverColor} text-white font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-opacity-50 group-hover:shadow-xl`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(mode.id);
                  }}
                >
                  <span className="flex items-center justify-center">
                    <span>เริ่มทำข้อสอบ</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>

              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full"></div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full shadow-sm">
            <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-600">เลือกโหมดที่เหมาะกับระดับความรู้ของคุณเพื่อประสบการณ์การเรียนรู้ที่ดีที่สุด</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModeSelection;