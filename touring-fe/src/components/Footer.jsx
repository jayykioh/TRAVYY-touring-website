import { Facebook, Instagram, Youtube, Twitter, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Grid Links */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-pink-500 grid place-items-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-800">Travvy</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Nền tảng đặt tour và khám phá du lịch nhanh chóng, hiện đại và tiện
            lợi. Khám phá thế giới theo cách của bạn với Travvy.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-800">Khám phá</h4>
          <ul className="space-y-2 text-gray-600">
            <li><a href="#" className="hover:text-blue-600 transition">Tour nổi bật</a></li>
            <li><a href="#" className="hover:text-blue-600 transition">Điểm đến phổ biến</a></li>
            <li><a href="#" className="hover:text-blue-600 transition">Kinh nghiệm du lịch</a></li>
            <li><a href="#" className="hover:text-blue-600 transition">Blog Travvy</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-800">Hỗ trợ</h4>
          <ul className="space-y-2 text-gray-600">
            <li><a href="#" className="hover:text-blue-600 transition">Trung tâm trợ giúp</a></li>
            <li><a href="#" className="hover:text-blue-600 transition">Chính sách hủy</a></li>
            <li><a href="#" className="hover:text-blue-600 transition">Liên hệ</a></li>
            <li><a href="#" className="hover:text-blue-600 transition">Câu hỏi thường gặp</a></li>
          </ul>
        </div>

        {/* Payment / Social */}
        <div>
          <h4 className="font-semibold mb-3 text-gray-800">Kết nối với Travvy</h4>
          <div className="flex gap-4 mb-4">
            <a href="#" className="hover:text-blue-600"><Facebook size={20} /></a>
            <a href="#" className="hover:text-blue-600"><Instagram size={20} /></a>
            <a href="#" className="hover:text-blue-600"><Youtube size={20} /></a>
            <a href="#" className="hover:text-blue-600"><Twitter size={20} /></a>
          </div>
          <h4 className="font-semibold mb-3 text-gray-800">Thanh toán</h4>
          <div className="flex flex-wrap gap-2">
            <img src="/visa.png" alt="Visa" className="h-6" />
            <img src="/mastercard.png" alt="MasterCard" className="h-6" />
            <img src="/paypal.png" alt="PayPal" className="h-6" />
            <img src="/gpay.png" alt="Google Pay" className="h-6" />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 py-4 px-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
        <p>© 2025 Travvy. Khám phá thế giới của bạn.</p>
        <div className="flex gap-4 mt-3 md:mt-0">
          <a href="#" className="hover:text-blue-600">Điều khoản</a>
          <a href="#" className="hover:text-blue-600">Chính sách bảo mật</a>
        </div>
      </div>
    </footer>
  );
}
