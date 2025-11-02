// App.jsx
import { Fragment } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/context";
import MainLayout from "./layout/MainLayout";
import LandingPage from "./pages/LandingPage";
import MainHome from "./pages/MainHome";
import DestinationPage from "./pages/Blogs";
import RegionTours from "./pages/RegionTours";
import SearchFilterResults from "./pages/SearchFilterResults";
import TourDetailPage from "./pages/TourDetailPage";
import BlogDetailPage from "./pages/BlogDetailPage"; // ✅ THÊM IMPORT NÀY
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import ProfileLayout from "./pages/UserProfile";
import ProfileInfo from "./components/ProfileInfo";
import ProfileReviews from "./components/ProfileReviews";
import ProfilePromotions from "./components/ProfilePromotions";
import ProfileSecurity from "./pages/ProfileSecurity";
import Confirm2FA from "./pages/Confirm2FA";
import ConfirmEmailVerification from "./pages/ConfirmEmailVerification";
import RolePopup from "./components/RolePopUp";
import OAuthCallback from "./pages/OAuthCallback";
import HelpCenter from "./components/HelpCenter";
import HelpCategoryView from "./components/HelpCategoryView";
import HelpArticleView from "./components/HelpArticleView";
import Cart from "./pages/Cart";
import WishlistPage from "./pages/WishlistPage";
import LoadingScreen from "./components/LoadingScreen";
import NotFoundPage from "./pages/NotFound";
import BookingPage from "./pages/BookingPage";
import BookingHistory from "./pages/BookingHistory";
import AvailableToursPage from "./pages/AvailableToursPage";
import AITourCreator from "./pages/AITourCreator";
import PaymentCallback from "./pages/PaymentCallback";
import PreferencesPage from "./pages/ViDoi";
import DiscoverResults from "./pages/DiscoverResults";
import ZoneDetail from "./pages/ZoneDetail";
import ItineraryView  from "./pages/ItineraryView";
import ItineraryResult from "./pages/ItineraryResult"; // ✅ ADD THIS IMPORT
// import ItineraryView from "./pages/ItineraryView";

// ✅ THÊM: Import Admin components
// import { AdminAuthProvider } from "./admin/context/AdminAuthContext";
import AdminRoutes from "./admin/routes/AdminRoutes";

// Import Guide Routes
import GuideRoutes from "./guide/routes/guideRoutes";

// Route guard
function ProtectedRoute({ children }) {
  const { isAuth, booting } = useAuth();
  if (booting) return <p className="p-6">Loading...</p>;
  if (!isAuth) return <Navigate to="/login" replace />;
  return children;
}

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function App() {
  const { booting, isAuth, user, bannedInfo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
           useEffect(() => {
    if (isAuth && user?.role === "TourGuide" && !location.pathname.startsWith("/guide")) {
      navigate("/guide", { replace: true });
    }
  }, [isAuth, user?.role, location.pathname, navigate]);
  console.log("Auth state:", { isAuth, user, bannedInfo });
  if (booting) return <LoadingScreen />;

  return (
    <Fragment>
      <Routes>
        {/* ✅ CẬP NHẬT 2: Admin routes - AdminAuthProvider đã wrap BÊN TRONG AdminRoutes */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* ----- Public + Main layout ----- */}
        <Route element={<MainLayout />}>
          {/* Nếu muốn / tự động là Home khi chưa login, MainHome khi đã login hoặc banned */}
          <Route
            path="/"
            element={isAuth || bannedInfo ? <MainHome /> : <LandingPage />}
          />
          <Route path="/home" element={<MainHome />} />
          <Route path="/destinations/:slug" element={<DestinationPage />} />
          {/* <Route path="/search-results" element={<SearchResults />} /> */}
          <Route
            path="/search-filter-results"
            element={<SearchFilterResults />}
          />
          <Route path="/tours/:id" element={<TourDetailPage />} />
          <Route path="/region/:slug" element={<RegionTours />} />
          {/* <Route path="/region/:slug/detail" element={<RegionDetailPage />} /> */}
          {/* <Route path="/region/all" element={<RegionPage />} /> */}
          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route path="/blog/:id" element={<BlogDetailPage />} />{" "}
          {/* ✅ THÊM ROUTE NÀY */}
          <Route path="/shoppingcarts" element={<Cart />} />
          {/* Help Center routes */}
          <Route path="/help" element={<HelpCenter />} />
          <Route
            path="/help/category/:category"
            element={<HelpCategoryView />}
          />
          <Route path="/help/article/:slug" element={<HelpArticleView />} />
          {/* <Route path="/region/:slug" element={<RegionTours />} /> */}
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
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileLayout />
              </ProtectedRoute>
            }
          >
            {/* <Route path="/itinerary" element={<ItineraryView />} /> */}

            {/* /profile -> /profile/info */}
            <Route index element={<Navigate to="info" replace />} />
            <Route path="info" element={<ProfileInfo />} />
            <Route path="reviews" element={<ProfileReviews />} />
            <Route path="vouchers" element={<ProfilePromotions />} />
            <Route path="favorites" element={<WishlistPage />} />
            <Route path="booking-history" element={<BookingHistory />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="security" element={<ProfileSecurity />} />
          </Route>
        </Route>
        <Route
          path="/ai-tour-creator"
          element={
            <ProtectedRoute>
              <AITourCreator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/intinerary-creator"
          element={
            <ProtectedRoute>
              <PreferencesPage />
            </ProtectedRoute>
          }
        />
        <Route path="/itinerary" element={
          <ProtectedRoute>  
          <ItineraryView />
          </ProtectedRoute>} />
        <Route
          path="/discover/results"
          element={
            <ProtectedRoute>
              <DiscoverResults />
            </ProtectedRoute>
          }
        />
        
<Route
  path="/zone/:zoneId"
  element={
      <ZoneDetail />
  }
/>
        {/* ✅ ADD: Itinerary routes */}
        <Route
          path="/itinerary"
          element={
            <ProtectedRoute>
              <ItineraryView />
            </ProtectedRoute>
          }
        />
        
        {/* ✅ ADD: Result page route */}
        <Route
          path="/itinerary/result/:id"
          element={
            <ProtectedRoute>
              <ItineraryResult />
            </ProtectedRoute>
          }
        />

        {/* ----- Auth routes (public) ----- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* ----- Security confirmation routes (public with token) ----- */}
        <Route path="/confirm-2fa" element={<Confirm2FA />} />
        <Route
          path="/confirm-email-verification"
          element={<ConfirmEmailVerification />}
        />

        {/* ----- Payment callback ----- */}
        <Route
          path="/payment/callback"
          element={
            <ProtectedRoute>
              <PaymentCallback />
            </ProtectedRoute>
          }
        />

        {/* ----- Tour Guide Routes (Protected) ----- */}
        <Route
          path="/guide/*"
          element={
            <ProtectedRoute>
              <GuideRoutes />
            </ProtectedRoute>
          }
        />

        {/* ----- 404 ----- */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Popup chọn role sau khi login */}
      {isAuth && (!user?.role || user.role === "uninitialized") && (
        <RolePopup />
      )}
    </Fragment>
  );
}
