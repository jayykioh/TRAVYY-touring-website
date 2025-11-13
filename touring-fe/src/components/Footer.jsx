import { Facebook, Instagram, Youtube, Twitter, MapPin, Wallet, Mail, Phone } from "lucide-react";
import { SiPaypal } from "react-icons/si";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand Section - Takes more space */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <MapPin className="w-11 h-11 text-cyan-400 stroke-[2.5] drop-shadow-lg" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Travvy
              </span>
            </div>
            <p className="text-white/60 leading-relaxed mb-6 max-w-md">
              Nền tảng đặt tour và khám phá du lịch hiện đại. Khám phá thế giới theo cách của bạn với Travvy - Đơn giản, Nhanh chóng, Đáng tin cậy.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <a href="mailto:contact@travvy.com" className="flex items-center gap-3 text-white/60 hover:text-cyan-400 transition group">
                <div className="w-9 h-9 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-sm">contact@travvy.com</span>
              </a>
              <a href="tel:+84123456789" className="flex items-center gap-3 text-white/60 hover:text-cyan-400 transition group">
                <div className="w-9 h-9 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-sm">+84 123 456 789</span>
              </a>
            </div>

            {/* Social Links */}
            <div className="flex gap-2">
              <a href="https://www.facebook.com" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition group" aria-label="Facebook">
                <Facebook size={18} className="text-white/60 group-hover:text-cyan-400 transition"/>
              </a>
              <a href="https://www.instagram.com" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition group" aria-label="Instagram">
                <Instagram size={18} className="text-white/60 group-hover:text-cyan-400 transition"/>
              </a>
              <a href="https://www.youtube.com" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition group" aria-label="YouTube">
                <Youtube size={18} className="text-white/60 group-hover:text-cyan-400 transition"/>
              </a>
              <a href="https://www.twitter.com" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition group" aria-label="Twitter">
                <Twitter size={18} className="text-white/60 group-hover:text-cyan-400 transition"/>
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Explore */}
            <div>
              <h4 className="font-bold text-white text-base mb-4 relative inline-block">
                Khám phá
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent"></div>
              </h4>
              <ul className="space-y-3">
                <li><Link to="/#landing" className="text-sm text-white/60 hover:text-cyan-400 hover:translate-x-1 inline-block transition">Tour nổi bật</Link></li>
                <li><Link to="/#highlights" className="text-sm text-white/60 hover:text-cyan-400 hover:translate-x-1 inline-block transition">Điểm đến phổ biến</Link></li>
                <li><Link to="/guides" className="text-sm text-white/60 hover:text-cyan-400 hover:translate-x-1 inline-block transition">Kinh nghiệm du lịch</Link></li>
                <li><Link to="/#blog" className="text-sm text-white/60 hover:text-cyan-400 hover:translate-x-1 inline-block transition">Blog Travvy</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-white text-base mb-4 relative inline-block">
                Hỗ trợ
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent"></div>
              </h4>
              <ul className="space-y-3">
                <li><a href="/help" className="text-sm text-white/60 hover:text-cyan-400 hover:translate-x-1 inline-block transition">Trung tâm trợ giúp</a></li>
                <li><a href="/cancellation-policy" className="text-sm text-white/60 hover:text-cyan-400 hover:translate-x-1 inline-block transition">Chính sách hủy</a></li>
                <li><a href="/contact" className="text-sm text-white/60 hover:text-cyan-400 hover:translate-x-1 inline-block transition">Liên hệ</a></li>
                <li><a href="/faq" className="text-sm text-white/60 hover:text-cyan-400 hover:translate-x-1 inline-block transition">Câu hỏi thường gặp</a></li>
              </ul>
            </div>

            {/* Payment */}
            <div>
              <h4 className="font-bold text-white text-base mb-4 relative inline-block">
                Thanh toán
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent"></div>
              </h4>
              <div className="space-y-2">
                <a href="/payment/momo" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 transition group" aria-label="MoMo">
                  <Wallet className="w-4 h-4 text-white/60 group-hover:text-cyan-400 transition" />
                  <span className="text-sm font-semibold text-white/80 group-hover:text-white transition">MoMo</span>
                </a>

                <a href="/payment/paypal" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 transition group" aria-label="PayPal">
                  <SiPaypal className="w-4 h-4 text-white/60 group-hover:text-cyan-400 transition" />
                  <span className="text-sm font-semibold text-white/80 group-hover:text-white transition">PayPal</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">© 2025 Travvy. Mọi quyền được bảo lưu.</p>
          <div className="flex flex-wrap gap-6 text-sm">
            <a href="/terms" className="text-white/50 hover:text-cyan-400 transition">Điều khoản sử dụng</a>
            <a href="/privacy" className="text-white/50 hover:text-cyan-400 transition">Chính sách bảo mật</a>
            <a href="/cookies" className="text-white/50 hover:text-cyan-400 transition">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}