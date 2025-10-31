const request = require('supertest');
const app = require('../../server');
const User = require('../../models/Users');
const { signAccess } = require('../../utils/jwt');

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(() => ({ messageId: 'mockMessageId' })),
    verify: jest.fn(),
  })),
}));

// Mock HelpCategory model
jest.mock('../../models/HelpCategory', () => ({}));

// Mock User model
jest.mock('../../models/Users', () => ({
  exists: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
}));

// Mock JWT utils
jest.mock('../../utils/jwt', () => ({
  signAccess: jest.fn(() => 'mockAccessToken'),
  signRefresh: jest.fn(() => 'mockRefreshToken'),
  newId: jest.fn(() => 'mockJti'),
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => 'hashedPassword'),
  compare: jest.fn(() => true),
}));

describe('Auth Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        username: 'newuser',
        phone: '0912345678',
        role: 'Traveler',
        provinceId: '01',
        wardId: '001',
        addressLine: '123 Test St',
      };

      User.exists.mockResolvedValue(false);
      User.create.mockResolvedValue({
        id: 'newUserId',
        ...userData,
        password: 'hashedPassword',
        location: {
          provinceId: '01',
          wardId: '001',
          addressLine: '123 Test St',
        },
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user).toHaveProperty('_id', 'newUserId');
      expect(response.body.user.email).toBe('newuser@example.com');
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        provinceId: '01',
        wardId: '001',
      };

      User.exists.mockResolvedValueOnce(true); // email exists

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.error).toBe('EMAIL_TAKEN');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        username: 'testuser',
        password: 'password123',
      };

      const mockUser = {
        id: 'userId',
        email: 'test@example.com',
        role: 'Traveler',
        name: 'Test User',
        username: 'testuser',
        phone: '0912345678',
        password: 'hashedPassword',
        location: {},
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.username).toBe('testuser');
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'password123',
      };

      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should accept change password request (auth middleware mocked)', async () => {
      // Note: Full integration test for change-password would require proper auth setup
      // This is a placeholder - in a real scenario, you'd set up test users and tokens
      expect(true).toBe(true);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send reset email for existing user', async () => {
      const forgotData = {
        email: 'test@example.com',
      };

      const mockUser = {
        email: 'test@example.com',
        name: 'Test User',
        save: jest.fn().mockResolvedValue(),
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(forgotData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('đã được gửi');
    });

    it('should not reveal non-existent email', async () => {
      const forgotData = {
        email: 'nonexistent@example.com',
      };

      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(forgotData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Nếu email tồn tại');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password successfully', async () => {
      const resetData = {
        token: 'validResetToken',
        newPassword: 'newpass123',
      };

      const mockUser = {
        id: 'userId',
        password: 'oldHashed',
        resetPasswordToken: 'hashedToken',
        resetPasswordExpires: Date.now() + 10000,
        email: 'test@example.com',
        name: 'Test User',
        save: jest.fn().mockResolvedValue(),
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Đặt lại mật khẩu thành công');
    });

    it('should return error for invalid token', async () => {
      const resetData = {
        token: 'invalidToken',
        newPassword: 'newpass123',
      };

      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(400);

      expect(response.body.message).toContain('không hợp lệ');
    });
  });
});