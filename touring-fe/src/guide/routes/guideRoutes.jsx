// src/routes/GuideRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import HomePage from "../pages/HomePage";
import RequestsPage from "../pages/RequestsPage";
import MyToursPage from "../pages/MyToursPage";
import GuideTourDetailPage from "../pages/GuideTourDetailPage";
import NotificationsPage from "../pages/NotificationsPage";
import EarningsPage from "../pages/EarningsPage";
import GuideProfilePage from "../pages/GuideProfilePage";

// 👇 import Provider dùng chung cho modal xác nhận
import { ConfirmProvider } from "../components/common/ConfirmProvider";

const GuideRoutes = () => {
  return (
    // Bọc provider bên ngoài Routes để mọi page con dùng được useConfirm()
    <ConfirmProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/requests/:id" element={<GuideTourDetailPage />} />
          <Route path="/tours" element={<MyToursPage />} />
          <Route path="/tours/:id" element={<GuideTourDetailPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/earnings" element={<EarningsPage />} />
          <Route path="/profile" element={<GuideProfilePage />} />
        </Route>
      </Routes>
    </ConfirmProvider>
  );
};

export default GuideRoutes;
