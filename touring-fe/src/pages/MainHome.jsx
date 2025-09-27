// src/pages/MainHome.jsx
import React from "react";
import TourHeroSection from "../components/TourHeroSection";
import TourPromotions from "../components/TourPromotions";
import AboutSection from "../components/AboutSection";
// import PopularDestinations from "../components/PopularDestinations";
// import TourCategories from "../components/TourCategories";
// import CustomerReviews from "../components/CustomerReviews";
import TravelBlog from "../components/TravelBlog";
// import NewsletterSubscription from "../components/NewsletterSubscription";
import TrustedPartners from "../components/TrustedPartners";
import QuickBooking from "../components/QuickBooking";
import WhyChooseUs from "../components/WhyChooseUs";

export default function MainHome() {
  return (
    <>
      {/* Hero section với tour slider */}
      <TourHeroSection />
      
      {/* Quick Booking Bar - sticky booking form */}
      <QuickBooking />
      
      {/* Tour promotions và featured activities */}
      <TourPromotions />
      
      {/* Popular Destinations */}
      {/* <PopularDestinations /> */}
      
      {/* Tour Categories */}
      {/* <TourCategories /> */}
      
      {/* Why Choose Us */}
      <WhyChooseUs />
      
      {/* Customer Reviews & Testimonials */}
      {/* <CustomerReviews /> */}
      
      {/* Travel Blog & Guides */}
      <TravelBlog />
      
      {/* Trusted Partners */}
      <TrustedPartners />
      
      {/* Tái sử dụng AboutSection từ trang Home ban đầu */}
      <AboutSection />
      
      {/* Newsletter Subscription */}
      {/* <NewsletterSubscription /> */}
    </>
  );
}