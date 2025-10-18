// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/context";
import MainLayout from "./layout/MainLayout";
import LandingPage from "./pages/LandingPage";
import MainHome from "./pages/MainHome";
import DestinationPage from "./pages/Blogs";
import RegionTours from "./pages/RegionTours";
import SearchFilterResults from "./pages/SearchFilterResults";
import TourDetailPage from "./pages/TourDetailPage";
import DiscountCodesPage from "./pages/DiscountCodesPage";
import BlogDetailPage from "./pages/BlogDetailPage"; // ✅ THÊM IMPORT NÀY
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileLayout from "./pages/UserProfile";
import ProfileInfo from "./components/ProfileInfo";
import ProfileReviews from "./components/ProfileReviews";
import RolePopup from "./components/RolePopUp";
import OAuthCallback from "./pages/OAuthCallback";

import Cart from "./pages/Cart";
import WishlistPage from "./pages/WishlistPage";
import LoadingScreen from "./components/LoadingScreen";
import NotFoundPage from "./pages/NotFound";
import BookingPage from "./pages/BookingPage";
import BookingHistory from "./pages/BookingHistory";
import AvailableToursPage from "./pages/AvailableToursPage";
import AITourCreator from "./pages/AITourCreator";
import PaymentCallback from "./pages/PaymentCallback";

// ✅ THÊM: Import Admin components
import AdminLayout from "./admin/components/Common/layout/AdminLayout";
import Dashboard from "./admin/components/Dashboard/Dashboard";
import TourManagement from "./admin/pages/TourManagement";
import GuideManagement from "./admin/pages/GuideManagement";
import AgencyAPIData from "./admin/pages/AgencyAPIData";
import Settings from "./admin/pages/Settings";
import AdminLogin from "./admin/pages/AdminLogin";
import { AdminAuthProvider } from "./admin/context/AdminAuthContext";

// Placeholder components cho admin
const CustomerRequests = () => (
  <div className="p-6">Customer Requests Page - Coming soon</div>
);
const Certification = () => (
  <div className="p-6">Certification Page - Coming soon</div>
);
const Reports = () => <div className="p-6">Reports Page - Coming soon</div>;

// Route guard
function ProtectedRoute({ children }) {
  const { isAuth, booting } = useAuth();
  if (booting) return <p className="p-6">Loading...</p>;
  if (!isAuth) return <Navigate to="/login" replace />;
  return children;
}

// Route guard cho admin
function AdminProtectedRoute({ children }) {
  const { isAuth, isAdmin, booting } = useAuth();

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuth) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/home" replace />;

  return children;
}

export default function App() {
  const { booting, isAuth, isAdmin, user } = useAuth();
  console.log("Auth state:", { isAuth, user });
  if (booting) return <LoadingScreen />;

  return (
    <>
      <Routes>
        {/* ✅ Admin routes - sử dụng auth context chung */}
        <Route
          path="/admin/login"
          element={
            <AdminAuthProvider>
              <AdminLogin />
            </AdminAuthProvider>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="dashboard">
                <Dashboard />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/tours"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="tours">
                <TourManagement />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/guides"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="guides">
                <GuideManagement />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/guides/compatibility"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="guides">
                <div className="p-6">Check Compatibility - Coming soon</div>
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/customers"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="customers">
                <CustomerRequests />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/certification"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="certification">
                <Certification />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/api"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="api">
                <AgencyAPIData />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="reports">
                <Reports />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <AdminProtectedRoute>
              <AdminLayout activePage="settings">
                <Settings />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        {/* Admin default redirect */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

        {/* ----- Public + Main layout ----- */}
        <Route element={<MainLayout />}>
          {/* Nếu muốn / tự động là Home khi chưa login, MainHome khi đã login */}
          <Route path="/" element={isAuth ? <MainHome /> : <LandingPage />} />
          <Route path="/home" element={<MainHome />} />
          <Route path="/destinations/:slug" element={<DestinationPage />} />
          {/* <Route path="/search-results" element={<SearchResults />} /> */}
          <Route
            path="/search-filter-results"
            element={<SearchFilterResults />}
          />
          <Route path="/discount-codes" element={<DiscountCodesPage />} />
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
            path="/ai-tour-creator"
            element={
              <ProtectedRoute>
                <AITourCreator />
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
            {/* /profile -> /profile/info */}
            <Route index element={<Navigate to="info" replace />} />
            <Route path="info" element={<ProfileInfo />} />
            <Route path="reviews" element={<ProfileReviews />} />
            <Route path="favorites" element={<WishlistPage />} />
            <Route path="booking-history" element={<BookingHistory />} />
          </Route>
        </Route>

        {/* ----- Auth routes (public) ----- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* ----- Payment callback ----- */}
        <Route
          path="/payment/callback"
          element={
            <ProtectedRoute>
              <PaymentCallback />
            </ProtectedRoute>
          }
        />

        {/* ----- 404 ----- */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Popup chọn role sau khi login (chỉ cho user, không cho admin) */}
      {isAuth && !isAdmin && (!user?.role || user.role === "uninitialized") && (
        <RolePopup />
      )}
    </>
  );
}
