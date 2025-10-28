import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Compass, Calendar, Map } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import * as THREE from 'three';

export default function TouringLanding() {
  const [show, setShow] = useState([false, false, false, false]);
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const delays = [400, 1000, 1600, 2200];
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

    // Create floating geometry
    const geometry = new THREE.IcosahedronGeometry(1.5, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040, 2));

    // Animation
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      mesh.rotation.x += 0.003;
      mesh.rotation.y += 0.005;
      mesh.position.y = Math.sin(Date.now() * 0.001) * 0.3;
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
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  const title = "TRAVYY";

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 -z-10" />

      {/* Back to home (top-left) - smooth slide-in */}
      <motion.button
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.12 }}
        onClick={() => navigate('/')}
        aria-label="Về trang chủ"
        className="absolute top-4 left-4 z-40 px-3 py-2 rounded-full bg-black/30 backdrop-blur-md text-white/90 border border-white/10 hover:bg-black/40 hover:scale-105 transform transition-all"
      >
        Về trang chủ
      </motion.button>

      {/* Glowing orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl" />
      </div>

      <div className="min-h-screen flex items-center justify-center p-8 relative z-10">
        {/* Corner cards */}
        <div
          className={`absolute top-8 left-8 max-w-xs backdrop-blur-md bg-white/5 p-5 rounded-2xl border border-white/10 shadow-2xl transition-all duration-1000 ${
            show[0] ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
          }`}
        >
          <Compass className="w-6 h-6 text-purple-400 mb-2" />
          <p className="text-sm font-medium text-white/80">Bạn muốn tạo chuyến đi riêng?</p>
        </div>

        <div
          className={`absolute top-8 right-8 max-w-xs backdrop-blur-md bg-white/5 p-5 rounded-2xl border border-white/10 shadow-2xl transition-all duration-1000 ${
            show[1] ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <Map className="w-6 h-6 text-blue-400 mb-2" />
          <p className="text-sm font-medium text-white/80">Khám phá những địa điểm thú vị</p>
        </div>

        <div
          className={`absolute bottom-8 left-8 max-w-xs backdrop-blur-md bg-white/5 p-5 rounded-2xl border border-white/10 shadow-2xl transition-all duration-1000 ${
            show[2] ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-6'
          }`}
        >
          <Calendar className="w-6 h-6 text-cyan-400 mb-2" />
          <p className="text-sm font-medium text-white/80">Lên lịch trình dễ dàng</p>
        </div>

        <div
          className={`absolute bottom-8 right-8 max-w-xs backdrop-blur-md bg-white/5 p-5 rounded-2xl border border-white/10 shadow-2xl transition-all duration-1000 ${
            show[3] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <MapPin className="w-6 h-6 text-pink-400 mb-2" />
          <p className="text-sm font-medium text-white/80">Tối ưu hóa hành trình của bạn</p>
        </div>

        {/* Center content */}
        <div className="max-w-4xl mx-auto text-center space-y-10">
          {/* Icon with glow */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/30 blur-2xl rounded-full animate-pulse" />
              <div className="relative backdrop-blur-xl bg-slate-800/40 p-6 rounded-3xl border border-purple-500/30 shadow-2xl">
                <MapPin className="w-16 h-16 text-purple-300" />
              </div>
            </div>
          </div>

          {/* Title with split letters */}
          <div className="space-y-6">
            <div className="flex justify-center gap-2 md:gap-4">
              {title.split('').map((char, i) => (
                <span
                  key={i}
                  className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-200 inline-block animate-bounce"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '2s'
                  }}
                >
                  {char}
                </span>
              ))}
            </div>

            <p className="text-lg md:text-xl text-white/70 font-light max-w-2xl mx-auto">
              Tạo lịch trình du lịch hoàn hảo với AI
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
                onClick={() => navigate('/intinerary-creator')}
              className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Bắt đầu ngay</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button 
              onClick={() => alert('Tìm hiểu thêm')}
              className="px-8 py-4 rounded-full backdrop-blur-md bg-white/5 text-white/90 font-semibold border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300"
            >
              Tìm hiểu thêm
            </button>

            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-full bg-white/10 text-white/80 font-medium border border-white/10 hover:bg-white/20 transition-all duration-200"
            >
              Về trang chủ
            </button>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-white/40 pt-4">
            Khám phá thế giới theo cách của bạn
          </p>
        </div>
      </div>
    </div>
  );
}