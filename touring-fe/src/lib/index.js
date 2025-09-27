// src/lib/index.js
export { heroSlides } from './heroData';
export { 
  promotionalBanners, 
  featuredTours, 
  creativeExperiences 
} from './toursData';

// Có thể thêm các utility functions nếu cần
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
};

export const calculateDiscount = (originalPrice, currentPrice) => {
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

export const formatReviews = (reviews) => {
  if (reviews >= 1000) {
    return Math.floor(reviews / 1000) + 'k';
  }
  return reviews.toLocaleString();
};