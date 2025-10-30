import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../auth/context";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  
  const getAvatar = (user) => {
    if (!user) return "https://i.pravatar.cc/40";

    // Nếu user đã có avatar trong MongoDB
    if (user.avatar) {
      // ✅ Thêm timestamp để force reload khi avatar thay đổi
      const timestamp = user.updatedAt || Date.now();
      return `/api/profile/avatar/${user._id}?v=${timestamp}`;
    }

    // Nếu chưa có => sinh avatar Discord-style (chữ cái đầu + màu ngẫu nhiên)
    const initial = (user.name || user.email || "?").charAt(0).toUpperCase();
    const colors = ["5865F2", "43B581", "FAA61A", "F04747", "7289DA"];
    const color = colors[initial.charCodeAt(0) % colors.length];
    return `https://ui-avatars.com/api/?name=${initial}&background=${color}&color=fff&bold=true`;
  };

  const avatarUrl = getAvatar(user);

  return (
    <div className="relative">
      {/* Avatar + tên */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2"
      >
        <img
          src={avatarUrl}
          alt={user.name || "avatar"}
          className="w-8 h-8 rounded-full object-cover border border-gray-200"
        />
        <span className="text-sm font-medium text-gray-800">
          {user.name || user.email}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-md py-1 z-50">
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>

          <Link
            to="/profile/reviews"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Review   
          </Link>
          <Link
            to="/profile/favorites"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Wishlist
          </Link>
          <Link
            to="/shoppingcarts"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            My Cart
          </Link>
        
          <button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
