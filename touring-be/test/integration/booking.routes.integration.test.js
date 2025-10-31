// Mock dependencies before requiring anything
jest.mock('../../middlewares/authJwt', () => jest.fn((req, res, next) => {
  req.user = { sub: '507f1f77bcf86cd799439011' };
  next();
}));

jest.mock('../../controller/bookingController', () => ({
  quote: jest.fn(),
  getUserBookings: jest.fn(),
}));

jest.mock('../../controller/payment.controller', () => ({
  getBookingByPayment: jest.fn(),
}));

const request = require('supertest');
const express = require('express');
const bookingRoutes = require('../../routes/bookingRoutes');

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/booking', bookingRoutes);

describe('Booking Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/booking/quote', () => {
    it('should get booking quote successfully', async () => {
      const mockQuote = {
        totalPrice: 1000000,
        breakdown: {
          adultPrice: 500000,
          childPrice: 250000,
          adults: 2,
          children: 0
        }
      };

      const { quote } = require('../../controller/bookingController');
      quote.mockImplementation((req, res) => {
        res.json(mockQuote);
      });

      const response = await request(app)
        .post('/api/booking/quote')
        .send({
          tourId: '507f1f77bcf86cd799439011',
          date: '2024-12-25',
          adults: 2,
          children: 0
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockQuote);
      expect(quote).toHaveBeenCalledTimes(1);
    });

    it('should return error for invalid quote request', async () => {
      const { quote } = require('../../controller/bookingController');
      quote.mockImplementation((req, res) => {
        res.status(400).json({ error: 'Invalid tour or date' });
      });

      const response = await request(app)
        .post('/api/booking/quote')
        .send({
          tourId: 'invalid-id',
          date: 'invalid-date'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid tour or date');
    });
  });

  describe('GET /api/booking/my', () => {
    it('should get user bookings successfully', async () => {
      const mockBookings = [
        {
          _id: '507f1f77bcf86cd799439011',
          tourId: '507f1f77bcf86cd799439012',
          date: '2024-12-25',
          status: 'confirmed',
          totalPrice: 1000000
        }
      ];

      const { getUserBookings } = require('../../controller/bookingController');
      getUserBookings.mockImplementation((req, res) => {
        res.json(mockBookings);
      });

      const response = await request(app)
        .get('/api/booking/my');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBookings);
      expect(getUserBookings).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no bookings found', async () => {
      const { getUserBookings } = require('../../controller/bookingController');
      getUserBookings.mockImplementation((req, res) => {
        res.json([]);
      });

      const response = await request(app)
        .get('/api/booking/my');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/booking/by-payment/:provider/:orderId', () => {
    it('should get booking by payment successfully', async () => {
      const mockBooking = {
        _id: '507f1f77bcf86cd799439011',
        paymentProvider: 'momo',
        orderId: 'ORDER123',
        status: 'paid'
      };

      const { getBookingByPayment } = require('../../controller/payment.controller');
      getBookingByPayment.mockImplementation((req, res) => {
        res.json(mockBooking);
      });

      const response = await request(app)
        .get('/api/booking/by-payment/momo/ORDER123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBooking);
      expect(getBookingByPayment).toHaveBeenCalledTimes(1);
    });

    it('should return 404 when booking not found', async () => {
      const { getBookingByPayment } = require('../../controller/payment.controller');
      getBookingByPayment.mockImplementation((req, res) => {
        res.status(404).json({ error: 'Booking not found' });
      });

      const response = await request(app)
        .get('/api/booking/by-payment/paypal/INVALID123');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Booking not found');
    });
  });
});