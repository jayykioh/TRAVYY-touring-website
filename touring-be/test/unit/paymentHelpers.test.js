const {
  createBookingFromSession,
  markBookingAsPaid,
  markBookingAsFailed,
  clearCartAfterPayment,
  calculateTotal,
  toUSD,
  toVND,
  FX_VND_USD
} = require('../../utils/paymentHelpers');

const Booking = require('../../models/Bookings');
const Tour = require('../../models/Tours');
const { Cart, CartItem } = require('../../models/Carts');
const User = require('../../models/Users');

// Mock dependencies

jest.mock('../../models/Bookings', () => ({
  findById: jest.fn().mockResolvedValue({ _id: 'booking123', userId: 'user123', status: 'pending' }),
  findOne: jest.fn().mockResolvedValue({ _id: 'booking123', userId: 'user123', status: 'pending' }),
  create: jest.fn().mockResolvedValue({ _id: 'booking123', userId: 'user123', status: 'pending' }),
  findByIdAndUpdate: jest.fn().mockResolvedValue({ _id: 'booking123', userId: 'user123', status: 'paid' })
}));

jest.mock('../../models/Tours', () => ({
  findById: jest.fn().mockResolvedValue({ _id: 'tour123', title: 'Tour 123', imageItems: [{ imageUrl: 'test.jpg' }], departures: [{ date: '2024-01-15', priceAdult: 100, priceChild: 50 }] })
}));

jest.mock('../../models/Carts', () => ({
  Cart: {
    findOne: jest.fn().mockResolvedValue({ _id: 'cart123', userId: 'user123' }),
    findById: jest.fn().mockResolvedValue({ _id: 'cart123', userId: 'user123' })
  },
  CartItem: {
    find: jest.fn().mockResolvedValue([])
  }
}));

jest.mock('../../models/Users', () => ({
  findById: jest.fn().mockResolvedValue({ _id: 'user123', name: 'User 123', email: 'user@example.com' })
}));

describe('Payment Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('FX_VND_USD', () => {
    it('should have correct exchange rate', () => {
      expect(FX_VND_USD).toBe(Number(process.env.FX_VND_USD || 0.000039));
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total from items array', () => {
      const items = [
        { adults: 2, children: 1, unitPriceAdult: 100, unitPriceChild: 50 },
        { adults: 1, children: 2, unitPriceAdult: 150, unitPriceChild: 75 }
      ];

      const result = calculateTotal(items);

      // (2*100 + 1*50) + (1*150 + 2*75) = 200 + 50 + 150 + 150 = 550
      expect(result).toBe(550);
    });

    it('should handle empty items array', () => {
      const result = calculateTotal([]);
      expect(result).toBe(0);
    });

    it('should handle items with zero quantities', () => {
      const items = [
        { adults: 0, children: 0, unitPriceAdult: 100, unitPriceChild: 50 }
      ];

      const result = calculateTotal(items);
      expect(result).toBe(0);
    });

    it('should handle missing unitPrice fields', () => {
      const items = [
        { adults: 1, children: 1, unitPriceAdult: undefined, unitPriceChild: undefined }
      ];

      const result = calculateTotal(items);
      expect(result).toBe(0);
    });
  });

  describe('toUSD', () => {
    it('should convert VND to USD', () => {
      const vnd = 100000;
      const expected = Math.round(vnd * FX_VND_USD * 100) / 100; // Round to 2 decimal places

      const result = toUSD(vnd);
      expect(result).toBe(expected);
    });

    it('should handle zero VND', () => {
      const result = toUSD(0);
      expect(result).toBe(0);
    });

    it('should handle negative VND', () => {
      const result = toUSD(-1000);
      expect(result).toBeLessThan(0);
    });
  });

  describe('toVND', () => {
    it('should convert USD to VND', () => {
      const usd = 10;
      const expected = Math.round(usd / FX_VND_USD);

      const result = toVND(usd);
      expect(result).toBe(expected);
    });

    it('should handle zero USD', () => {
      const result = toVND(0);
      expect(result).toBe(0);
    });

    it('should handle fractional USD', () => {
      const usd = 10.50;
      const result = toVND(usd);
      expect(result).toBe(Math.round(usd / FX_VND_USD));
    });
  });

  describe('clearCartAfterPayment', () => {
    it('should clear cart items for user', async () => {
      const userId = 'user123';
      CartItem.deleteMany.mockResolvedValue({ deletedCount: 3 });

      const result = await clearCartAfterPayment(userId);

      expect(CartItem.deleteMany).toHaveBeenCalledWith({ userId });
      expect(result).toEqual({ deletedCount: 3 });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      CartItem.deleteMany.mockRejectedValue(error);

      await expect(clearCartAfterPayment('user123')).rejects.toThrow('Database error');
    });
  });

  describe('markBookingAsPaid', () => {
    it('should mark booking as paid with PayPal data', async () => {
      const orderId = 'order123';
      const paymentData = {
        paypal: {
          captureId: 'cap123',
          payerId: 'payer123'
        }
      };

      const mockBooking = {
        status: 'pending',
        payment: { status: 'pending' },
        markAsPaid: jest.fn()
      };

      Booking.findOneAndUpdate.mockResolvedValue(mockBooking);

      const result = await markBookingAsPaid(orderId, paymentData);

      expect(Booking.findOneAndUpdate).toHaveBeenCalledWith(
        { 'payment.orderId': orderId },
        {
          status: 'paid',
          'payment.status': 'completed',
          'payment.paidAt': expect.any(Date),
          'payment.paypalData': paymentData.paypal
        },
        { new: true }
      );
      expect(result).toEqual(mockBooking);
    });

    it('should mark booking as paid with MoMo data', async () => {
      const orderId = 'order456';
      const paymentData = {
        momo: {
          resultCode: 0,
          message: 'Success'
        }
      };

      const mockBooking = {
        status: 'pending',
        payment: { status: 'pending' }
      };

      Booking.findOneAndUpdate.mockResolvedValue(mockBooking);

      await markBookingAsPaid(orderId, paymentData);

      expect(Booking.findOneAndUpdate).toHaveBeenCalledWith(
        { 'payment.orderId': orderId },
        expect.objectContaining({
          'payment.momoData': paymentData.momo
        }),
        { new: true }
      );
    });

    it('should handle booking not found', async () => {
      Booking.findOneAndUpdate.mockResolvedValue(null);

      const result = await markBookingAsPaid('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('markBookingAsFailed', () => {
    it('should mark booking as failed with failure data', async () => {
      const orderId = 'order123';
      const failureData = {
        reason: 'Payment declined',
        code: 'CARD_DECLINED'
      };

      const mockBooking = {
        status: 'pending',
        payment: { status: 'pending' }
      };

      Booking.findOneAndUpdate.mockResolvedValue(mockBooking);

      const result = await markBookingAsFailed(orderId, failureData);

      expect(Booking.findOneAndUpdate).toHaveBeenCalledWith(
        { 'payment.orderId': orderId },
        {
          status: 'cancelled',
          'payment.status': 'failed',
          'payment.failedAt': expect.any(Date),
          'payment.failureReason': failureData.reason,
          'payment.failureCode': failureData.code
        },
        { new: true }
      );
      expect(result).toEqual(mockBooking);
    });

    it('should handle booking not found', async () => {
      Booking.findOneAndUpdate.mockResolvedValue(null);

      const result = await markBookingAsFailed('nonexistent', { reason: 'test' });

      expect(result).toBeNull();
    });
  });

  describe('createBookingFromSession', () => {
    const mockSession = {
      userId: 'user123',
      orderId: 'order123',
      items: [
        {
          tourId: 'tour1',
          name: 'Test Tour',
          image: 'test.jpg',
          meta: {
            date: '2024-01-15',
            adults: 2,
            children: 1,
            unitPriceAdult: 100,
            unitPriceChild: 50
          }
        }
      ],
      retryBookingId: null
    };

    it('should create booking from session for successful payment', async () => {
      const additionalData = {
        markPaid: true,
        paypal: { captureId: 'cap123' }
      };

      const mockBooking = {
        _id: 'booking123',
        status: 'paid',
        generateOrderRef: jest.fn().mockReturnValue('TRAV-123456')
      };

      Booking.create.mockResolvedValue(mockBooking);

      const result = await createBookingFromSession(mockSession, additionalData);

      expect(Booking.create).toHaveBeenCalledWith({
        userId: 'user123',
        items: [{
          tourId: 'tour1',
          name: 'Test Tour',
          image: 'test.jpg',
          date: '2024-01-15',
          adults: 2,
          children: 1,
          unitPriceAdult: 100,
          unitPriceChild: 50
        }],
        currency: 'VND',
        originalAmount: 250, // 2*100 + 1*50
        discountAmount: 0,
        totalAmount: 250,
        payment: {
          provider: 'paypal',
          orderId: 'order123',
          status: 'completed',
          amount: 250,
          currency: 'VND',
          paidAt: expect.any(Date),
          paypalData: { captureId: 'cap123' }
        },
        status: 'paid'
      });

      expect(result).toEqual(mockBooking);
    });

    it('should create booking for failed payment', async () => {
      const additionalData = {
        failReason: 'Payment timeout'
      };

      const mockBooking = {
        _id: 'booking123',
        status: 'cancelled'
      };

      Booking.create.mockResolvedValue(mockBooking);

      const result = await createBookingFromSession(mockSession, additionalData);

      expect(Booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'cancelled',
          payment: expect.objectContaining({
            status: 'failed'
          })
        })
      );
      expect(result).toEqual(mockBooking);
    });

    it('should update existing booking for retry payment', async () => {
      const retrySession = { ...mockSession, retryBookingId: 'existingBooking123' };
      const additionalData = { markPaid: true };

      const mockExistingBooking = {
        _id: 'existingBooking123',
        items: [],
        save: jest.fn().mockResolvedValue()
      };

      Booking.findById.mockResolvedValue(mockExistingBooking);

      const result = await createBookingFromSession(retrySession, additionalData);

      expect(Booking.findById).toHaveBeenCalledWith('existingBooking123');
      expect(mockExistingBooking.save).toHaveBeenCalled();
      expect(result).toEqual(mockExistingBooking);
    });

    it('should throw error for missing session', async () => {
      await expect(createBookingFromSession(null)).rejects.toThrow('Session data missing');
    });

    it('should throw error for missing userId', async () => {
      const invalidSession = { ...mockSession, userId: null };

      await expect(createBookingFromSession(invalidSession)).rejects.toThrow('Missing userId in session');
    });

    it('should handle MoMo payment success', async () => {
      const additionalData = {
        ipn: { resultCode: '0', transId: 'momo123' }
      };

      Booking.create.mockResolvedValue({ _id: 'booking123' });

      await createBookingFromSession(mockSession, additionalData);

      expect(Booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          payment: expect.objectContaining({
            provider: 'momo',
            status: 'completed',
            transactionId: 'momo123',
            momoData: { resultCode: '0', transId: 'momo123' }
          })
        })
      );
    });
  });
});