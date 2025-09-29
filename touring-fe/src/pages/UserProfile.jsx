import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../auth/context";
export default function ProfileLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <aside className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-4">
                <img
                  alt="avatar"
                  src={user?.avatar || "https://i.pravatar.cc/100"}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-800">
                    {user?.name || "Người dùng"}
                  </div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
              </div>
            </div>

            <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y">
              {[
                ["Thông tin khách hàng", "info"],
                ["Giỏ hàng / Đơn đã mua", "orders"],
                ["Mã giảm giá", "vouchers"],
                ["Lịch sử chuyến đi", "trips"],
                ["Đánh giá", "reviews"],
                ["Phương thức thanh toán", "payments"],
                ["Thông tin khách", "guests"],
                ["Yêu thích", "favorites"],
                ["Bảo mật đăng nhập", "security"],
              ].map(([label, path]) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 text-sm 
                     ${isActive ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}`
                  }
                  end
                >
                  <span>{label}</span>
                  <span className="text-gray-400">›</span>
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* NỘI DUNG TỪ ROUTE CON */}
          <section className="space-y-4">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  );
}
