// Mock dependencies before requiring the controller
jest.mock('../../models/Users', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));
jest.mock('zod', () => {
  const mockParse = jest.fn();
  const mockSchema = { parse: mockParse };
  return {
    z: {
      object: jest.fn(() => mockSchema),
      string: jest.fn(() => ({
        min: jest.fn().mockReturnThis(),
        trim: jest.fn().mockReturnThis(),
        optional: jest.fn().mockReturnThis(),
        nullable: jest.fn().mockReturnThis(),
        transform: jest.fn().mockReturnThis(),
        refine: jest.fn().mockReturnThis()
      })),
      ZodError: class ZodError extends Error {
        constructor(errors) {
          super('Validation failed');
          this.errors = errors;
        }
      }
    }
  };
});
jest.mock('multer', () => {
  const mockMulter = jest.fn(() => ({
    single: jest.fn(() => (req, res, next) => next())
  }));
  mockMulter.memoryStorage = jest.fn();
  return mockMulter;
});

const profileController = require('../../controller/profile.controller');
const User = require('../../models/Users');
const { z } = require('zod');
const multer = require('multer');

describe('Profile Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      user: { sub: 'user123' },
      params: {},
      file: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      set: jest.fn().mockReturnThis(),
      send: jest.fn(),
      redirect: jest.fn()
    };
    next = jest.fn();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const mockUser = { _id: 'user123', name: 'Test User', email: 'test@example.com' };
      User.findById.mockReturnValue({
        select: jest.fn(() => mockUser)
      });

      await profileController.getProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 if user not found', async () => {
      User.findById.mockReturnValue({
        select: jest.fn(() => null)
      });

      await profileController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'USER_NOT_FOUND' });
    });

    it('should handle errors', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('DB Error'))
      });

      await profileController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'FETCH_FAILED', message: 'DB Error' });
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const payload = {
        name: 'Updated Name',
        username: 'updateduser',
        phone: '0912345678',
        location: {
          provinceId: '01',
          wardId: '001',
          addressLine: '123 Test St'
        }
      };
      req.body = payload;
      const mockUpdatedUser = { ...payload, _id: 'user123' };

      z.object().parse.mockReturnValue(payload);
      User.findByIdAndUpdate.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUpdatedUser) });

      await profileController.updateProfile(req, res);

      expect(z.object().parse).toHaveBeenCalledWith(payload);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user123', {
        $set: {
          name: 'Updated Name',
          'location.provinceId': '01',
          'location.wardId': '001',
          'location.addressLine': '123 Test St',
          phone: '0912345678',
          username: 'updateduser'
        }
      }, { new: true });
      expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
    });

    it('should handle validation errors', async () => {
      const zodError = new z.ZodError([{ message: 'Invalid data' }]);
      z.object().parse.mockImplementation(() => { throw zodError; });

      await profileController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'VALIDATION_ERROR', message: 'Invalid data' });
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar successfully', async () => {
      req.file = { buffer: Buffer.from('test'), mimetype: 'image/jpeg' };
      const mockUser = { _id: 'user123', save: jest.fn() };
      User.findById.mockResolvedValue(mockUser);

      await profileController.uploadAvatar[1](req, res);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(mockUser.avatar).toEqual({
        data: Buffer.from('test'),
        contentType: 'image/jpeg'
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return 400 if no file', async () => {
      req.file = null;

      await profileController.uploadAvatar[1](req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'NO_FILE' });
    });
  });

  describe('deleteAvatar', () => {
    it('should delete avatar successfully', async () => {
      const mockUser = { _id: 'user123', avatar: { data: 'test' }, save: jest.fn() };
      User.findById.mockResolvedValue(mockUser);

      await profileController.deleteAvatar(req, res);

      expect(mockUser.avatar).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return 404 if no avatar', async () => {
      const mockUser = { _id: 'user123', save: jest.fn() };
      User.findById.mockResolvedValue(mockUser);

      await profileController.deleteAvatar(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'NO_AVATAR' });
    });
  });

  describe('getAvatar', () => {
    it('should return avatar data', async () => {
      req.params.userId = 'user123';
      const mockUser = { _id: 'user123', avatar: { data: Buffer.from('test'), contentType: 'image/jpeg' } };
      User.findById.mockResolvedValue(mockUser);

      await profileController.getAvatar(req, res);

      expect(res.set).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
      expect(res.send).toHaveBeenCalledWith(Buffer.from('test'));
    });

    it('should redirect to default avatar if no avatar data', async () => {
      req.params.userId = 'user123';
      const mockUser = { _id: 'user123', name: 'Test User' };
      User.findById.mockResolvedValue(mockUser);

      await profileController.getAvatar(req, res);

      expect(res.redirect).toHaveBeenCalled();
    });
  });
});