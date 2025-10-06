import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, CheckCircle, Bot, User, Phone, Mail, Calendar, DollarSign } from 'lucide-react';

// Import mockdata - đường dẫn: src/mockdata/tourQuestions.js
import { TOUR_QUESTIONS } from '../mockdata/tourQuestions';

const AITourCreator = () => {
  const inputRef = useRef(null);
  const [step, setStep] = useState('chat');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: TOUR_QUESTIONS[0].question }
  ]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [tourData, setTourData] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [errors, setErrors] = useState({});

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isTyping) return;
    setTimeout(() => {
      try {
        inputRef.current?.focus?.({ preventScroll: true });
      } catch {
        inputRef.current?.focus?.();
      }
    }, 0);
  }, [messages, isTyping]);

  const simulateTyping = (callback, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const userMessage = { sender: 'user', text: userInput };
    const currentQ = TOUR_QUESTIONS[currentQuestion];
    const newTourData = { ...tourData, [currentQ.key]: userInput };

    setMessages(prev => [...prev, userMessage]);
    setTourData(newTourData);
    setUserInput('');
    
    setTimeout(() => {
      try {
        inputRef.current?.focus?.({ preventScroll: true });
      } catch {
        inputRef.current?.focus?.();
      }
    }, 0);

    if (currentQuestion < TOUR_QUESTIONS.length - 1) {
      simulateTyping(() => {
        const nextQ = TOUR_QUESTIONS[currentQuestion + 1];
        setMessages(prev => [...prev, { sender: 'ai', text: nextQ.question }]);
        setCurrentQuestion(currentQuestion + 1);
      });
    } else {
      simulateTyping(() => {
        const summary = generateSummary(newTourData);
        setMessages(prev => [
          ...prev,
          { sender: 'ai', text: summary },
          { sender: 'ai', text: '', action: 'createForm' }
        ]);
      }, 1500);
    }
  };

  const generateSummary = (data) => {
    return `Tuyệt vời! 🎉 Để mình tóm tắt lại thông tin tour của bạn:\n\n📍 Địa điểm: ${data.destination}\n⏰ Thời gian: ${data.duration}\n💰 Ngân sách: ${data.budget}\n👥 Số người: ${data.numberOfPeople}\n🎯 Loại tour: ${data.tourType}\n❤️ Sở thích: ${data.interests}\n🍜 Ẩm thực: ${data.foodPreferences}\n🏃 Hoạt động: ${data.activities}\n\nMọi thứ đã sẵn sàng! Hãy bấm nút bên dưới để tạo form tour của bạn nhé! ✨`;
  };

  const handleCreateForm = () => {
    setStep('form');
  };

  const handleInputChange = (key, value) => {
    setTourData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!tourData.fullName?.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }
    
    if (!tourData.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(tourData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
    }
    
    if (!tourData.email?.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tourData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!tourData.startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    }
    
    if (!tourData.estimatedPrice?.trim()) {
      newErrors.estimatedPrice = 'Vui lòng nhập ước tính giá tour';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveTour = async () => {
    if (!validateForm()) {
      return;
    }
    
    console.log('Saving tour data:', tourData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (step === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#1B8579] rounded-full flex items-center justify-center text-white font-bold">
                <Bot size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Form Tour Của Bạn</h1>
                <p className="text-gray-600">Kiểm tra và chỉnh sửa thông tin trước khi lưu</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin liên hệ (Bắt buộc)</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="inline mr-1" size={16} /> Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tourData.fullName || ''}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-[#1B8579] focus:outline-none transition ${
                      errors.fullName ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Nhập họ và tên của bạn"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="inline mr-1" size={16} /> Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={tourData.phoneNumber || ''}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:border-[#1B8579] focus:outline-none transition ${
                        errors.phoneNumber ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="0912345678"
                    />
                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Mail className="inline mr-1" size={16} /> Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={tourData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:border-[#1B8579] focus:outline-none transition ${
                        errors.email ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="email@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="inline mr-1" size={16} /> Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={tourData.startDate || ''}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:border-[#1B8579] focus:outline-none transition ${
                        errors.startDate ? 'border-red-500' : 'border-gray-200'
                      }`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <DollarSign className="inline mr-1" size={16} /> Ước tính giá tour <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tourData.estimatedPrice || ''}
                      onChange={(e) => handleInputChange('estimatedPrice', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:border-[#1B8579] focus:outline-none transition ${
                        errors.estimatedPrice ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="VD: 300,000 VND"
                    />
                    {errors.estimatedPrice && <p className="text-red-500 text-sm mt-1">{errors.estimatedPrice}</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">📍 Địa điểm</label>
                <input
                  type="text"
                  value={tourData.destination || ''}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1B8579] focus:outline-none transition"
                  placeholder="Nhập địa điểm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">⏰ Thời gian</label>
                  <input
                    type="text"
                    value={tourData.duration || ''}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1B8579] focus:outline-none transition"
                    placeholder="Ví dụ: 3 ngày 2 đêm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">💰 Ngân sách</label>
                  <input
                    type="text"
                    value={tourData.budget || ''}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1B8579] focus:outline-none transition"
                    placeholder="Ví dụ: 5-7 triệu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">👥 Số người</label>
                  <input
                    type="text"
                    value={tourData.numberOfPeople || ''}
                    onChange={(e) => handleInputChange('numberOfPeople', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1B8579] focus:outline-none transition"
                    placeholder="Ví dụ: 2 người"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">🎯 Loại tour</label>
                  <input
                    type="text"
                    value={tourData.tourType || ''}
                    onChange={(e) => handleInputChange('tourType', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1B8579] focus:outline-none transition"
                    placeholder="Nghỉ dưỡng, khám phá..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">❤️ Sở thích</label>
                <textarea
                  value={tourData.interests || ''}
                  onChange={(e) => handleInputChange('interests', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1B8579] focus:outline-none transition"
                  rows="2"
                  placeholder="Chụp ảnh, leo núi..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">🍜 Ẩm thực yêu thích</label>
                <textarea
                  value={tourData.foodPreferences || ''}
                  onChange={(e) => handleInputChange('foodPreferences', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1B8579] focus:outline-none transition"
                  rows="2"
                  placeholder="Hải sản, món địa phương..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">🏃 Hoạt động</label>
                <textarea
                  value={tourData.activities || ''}
                  onChange={(e) => handleInputChange('activities', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1B8579] focus:outline-none transition"
                  rows="2"
                  placeholder="Tắm biển, trekking..."
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep('chat')}
                className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveTour}
                className="flex-1 px-6 py-4 bg-[#1B8579] text-white rounded-xl font-semibold hover:bg-[#156b61] transition shadow-lg"
              >
                Lưu tour
              </button>
            </div>
          </div>

          {showSuccess && (
            <div className="fixed bottom-8 right-8 bg-white rounded-2xl shadow-2xl p-6 flex items-center gap-4 animate-[slideIn_0.3s_ease-out] border-l-4 border-green-500">
              <CheckCircle className="text-green-500" size={32} />
              <div>
                <p className="font-bold text-gray-800">Tour của bạn đã được lưu thành công!</p>
                <p className="text-sm text-gray-600">Chúng tôi sẽ liên hệ để xác nhận chi tiết.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-5xl flex gap-6">
        <div className="flex-1 hidden lg:block" />
        
        <div className="w-full max-w-3xl">
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200" style={{ height: '650px' }}>
            <div className="absolute inset-0 bg-[url('https://exmouthresort.net.au/wp-content/uploads/119079-56.jpg')] bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-black/70"></div>
            
            <div className="h-full flex flex-col relative z-10">
              <div className="bg-gradient-to-r from-[#1B8579]/90 to-[#0d5c54]/90 backdrop-blur-sm px-6 py-4 flex items-center gap-3 shadow-lg border-b border-white/10">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
                  <Bot className="text-[#1B8579]" size={26} />
                </div>
                <div className="flex-1">
                  <h2 className="text-white font-bold text-lg drop-shadow-lg">Travyy AI Assistant</h2>
                  <p className="text-white/90 text-sm">Trợ lý du lịch thông minh</p>
                </div>
              </div>

              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-black/20 to-black/30">
                {messages.map((msg, idx) => (
                  <div key={idx}>
                    {msg.sender === 'ai' ? (
                      <div className="flex gap-3 items-start">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B8579] to-[#0d5c54] flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white/30">
                          <Bot className="text-white" size={20} />
                        </div>
                        <div className="flex-1 max-w-[75%]">
                          {msg.text && (
                            <div className="bg-white/20 backdrop-blur-xl rounded-3xl rounded-tl-sm px-6 py-4 shadow-2xl border border-white/40">
                              <p className="text-white whitespace-pre-line leading-relaxed font-medium drop-shadow-lg">{msg.text}</p>
                            </div>
                          )}
                          {msg.action === 'createForm' && (
                            <button
                              onClick={handleCreateForm}
                              className="mt-4 px-8 py-4 bg-gradient-to-r from-[#1B8579] via-[#1a9d8f] to-[#15a895] text-white rounded-full font-bold hover:shadow-2xl transition-all shadow-xl flex items-center gap-3 transform hover:scale-105 border-2 border-white/30 hover:border-white/50"
                            >
                              <Sparkles size={20} />
                              <span>Tạo Form Tour Của Tôi</span>
                            </button>
                          )}
                          <p className="text-xs text-white/80 mt-1 ml-1 drop-shadow font-medium">
                            {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3 items-start justify-end">
                        <div className="flex-1 max-w-[75%] flex flex-col items-end">
                          <div className="bg-gradient-to-br from-[#1B8579] via-[#1a9d8f] to-[#15a895] text-white rounded-3xl rounded-tr-sm px-6 py-4 shadow-xl border-2 border-[#0d5c54]/30">
                            <p className="leading-relaxed font-medium">{msg.text}</p>
                          </div>
                          <p className="text-xs text-gray-300 mt-1 mr-1 drop-shadow">
                            {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white/30">
                          <User className="text-white" size={20} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B8579] to-[#0d5c54] flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white/30">
                      <Bot className="text-white" size={20} />
                    </div>
                    <div className="bg-white/20 backdrop-blur-xl rounded-3xl rounded-tl-sm px-6 py-4 shadow-2xl border border-white/40">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-white/10 bg-black/30 backdrop-blur-md p-4">
                <div className="flex gap-3 items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-6 py-4 bg-white/25 backdrop-blur-xl border border-white/40 rounded-full focus:border-white/60 focus:bg-white/30 focus:outline-none transition-all text-white shadow-lg placeholder:text-white/60 font-medium"
                    disabled={isTyping}
                    autoComplete="off"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isTyping || !userInput.trim()}
                    className="w-14 h-14 bg-gradient-to-br from-[#1B8579] to-[#0d5c54] hover:from-[#1a9d8f] hover:to-[#0a4a43] rounded-full hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl flex items-center justify-center transform hover:scale-110 active:scale-95"
                  >
                    <Send size={22} className="text-white" />
                  </button>
                </div>
                <p className="text-xs text-white/70 mt-3 text-center drop-shadow font-medium">
                  Nhấn Enter để gửi • Travyy AI luôn sẵn sàng giúp bạn
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 hidden lg:block" />
      </div>
    </div>
  );
};

export default AITourCreator;