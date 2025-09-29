import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/context";

import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import MainHome from "./pages/MainHome";
import DestinationPage from "./pages/Blogs";
import DiscountCodesPage from "./pages/DiscountCodesPage"; // Import trang mã giảm giá
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileLayout from "./pages/UserProfile"; // Layout có <Outlet />
import ProfileInfo from "./components/ProfileInfo";
import ProfileOrders from "./components/ProfileOrders";
import ProfileReviews from "./components/ProfileReviews";
import RolePopup from "./components/RolePopup";
import OAuthCallback from "./pages/OAuthCallback";

// Route guard
function ProtectedRoute({ children }) {
  const { isAuth, booting } = useAuth();
  if (booting) return <p className="p-6">Loading...</p>;
  if (!isAuth) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { booting, isAuth, user } = useAuth();
  console.log("Auth state:", { isAuth, user });

  if (booting) return <p className="p-6">Loading app...</p>;

  return (
    <>
      <Routes>
        {/* Routes có MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/destinations/:slug" element={<DestinationPage />} />
          <Route path="/home" element={<MainHome />} />
          <Route path="/discount-codes" element={<DiscountCodesPage />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileLayout />
              </ProtectedRoute>
            }
          >
            {/* 👇 Nếu chỉ vào /profile thì redirect sang /profile/info */}
            <Route index element={<Navigate to="info" replace />} />
            <Route path="info" element={<ProfileInfo />} />
            <Route path="orders" element={<ProfileOrders />} />
            <Route path="reviews" element={<ProfileReviews />} />
          </Route>
        </Route>

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Profile routes (protected) */}
        <Route path="/oauth/callback" element={<OAuthCallback/>}></Route>
        {/* 404 fallback */}
        <Route path="*" element={<div className="p-6">404</div>} />
      </Routes>

      {/* Popup chọn role */}
      {isAuth && (!user.role || user.role === "uninitialized") && <RolePopup />}
    </>
  );
}
