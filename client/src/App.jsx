import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ModeSelection from './components/ModeSelection';
import TopicSelection from './components/TopicSelection';
import Quiz from './components/Quiz';
import Result from './components/Result';
import Login from './components/Login';
import Register from './components/Register';
import NormalModeSelection from './components/NormalModeSelection';
import Profile from './components/Profile';
import Rank from './components/Rank';
import AdminPage from './components/AdminPage'; // นำเข้า AdminPage
import { Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div>กำลังโหลด...</div>;
  
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && !user.is_admin) return <Navigate to="/admin" />;
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState('mode');
  const [mode, setMode] = useState('');
  const [quizMode, setQuizMode] = useState('');
  const navigate = useNavigate();

  const handleModeSelect = (selectedMode) => {
    console.log('🔍 Debug handleModeSelect:', { selectedMode, currentPage });
    
    if (!selectedMode) {
      console.error('ข้อผิดพลาด: selectedMode เป็น undefined หรือ null');
      setCurrentPage('home');
      setMode('');
      navigate('/');
      return;
    }
    console.log('✅ เลือกโหมด:', selectedMode);
    setMode(selectedMode);
    setCurrentPage('topic');
    navigate('/topic', { state: { mode: selectedMode } });
  };

  const handleTopicSelect = (selectedQuizMode) => {
    console.log('🔍 Debug handleTopicSelect:', { selectedQuizMode, mode, currentPage });
    
    if (!selectedQuizMode) {
      console.error('ข้อผิดพลาด: selectedQuizMode เป็น undefined หรือ null');
      setCurrentPage('mode');
      setQuizMode('');
      navigate('/');
      return;
    }
    
    if (!mode) {
      console.error('ข้อผิดพลาด: mode เป็น undefined หรือ null');
      setCurrentPage('mode');
      setQuizMode('');
      navigate('/');
      return;
    }
    
    console.log('✅ เลือกหัวข้อ:', selectedQuizMode, 'โหมด:', mode);
    setQuizMode(selectedQuizMode);
    const quizState = { mode, subtopic: selectedQuizMode, questions: [] };
    localStorage.setItem('quizState', JSON.stringify(quizState));
    navigate('/quiz', { state: quizState });
  };

  const handleSubmit = (userAnswers) => {
    navigate('/result', { state: { answers: userAnswers, mode, quizMode } });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<ModeSelection onSelect={handleModeSelect} />} />
          <Route path="/topic" element={<TopicSelection onSelect={handleTopicSelect} mode={mode} />} />
          <Route path="/normal-mode" element={<NormalModeSelection onSelect={handleTopicSelect} mode={mode} />} />
          <Route path="/quiz" element={<Quiz onSubmit={handleSubmit} />} />
          <Route path="/result" element={<Result />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/rank" element={<Rank />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;