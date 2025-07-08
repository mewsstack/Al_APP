import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function TopicSelection({ onSelect, mode = 'easy' }) {
  const [hoveredTopic, setHoveredTopic] = useState(null);
  const navigate = useNavigate();

  const topicsByMode = {
    easy: [
      {
        id: 'Linear DS',
        title: 'Linear Data Structures',
        titleTh: 'โครงสร้างข้อมูลเชิงเส้น',
        description: 'เรียนรู้เกี่ยวกับ Array, Linked List, Stack และ Queue',
        concepts: ['Array Operations', 'Linked List', 'Stack (LIFO)', 'Queue (FIFO)'],
        icon: '📊',
        color: 'from-blue-400 to-blue-600',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        difficulty: 'ง่าย',
        questions: 25,
        timeEstimate: '25 นาที'
      },
      {
        id: 'Sorting Algo',
        title: 'Sorting Algorithms',
        titleTh: 'อัลกอริทึมการเรียงลำดับ',
        description: 'อัลกอริทึมต่างๆ สำหรับการเรียงลำดับข้อมูล',
        concepts: ['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort'],
        icon: '🔢',
        color: 'from-purple-400 to-purple-600',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600',
        difficulty: 'ปานกลาง',
        questions: 20,
        timeEstimate: '25 นาที'
      },
      {
        id: 'random',
        title: 'Random Mix',
        titleTh: 'สุ่มทั้งหมด',
        description: 'ข้อสอบแบบสุ่มจากทุกหัวข้อ เพื่อทดสอบความรู้โดยรวม',
        concepts: ['All Topics Mixed', 'Comprehensive Test', 'Knowledge Review', 'Surprise Questions'],
        icon: '🎲',
        color: 'from-green-400 to-green-600',
        bgColor: 'bg-green-50',
        textColor: 'text-green-600',
        difficulty: 'หลากหลาย',
        questions: 10,
        timeEstimate: '8-12 นาที'
      }
    ],
    normal: [
      {
        id: 'Tree',
        title: 'Tree Structures',
        titleTh: 'โครงสร้างข้อมูลแบบต้นไม้',
        description: 'เรียนรู้เกี่ยวกับ Binary Tree, BST และการท่องต้นไม้',
        concepts: ['Binary Tree', 'Binary Search Tree', 'Tree Traversal', 'AVL Tree'],
        icon: '🌳',
        color: 'from-blue-400 to-blue-600',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        difficulty: 'ปานกลาง',
        questions: 25,
        timeEstimate: '25 นาที'
      },
      {
        id: 'Merge Sort',
        title: 'Merge Sort Algorithm',
        titleTh: 'อัลกอริทึม Merge Sort',
        description: 'ศึกษา Merge Sort และการประยุกต์ใช้',
        concepts: ['Divide & Conquer', 'Merging', 'Time Complexity', 'Space Complexity'],
        icon: '🔄',
        color: 'from-purple-400 to-purple-600',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600',
        difficulty: 'ปานกลาง',
        questions: 25,
        timeEstimate: '25 นาที'
      },
      {
        id: 'random',
        title: 'Random Mix',
        titleTh: 'สุ่มทั้งหมด',
        description: 'ข้อสอบแบบสุ่มจากทุกหัวข้อในโหมดปกติ',
        concepts: ['Tree Structures', 'Merge Sort', 'Comprehensive Test', 'Mixed Questions'],
        icon: '🎲',
        color: 'from-green-400 to-green-600',
        bgColor: 'bg-green-50',
        textColor: 'text-green-600',
        difficulty: 'หลากหลาย',
        questions: 10,
        timeEstimate: '15-20 นาที'
      }
    ],
    hard: [
      {
        id: 'Divide & Conquer',
        title: 'Divide & Conquer',
        titleTh: 'Divide & Conquer',
        description: 'ศึกษาเทคนิค Divide & Conquer และการประยุกต์ใช้',
        concepts: ['Strassens Algorithm', 'Closest Pair', 'Karatsuba Multiplication', 'FFT'],
        icon: '🧩',
        color: 'from-red-400 to-red-600',
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        difficulty: 'ยาก',
        questions: 20,
        timeEstimate: '20 นาที'
      },
      {
        id: 'Greedy Algorithm',
        title: 'Greedy Algorithms',
        titleTh: 'อัลกอริทึมโลภ',
        description: 'เรียนรู้การตัดสินใจแบบโลภเพื่อแก้ปัญหา',
        concepts: ['Kruskal’s Algorithm', 'Huffman Coding', 'Prim’s Algorithm', 'Activity Selection'],
        icon: '💡',
        color: 'from-orange-400 to-orange-600',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-600',
        difficulty: 'ยาก',
        questions: 20,
        timeEstimate: '20 นาที'
      },
      {
        id: 'random',
        title: 'Random Mix',
        titleTh: 'สุ่มทั้งหมด',
        description: 'ข้อสอบแบบสุ่มจากทุกหัวข้อในโหมดยาก',
        concepts: ['Divide & Conquer', 'Greedy Algorithms', 'Advanced Concepts', 'Mixed Questions'],
        icon: '🎲',
        color: 'from-green-400 to-green-600',
        bgColor: 'bg-green-50',
        textColor: 'text-green-600',
        difficulty: 'หลากหลาย',
        questions: 20,
        timeEstimate: '30-40 นาที'
      }
    ]
  };

  const topics = topicsByMode[mode] || topicsByMode.easy;

  const getModeInfo = (mode) => {
    switch (mode) {
      case 'easy':
        return { title: 'โหมดง่าย', subtitle: 'Easy Mode', color: 'text-green-600', bg: 'bg-green-100' };
      case 'normal':
        return { title: 'โหมดปกติ', subtitle: 'Normal Mode', color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'hard':
        return { title: 'โหมดยาก', subtitle: 'Hard Mode', color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { title: 'โหมดง่าย', subtitle: 'Easy Mode', color: 'text-green-600', bg: 'bg-green-100' };
    }
  };

  const modeInfo = getModeInfo(mode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M20 20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm0-20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="flex justify-start mb-6">
          <button
            className="flex items-center px-4 py-2 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            onClick={() => navigate('/')}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            กลับ
          </button>
        </div>

        <div className="text-center mb-12">
          <div className={`inline-flex items-center px-4 py-2 ${modeInfo.bg} ${modeInfo.color} rounded-full mb-6 shadow-sm`}>
            <div className="w-2 h-2 bg-current rounded-full mr-2"></div>
            <span className="font-medium">{modeInfo.title}</span>
            <span className="mx-2 opacity-50">•</span>
            <span className="text-sm opacity-75">{modeInfo.subtitle}</span>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              เลือกหัวข้อที่ต้องการเรียนรู้
            </h1>
            <p className="text-xl text-gray-600 mb-2">Choose Your Learning Topic</p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              เลือกหัวข้อที่คุณต้องการทดสอบความรู้ หรือสุ่มข้อสอบจากทุกหัวข้อเพื่อความท้าทาย
            </p>
          </div>

          <div className="flex justify-center items-center space-x-4 mb-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
              <span className="ml-2 text-sm text-gray-600">เลือกโหมด</span>
            </div>
            <div className="w-8 h-1 bg-indigo-500 rounded"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
              <span className="ml-2 text-sm font-medium text-indigo-600">เลือกหัวข้อ</span>
            </div>
            <div className="w-8 h-1 bg-gray-300 rounded"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">3</div>
              <span className="ml-2 text-sm text-gray-400">เริ่มทำข้อสอบ</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className={`${topic.bgColor} rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-white/50 backdrop-blur-sm group relative overflow-hidden`}
              onMouseEnter={() => setHoveredTopic(topic.id)}
              onMouseLeave={() => setHoveredTopic(null)}
              onClick={() => onSelect(topic.id)}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${topic.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="text-5xl">{topic.icon}</div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${topic.textColor} mb-1`}>{topic.questions} ข้อ</div>
                    <div className="text-xs text-gray-500">{topic.timeEstimate}</div>
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{topic.titleTh}</h3>
                  <p className={`text-lg font-medium ${topic.textColor}`}>{topic.title}</p>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed text-sm">{topic.description}</p>
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">เนื้อหาที่ครอบคลุม:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {topic.concepts.map((concept, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-600">
                        <div className={`w-1.5 h-1.5 bg-gradient-to-r ${topic.color} rounded-full mr-2 flex-shrink-0`}></div>
                        <span className="truncate">{concept}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`inline-flex items-center px-3 py-1 bg-white/60 ${topic.textColor} rounded-full text-xs font-medium`}>
                    <span>ระดับ: {topic.difficulty}</span>
                  </div>
                  {hoveredTopic === topic.id && (
                    <div className="animate-bounce">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </div>
                <button
                  className={`w-full py-4 px-6 bg-gradient-to-r ${topic.color} hover:scale-105 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-opacity-50`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(topic.id);
                  }}
                >
                  <span className="flex items-center justify-center">
                    <span>เลือกหัวข้อนี้</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/20 to-transparent rounded-tr-full"></div>
            </div>
          ))}
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">💡 เคล็ดลับสำหรับการทำข้อสอบ</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">อ่านคำถามอย่างละเอียด</h4>
                  <p className="text-sm text-gray-600">ใช้เวลาในการทำความเข้าใจคำถามก่อนตอบ</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">จัดการเวลาให้เหมาะสม</h4>
                  <p className="text-sm text-gray-600">แบ่งเวลาให้เหมาะสมกับจำนวนข้อสอบ</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">ทบทวนคำตอบ</h4>
                  <p className="text-sm text-gray-600">ตรวจสอบคำตอบก่อนส่งข้อสอบ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopicSelection;