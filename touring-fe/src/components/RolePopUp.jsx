import { useState } from "react";
import { useAuth } from "../auth/context";
import { useNavigate } from "react-router-dom";

export default function RolePopup() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== null) return null;

  async function chooseRole(role) {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to set role");
      const updatedUser = await res.json();

      setUser(updatedUser); // update context
      navigate("/profile"); // chuyển sang trang profile
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md animate-fadeIn">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Chọn vai trò của bạn
        </h2>

        <div className="space-y-4">
          {["Traveler", "TourGuide", "TravelAgency"].map((r) => (
            <button
              key={r}
              onClick={() => chooseRole(r)}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl border border-gray-200 
                        bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium 
                        shadow hover:shadow-lg hover:scale-[1.02] transition-all 
                        disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : `Tôi là ${r}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
