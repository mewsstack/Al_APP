import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔄 AuthContext: Checking existing token:', token ? 'Found' : 'Not found');
    
    if (token) {
      fetch('http://localhost:5000/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          console.log('🔍 AuthContext: /api/profile response status:', res.status);
          
          if (res.status === 401 || res.status === 403) {
            console.log('🚫 AuthContext: Token expired or unauthorized, removing token and logging out.');
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
            return null;
          }
          
          if (!res.ok) {
            throw new Error(`HTTP Error: ${res.status} - ไม่สามารถดึงข้อมูลผู้ใช้ได้`);
          }
          
          return res.json();
        })
        .then((data) => {
          if (data) {
            console.log('✅ AuthContext: /api/profile user data:', data);
            if (data && data.user) {
              setUser(data.user);
            } else {
              console.log('⚠️ AuthContext: Response ok but no user object, setting empty user');
              setUser({});
            }
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('❌ AuthContext: Auth check error:', err.message);
          localStorage.removeItem('token'); // ลบ token ที่เสียหาย
          setUser(null);
          setLoading(false);
        });
    } else {
      console.log('📝 AuthContext: No token found, user not logged in');
      setLoading(false);
    }
  }, []);

  // ฟังก์ชัน login ที่ปรับปรุงแล้ว
  const login = async (email, password) => {
    console.log('🔐 AuthContext: Starting login process for:', email);
    
    try {
      // ตรวจสอบการเชื่อมต่อก่อน
      console.log('🌐 AuthContext: Sending login request to http://localhost:5000/api/login');
      
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 AuthContext: Login response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      // ดึงข้อมูล response
      const responseText = await response.text();
      console.log('📄 AuthContext: Raw response:', responseText);

      // พยายาม parse JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ AuthContext: Failed to parse JSON response:', parseError);
        throw new Error('เซิร์ฟเวอร์ส่งข้อมูลกลับมาไม่ถูกต้อง');
      }

      // ตรวจสอบ response status
      if (!response.ok) {
        console.error('❌ AuthContext: Login failed with status:', response.status, data);
        
        // แสดง error message ที่เหมาะสม
        if (response.status === 401) {
          throw new Error(data.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        } else if (response.status === 500) {
          throw new Error(data.error || 'เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่อีกครั้ง');
        } else {
          throw new Error(data.error || `HTTP Error ${response.status}: ${response.statusText}`);
        }
      }

      // ตรวจสอบข้อมูลที่ได้รับ
      if (!data.token) {
        console.error('❌ AuthContext: No token in response:', data);
        throw new Error('เซิร์ฟเวอร์ไม่ได้ส่ง token กลับมา');
      }

      if (!data.user) {
        console.error('❌ AuthContext: No user data in response:', data);
        throw new Error('เซิร์ฟเวอร์ไม่ได้ส่งข้อมูลผู้ใช้กลับมา');
      }

      console.log('✅ AuthContext: Login successful:', {
        user: data.user,
        token: data.token ? 'received' : 'missing'
      });

      // บันทึก token และ user data
      localStorage.setItem('token', data.token);
      setUser(data.user);
      
      return data;
      
    } catch (err) {
      console.error('❌ AuthContext: Login error caught:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });

      // จัดการ network errors
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบ:\n- เซิร์ฟเวอร์ทำงานอยู่หรือไม่\n- การเชื่อมต่ออินเทอร์เน็ต');
      }

      // ส่งต่อ error ที่มีอยู่แล้ว
      throw new Error(err.message || 'เกิดข้อผิดพลาดในการล็อกอิน');
    }
  };

  // ฟังก์ชัน logout
  const logout = () => {
    console.log('🚪 AuthContext: User logging out');
    localStorage.removeItem('token');
    setUser(null);
  };

  // ฟังก์ชันตรวจสอบว่าเป็น admin หรือไม่
  const isAdmin = () => {
    return user && user.is_admin === true;
  };

  // ฟังก์ชันตรวจสอบว่า login แล้วหรือไม่
  const isAuthenticated = () => {
    return user !== null && user !== undefined;
  };

  const contextValue = {
    user,
    setUser,
    loading,
    login,
    logout,
    isAdmin,
    isAuthenticated
  };

  console.log('🏗️ AuthContext: Current state:', {
    user: user ? { ...user, password: undefined } : null,
    loading,
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin()
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};