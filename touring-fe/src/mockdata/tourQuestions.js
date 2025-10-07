// src/mockdata/tourQuestions.js

/**
 * Mock Data cho câu hỏi tạo tour
 * Định dạng: Array of Question Objects
 * 
 * Mỗi question object bao gồm:
 * - id: unique identifier
 * - question: Câu hỏi hiển thị cho user
 * - key: Property name trong tourData object
 * - type: Loại input (text, number, select, etc.)
 */

export const TOUR_QUESTIONS = [
  {
    id: 'destination',
    question: 'Chào bạn! 👋 Mình là trợ lý AI của Travyy. Hãy cho mình biết bạn muốn đi đâu nhé? (Ví dụ: Đà Nẵng, Phú Quốc, Sapa...)',
    key: 'destination',
    type: 'text'
  },
  {
    id: 'duration',
    question: 'Tuyệt vời! Bạn dự định đi trong bao lâu? (Ví dụ: 3 ngày 2 đêm, 5 ngày 4 đêm...)',
    key: 'duration',
    type: 'text'
  },
  {
    id: 'budget',
    question: 'Ngân sách dự kiến của bạn là bao nhiêu? (Ví dụ: 5-7 triệu, 10-15 triệu...)',
    key: 'budget',
    type: 'text'
  },
  {
    id: 'people',
    question: 'Bạn đi với bao nhiêu người? (Ví dụ: 2 người, gia đình 4 người...)',
    key: 'numberOfPeople',
    type: 'text'
  },
  {
    id: 'tourType',
    question: 'Bạn thích loại tour nào? (Nghỉ dưỡng, khám phá văn hóa, mạo hiểm, ẩm thực...)',
    key: 'tourType',
    type: 'text'
  },
  {
    id: 'interests',
    question: 'Bạn có sở thích đặc biệt nào không? (Chụp ảnh, leo núi, lặn biển, tham quan di tích...)',
    key: 'interests',
    type: 'text'
  },
  {
    id: 'food',
    question: 'Có món ăn hoặc ẩm thực nào bạn muốn thử không? (Hải sản, món địa phương, chay...)',
    key: 'foodPreferences',
    type: 'text'
  },
  {
    id: 'activities',
    question: 'Những hoạt động nào bạn muốn trải nghiệm? (Tắm biển, trekking, shopping, spa...)',
    key: 'activities',
    type: 'text'
  }
];

/**
 * Mock Data mở rộng - có thể thêm sau này
 */

// Danh sách địa điểm phổ biến
export const POPULAR_DESTINATIONS = [
  { id: 1, name: 'Đà Nẵng', region: 'Miền Trung' },
  { id: 2, name: 'Phú Quốc', region: 'Miền Nam' },
  { id: 3, name: 'Sapa', region: 'Miền Bắc' },
  { id: 4, name: 'Nha Trang', region: 'Miền Trung' },
  { id: 5, name: 'Hạ Long', region: 'Miền Bắc' },
  { id: 6, name: 'Đà Lạt', region: 'Miền Nam' },
  { id: 7, name: 'Hội An', region: 'Miền Trung' },
  { id: 8, name: 'Vũng Tàu', region: 'Miền Nam' }
];

// Các loại tour
export const TOUR_TYPES = [
  { id: 1, name: 'Nghỉ dưỡng', icon: '🏖️' },
  { id: 2, name: 'Khám phá văn hóa', icon: '🏛️' },
  { id: 3, name: 'Mạo hiểm', icon: '🏔️' },
  { id: 4, name: 'Ẩm thực', icon: '🍜' },
  { id: 5, name: 'Team building', icon: '🤝' },
  { id: 6, name: 'Honeymoon', icon: '💑' }
];

// Các hoạt động phổ biến
export const ACTIVITIES = [
  { id: 1, name: 'Tắm biển', category: 'water' },
  { id: 2, name: 'Lặn biển', category: 'water' },
  { id: 3, name: 'Trekking', category: 'adventure' },
  { id: 4, name: 'Leo núi', category: 'adventure' },
  { id: 5, name: 'Chụp ảnh', category: 'leisure' },
  { id: 6, name: 'Shopping', category: 'leisure' },
  { id: 7, name: 'Spa & Massage', category: 'relaxation' },
  { id: 8, name: 'Tham quan di tích', category: 'culture' }
];

// Mức ngân sách
export const BUDGET_RANGES = [
  { id: 1, range: '3-5 triệu', min: 3000000, max: 5000000 },
  { id: 2, range: '5-7 triệu', min: 5000000, max: 7000000 },
  { id: 3, range: '7-10 triệu', min: 7000000, max: 10000000 },
  { id: 4, range: '10-15 triệu', min: 10000000, max: 15000000 },
  { id: 5, range: 'Trên 15 triệu', min: 15000000, max: null }
];

/**
 * API Endpoints - Chuẩn bị cho backend integration
 */
export const API_ENDPOINTS = {
  CREATE_TOUR: '/api/tours',
  GET_DESTINATIONS: '/api/destinations',
  GET_TOUR_TYPES: '/api/tour-types',
  GET_ACTIVITIES: '/api/activities',
  SUBMIT_TOUR_REQUEST: '/api/tour-requests'
};