import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // ปรับ path ตามโครงสร้าง

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMsg = location.state && location.state.message ? location.state.message : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Debug: แสดงข้อมูลที่ส่งไป (ไม่แสดงรหัสผ่านจริง)
    console.log('🔐 Attempting login with:', { 
      email, 
      password: '***(' + password.length + ' chars)',
      timestamp: new Date().toISOString()
    });
    
    try {
      const data = await login(email, password);
      
      // Debug: แสดงข้อมูลที่ได้รับกลับมา
      console.log('✅ Login successful, received data:', {
        ...data,
        token: data.token ? '***(' + data.token.length + ' chars)' : 'no token'
      });
      
      // ตรวจสอบและ navigate ตาม role
      if (data.user && data.user.is_admin) {
        console.log('👑 Admin user detected, navigating to /admin');
        navigate('/admin');
      } else {
        console.log('👤 Regular user detected, navigating to /');
        navigate('/');
      }
      
    } catch (err) {
      // Debug: แสดงข้อมูล error ทั้งหมด
      console.error('❌ Login error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        cause: err.cause
      });
      
      // แสดง error message ที่เป็นมิตรกับผู้ใช้
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      } else if (err.message.includes('401')) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else if (err.message.includes('500')) {
        setError('เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่อีกครั้ง');
      } else {
        setError(err.message || 'เกิดข้อผิดพลาดในการล็อกอิน');
      }
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">เข้าสู่ระบบ</h1>
        
        {/* Success Message */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm text-center">
            {successMsg}
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="กรอกอีเมล"
              autoComplete="email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="กรอกรหัสผ่าน"
              autoComplete="current-password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white hover:shadow-lg'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังล็อกอิน...
              </div>
            ) : 'เข้าสู่ระบบ'}
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-600 mt-4">
          ยังไม่มีบัญชี?{' '}
          <a href="/register" className="text-indigo-600 hover:underline font-medium">สมัครสมาชิก</a>
        </p>
        
        {/* Debug Info - ลบออกเมื่อ production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
            <strong>Debug Info:</strong><br />
            เปิด Console (F12) เพื่อดูข้อมูล debug เพิ่มเติม<br />
            API Endpoint: http://localhost:5000/api/login
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;