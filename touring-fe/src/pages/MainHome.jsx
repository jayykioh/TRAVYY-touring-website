import React from "react";
import TourHeroSection from "../components/TourHeroSection";
import TourPromotions from "../components/TourRecommend";
import AboutSection from "../components/AboutSection";
import TravelBlog from "../components/TravelBlog";
import FAQ from "../components/FAQ";
import VietnamDestinations from "../components/VietnamDestinations";
import TrustedPartners from "../components/TrustedPartners";
import QuickBooking from "../components/QuickBooking";
import WhyChooseUs from "../components/WhyChooseUs";
import TourDetailPage from "../pages/TourDetailPage";
import Explore from "../components/ExploreNow";
import RegionSection from "../components/RegionSection";


export default function MainHome() {
  return (
    <>
      {/* Hero section với tour slider */}
      <TourHeroSection />
     
      {/* Quick Booking Bar - sticky booking form */}
      <QuickBooking />
     
      {/* Tour promotions với điều hướng tới trang mã giảm giá */}

      <TourPromotions />
       <RegionSection/>

     <Explore/>


      {/* Why Choose Us */}
      {/* <WhyChooseUs /> */}
     
      {/* FAQ */}
      {/* <FAQ/> */}
     
      {/* Travel Blog & Guides */}
      <TravelBlog />
           
      {/* Vietnam Destinations */}
      {/* <VietnamDestinations /> */}
     
      {/* About Section */}
      <AboutSection />
    </>
  );
}