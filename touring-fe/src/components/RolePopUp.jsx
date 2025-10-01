import { useState } from "react";
import { useAuth } from "../auth/context";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function RolePopup() {
  const { user, setUser, withAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== null) return null;

  async function chooseRole(role) {
    if (loading) return;
    try {
      setLoading(true);
      const res = await withAuth("/api/auth/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }), 
      });
      setUser(res.user);
      toast.success("Role set successfully");
      navigate("/profile", { replace: true });
    } catch (err) {
      const msg = err?.body?.error || err?.body?.message || err.message || "Set role failed";
      toast.error(msg);
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
