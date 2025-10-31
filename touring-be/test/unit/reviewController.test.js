// test/unit/reviewController.test.js
const reviewController = require('../../controller/reviewController');

// Mock dependencies
jest.mock('../../models/Review', () => ({
  create: jest.fn(),
  find: jest.fn(() => ({
    sort: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([])
  })),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn().mockResolvedValue(0)
}));

jest.mock('../../models/Bookings', () => ({
  findOne: jest.fn(),
  findById: jest.fn()
}));

jest.mock('../../models/Tours', () => ({
  findById: jest.fn()
}));

jest.mock('../../models/Users', () => ({
  findById: jest.fn()
}));

const Review = require('../../models/Review');
const Booking = require('../../models/Bookings');
const Tour = require('../../models/Tours');
const User = require('../../models/Users');

describe('Review Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { sub: 'user123' },
      body: {},
      params: {},
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('createReview', () => {
    it('should create a review successfully', async () => {
      const mockBooking = {
        _id: 'booking123',
        userId: 'user123',
        status: 'paid',
        items: [{
          tourId: 'tour123',
          name: 'Test Tour',
          date: '2024-01-15'
        }]
      };
      const mockTour = {
        _id: 'tour123',
        name: 'Test Tour'
      };
      const mockReview = {
        _id: 'review123',
        tourId: 'tour123',
        bookingId: 'booking123',
        userId: 'user123',
        rating: 5,
        title: 'Great tour',
        content: 'Amazing experience'
      };

      Booking.findOne.mockResolvedValue(mockBooking);
      Tour.findById.mockResolvedValue(mockTour);
      Review.create.mockResolvedValue(mockReview);

      req.body = {
        tourId: 'tour123',
        bookingId: 'booking123',
        rating: 5,
        title: 'Great tour',
        content: 'Amazing experience'
      };

      await reviewController.createReview(req, res);

      expect(Booking.findOne).toHaveBeenCalledWith({
        _id: 'booking123',
        userId: 'user123',
        status: 'paid'
      });
      expect(Review.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Review created successfully',
        data: mockReview
      });
    });

    it('should return error for missing required fields', async () => {
      req.body = {};

      await reviewController.createReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Thiếu thông tin bắt buộc: tourId, bookingId, rating, title, content'
      });
    });

    it('should return error if booking not found', async () => {
      Booking.findOne.mockResolvedValue(null);

      req.body = {
        tourId: 'tour123',
        bookingId: 'booking123',
        rating: 5,
        title: 'Great tour',
        content: 'Amazing experience'
      };

      await reviewController.createReview(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Booking not found or not eligible for review'
      });
    });
  });

  describe('getReviews', () => {
    it('should get reviews for a tour', async () => {
      const mockReviews = [{
        _id: 'review123',
        tourId: 'tour123',
        rating: 5,
        title: 'Great tour',
        content: 'Amazing experience',
        user: { name: 'John Doe' }
      }];

      Review.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockReviews)
      });
      Review.countDocuments.mockResolvedValue(1);

      req.params.tourId = 'tour123';
      req.query = { page: 1, limit: 10 };

      await reviewController.getReviews(req, res);

      expect(Review.find).toHaveBeenCalledWith({ tourId: 'tour123' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockReviews,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalReviews: 1,
          hasNext: false,
          hasPrev: false
        }
      });
    });
  });

  describe('getReviewStats', () => {
    it('should get review statistics for a tour', async () => {
      const mockReviews = [
        { rating: 5 },
        { rating: 4 },
        { rating: 5 }
      ];

      Review.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReviews)
      });

      req.params.tourId = 'tour123';

      await reviewController.getReviewStats(req, res);

      expect(Review.find).toHaveBeenCalledWith({ tourId: 'tour123' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          totalReviews: 3,
          averageRating: 4.67,
          ratingDistribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 1,
            5: 2
          }
        }
      });
    });
  });
});