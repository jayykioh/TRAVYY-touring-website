// Mock dependencies before requiring anything
jest.mock('../../middlewares/authJwt', () => jest.fn((req, res, next) => {
  req.user = { sub: '507f1f77bcf86cd799439011' };
  next();
}));


jest.mock('../../controller/payment.controller', () => {
  return {
    createMoMoPayment: jest.fn((req, res) => {
      if (req.body.bookingId === '507f1f77bcf86cd799439011' && req.body.amount === 1000000) {
        res.json({ payUrl: 'https://test-payment.momo.vn/pay', orderId: 'ORDER123456', amount: 1000000 });
      } else {
        res.status(400).json({ error: 'Invalid booking or amount' });
      }
    }),
    handleMoMoIPN: jest.fn((req, res) => {
      if (req.body.resultCode === 0) {
        res.status(204).send();
      } else {
        res.status(400).json({ error: 'Payment failed' });
      }
    }),
    markMoMoPaid: jest.fn((req, res) => {
      res.json({ success: true, bookingId: '507f1f77bcf86cd799439011' });
    }),
    getMoMoSessionStatus: jest.fn((req, res) => {
      if (req.params.orderId === 'ORDER123456') {
        res.json({ orderId: 'ORDER123456', status: 'paid', amount: 1000000 });
      } else {
        res.status(404).json({ error: 'Session not found' });
      }
    }),
    getBookingByPayment: jest.fn((req, res) => {
      if (req.params.provider === 'momo') {
        res.json({ _id: '507f1f77bcf86cd799439011', paymentProvider: 'momo', orderId: 'ORDER123456', status: 'paid' });
      } else {
        res.json({ _id: '507f1f77bcf86cd799439012', paymentProvider: 'paypal', orderId: 'PAYPAL123456', status: 'paid' });
      }
    }),
    retryPaymentForBooking: jest.fn((req, res) => {
      if (req.method === 'POST' && req.params.bookingId === '507f1f77bcf86cd799439011') {
        res.json({ success: true, newPaymentUrl: 'https://test-payment.momo.vn/retry', orderId: 'RETRY123456' });
      } else {
        res.status(400).json({ error: 'Retry payment failed' });
      }
    })
  };
});

const request = require('supertest');
const express = require('express');
const paymentRoutes = require('../../routes/payment.routes');

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/payment', paymentRoutes);

describe('Payment Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/payment/momo', () => {
    it('should create MoMo payment successfully', async () => {
      const mockPaymentResponse = {
        payUrl: 'https://test-payment.momo.vn/pay',
        orderId: 'ORDER123456',
        amount: 1000000
      };

      const { createMoMoPayment } = require('../../controller/payment.controller');
      createMoMoPayment.mockImplementation((req, res) => {
        res.json(mockPaymentResponse);
      });

      const response = await request(app)
        .post('/api/payment/momo')
        .send({
          bookingId: '507f1f77bcf86cd799439011',
          amount: 1000000
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPaymentResponse);
      expect(createMoMoPayment).toHaveBeenCalledTimes(1);
    });

    it('should return error for invalid payment request', async () => {
      const { createMoMoPayment } = require('../../controller/payment.controller');
      createMoMoPayment.mockImplementation((req, res) => {
        res.status(400).json({ error: 'Invalid booking or amount' });
      });

      const response = await request(app)
        .post('/api/payment/momo')
        .send({
          bookingId: 'invalid-id',
          amount: -1000
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid booking or amount');
    });
  });

  describe('POST /api/payment/momo/ipn', () => {
    it('should handle MoMo IPN callback successfully', async () => {
      const { handleMoMoIPN } = require('../../controller/payment.controller');
      handleMoMoIPN.mockImplementation((req, res) => {
        res.status(204).send();
      });

      const ipnData = {
        partnerCode: 'MOMO',
        orderId: 'ORDER123456',
        requestId: 'REQ123456',
        amount: '1000000',
        orderInfo: 'Payment for booking',
        orderType: 'momo_wallet',
        transId: 'TRANS123456',
        resultCode: 0,
        message: 'Success',
        payType: 'qr',
        responseTime: Date.now(),
        extraData: '',
        signature: 'mock_signature'
      };

      const response = await request(app)
        .post('/api/payment/momo/ipn')
        .send(ipnData);

      expect(response.status).toBe(204);
      expect(handleMoMoIPN).toHaveBeenCalledTimes(1);
    });

    it('should handle failed payment IPN', async () => {
      const { handleMoMoIPN } = require('../../controller/payment.controller');
      handleMoMoIPN.mockImplementation((req, res) => {
        res.status(400).json({ error: 'Payment failed' });
      });

      const ipnData = {
        partnerCode: 'MOMO',
        orderId: 'ORDER123456',
        resultCode: 1, // Failed
        message: 'Payment failed'
      };

      const response = await request(app)
        .post('/api/payment/momo/ipn')
        .send(ipnData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Payment failed');
    });
  });

  describe('POST /api/payment/momo/mark-paid', () => {
    it('should mark MoMo payment as paid', async () => {
      const mockResult = { success: true, bookingId: '507f1f77bcf86cd799439011' };

      const { markMoMoPaid } = require('../../controller/payment.controller');
      markMoMoPaid.mockImplementation((req, res) => {
        res.json(mockResult);
      });

      const response = await request(app)
        .post('/api/payment/momo/mark-paid')
        .send({
          orderId: 'ORDER123456'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(markMoMoPaid).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/payment/momo/session/:orderId', () => {
    it('should get MoMo session status successfully', async () => {
      const mockStatus = {
        orderId: 'ORDER123456',
        status: 'paid',
        amount: 1000000
      };

      const { getMoMoSessionStatus } = require('../../controller/payment.controller');
      getMoMoSessionStatus.mockImplementation((req, res) => {
        res.json(mockStatus);
      });

      const response = await request(app)
        .get('/api/payment/momo/session/ORDER123456');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStatus);
      expect(getMoMoSessionStatus).toHaveBeenCalledTimes(1);
    });

    it('should return 404 for non-existent session', async () => {
      const { getMoMoSessionStatus } = require('../../controller/payment.controller');
      getMoMoSessionStatus.mockImplementation((req, res) => {
        res.status(404).json({ error: 'Session not found' });
      });

      const response = await request(app)
        .get('/api/payment/momo/session/NONEXISTENT');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Session not found');
    });
  });

  describe('GET /api/payment/booking/:provider/:orderId', () => {
    it('should get booking by payment for MoMo', async () => {
      const mockBooking = {
        _id: '507f1f77bcf86cd799439011',
        paymentProvider: 'momo',
        orderId: 'ORDER123456',
        status: 'paid'
      };

      const { getBookingByPayment } = require('../../controller/payment.controller');
      getBookingByPayment.mockImplementation((req, res) => {
        res.json(mockBooking);
      });

      const response = await request(app)
        .get('/api/payment/booking/momo/ORDER123456');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBooking);
      expect(getBookingByPayment).toHaveBeenCalledTimes(1);
    });

    it('should get booking by payment for PayPal', async () => {
      const mockBooking = {
        _id: '507f1f77bcf86cd799439012',
        paymentProvider: 'paypal',
        orderId: 'PAYPAL123456',
        status: 'paid'
      };

      const { getBookingByPayment } = require('../../controller/payment.controller');
      getBookingByPayment.mockImplementation((req, res) => {
        res.json(mockBooking);
      });

      const response = await request(app)
        .get('/api/payment/booking/paypal/PAYPAL123456');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBooking);
    });
  });

  describe('POST /api/payment/retry/:bookingId', () => {
    it('should retry payment for booking successfully', async () => {
      const mockRetryResult = {
        success: true,
        newPaymentUrl: 'https://test-payment.momo.vn/retry',
        orderId: 'RETRY123456'
      };

      const { retryPaymentForBooking } = require('../../controller/payment.controller');
      retryPaymentForBooking.mockImplementation((req, res) => {
        res.json(mockRetryResult);
      });

      const response = await request(app)
        .post('/api/payment/retry/507f1f77bcf86cd799439011');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRetryResult);
      expect(retryPaymentForBooking).toHaveBeenCalledTimes(1);
    });

    it('should return error when retry fails', async () => {
      const { retryPaymentForBooking } = require('../../controller/payment.controller');
      retryPaymentForBooking.mockImplementation((req, res) => {
        res.status(400).json({ error: 'Retry payment failed' });
      });

      const response = await request(app)
        .post('/api/payment/retry/507f1f77bcf86cd799439011');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Retry payment failed');
    });
  });
});