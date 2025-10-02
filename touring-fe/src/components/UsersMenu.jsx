import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../auth/context";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null; // Nếu chưa login thì ko render

  return (
    <div className="relative">
      {/* Avatar + tên */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2"
      >
        <img
          src={user.avatar || "https://i.pravatar.cc/40"}
          alt={user.name || "avatar"}
          className="w-8 h-8 rounded-full"
        />
        <span className="text-sm font-medium text-gray-800">
          {user.name || user.email}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md py-1">
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Profile
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
          <Link
            to="/settings"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
           <Link
            to="/help"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Help
          </Link>
          <button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
