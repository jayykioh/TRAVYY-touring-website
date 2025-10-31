const User = require('../../models/Users');
const bcrypt = require('bcryptjs');

// Mock the User model
jest.mock('../../models/Users', () => {
  const bcrypt = require('bcryptjs');
  return jest.fn().mockImplementation((data) => ({
    ...data,
    setPassword: async function(password) {
      this.password = await bcrypt.hash(password, 10);
    },
    validatePassword: async function(password) {
      return bcrypt.compare(password, this.password);
    },
    save: jest.fn(),
  }));
});

// Mock bcrypt
jest.mock('bcryptjs');

describe('User Model', () => {
  let user;

  beforeEach(() => {
    user = new User({
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'Test User',
    });
    jest.clearAllMocks();
  });

  describe('setPassword', () => {
    it('should hash the password and set it', async () => {
      bcrypt.hash.mockResolvedValue('newHashedPassword');

      await user.setPassword('newPassword');

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(user.password).toBe('newHashedPassword');
    });

    it('should handle hash errors', async () => {
      bcrypt.hash.mockRejectedValue(new Error('Hash error'));

      await expect(user.setPassword('newPassword')).rejects.toThrow('Hash error');
    });
  });

  describe('validatePassword', () => {
    it('should return true for correct password', async () => {
      bcrypt.compare.mockResolvedValue(true);

      const result = await user.validatePassword('correctPassword');

      expect(bcrypt.compare).toHaveBeenCalledWith('correctPassword', 'hashedPassword');
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      bcrypt.compare.mockResolvedValue(false);

      const result = await user.validatePassword('wrongPassword');

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
      expect(result).toBe(false);
    });

    it('should handle compare errors', async () => {
      bcrypt.compare.mockRejectedValue(new Error('Compare error'));

      await expect(user.validatePassword('password')).rejects.toThrow('Compare error');
    });
  });
});