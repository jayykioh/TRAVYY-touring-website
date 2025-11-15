import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../auth/context";
import { useEffect } from "react";

export default function ProfileLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname]);

  //  Nếu có avatar trong MongoDB => load qua API
  // Nếu chưa có => hiển thị avatar Discord-style (chữ cái đầu + màu ngẫu nhiên)
  const getAvatarUrl = (user) => {
    if (!user) return "https://i.pravatar.cc/100";
    if (user.avatar) {
      // ✅ Thêm timestamp để force reload khi avatar thay đổi
      const timestamp = user.updatedAt || Date.now();
      return `/api/profile/avatar/${user._id}?v=${timestamp}`;
    }

    const initial = (user.name || user.email || "?").charAt(0).toUpperCase();
    const colors = ["5865F2", "43B581", "FAA61A", "F04747", "7289DA"];
    const color = colors[initial.charCodeAt(0) % colors.length];
    return `https://ui-avatars.com/api/?name=${initial}&background=${color}&color=fff&bold=true`;
  };

  const avatarUrl = getAvatarUrl(user);

  // Kiểm tra xem user có đăng nhập bằng OAuth không
  // User OAuth sẽ có googleId hoặc facebookId và KHÔNG có password
  const isOAuthUser = user?.googleId || user?.facebookId;
  const hasPassword = !isOAuthUser; // Nếu không phải OAuth thì có password

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Sidebar trái */}
          <aside className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-4">
                <img
                  alt="avatar"
                  src={avatarUrl}
                  className="w-14 h-14 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <div className="font-semibold text-gray-800">
                    {user?.name || "Người dùng"}
                  </div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
              </div>
            </div>

            {/* Menu điều hướng */}
            <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y">
              {[
                ["Thông tin khách hàng", "info", true],
                ["Yêu thích", "favorites", true],
                ["Lịch sử chuyến đi", "booking-history", true],
                ["Yêu cầu tour tùy chỉnh", "my-tour-requests", true],
                ["Hoàn tiền", "refunds", true],
                ["Mã giảm giá", "vouchers", true],
                ["Đánh giá", "reviews", true],
                ["Bảo mật", "security", true], // ✅ Thêm menu Bảo mật
                ["Đổi mật khẩu", "change-password", hasPassword], // Chỉ hiển thị nếu có password
              ]
                .filter(([, , show]) => show) // Lọc ra các menu item được phép hiển thị
                .map(([label, path]) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 text-sm 
                       ${
                         isActive
                           ? "bg-blue-50 text-blue-700 font-medium"
                           : "hover:bg-gray-50 text-gray-700"
                       }`
                    }
                    end
                  >
                    <span>{label}</span>
                    <span className="text-gray-400">›</span>
                  </NavLink>
                ))}
            </nav>
          </aside>

          {/* Nội dung bên phải */}
          <section className="space-y-4">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  );
}
