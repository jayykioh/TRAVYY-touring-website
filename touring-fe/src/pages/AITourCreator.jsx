import { useState, useEffect, useRef } from 'react';
import { MapPin, Compass, Calendar, Map } from 'lucide-react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

export default function TouringLanding() {
  const navigate = useNavigate();

  // Inject Google Fonts for this page only (Poppins + Playfair Display)
  useEffect(() => {
    const poppinsId = 'travyy-google-fonts';
    if (!document.getElementById(poppinsId)) {
      const link = document.createElement('link');
      link.id = poppinsId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:wght@400;600;700;800&family=Poppins:wght@300;400;600;700;900&display=swap';
      document.head.appendChild(link);
    }
  }, []);
  
  const [show, setShow] = useState([false, false, false, false]);
  const [pageLoaded, setPageLoaded] = useState(false);
  const canvasRef = useRef(null);

  // Page load animation
  useEffect(() => {
    setTimeout(() => setPageLoaded(true), 100);
  }, []);

  useEffect(() => {
    const delays = [600, 900, 1200, 1500];
    const timers = delays.map((delay, index) =>
      setTimeout(() => {
        setShow((prev) => {
          const next = [...prev];
          next[index] = true;
          return next;
        });
      }, delay)
    );
    return () => timers.forEach((t) => clearTimeout(t));
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

    // Create multiple floating particles with different geometries
    const particles = [];
    const particleCount = 15;
    
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
        opacity: 0.35 + Math.random() * 0.25
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

    // Animation
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      particles.forEach((particle, i) => {
        particle.rotation.x += particle.userData.rotSpeedX;
        particle.rotation.y += particle.userData.rotSpeedY;
        
        particle.position.x += particle.userData.speedX;
        particle.position.y += particle.userData.speedY + Math.sin(Date.now() * 0.001 + particle.userData.floatOffset) * 0.002;
        particle.position.z += particle.userData.speedZ;
        
        // Wrap around screen
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

    // Resize handler
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
    <div className={`min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-gray-950 to-black transition-opacity duration-1000 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ fontFamily: "'Poppins', 'Playfair Display', sans-serif" }}>
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-60 pointer-events-none" />

      {/* Back to home (top-left) */}
      <button
        onClick={() => navigate('/')}
        aria-label="Về trang chủ"
        className="absolute top-4 left-4 z-40 px-3 py-2 rounded-full bg-black/30 backdrop-blur-md text-white/90 border border-white/10 hover:bg-black/40 hover:scale-105 transform transition-all"
      >
        Về trang chủ
      </button>

      {/* Animated gradient orbs - darker theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-violet-900/15 to-fuchsia-900/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-900/12 to-blue-900/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s', animationDuration: '4s'}} />
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-gradient-to-br from-pink-900/12 to-rose-900/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s', animationDuration: '5s'}} />
        
        {/* Subtle floating particles */}
        <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-cyan-400/20 rounded-full animate-ping" style={{animationDuration: '3s'}} />
        <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 bg-violet-400/20 rounded-full animate-ping" style={{animationDuration: '4s', animationDelay: '1s'}} />
        <div className="absolute bottom-1/4 left-2/3 w-1.5 h-1.5 bg-blue-400/20 rounded-full animate-ping" style={{animationDuration: '3.5s', animationDelay: '2s'}} />
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 md:p-6 relative z-20" style={{perspective: '1000px'}}>
        {/* Unified Center Block - Hero + Features */}
        <div className="flex flex-col items-center justify-center w-full max-w-5xl">
          {/* Hero section with 3D depth */}
          <div className={`flex flex-col items-center justify-center space-y-4 md:space-y-5 relative transition-all duration-1000 ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{transformStyle: 'preserve-3d'}}>
            {/* Modern icon design - popping forward */}
            <div className={`relative group transition-all duration-700 delay-200 ${pageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} style={{transform: 'translateZ(60px)', transformStyle: 'preserve-3d'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-blue-600/15 blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse" 
                   style={{animationDuration: '3s', transform: 'translateZ(-15px)'}} />
              <div className="relative backdrop-blur-3xl bg-gradient-to-br from-white/20 to-white/5 p-3 md:p-4 rounded-2xl border-2 border-cyan-400/30 shadow-2xl hover:scale-110 transition-all duration-500"
                   style={{
                     transform: 'translateZ(15px)',
                     boxShadow: '0 15px 45px rgba(34, 211, 238, 0.3), 0 0 60px rgba(59, 130, 246, 0.2)'
                   }}>
                <MapPin className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-2xl" />
              </div>
            </div>
            
            {/* Title with gradient - extreme forward */}
            <div className={`flex justify-center gap-0.5 md:gap-1 relative transition-all duration-1000 delay-300 ${pageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} style={{transform: 'translateZ(120px)', transformStyle: 'preserve-3d'}}>
              {title.split('').map((char, i) => (
                <span
                  key={i}
                  className="text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-blue-200 inline-block"
                  style={{
                    fontFamily: "'Bebas Neue', 'Poppins', sans-serif",
                    letterSpacing: '0.05em',
                    filter: 'drop-shadow(0 8px 24px rgba(6, 182, 212, 0.8)) drop-shadow(0 0 60px rgba(59, 130, 246, 0.6))',
                    animation: 'float3d 3s ease-in-out infinite',
                    animationDelay: `${i * 0.15}s`,
                    textShadow: '0 8px 32px rgba(6, 182, 212, 0.8), 0 16px 60px rgba(59, 130, 246, 0.6), 0 -4px 24px rgba(255, 255, 255, 0.4)',
                    transform: `translateZ(${i * 4}px)`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
            
            {/* Tagline - mid depth */}
            <p className={`text-base md:text-lg lg:text-xl text-white/90 font-light tracking-wide text-center max-w-xl px-4 relative transition-all duration-1000 delay-500 ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
               style={{
                 transform: 'translateZ(45px)', 
                 textShadow: '0 4px 20px rgba(0,0,0,0.6), 0 0 40px rgba(6, 182, 212, 0.3)'
               }}>
              Tạo lịch trình du lịch hoàn hảo với AI
            </p>
            
            {/* Subtitle - above buttons */}
            <p className={`text-[9px] md:text-[10px] text-white/50 text-center tracking-[0.2em] uppercase relative transition-all duration-1000 delay-700 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}
               style={{transform: 'translateZ(30px)'}}>
              Khám phá thế giới theo cách của bạn
            </p>
            
            {/* Modern buttons - forward */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full md:w-auto">
              <button 
                onClick={() => navigate('/intinerary-creator')}
                className="group relative px-12 py-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-semibold shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Bắt đầu ngay</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button 
                onClick={() => navigate('/home')}
                className="px-12 py-5 rounded-full backdrop-blur-md bg-white/5 text-white/90 text-lg font-semibold border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300"
              >
                Tìm hiểu thêm
              </button>
            </div>
          </div>

          {/* Feature cards - directly below hero */}
          <div className="w-full mt-16 md:mt-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4" 
                 style={{transformStyle: 'preserve-3d'}}>
              <div className={`group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/20 shadow-xl hover:shadow-violet-500/50 hover:border-violet-400/70 transition-all duration-700 ease-out cursor-pointer ${show[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                   style={{
                     animation: show[0] ? 'cardFloat3d 4s ease-in-out infinite' : 'none',
                     animationDelay: '0s',
                     transform: show[0] ? 'translateZ(15px)' : 'translateZ(0px)',
                     transformStyle: 'preserve-3d'
                   }}>
                <div className="relative mb-2 md:mb-2.5 transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-1">
                  <div className="absolute -inset-2 bg-violet-500/40 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <Compass className="w-7 h-7 md:w-8 md:h-8 text-violet-300 relative" />
                </div>
                <h3 className="text-xs md:text-sm font-bold text-white mb-1 md:mb-1.5">Chuyến đi riêng</h3>
                <p className="text-[10px] md:text-xs text-white/60 leading-relaxed">Tạo hành trình độc đáo</p>
              </div>
              
              <div className={`group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/20 shadow-xl hover:shadow-cyan-500/50 hover:border-cyan-400/70 transition-all duration-700 ease-out cursor-pointer ${show[1] ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                   style={{
                     animation: show[1] ? 'cardFloat3d 4s ease-in-out infinite' : 'none',
                     animationDelay: '0.5s',
                     transform: show[1] ? 'translateZ(12px)' : 'translateZ(0px)',
                     transformStyle: 'preserve-3d'
                   }}>
                <div className="relative mb-2 md:mb-2.5 transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-1">
                  <div className="absolute -inset-2 bg-cyan-500/40 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <Map className="w-7 h-7 md:w-8 md:h-8 text-cyan-300 relative" />
                </div>
                <h3 className="text-xs md:text-sm font-bold text-white mb-1 md:mb-1.5">Địa điểm thú vị</h3>
                <p className="text-[10px] md:text-xs text-white/60 leading-relaxed">AI gợi ý phù hợp</p>
              </div>
              
              <div className={`group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/20 shadow-xl hover:shadow-blue-500/50 hover:border-blue-400/70 transition-all duration-700 ease-out cursor-pointer ${show[2] ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                   style={{
                     animation: show[2] ? 'cardFloat3d 4s ease-in-out infinite' : 'none',
                     animationDelay: '1s',
                     transform: show[2] ? 'translateZ(9px)' : 'translateZ(0px)',
                     transformStyle: 'preserve-3d'
                   }}>
                <div className="relative mb-2 md:mb-2.5 transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-1">
                  <div className="absolute -inset-2 bg-blue-500/40 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <Calendar className="w-7 h-7 md:w-8 md:h-8 text-blue-300 relative" />
                </div>
                <h3 className="text-xs md:text-sm font-bold text-white mb-1 md:mb-1.5">Lịch trình dễ dàng</h3>
                <p className="text-[10px] md:text-xs text-white/60 leading-relaxed">Sắp xếp nhanh chóng</p>
              </div>
              
              <div className={`group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/20 shadow-xl hover:shadow-fuchsia-500/50 hover:border-fuchsia-400/70 transition-all duration-700 ease-out cursor-pointer ${show[3] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                   style={{
                     animation: show[3] ? 'cardFloat3d 4s ease-in-out infinite' : 'none',
                     animationDelay: '1.5s',
                     transform: show[3] ? 'translateZ(6px)' : 'translateZ(0px)',
                     transformStyle: 'preserve-3d'
                   }}>
                <div className="relative mb-2 md:mb-2.5 transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-1">
                  <div className="absolute -inset-2 bg-fuchsia-500/40 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <MapPin className="w-7 h-7 md:w-8 md:h-8 text-fuchsia-300 relative" />
                </div>
                <h3 className="text-xs md:text-sm font-bold text-white mb-1 md:mb-1.5">Tối ưu hành trình</h3>
                <p className="text-[10px] md:text-xs text-white/60 leading-relaxed">Tiết kiệm thời gian</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes float3d {
          0%, 100% { 
            transform: translateY(0px) rotateX(0deg);
          }
          50% { 
            transform: translateY(-12px) rotateX(5deg);
          }
        }
        
        @keyframes cardFloat3d {
          0%, 100% { 
            transform: translateY(0px) rotateY(0deg) scale(1);
          }
          50% { 
            transform: translateY(-8px) rotateY(2deg) scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}