import { Facebook, Youtube, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-[url('https://exmouthresort.net.au/wp-content/uploads/119079-56.jpg')] bg-cover bg-center">
      {/* Overlay đen mờ */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Nội dung footer */}
      <div className="relative">
        {/* Grid Links */}
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          {/* Brand */}
          <div>
            <div className="flex items-start gap-3 mb-3">
              <img
                src="/logo.png"
                alt="Travvy Logo"
                className="w-20 h-20 object-contain drop-shadow-[0_10px_2px_rgba(0,0,0,0.6)]"
              />
              {/* <span className="text-lg font-bold text-white">Travvy</span> */}
            </div>
            <p className="text-gray-200 leading-relaxed">
              Nền tảng đặt tour và khám phá du lịch nhanh chóng, hiện đại và
              tiện lợi. Khám phá thế giới theo cách của bạn với Travvy.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold mb-3 text-white">Khám phá</h4>
            <ul className="space-y-2 text-gray-200">
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Tour nổi bật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Điểm đến phổ biến
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Kinh nghiệm du lịch
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Blog Travvy
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-3 text-white">Hỗ trợ</h4>
            <ul className="space-y-2 text-gray-200">
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Chính sách hủy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition">
                  Câu hỏi thường gặp
                </a>
              </li>
            </ul>
          </div>

          {/* Payment / Social */}
          <div>
            <h4 className="font-semibold mb-3 text-white">
              Kết nối với Travvy
            </h4>
            <div className="flex gap-4 mb-4 text-white">
              <a href="#" className="hover:text-blue-400">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-blue-400">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-blue-400">
                <Youtube size={20} />
              </a>
              <a href="#" className="hover:text-blue-400">
                <Twitter size={20} />
              </a>
            </div>
            <h4 className="font-semibold mb-3 text-white">Thanh toán</h4>
            <div className="flex flex-wrap gap-2">
              <img src="/visa.png" alt="Visa" className="h-6" />
              <img src="/mastercard.png" alt="MasterCard" className="h-6" />
              <img src="/paypal.png" alt="PayPal" className="h-6" />
              <img src="/gpay.png" alt="Google Pay" className="h-6" />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-600 py-4 px-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-300">
          <p>© 2025 Travvy. Khám phá thế giới của bạn.</p>
          <div className="flex gap-4 mt-3 md:mt-0">
            <a href="#" className="hover:text-blue-400">
              Điều khoản
            </a>
            <a href="#" className="hover:text-blue-400">
              Chính sách bảo mật
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
