const { sendMail } = require('../../utils/emailService');
const nodemailer = require('nodemailer');

// Mock nodemailer

jest.mock('nodemailer', () => {
  const mockSendMail = jest.fn().mockResolvedValue({
    messageId: 'msg123',
    accepted: ['test@example.com'],
    rejected: []
  });
  return {
    createTransport: jest.fn(() => ({
      sendMail: mockSendMail,
      verify: jest.fn().mockResolvedValue(true)
    }))
  };
});

describe('Email Service', () => {
  let mockTransporter;
  let mockSendMail;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock transporter
    mockSendMail = jest.fn();
    mockTransporter = {
      sendMail: mockSendMail,
      verify: jest.fn()
    };

    nodemailer.createTransport.mockReturnValue(mockTransporter);

    // Re-require the module to trigger transporter creation
    jest.resetModules();
    require('../../utils/emailService');
  });

  describe('sendMail', () => {
    it('should send email successfully', async () => {
      const mockInfo = {
        messageId: 'msg123',
        accepted: ['test@example.com'],
        rejected: []
      };

      mockSendMail.mockResolvedValue(mockInfo);

      // Mock environment variables
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASS = 'password';
      process.env.MAIL_FROM = 'noreply@example.com';

      const result = await sendMail('test@example.com', 'Test Subject', '<h1>Test</h1>');

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: '587',
        secure: false,
        auth: {
          user: 'user@example.com',
          pass: 'password'
        }
      });

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<h1>Test</h1>'
      });

      expect(result).toEqual(mockInfo);
    });

    it('should use default from address when MAIL_FROM not set', async () => {
      const mockInfo = { messageId: 'msg123' };
      mockSendMail.mockResolvedValue(mockInfo);

      // Clear MAIL_FROM
      delete process.env.MAIL_FROM;

      await sendMail('test@example.com', 'Test Subject', 'Test content');

      expect(mockSendMail).toHaveBeenCalledWith({
        from: `"Travyy Touring" <user@example.com>`,
        to: 'test@example.com',
        subject: 'Test Subject',
        html: 'Test content'
      });
    });

    it('should handle sendMail errors', async () => {
      const error = new Error('SMTP connection failed');
      mockSendMail.mockRejectedValue(error);

      await expect(sendMail('test@example.com', 'Test', 'Content'))
        .rejects
        .toThrow('SMTP connection failed');
    });

    it('should handle multiple recipients', async () => {
      const mockInfo = { messageId: 'msg123' };
      mockSendMail.mockResolvedValue(mockInfo);

      await sendMail('user1@example.com,user2@example.com', 'Test', 'Content');

      expect(mockSendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to: 'user1@example.com,user2@example.com',
        subject: 'Test',
        html: 'Content'
      });
    });
  });

  describe('Transporter Configuration', () => {
    it('should create transporter with correct config', () => {
      // Re-require to trigger transporter creation
      jest.resetModules();
      require('../../utils/emailService');

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: '587',
        secure: false,
        auth: {
          user: 'user@example.com',
          pass: 'password'
        }
      });
    });

    it('should verify connection on startup', () => {
      const mockVerify = jest.fn((callback) => callback(null, true));
      mockTransporter.verify = mockVerify;

      // Re-require to trigger verification
      jest.resetModules();
      require('../../utils/emailService');

      expect(mockVerify).toHaveBeenCalled();
    });

    it('should log successful SMTP verification', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockVerify = jest.fn((callback) => callback(null, true));
      mockTransporter.verify = mockVerify;

      jest.resetModules();
      require('../../utils/emailService');

      expect(consoleSpy).toHaveBeenCalledWith('✅ SMTP server ready to send emails');

      consoleSpy.mockRestore();
    });

    it('should log SMTP verification errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Connection failed');
      const mockVerify = jest.fn((callback) => callback(error, false));
      mockTransporter.verify = mockVerify;

      jest.resetModules();
      require('../../utils/emailService');

      expect(consoleSpy).toHaveBeenCalledWith('❌ SMTP error:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('Environment Variables', () => {
    beforeEach(() => {
      // Clear environment variables
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_PORT;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
      delete process.env.MAIL_FROM;
    });

    it('should handle missing environment variables gracefully', async () => {
      // Set minimal required vars
      process.env.SMTP_USER = 'test@example.com';
      process.env.SMTP_PASS = 'testpass';

      mockSendMail.mockResolvedValue({ messageId: 'test' });

      await expect(sendMail('to@example.com', 'Subject', 'Content')).resolves.toBeDefined();

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: undefined,
        port: undefined,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'testpass'
        }
      });
    });
  });
});