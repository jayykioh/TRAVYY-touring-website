import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context';
import { motion } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '../components/ui/dialog';
import Prism from '../components/ui/prism';
// Modern SVG Icons
const CompassIcon = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M16.24 7.76L10.5 10.5L7.76 16.24L13.5 13.5L16.24 7.76Z" fill="currentColor" opacity="0.5" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

const SparklesIcon = ({ className = "w-20 h-20" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="currentColor" />
    <path d="M19 4L19.5 6.5L22 7L19.5 7.5L19 10L18.5 7.5L16 7L18.5 6.5L19 4Z" fill="currentColor" opacity="0.6" />
    <path d="M5 14L5.5 16L7 16.5L5.5 17L5 19L4.5 17L3 16.5L4.5 16L5 14Z" fill="currentColor" opacity="0.6" />
  </svg>
);

const BrainIcon = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.5 2C7.01472 2 5 4.01472 5 6.5V7C5 7.55228 4.55228 8 4 8C2.89543 8 2 8.89543 2 10V11C2 12.1046 2.89543 13 4 13C4.55228 13 5 13.4477 5 14V17.5C5 19.9853 7.01472 22 9.5 22H14.5C16.9853 22 19 19.9853 19 17.5V14C19 13.4477 19.4477 13 20 13C21.1046 13 22 12.1046 22 11V10C22 8.89543 21.1046 8 20 8C19.4477 8 19 7.55228 19 7V6.5C19 4.01472 16.9853 2 14.5 2H9.5Z" stroke="currentColor" strokeWidth="2" />
    <path d="M9 10H10M14 10H15M12 14C12 14 13 15 12 16C11 15 12 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ArrowRightIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronLeftIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function AITourCreator() {
  const navigate = useNavigate();
  const { isAuth } = useAuth();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Prism Background */}
      <div className="absolute inset-0 z-0">
        <Prism 
          height={4}
          baseWidth={6}
          animationType="rotate"
          glow={1.2}
          noise={0.2}
          scale={3.5}
          hueShift={0.3}
          colorFrequency={0.8}
          timeScale={0.3}
          bloom={1.5}
        />
      </div>

      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-40 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-full bg-slate-800/40 backdrop-blur-md border border-slate-700/50 text-slate-200 hover:bg-slate-700/50 hover:text-white transition-all duration-300 text-sm font-medium"
          >
            ← Về trang chủ
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-full bg-slate-800/40 backdrop-blur-md border border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-300 text-sm font-medium"
          >
            Cách hoạt động
          </button>
        </div>
      </nav>

      {/* Main Content - Centered */}
      <div className="min-h-screen flex items-center justify-center p-6 relative z-20">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          
          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-none">
              Tạo lịch trình du lịch
            </h1>
            <p className="text-2xl md:text-3xl text-slate-300 font-light">
              Theo cách của bạn
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate('/intinerary-creator')}
              className="group relative px-8 py-4 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <span>Tự tạo lịch trình</span>
            </button>
            
            <button
              onClick={() => {
                if (!isAuth) {
                  navigate('/login', { state: { from: '/recommendations/wrapped' } });
                } else {
                  navigate('/recommendations/wrapped');
                }
              }}
              className="group relative px-8 py-4 rounded-full bg-slate-800/60 backdrop-blur-md border border-slate-600/50 text-white hover:bg-slate-700/60 hover:border-slate-500 font-semibold text-lg transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5" />
                {isAuth ? 'Gợi ý AI' : 'Đăng nhập xem AI'}
              </span>
            </button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3 text-sm"
          >
            <div className="px-4 py-2 rounded-full bg-slate-800/40 backdrop-blur-md border border-slate-700/50 text-slate-300">
              ⚡ Nhanh chóng
            </div>
            <div className="px-4 py-2 rounded-full bg-slate-800/40 backdrop-blur-md border border-slate-700/50 text-slate-300">
              🔒 Bảo mật
            </div>
            <div className="px-4 py-2 rounded-full bg-slate-800/40 backdrop-blur-md border border-slate-700/50 text-slate-300">
              ✨ Miễn phí
            </div>
          </motion.div>
        </div>
      </div>

      {/* Shadcn Dialog for How it works */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-slate-200/80">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Cách hệ thống hoạt động
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-base">
              Hai cách tạo lịch trình phù hợp với từng nhu cầu
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Method 1: Manual */}
            <div className="border border-slate-200 rounded-xl p-6 bg-white/80">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-100 rounded-xl shrink-0">
                  <CompassIcon className="w-8 h-8 text-slate-900" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <span>🗺️</span>
                    <span>Tự tạo lịch trình</span>
                  </h3>
                  <p className="text-sm text-slate-600 mb-2">
                    Hoàn toàn kiểm soát chuyến đi:
                  </p>
                  <ul className="space-y-1 text-sm text-slate-500">
                    <li>• Chọn địa điểm theo sở thích cá nhân</li>
                    <li>• Sắp xếp thứ tự tùy ý</li>
                    <li>• Điều chỉnh thời gian linh hoạt</li>
                    <li>• Không cần tài khoản</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Method 2: AI */}
            <div className="border-2 border-[#02A0AA]/30 rounded-xl p-6 bg-linear-to-br from-[#02A0AA]/5 to-cyan-50/50">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shrink-0 shadow-sm">
                  <SparklesIcon className="w-8 h-8 text-[#02A0AA]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <span>✨</span>
                    <span>Gợi ý chính xác</span>
                  </h3>
                  <p className="text-sm text-slate-600 mb-2">
                    Dựa trên hồ sơ của bạn:
                  </p>
                  <ul className="space-y-1 text-sm text-slate-500">
                    <li>• Hiển thị báo cáo tuần (giống Spotify Wrapped)</li>
                    <li>• Tự động tìm tour phù hợp</li>
                    <li>• Tối ưu lịch trình di chuyển</li>
                    <li>• Cải thiện theo thời gian</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Comparison Card */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#02A0AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>So sánh hai phương thức</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-[#02A0AA] text-sm">Tự tạo</h4>
                  <ul className="text-xs text-slate-600 space-y-1">
                    <li>✓ Bạn chọn sở thích</li>
                    <li>✓ Kết quả ngay lập tức</li>
                    <li>✓ Không cần đăng nhập</li>
                    <li>✓ Phù hợp cho lần đầu</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-600 text-sm">Gợi ý AI</h4>
                  <ul className="text-xs text-slate-600 space-y-1">
                    <li>✓ AI tự động phân tích</li>
                    <li>✓ Càng dùng càng chính xác</li>
                    <li>✓ Cần đăng nhập</li>
                    <li>✓ Báo cáo tuần qua</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => {
                setShowModal(false);
                if (!isAuth) {
                  navigate('/login', { state: { from: '/recommendations/wrapped' } });
                } else {
                  navigate('/recommendations/wrapped');
                }
              }}
              className="w-full bg-[#02A0AA] hover:bg-[#029099] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              Dùng thử AI ngay
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
