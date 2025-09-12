import React from 'react'
import HeroSection from '../sections/HeroSection'
import AboutSection from '../sections/AboutSection'
import PromoSection from '../sections/PromoSection'
import MainLayout from '../layout/MainLayout'
const Home = () => {
  return (
    <div>
      <MainLayout />
      <HeroSection />
      <AboutSection />
      <PromoSection />
    </div>
  )
}

export default Home
