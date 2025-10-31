// Mock dependencies before requiring the controller
const mockQuery = {
  sort: jest.fn().mockReturnThis(),
  lean: jest.fn(),
  populate: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis()
};

jest.mock('../../models/Bookings', () => ({
  find: jest.fn(() => mockQuery),
}));
jest.mock('../../models/Tours', () => ({
  findById: jest.fn(() => mockQuery),
  find: jest.fn(() => mockQuery)
}));

const bookingController = require('../../controller/bookingController');
const Booking = require('../../models/Bookings');
const Tour = require('../../models/Tours');

describe('Booking Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: { sub: 'user123' },
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('quote', () => {
    it('should return pricing quote for valid items', async () => {
      const mockTour = {
        _id: 'tour123',
        title: 'Test Tour',
        imageItems: [{ imageUrl: 'test.jpg' }],
        departures: [{
          date: '2024-01-15',
          priceAdult: 100,
          priceChild: 50,
          status: 'open',
          seatsLeft: 20,
          seatsTotal: 30
        }]
      };

      mockQuery.lean.mockResolvedValue(mockTour);

      req.body.items = [{
        tourId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        date: '2024-01-15',
        adults: 2,
        children: 1
      }];

      await bookingController.quote(req, res);

      expect(Tour.findById).toHaveBeenCalledWith('aaaaaaaaaaaaaaaaaaaaaaaa');
      expect(res.json).toHaveBeenCalledWith({
        items: [{
          tourId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
          date: '2024-01-15',
          adults: 2,
          children: 1,
          unitPriceAdult: 100,
          unitPriceChild: 50,
          name: 'Test Tour',
          image: 'test.jpg',
          seatsLeft: 20,
          seatsTotal: 30
        }]
      });
    });

    it('should return error for invalid tour ID', async () => {
      req.body.items = [{
        tourId: 'invalid-id',
        date: '2024-01-15',
        adults: 1,
        children: 0
      }];

      await bookingController.quote(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'INVALID_TOUR_ID' });
    });

    it('should return error for invalid input (no date)', async () => {
      req.body.items = [{
        tourId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        date: '',
        adults: 1,
        children: 0
      }];

      await bookingController.quote(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'INVALID_INPUT' });
    });

    it('should return error when exceeding departure capacity', async () => {
      const mockTour = {
        _id: 'tour123',
        title: 'Test Tour',
        departures: [{
          date: '2024-01-15',
          priceAdult: 100,
          status: 'open',
          seatsLeft: 5,
          seatsTotal: 10
        }]
      };

      mockQuery.lean.mockResolvedValue(mockTour);

      req.body.items = [{
        tourId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        date: '2024-01-15',
        adults: 3,
        children: 3
      }];

      await bookingController.quote(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: 'EXCEEDS_DEPARTURE_CAPACITY',
        limit: 5
      });
    });

    it('should handle tour not found', async () => {
      mockQuery.lean.mockResolvedValue(null);

      req.body.items = [{
        tourId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        date: '2024-01-15',
        adults: 1,
        children: 0
      }];

      await bookingController.quote(req, res);

      expect(res.json).toHaveBeenCalledWith({
        items: [{
          tourId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
          date: '2024-01-15',
          adults: 1,
          children: 0,
          unitPriceAdult: 0,
          unitPriceChild: 0,
          name: '',
          image: '',
          seatsLeft: null,
          seatsTotal: null
        }]
      });
    });

    it('should handle database errors', async () => {
      mockQuery.lean.mockRejectedValue(new Error('Database error'));

      req.body.items = [{
        tourId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        date: '2024-01-15',
        adults: 1,
        children: 0
      }];

      await bookingController.quote(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'QUOTE_FAILED' });
    });
  });

  describe('getUserBookings', () => {
    it('should return user bookings successfully', async () => {
      const mockBookings = [
        {
          _id: 'booking1',
          userId: 'user123',
          items: [{
            tourId: {
              title: 'Tour 1',
              imageItems: [{ imageUrl: 'tour1.jpg' }]
            },
            date: '2024-01-15',
            adults: 2,
            children: 1,
            unitPriceAdult: 150,
            unitPriceChild: 75,
            name: 'Tour 1',
            image: 'tour1.jpg'
          }],
          currency: 'VND',
          totalVND: 375,
          payment: { provider: 'momo', status: 'paid' },
          status: 'paid',
          createdAt: new Date('2024-01-10')
        }
      ];

      mockQuery.lean.mockResolvedValue(mockBookings);

      await bookingController.getUserBookings(req, res);

      expect(Booking.find).toHaveBeenCalledWith({ userId: 'user123' });
      expect(mockQuery.populate).toHaveBeenCalledWith('items.tourId', 'title imageItems');
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        bookings: mockBookings,
        count: 1
      });
    });

    it('should return error for unauthorized user', async () => {
      req.user = null;

      await bookingController.getUserBookings(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'UNAUTHORIZED' });
    });

    it('should handle empty bookings list', async () => {
      mockQuery.lean.mockResolvedValue([]);

      await bookingController.getUserBookings(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        bookings: [],
        count: 0
      });
    });

    it('should enrich booking items with tour data when populate works', async () => {
      const mockBookings = [
        {
          _id: 'booking1',
          userId: 'user123',
          items: [{
            tourId: {
              title: 'Tour Title',
              imageItems: [{ imageUrl: 'tour.jpg' }]
            },
            date: '2024-01-15',
            adults: 1,
            children: 0,
            unitPriceAdult: 100,
            unitPriceChild: 50,
            name: '', // Empty name, should use tour title
            image: '' // Empty image, should use tour image
          }],
          currency: 'VND',
          totalVND: 100,
          payment: { provider: 'momo', status: 'paid' },
          status: 'paid',
          createdAt: new Date('2024-01-10')
        }
      ];

      mockQuery.lean.mockResolvedValue(mockBookings);

      await bookingController.getUserBookings(req, res);

      const expectedBookings = [{
        ...mockBookings[0],
        items: [{
          ...mockBookings[0].items[0],
          name: 'Tour Title',
          image: 'tour.jpg'
        }]
      }];

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        bookings: expectedBookings,
        count: 1
      });
    });

    it('should handle database errors', async () => {
      mockQuery.lean.mockRejectedValue(new Error('Database error'));

      await bookingController.getUserBookings(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'FETCH_BOOKINGS_FAILED' });
    });
  });
});