// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/context";

import MainLayout from "./layout/MainLayout";
import LandingPage from "./pages/LandingPage";
import MainHome from "./pages/MainHome";
import DestinationPage from "./pages/Blogs";
import RegionTours from "./components/RegionTours";
<<<<<<< HEAD
// import SearchResults from "./pages/SearchResults";
=======
import SearchResults from "./pages/SearchFilterResults";
>>>>>>> ad409ae (Cập nhật nhỏlanding, up blog đã được chinh sua, doi lai searchfilter dong thoi doi ten cua file do)
import TourDetailPage from "./pages/TourDetailPage";
import DiscountCodesPage from "./pages/DiscountCodesPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileLayout from "./pages/UserProfile";
import ProfileInfo from "./components/ProfileInfo";
import ProfileReviews from "./components/ProfileReviews";
import RolePopup from "./components/RolePopup";
import OAuthCallback from "./pages/OAuthCallback";
import Cart from "./pages/Cart";
import WishlistPage from "./pages/WishlistPage";
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
        {/* ----- Public + Main layout ----- */}
        <Route element={<MainLayout />}>
          {/* Nếu muốn / tự động là Home khi chưa login, MainHome khi đã login */}
          <Route path="/" element={isAuth ? <MainHome /> : <LandingPage />} />
          <Route path="/home" element={<MainHome />} />
          <Route path="/destinations/:slug" element={<DestinationPage />} />
          {/* <Route path="/search" element={<SearchResults />} /> */}
          <Route path="/discount-codes" element={<DiscountCodesPage />} />
          <Route path="/tours/:id" element={<TourDetailPage />} />
          <Route path="/region/:slug" element={<RegionTours />} />
            <Route path="/shoppingcarts" element={<Cart/> }/>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileLayout />
              </ProtectedRoute>
            }
          >
            {/* /profile -> /profile/info */}
            <Route index element={<Navigate to="info" replace />} />
            <Route path="info" element={<ProfileInfo />} />
            <Route path="reviews" element={<ProfileReviews />} />
            <Route path="favorites" element={<WishlistPage />} />
          </Route>
        </Route>

        {/* ----- Auth routes (public) ----- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* ----- 404 ----- */}
        <Route path="*" element={<div className="p-6">404</div>} />
      </Routes>

      {/* Popup chọn role sau khi login */}
      {isAuth && (!user?.role || user.role === "uninitialized") && (
        <RolePopup />
      )}
    </>
  );
}