import { Facebook, Instagram, Youtube, Twitter, MapPin, Wallet, Mail, Phone } from "lucide-react";
import { SiPaypal } from "react-icons/si";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <footer className="relative bg-[url('https://exmouthresort.net.au/wp-content/uploads/119079-56.jpg')] bg-cover bg-center text-white">
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Content wrapper */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Brand Section - Takes more space */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <MapPin className="w-9 h-9 text-cyan-400 stroke-[2.5] drop-shadow-lg" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Travvy
              </span>
            </div>
            <p className="text-white/75 leading-relaxed mb-3 max-w-md text-sm">
              Nền tảng đặt tour và khám phá du lịch hiện đại. Khám phá thế giới theo cách của bạn với Travvy - Đơn giản, Nhanh chóng, Đáng tin cậy.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-1.5 mb-3">
              <a href="mailto:contact@travvy.com" className="flex items-center gap-2 text-white/70 hover:text-cyan-300 transition group">
                <div className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-sm">contact@travvy.com</span>
              </a>
              <a href="tel:+84123456789" className="flex items-center gap-2 text-white/70 hover:text-cyan-300 transition group">
                <div className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-sm">+84 123 456 789</span>
              </a>
            </div>

            {/* Social Links */}
            <div className="flex gap-1.5">
              <a href="https://www.facebook.com" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition group" aria-label="Facebook">
                <Facebook size={16} className="text-white/70 group-hover:text-cyan-300 transition"/>
              </a>
              <a href="https://www.instagram.com" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition group" aria-label="Instagram">
                <Instagram size={16} className="text-white/70 group-hover:text-cyan-300 transition"/>
              </a>
              <a href="https://www.youtube.com" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition group" aria-label="YouTube">
                <Youtube size={16} className="text-white/70 group-hover:text-cyan-300 transition"/>
              </a>
              <a href="https://www.twitter.com" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition group" aria-label="Twitter">
                <Twitter size={16} className="text-white/70 group-hover:text-cyan-300 transition"/>
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Explore */}
            <div>
              <h4 className="font-bold text-white text-sm mb-2 relative inline-block">
                Khám phá
                <div className="absolute -bottom-0.5 left-0 w-6 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent"></div>
              </h4>
              <ul className="space-y-1">
                <li><a onClick={() => {
                  if (location.pathname !== '/home') {
                    navigate('/home');
                  }
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                }} href="#" className="text-sm text-white/70 hover:text-cyan-300 hover:translate-x-0.5 inline-block transition cursor-pointer">Trang chủ</a></li>
                <li><Link to="/available-tours" onClick={() => setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)} className="text-sm text-white/70 hover:text-cyan-300 hover:translate-x-0.5 inline-block transition">Danh sách tours</Link></li>
                <li><Link to="/ai-tour-creator" className="text-sm text-white/70 hover:text-cyan-300 hover:translate-x-0.5 inline-block transition">Tạo tour với AI</Link></li>
                <li><Link to="/blog/1" className="text-sm text-white/70 hover:text-cyan-300 hover:translate-x-0.5 inline-block transition">Blog Travvy</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-white text-sm mb-2 relative inline-block">
                Hỗ trợ
                <div className="absolute -bottom-0.5 left-0 w-6 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent"></div>
              </h4>
              <ul className="space-y-1">
                <li><Link to="/help" onClick={() => setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)} className="text-sm text-white/70 hover:text-cyan-300 hover:translate-x-0.5 inline-block transition">Trung tâm trợ giúp</Link></li>
                <li><Link to="/shoppingcarts" className="text-sm text-white/70 hover:text-cyan-300 hover:translate-x-0.5 inline-block transition">Giỏ hàng</Link></li>
                <li><Link to="/profile/booking-history" className="text-sm text-white/70 hover:text-cyan-300 hover:translate-x-0.5 inline-block transition">Lịch sử đặt tour</Link></li>
                <li><Link to="/profile/favorites" className="text-sm text-white/70 hover:text-cyan-300 hover:translate-x-0.5 inline-block transition">Yêu thích</Link></li>
              </ul>
            </div>

            {/* Payment */}
            <div>
              <h4 className="font-bold text-white text-sm mb-2 relative inline-block">
                Thanh toán
                <div className="absolute -bottom-0.5 left-0 w-6 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent"></div>
              </h4>
              <div className="space-y-1">
                <a href="/payment/momo" className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-cyan-400/50 transition group" aria-label="MoMo">
                  <Wallet className="w-4 h-4 text-white/70 group-hover:text-cyan-300 transition" />
                  <span className="text-sm font-semibold text-white/80 group-hover:text-white transition">MoMo</span>
                </a>

                <a href="/payment/paypal" className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-cyan-400/50 transition group" aria-label="PayPal">
                  <SiPaypal className="w-4 h-4 text-white/70 group-hover:text-cyan-300 transition" />
                  <span className="text-sm font-semibold text-white/80 group-hover:text-white transition">PayPal</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-sm text-white/60">© 2025 Travvy. Mọi quyền được bảo lưu.</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="/terms" className="text-white/60 hover:text-cyan-300 transition">Điều khoản sử dụng</a>
            <a href="/privacy" className="text-white/60 hover:text-cyan-300 transition">Chính sách bảo mật</a>
            <a href="/cookies" className="text-white/60 hover:text-cyan-300 transition">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}