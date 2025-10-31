// test/unit/notifyController.test.js
const notifyController = require('../../controller/notifyController');

// Mock dependencies

jest.mock('../../utils/emailService', () => ({
  sendMail: jest.fn().mockResolvedValue({ messageId: 'mockMsgId' })
}));

jest.mock('../../models/Notification', () => ({
  create: jest.fn().mockResolvedValue({ _id: 'notif123', message: 'Test notification' }),
  find: jest.fn(() => ({
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([{ _id: 'notif123', message: 'Test notification' }])
  }))
}));

jest.mock('../../models/Users', () => ({
  findOne: jest.fn().mockResolvedValue({ _id: 'user123', email: 'test@example.com' })
}));

const { sendMail } = require('../../utils/emailService');
const Notification = require('../../models/Notification');
const User = require('../../models/Users');

describe('Notify Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { sub: 'user123' },
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('notifyBookingSuccess', () => {
    it('should send booking success email', async () => {
      sendMail.mockResolvedValue();

      req.body = {
        email: 'test@example.com',
        bookingCode: 'BK123',
        tourTitle: 'Test Tour'
      };

      await notifyController.notifyBookingSuccess(req, res);

      expect(sendMail).toHaveBeenCalledWith(
        'test@example.com',
        'Xác nhận đặt tour thành công',
        expect.stringContaining('Test Tour')
      );
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should handle email send error', async () => {
      sendMail.mockRejectedValue(new Error('Email failed'));

      req.body = {
        email: 'test@example.com',
        bookingCode: 'BK123',
        tourTitle: 'Test Tour'
      };

      await notifyController.notifyBookingSuccess(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email failed'
      });
    });
  });

  describe('notifyPaymentSuccess', () => {
    it('should send payment success email and create notification', async () => {
      const mockUser = { _id: 'user123', email: 'test@example.com' };

      User.findOne.mockResolvedValue(mockUser);
      sendMail.mockResolvedValue();
      Notification.create.mockResolvedValue({ _id: 'notif123' });

      req.body = {
        email: 'test@example.com',
        amount: '1000000',
        bookingCode: 'BK123',
        tourTitle: 'Test Tour',
        bookingId: 'booking123'
      };

      await notifyController.notifyPaymentSuccess(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(sendMail).toHaveBeenCalled();
      expect(Notification.create).toHaveBeenCalledWith({
        userId: 'user123',
        type: 'payment_success',
        title: 'Thanh toán thành công',
        message: expect.stringContaining('BK123'),
        data: {
          bookingId: 'booking123',
          amount: '1000000',
          tourTitle: 'Test Tour'
        }
      });
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('getUserNotifications', () => {
    it('should get user notifications', async () => {
      const mockNotifications = [
        { _id: 'notif1', title: 'Test', message: 'Test message' }
      ];

      Notification.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockNotifications)
      });

      req.query = { limit: 10 };

      await notifyController.getUserNotifications(req, res);

      expect(Notification.find).toHaveBeenCalledWith({ userId: 'user123' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockNotifications
      });
    });
  });
});