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
import { Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
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
    if (!selectedMode) {
      console.error('Error: selectedMode is undefined or null');
      setCurrentPage('home');
      setMode('');
      navigate('/');
      return;
    }
    console.log('Selected mode:', selectedMode);
    setMode(selectedMode);
    setCurrentPage('topic');
    navigate('/topic', { state: { mode: selectedMode } });
  };

  const handleTopicSelect = (selectedQuizMode) => {
    if (!selectedQuizMode || !mode) {
      console.error('Error: selectedQuizMode or mode is undefined or null', { selectedQuizMode, mode });
      setCurrentPage('mode');
      setQuizMode('');
      navigate('/');
      return;
    }
    console.log('Selected topic:', selectedQuizMode, 'Mode:', mode);
    setQuizMode(selectedQuizMode);
    const quizState = { mode, subtopic: selectedQuizMode, questions: [] }; // ใช้ subtopic แทน quizMode
    localStorage.setItem('quizState', JSON.stringify(quizState)); // บันทึก state
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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;