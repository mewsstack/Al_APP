import { useState } from 'react';
import { Menu, X, User, Trophy, LogIn, UserPlus, LogOut, Home, Brain, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="relative z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl backdrop-blur-sm">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link 
            to="/"
            className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
                <Star className="w-2 h-2 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Algorithm Master
              </h1>
              <p className="text-xs text-white/70 -mt-1">Test Your Knowledge</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                {/* User Info */}
                <Link 
                  to="/profile"
                  className="flex items-center space-x-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{user?.username || 'Guest'}</p>
                    <p className="text-xs text-white/80 flex items-center">
                      <Trophy size={12} className="mr-1" />
                      {user?.score || 0} คะแนน
                    </p>
                  </div>
                </Link>

                {/* Navigation Links */}
                <NavButton icon={Home} text="หน้าหลัก" to="/" />
                <NavButton icon={Trophy} text="อันดับ" to="/rank" variant="gold" />
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500/90 hover:bg-red-500 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-sm border border-red-400/30"
                >
                  <LogOut size={16} />
                  <span className="text-sm font-medium">ออกจากระบบ</span>
                </button>
              </>
            ) : (
              <>
                <NavButton icon={Home} text="หน้าหลัก" to="/" />
                <NavButton icon={Trophy} text="อันดับ" to="/rank" variant="gold" />
                
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/30"
                >
                  <LogIn size={16} />
                  <span className="text-sm font-medium">เข้าสู่ระบบ</span>
                </Link>
                
                <Link
                  to="/register"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <UserPlus size={16} />
                  <span className="text-sm font-medium">สมัครสมาชิก</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden relative p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20"
          >
            <div className="relative w-6 h-6">
              <Menu 
                size={24} 
                className={`absolute transition-all duration-300 ${isMobileMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} 
              />
              <X 
                size={24} 
                className={`absolute transition-all duration-300 ${isMobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`} 
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-500 ease-out ${
            isMobileMenuOpen 
              ? 'max-h-96 opacity-100 translate-y-0' 
              : 'max-h-0 opacity-0 -translate-y-4 overflow-hidden'
          }`}
        >
          <div className="py-4 space-y-3 border-t border-white/20">
            {user ? (
              <>
                {/* Mobile User Info */}
                <Link
                  to="/profile"
                  onClick={handleMobileLinkClick}
                  className="flex items-center space-x-3 px-4 py-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 mx-2 hover:bg-white/20 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{user?.username || 'Guest'}</p>
                    <p className="text-sm text-white/80 flex items-center">
                      <Trophy size={14} className="mr-1" />
                      {user?.score || 0} คะแนน
                    </p>
                  </div>
                </Link>

                <MobileNavButton icon={Home} text="หน้าหลัก" to="/" onClick={handleMobileLinkClick} />
                <MobileNavButton icon={Trophy} text="อันดับ" to="/rank" onClick={handleMobileLinkClick} variant="gold" />
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 mx-2 bg-red-500/20 hover:bg-red-500/30 rounded-2xl transition-all duration-300 text-left border border-red-400/30"
                >
                  <div className="w-10 h-10 bg-red-500/80 rounded-full flex items-center justify-center">
                    <LogOut size={18} />
                  </div>
                  <span className="font-medium">ออกจากระบบ</span>
                </button>
              </>
            ) : (
              <>
                <MobileNavButton icon={Home} text="หน้าหลัก" to="/" onClick={handleMobileLinkClick} />
                <MobileNavButton icon={Trophy} text="อันดับ" to="/rank" onClick={handleMobileLinkClick} variant="gold" />
                <MobileNavButton icon={LogIn} text="เข้าสู่ระบบ" to="/login" onClick={handleMobileLinkClick} />
                <MobileNavButton icon={UserPlus} text="สมัครสมาชิก" to="/register" onClick={handleMobileLinkClick} variant="green" />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Desktop Navigation Button Component
function NavButton({ icon: Icon, text, to, variant = 'default' }) {
  const variants = {
    default: 'bg-white/10 hover:bg-white/20 border-white/30',
    gold: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border-yellow-400/40',
    green: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border-green-400/40'
  };

  return (
    <Link 
      to={to}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border ${variants[variant]}`}
    >
      <Icon size={16} />
      <span className="text-sm font-medium">{text}</span>
    </Link>
  );
}

// Mobile Navigation Button Component
function MobileNavButton({ icon: Icon, text, to, onClick, variant = 'default' }) {
  const variants = {
    default: 'bg-white/10 hover:bg-white/15 border-white/20',
    gold: 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 border-yellow-400/30',
    green: 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border-green-400/30'
  };

  const iconVariants = {
    default: 'bg-white/20',
    gold: 'bg-gradient-to-r from-yellow-500/80 to-orange-500/80',
    green: 'bg-gradient-to-r from-green-500/80 to-emerald-500/80'
  };

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 mx-2 rounded-2xl transition-all duration-300 text-left border ${variants[variant]} transform hover:scale-[1.02]`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconVariants[variant]}`}>
        <Icon size={18} />
      </div>
      <span className="font-medium">{text}</span>
    </Link>
  );
}

export default Navbar;