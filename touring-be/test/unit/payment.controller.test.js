// test/unit/payment.controller.test.js
const paymentController = require('../../controller/payment.controller');
const PaymentSession = require('../../models/PaymentSession');
const Booking = require('../../models/Bookings');
const { Cart, CartItem } = require('../../models/Carts');
const Tour = require('../../models/Tours');
const User = require('../../models/Users');


// Mock crypto
jest.mock('crypto', () => ({
  createHmac: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('valid_signature')
  }))
}));

// Mock fetch
const fetchMock = jest.fn();
global.fetch = fetchMock;

// Mock PaymentSession
jest.mock('../../models/PaymentSession', () => ({
  create: jest.fn().mockResolvedValue({ _id: 'session123', status: 'pending' }),
  findOne: jest.fn().mockResolvedValue({ _id: 'session123', status: 'pending' }),
  findById: jest.fn().mockResolvedValue({ _id: 'session123', status: 'pending' }),
  findByIdAndUpdate: jest.fn().mockResolvedValue({ _id: 'session123', status: 'paid' })
}));

// Mock Bookings
jest.mock('../../models/Bookings', () => ({
  findById: jest.fn().mockResolvedValue({ _id: 'booking123', userId: 'user123', status: 'pending' }),
  findOne: jest.fn().mockResolvedValue({ _id: 'booking123', userId: 'user123', status: 'pending' }),
  create: jest.fn().mockResolvedValue({ _id: 'booking123', userId: 'user123', status: 'pending' }),
  findByIdAndUpdate: jest.fn().mockResolvedValue({ _id: 'booking123', userId: 'user123', status: 'paid' })
}));

// Mock Cart
jest.mock('../../models/Carts', () => ({
  Cart: {
    findOne: jest.fn().mockResolvedValue({ _id: 'cart123', userId: 'user123' }),
    findById: jest.fn().mockResolvedValue({ _id: 'cart123', userId: 'user123' })
  },
  CartItem: {
    find: jest.fn().mockResolvedValue([])
  }
}));

// Mock Tour
jest.mock('../../models/Tours', () => ({
  findById: jest.fn().mockResolvedValue({ _id: 'tour123', title: 'Tour 123', imageItems: [{ imageUrl: 'test.jpg' }], departures: [{ date: '2024-01-15', priceAdult: 100, priceChild: 50 }] })
}));

// Mock User
jest.mock('../../models/Users', () => ({
  findById: jest.fn().mockResolvedValue({ _id: 'user123', name: 'User 123', email: 'user@example.com' })
}));

describe('Payment Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: { sub: 'user123' },
      params: {},
      protocol: 'http',
      get: jest.fn(() => 'localhost:4000'),
      headers: { authorization: 'Bearer token' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  describe('createMoMoPayment', () => {
    it('should create MoMo payment for cart mode', async () => {
      req.body = { mode: 'cart' };

      const mockCart = { _id: 'cart123', userId: 'user123' };
      const mockItems = [{
        _id: 'item1',
        tourId: 'tour123',
        date: '2024-01-15',
        adults: 2,
        children: 1,
        unitPriceAdult: 100,
        unitPriceChild: 50,
        selected: true
      }];
      const mockTour = {
        title: 'Test Tour',
        imageItems: [{ imageUrl: 'test.jpg' }],
        departures: [{
          date: '2024-01-15',
          priceAdult: 100,
          priceChild: 50
        }]
      };

      Cart.findOne.mockReturnValue({
        then: jest.fn().mockImplementation((resolve) => resolve(mockCart))
      });
      CartItem.find.mockReturnValue({
        then: jest.fn().mockImplementation((resolve) => resolve(mockItems))
      });
      Tour.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockTour)
      });
      
      // Mock fetch for MoMo API
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          resultCode: 0,
          payUrl: 'http://pay.url',
          orderId: 'order123'
        })
      });
      
      PaymentSession.create.mockResolvedValue({ orderId: 'order123', payUrl: 'http://pay.url' });

      await paymentController.createMoMoPayment(req, res);

      expect(global.fetch).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          payUrl: 'http://pay.url',
          resultCode: 0
        })
      );
    });

    it('should create MoMo payment for buy-now mode', async () => {
      req.body = {
        mode: 'buy-now',
        item: {
          tourId: 'tour123',
          date: '2024-01-15',
          adults: 2,
          children: 1
        }
      };

      const mockTour = {
        title: 'Test Tour',
        imageItems: [{ imageUrl: 'test.jpg' }],
        departures: [{
          date: '2024-01-15',
          priceAdult: 100,
          priceChild: 50
        }]
      };

      Tour.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockTour)
      });
      
      // Mock fetch for MoMo API
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          resultCode: 0,
          payUrl: 'http://pay.url',
          orderId: 'order123'
        })
      });
      
      PaymentSession.create.mockResolvedValue({ orderId: 'order123', payUrl: 'http://pay.url' });

      await paymentController.createMoMoPayment(req, res);

      expect(global.fetch).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          payUrl: 'http://pay.url',
          resultCode: 0
        })
      );
    });
  });

  describe('handleMoMoIPN', () => {
    it('should handle successful MoMo IPN', async () => {
      req.body = {
        orderId: 'order123',
        resultCode: '0',
        message: 'Success',
        transId: 'trans123',
        payType: 'qr',
        signature: 'valid_signature'
      };

      const mockSession = {
        _id: 'session123',
        orderId: 'order123',
        status: 'pending',
        userId: 'user123',
        save: jest.fn().mockResolvedValue()
      };

      PaymentSession.findOne.mockReturnValue({
        then: jest.fn().mockImplementation((resolve) => resolve(mockSession))
      });

      // Mock createBookingFromSession
      const mockCreateBooking = jest.fn().mockResolvedValue({ _id: 'booking123' });
      paymentController.createBookingFromSession = mockCreateBooking;

      await paymentController.handleMoMoIPN(req, res);

      expect(mockSession.save).toHaveBeenCalled();
      expect(mockSession.status).toBe('paid');
      expect(mockCreateBooking).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle failed MoMo IPN', async () => {
      req.body = {
        orderId: 'order123',
        resultCode: '1',
        message: 'Failed',
        signature: 'valid_signature'
      };

      const mockSession = {
        orderId: 'order123',
        status: 'pending',
        save: jest.fn().mockResolvedValue()
      };

      PaymentSession.findOne.mockReturnValue({
        then: jest.fn().mockImplementation((resolve) => resolve(mockSession))
      });

      await paymentController.handleMoMoIPN(req, res);

      expect(mockSession.status).toBe('failed');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getMoMoSessionStatus', () => {
    it('should return session status', async () => {
      req.params.orderId = 'order123';

      const mockSession = {
        orderId: 'order123',
        status: 'paid',
        paidAt: new Date(),
        amount: 100000,
        resultCode: '0',
        message: 'Success'
      };

      PaymentSession.findOne.mockReturnValue({
        then: jest.fn().mockImplementation((resolve) => resolve(mockSession))
      });

      await paymentController.getMoMoSessionStatus(req, res);

      expect(res.json).toHaveBeenCalledWith({
        orderId: 'order123',
        status: 'paid',
        paidAt: mockSession.paidAt,
        amount: 100000,
        resultCode: '0',
        message: 'Success'
      });
    });
  });

  describe('markMoMoPaid', () => {
    it('should mark session as paid', async () => {
      req.body = { orderId: 'order123', resultCode: '0' };

      const mockSession = {
        orderId: 'order123',
        status: 'pending',
        save: jest.fn().mockResolvedValue()
      };

      PaymentSession.findOne.mockReturnValue({
        then: jest.fn().mockImplementation((resolve) => resolve(mockSession))
      });

      await paymentController.markMoMoPaid(req, res);

      expect(mockSession.status).toBe('paid');
      expect(mockSession.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'paid',
          paidAt: expect.any(Date)
        })
      );
    });
  });

  describe('getBookingByPayment', () => {
    it('should return existing booking', async () => {
      req.params = { provider: 'momo', orderId: 'order123' };
      req.headers = { authorization: 'Bearer token' };

      const mockBooking = {
        _id: 'booking123',
        payment: { provider: 'momo', orderID: 'order123' },
        userId: 'user123',
        items: [{ name: 'Test Tour' }]
      };

      Booking.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockBooking)
      });

      await paymentController.getBookingByPayment(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, booking: mockBooking });
    });

    it('should return payment session status when no booking', async () => {
      req.params = { provider: 'momo', orderId: 'order123' };
      req.headers = { authorization: 'Bearer token' };

      const mockSession = {
        orderId: 'order123',
        provider: 'momo',
        status: 'pending'
      };

      Booking.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null)
      });
      PaymentSession.findOne.mockReturnValue({
        then: jest.fn().mockImplementation((resolve) => resolve(mockSession))
      });

      await paymentController.getBookingByPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        pending: true,
        sessionStatus: 'pending',
        message: 'Payment session found but not completed yet'
      });
    });
  });
});