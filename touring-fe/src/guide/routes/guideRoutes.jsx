import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import HomePage from "../pages/HomePage";
import RequestsPage from "../pages/RequestsPage";
import MyToursPage from "../pages/MyToursPage";
import GuideTourDetailPage from "../pages/GuideTourDetailPage";
import NotificationsPage from "../pages/NotificationsPage";
import EarningsPage from "../pages/EarningsPage";
import ProfilePage from "../pages/ProfilePage";

const GuideRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/requests/:id" element={<GuideTourDetailPage />} />
        <Route path="/tours" element={<MyToursPage />} />
        <Route path="/tours/:id" element={<GuideTourDetailPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/earnings" element={<EarningsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
};

export default GuideRoutes;
