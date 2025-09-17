import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const mockUsers = [
  { email: 'user@example.com', password: 'password123' },
  { email: 'admin@test.com', password: 'admin123' }
];

const Login = ({ setCurrentPage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '',
    email: '', password: '', question: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = mockUsers.find(
        u => u.email === formData.email && u.password === formData.password
      );
      if (user) {
        setCurrentPage('home');
      } else {
        setError('Email hoặc mật khẩu không đúng');
      }
    } else {
      const existingUser = mockUsers.find(u => u.email === formData.email);
      if (existingUser) {
        setError('Email đã tồn tại');
        return;
      }

      if (formData.password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }

      mockUsers.push({
        email: formData.email,
        password: formData.password
      });

      setSuccess(true);
      setTimeout(() => {
        setIsLogin(true);
        setSuccess(false);
        setFormData({ firstName: '', lastName: '', email: '', password: '', question: '' });
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-green-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Đăng ký thành công!</h2>
          <p>Đang chuyển về trang đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex items-center justify-center min-h-screen pt-20">
      <div className="flex w-full max-w-6xl mx-4">
        {/* Left side */}
        <div className="flex-1 text-white pr-8">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            CONNECT MORE, EXPERIENCE MORE<br />
            WITH "..."
          </h1>

          <div className="space-y-4 mt-8">
            <div className="bg-white p-4 rounded-lg shadow-md w-64 h-32 flex items-center justify-center">
              <div className="text-center text-gray-600">
                🍃 Sample Image 1<br />
                <span className="text-sm">Nature Pattern</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md w-48 h-24 flex items-center justify-center ml-8">
              <div className="text-center text-gray-600">
                🍐 Sample Image 2
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login/Sign up form */}
        <div className="bg-white rounded-lg shadow-lg p-8 w-96">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </h2>

          <div>
            {!isLogin && (
              <div className="flex space-x-4 mb-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            )}

            <div className="mb-4">
              <input
                type="email"
                name="email"
                placeholder="Email/Địa chỉ email/Tên người dùng"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-4 relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={isLogin ? "Enter your password" : "Password"}
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {!isLogin && (
              <div className="mb-6">
                <textarea
                  name="question"
                  placeholder="Enter your question or message"
                  value={formData.question}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 h-24 resize-none"
                />
              </div>
            )}

            {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

            <button
              onClick={handleSubmit}
              className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition duration-200"
            >
              {isLogin ? 'Log in' : 'Sign up'}
            </button>
          </div>

          <div className="text-center mt-4">
            <span className="text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ firstName: '', lastName: '', email: '', password: '', question: '' });
              }}
              className="text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
