const { signAccess, signRefresh, verifyAccess, verifyRefresh, newId } = require('../../utils/jwt');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');

// Mock jsonwebtoken and crypto
jest.mock('jsonwebtoken');
jest.mock('crypto', () => ({
  randomUUID: jest.fn(),
}));

describe('JWT Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signAccess', () => {
    it('should sign access token with correct payload and options', () => {
      const user = { id: 'userId', role: 'Traveler' };
      jwt.sign.mockReturnValue('accessToken');

      const result = signAccess(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: 'userId', role: 'Traveler' },
        'test_access_secret',
        { expiresIn: '10m' }
      );
      expect(result).toBe('accessToken');
    });

    it('should use default role if not provided', () => {
      const user = { id: 'userId' };
      jwt.sign.mockReturnValue('accessToken');

      signAccess(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: 'userId', role: 'Traveler' },
        'test_access_secret',
        { expiresIn: '10m' }
      );
    });
  });

  describe('signRefresh', () => {
    it('should sign refresh token with correct payload and options', () => {
      const params = { jti: 'jti123', userId: 'userId' };
      jwt.sign.mockReturnValue('refreshToken');

      const result = signRefresh(params);

      expect(jwt.sign).toHaveBeenCalledWith(
        { sid: 'jti123', sub: 'userId' },
        'test_refresh_secret',
        { expiresIn: '30d', jwtid: 'jti123' }
      );
      expect(result).toBe('refreshToken');
    });
  });

  describe('verifyAccess', () => {
    it('should verify access token', () => {
      const token = 'accessToken';
      const decoded = { sub: 'userId', role: 'Traveler' };
      jwt.verify.mockReturnValue(decoded);

      const result = verifyAccess(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, 'test_access_secret');
      expect(result).toBe(decoded);
    });
  });

  describe('verifyRefresh', () => {
    it('should verify refresh token', () => {
      const token = 'refreshToken';
      const decoded = { sid: 'jti123', sub: 'userId' };
      jwt.verify.mockReturnValue(decoded);

      const result = verifyRefresh(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, 'test_refresh_secret');
      expect(result).toBe(decoded);
    });
  });

  describe('newId', () => {
    it('should return a random UUID', () => {
      randomUUID.mockReturnValue('uuid-123');

      const result = newId();

      expect(randomUUID).toHaveBeenCalled();
      expect(result).toBe('uuid-123');
    });
  });
});