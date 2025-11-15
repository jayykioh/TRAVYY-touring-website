import { useState, useEffect, useRef } from 'react';
import { MapPin, Compass, Map, Sparkles, TrendingUp, X, ArrowRight, Zap, Brain, Calendar } from 'lucide-react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context';

export default function AITourCreator() {
  const navigate = useNavigate();
  const { isAuth } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const canvasRef = useRef(null);

  // Inject Google Fonts
  useEffect(() => {
    const fontsId = 'travyy-google-fonts';
    if (!document.getElementById(fontsId)) {
      const link = document.createElement('link');
      link.id = fontsId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:wght@400;600;700;800&family=Poppins:wght@300;400;600;700;900&display=swap';
      document.head.appendChild(link);
    }
  }, []);
  
  // Page load animation
  useEffect(() => {
    setTimeout(() => setPageLoaded(true), 100);
  }, []);

  // Three.js background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 5;

    // Create floating particles
    const particles = [];
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
      let geometry;
      const rand = Math.random();
      
      if (rand < 0.33) {
        geometry = new THREE.TorusGeometry(0.6, 0.2, 8, 16);
      } else if (rand < 0.66) {
        geometry = new THREE.OctahedronGeometry(0.8, 0);
      } else {
        geometry = new THREE.TetrahedronGeometry(1, 0);
      }
      
      const material = new THREE.MeshPhongMaterial({
        color: i % 3 === 0 ? 0x06b6d4 : i % 3 === 1 ? 0x8b5cf6 : 0x3b82f6,
        wireframe: true,
        transparent: true,
        opacity: 0.3 + Math.random() * 0.2
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = (Math.random() - 0.5) * 10;
      mesh.position.y = (Math.random() - 0.5) * 10;
      mesh.position.z = (Math.random() - 0.5) * 10;
      
      mesh.userData = {
        speedX: (Math.random() - 0.5) * 0.002,
        speedY: (Math.random() - 0.5) * 0.002,
        speedZ: (Math.random() - 0.5) * 0.002,
        rotSpeedX: (Math.random() - 0.5) * 0.01,
        rotSpeedY: (Math.random() - 0.5) * 0.01,
        floatOffset: Math.random() * Math.PI * 2
      };
      
      scene.add(mesh);
      particles.push(mesh);
    }

    // Lighting
    const light1 = new THREE.DirectionalLight(0x06b6d4, 0.6);
    light1.position.set(5, 5, 5);
    scene.add(light1);
    
    const light2 = new THREE.DirectionalLight(0x8b5cf6, 0.4);
    light2.position.set(-5, -5, -5);
    scene.add(light2);
    
    scene.add(new THREE.AmbientLight(0x404040, 1));

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      particles.forEach((particle) => {
        particle.rotation.x += particle.userData.rotSpeedX;
        particle.rotation.y += particle.userData.rotSpeedY;
        
        particle.position.x += particle.userData.speedX;
        particle.position.y += particle.userData.speedY + Math.sin(Date.now() * 0.001 + particle.userData.floatOffset) * 0.002;
        particle.position.z += particle.userData.speedZ;
        
        // Wrap around
        if (particle.position.x > 8) particle.position.x = -8;
        if (particle.position.x < -8) particle.position.x = 8;
        if (particle.position.y > 8) particle.position.y = -8;
        if (particle.position.y < -8) particle.position.y = 8;
        if (particle.position.z > 8) particle.position.z = -8;
        if (particle.position.z < -8) particle.position.z = 8;
      });
      
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      particles.forEach(p => {
        p.geometry.dispose();
        p.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  const title = "TRAVYY";

  return (
    <div className={`min-h-screen relative overflow-hidden bg-linear-to-br from-slate-950 via-gray-950 to-black transition-opacity duration-1000 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ fontFamily: "'Poppins', 'Playfair Display', sans-serif" }}>
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-50 pointer-events-none" />

      {/* Back to home */}
      <button
        onClick={() => navigate('/')}
        aria-label="Về trang chủ"
        className="absolute top-4 left-4 z-40 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md text-white/90 border border-white/10 hover:bg-black/40 hover:scale-105 transform transition-all text-sm font-medium"
      >
        ← Về trang chủ
      </button>

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-linear-to-br from-violet-900/15 to-fuchsia-900/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-linear-to-br from-cyan-900/12 to-blue-900/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s', animationDuration: '4s'}} />
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-linear-to-br from-pink-900/12 to-rose-900/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s', animationDuration: '5s'}} />
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 md:p-6 relative z-20">
        <div className="flex flex-col items-center justify-center w-full max-w-6xl">
          {/* Hero section */}
          <div className={`flex flex-col items-center justify-center space-y-4 mb-12 transition-all duration-1000 ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            {/* Icon */}
            <div className={`relative group transition-all duration-700 delay-200 ${pageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
              <div className="absolute inset-0 bg-linear-to-br from-cyan-600/20 to-blue-600/15 blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse" 
                   style={{animationDuration: '3s'}} />
              <div className="relative backdrop-blur-3xl bg-linear-to-br from-white/20 to-white/5 p-4 rounded-2xl border-2 border-cyan-400/30 shadow-2xl">
                <MapPin className="w-12 h-12 text-white drop-shadow-2xl" />
              </div>
            </div>
            
            {/* Title */}
            <div className={`flex justify-center gap-1 transition-all duration-1000 delay-300 ${pageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
              {title.split('').map((char, i) => (
                <span
                  key={i}
                  className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to-br from-white via-cyan-100 to-blue-200 inline-block"
                  style={{
                    fontFamily: "'Bebas Neue', 'Poppins', sans-serif",
                    letterSpacing: '0.05em',
                    textShadow: '0 8px 32px rgba(6, 182, 212, 0.8), 0 16px 60px rgba(59, 130, 246, 0.6)',
                    animation: 'float 3s ease-in-out infinite',
                    animationDelay: `${i * 0.15}s`
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
            
            {/* Tagline */}
            <p className={`text-xl md:text-2xl text-white/90 font-light tracking-wide text-center max-w-2xl px-4 transition-all duration-1000 delay-500 ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
               style={{textShadow: '0 4px 20px rgba(0,0,0,0.6)'}}>
              Trung tâm tạo lịch trình thông minh
            </p>
            
            {/* Subtitle */}
            <p className={`text-xs text-white/50 text-center tracking-widest uppercase transition-all duration-1000 delay-700 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Chọn phương thức phù hợp với bạn
            </p>
          </div>

          {/* Main Cards - 3 columns */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-8 transition-all duration-1000 delay-900 ${pageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            
            {/* Card 1: Manual Creation */}
            <div className="group relative backdrop-blur-xl bg-linear-to-br from-white/10 to-white/5 p-8 rounded-3xl border border-white/20 shadow-2xl hover:shadow-cyan-500/30 hover:border-cyan-400/50 transition-all duration-500 cursor-pointer overflow-hidden"
                 onClick={() => navigate('/intinerary-creator')}>
              <div className="absolute inset-0 bg-linear-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-500 rounded-3xl" />
              
              <div className="relative z-10">
                <div className="mb-6 relative">
                  <div className="absolute -inset-3 bg-cyan-500/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-linear-to-br from-cyan-500/20 to-blue-500/20 p-4 rounded-2xl border border-cyan-400/30 inline-block">
                    <Compass className="w-10 h-10 text-cyan-300 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                  Tự tạo Itinerary
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  Tự do chọn điểm đến, sắp xếp lịch trình theo ý muốn. Phù hợp với người có kế hoạch rõ ràng.
                </p>
                
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-white/60 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Chọn địa điểm tùy ý
                  </li>
                  <li className="flex items-center gap-2 text-white/60 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Kiểm soát hoàn toàn
                  </li>
                  <li className="flex items-center gap-2 text-white/60 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Không cần đăng nhập
                  </li>
                </ul>
                
                <button className="w-full bg-linear-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300 px-6 py-3 rounded-xl font-semibold hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                  Bắt đầu tạo
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Card 2: AI Recommendations */}
            <div className="group relative backdrop-blur-xl bg-linear-to-br from-white/10 to-white/5 p-8 rounded-3xl border-2 border-purple-400/40 shadow-2xl hover:shadow-purple-500/40 hover:border-purple-400/60 transition-all duration-500 cursor-pointer overflow-hidden"
                 onClick={() => {
                   if (!isAuth) {
                     navigate('/login', { state: { from: '/recommendations/wrapped' } });
                   } else {
                     navigate('/recommendations/wrapped');
                   }
                 }}>
              <div className="absolute top-4 right-4 bg-linear-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                AI Powered
              </div>
              
              <div className="absolute inset-0 bg-linear-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500 rounded-3xl" />
              
              <div className="relative z-10">
                <div className="mb-6 relative">
                  <div className="absolute -inset-3 bg-purple-500/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-linear-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-2xl border border-purple-400/40 inline-block">
                    <Sparkles className="w-10 h-10 text-purple-300 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                  AI Gợi ý cá nhân
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  Xem báo cáo tuần qua, nhận gợi ý tour phù hợp với sở thích. AI tối ưu hành trình cho bạn.
                </p>
                
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-white/60 text-xs">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    Phân tích sở thích
                  </li>
                  <li className="flex items-center gap-2 text-white/60 text-xs">
                    <TrendingUp className="w-3 h-3 text-purple-400" />
                    Báo cáo Wrapped
                  </li>
                  <li className="flex items-center gap-2 text-white/60 text-xs">
                    <Zap className="w-3 h-3 text-purple-400" />
                    Tự động tối ưu
                  </li>
                </ul>
                
                <button className="w-full bg-linear-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl group/btn">
                  {isAuth ? 'Xem báo cáo' : 'Đăng nhập để xem'}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Card 3: How it works */}
            <div className="group relative backdrop-blur-xl bg-linear-to-br from-white/10 to-white/5 p-8 rounded-3xl border border-white/20 shadow-2xl hover:shadow-blue-500/30 hover:border-blue-400/50 transition-all duration-500 cursor-pointer overflow-hidden"
                 onClick={() => setShowModal(true)}>
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/10 group-hover:to-indigo-500/10 transition-all duration-500 rounded-3xl" />
              
              <div className="relative z-10">
                <div className="mb-6 relative">
                  <div className="absolute -inset-3 bg-blue-500/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-linear-to-br from-blue-500/20 to-indigo-500/20 p-4 rounded-2xl border border-blue-400/30 inline-block">
                    <Brain className="w-10 h-10 text-blue-300 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                  Pipeline hoạt động
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  Tìm hiểu cách AI phân tích hành vi, thu thập dữ liệu và tối ưu gợi ý cho bạn.
                </p>
                
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-white/60 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    Thu thập dữ liệu
                  </li>
                  <li className="flex items-center gap-2 text-white/60 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    Phân tích AI
                  </li>
                  <li className="flex items-center gap-2 text-white/60 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    Cá nhân hóa gợi ý
                  </li>
                </ul>
                
                <button className="w-full bg-linear-to-r from-blue-500/20 to-indigo-500/20 border border-blue-400/30 text-blue-300 px-6 py-3 rounded-xl font-semibold hover:from-blue-500/30 hover:to-indigo-500/30 transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                  Tìm hiểu thêm
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Feature Pills */}
          <div className={`flex flex-wrap justify-center gap-4 text-white/60 text-sm transition-all duration-1000 delay-1100 ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center gap-2 backdrop-blur-md bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Map className="w-4 h-4 text-cyan-400" />
              <span>Pipeline cũ + mới</span>
            </div>
            <div className="flex items-center gap-2 backdrop-blur-md bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Tự động cập nhật</span>
            </div>
            <div className="flex items-center gap-2 backdrop-blur-md bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>AI học từ hành vi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Explanation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
             onClick={() => setShowModal(false)}>
          <div className="relative bg-linear-to-br from-slate-900 to-gray-900 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl"
               onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              aria-label="Đóng"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/30 mb-4">
                  <Brain className="w-8 h-8 text-purple-300" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Pipeline AI hoạt động như thế nào?</h2>
                <p className="text-white/60">Hệ thống AI thu thập và phân tích dữ liệu để gợi ý tour phù hợp</p>
              </div>

              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-linear-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">📊 Thu thập dữ liệu</h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-3">
                    Hệ thống theo dõi hành vi của bạn khi:
                  </p>
                  <ul className="space-y-1 text-white/60 text-sm">
                    <li>• Xem tour, blog, địa điểm</li>
                    <li>• Lưu yêu thích, đặt tour</li>
                    <li>• Tương tác với nội dung</li>
                  </ul>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">🧠 Phân tích AI</h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-3">
                    AI xử lý dữ liệu mỗi tuần để:
                  </p>
                  <ul className="space-y-1 text-white/60 text-sm">
                    <li>• Xác định sở thích (văn hóa, mạo hiểm, ẩm thực...)</li>
                    <li>• Tìm tỉnh thành yêu thích</li>
                    <li>• Đánh giá mức độ tương tác</li>
                    <li>• Tạo UserProfile cá nhân hóa</li>
                  </ul>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">✨ Gợi ý thông minh</h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-3">
                    Dựa trên profile, hệ thống:
                  </p>
                  <ul className="space-y-1 text-white/60 text-sm">
                    <li>• Hiển thị báo cáo Wrapped (như Spotify)</li>
                    <li>• Tự động tìm tour phù hợp</li>
                    <li>• Tối ưu lịch trình di chuyển</li>
                    <li>• Cập nhật theo thời gian thực</li>
                  </ul>
                </div>
              </div>

              {/* Pipeline comparison */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Map className="w-5 h-5 text-cyan-400" />
                  Sự khác biệt giữa 2 pipeline
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-cyan-300 text-sm">Pipeline cũ (Manual)</h4>
                    <ul className="text-white/60 text-xs space-y-1">
                      <li>• Người dùng chọn sở thích thủ công</li>
                      <li>• ViDoi → DiscoverResults</li>
                      <li>• Không cần đăng nhập</li>
                      <li>• Kết quả tức thì</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-purple-300 text-sm">Pipeline mới (AI)</h4>
                    <ul className="text-white/60 text-xs space-y-1">
                      <li>• AI phân tích hành vi tự động</li>
                      <li>• Wrapped → Auto DiscoverResults</li>
                      <li>• Cần đăng nhập để theo dõi</li>
                      <li>• Càng dùng càng chính xác</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    if (!isAuth) {
                      navigate('/login', { state: { from: '/recommendations/wrapped' } });
                    } else {
                      navigate('/recommendations/wrapped');
                    }
                  }}
                  className="flex-1 bg-linear-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
                >
                  Dùng thử AI ngay
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white/5 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
