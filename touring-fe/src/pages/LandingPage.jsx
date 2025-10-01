// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";   // ⬅️ THÊM DÒNG NÀY
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import PromoSection from "../components/PromoSection";
import MainLayout from "../layout/MainLayout";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <PromoSection />
    </>
  );
}

