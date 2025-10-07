// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";   // ⬅️ THÊM DÒNG NÀY
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import ExploreNow from "../components/ExploreNow";
import TourRecommend from "../components/TourRecommend";
import WhyChooseUs from "../components/WhyChooseUs"
import RegionSection from "../components/RegionSection";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <TourRecommend/>
       <RegionSection/>


      <ExploreNow />
      <WhyChooseUs/>
    </>
  );
}

