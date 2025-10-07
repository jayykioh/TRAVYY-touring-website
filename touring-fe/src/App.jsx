// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/context";
import MainLayout from "./layout/MainLayout";
import LandingPage from "./pages/LandingPage";
import MainHome from "./pages/MainHome";
import DestinationPage from "./pages/Blogs";
import RegionTours from "./pages/RegionTours";
import SearchResults from "./pages/SearchResults";
import TourDetailPage from "./pages/TourDetailPage";
import DiscountCodesPage from "./pages/DiscountCodesPage";
import BlogDetailPage from "./pages/BlogDetailPage"; // ✅ THÊM IMPORT NÀY
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileLayout from "./pages/UserProfile";
import ProfileInfo from "./components/ProfileInfo";
import ProfileReviews from "./components/ProfileReviews";
import RolePopup from "./components/RolePopup";
import OAuthCallback from "./pages/OAuthCallback";

import Cart from "./pages/Cart";
import WishlistPage from "./pages/WishlistPage";
import LoadingScreen from "./components/LoadingScreen";
import NotFoundPage from "./pages/NotFound";
import BookingPage from "./pages/BookingPage";
import BookingHistory from "./pages/BookingHistory";

import AvailableToursPage from "./pages/AvailableToursPage";
import AITourCreator from "./pages/AITourCreator";
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
          <Route path="/search-results" element={<SearchResults />} />
          <Route path="/discount-codes" element={<DiscountCodesPage />} />
          <Route path="/tours/:id" element={<TourDetailPage />} />
          <Route path="/region/:slug" element={<RegionTours />} />
          {/* <Route path="/region/:slug/detail" element={<RegionDetailPage />} /> */}
          {/* <Route path="/region/all" element={<RegionPage />} /> */}
         <Route path="/booking" element={<BookingPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} /> {/* ✅ THÊM ROUTE NÀY */}
          <Route path="/shoppingcarts" element={<Cart />} />
          {/* <Route path="/region/:slug" element={<RegionTours />} /> */}
          <Route path="/blog/:id" element={<BlogDetailPage />} /> {/* ✅ THÊM ROUTE NÀY */}
          
            <Route path="/shoppingcarts" element={<Cart/> }/>
            
            {/* ✅ BẢO VỆ 2 ROUTE NÀY */}
          <Route 
            path="/available-tours" 
            element={
              <ProtectedRoute>
                <AvailableToursPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ai-tour-creator" 
            element={
              <ProtectedRoute>
                <AITourCreator />
              </ProtectedRoute>
            } 
          />

          <Route path="/my-bookings" element={<BookingHistory />} />
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
