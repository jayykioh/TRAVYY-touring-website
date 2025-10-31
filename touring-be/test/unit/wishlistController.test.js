// test/unit/wishlistController.test.js
const wishlistController = require('../../controller/wishlistController');

// Mock dependencies
jest.mock('../../models/Wishlist', () => ({
  find: jest.fn(() => ({
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue([])
  })),
  findOne: jest.fn(),
  create: jest.fn(),
  findOneAndDelete: jest.fn()
}));

jest.mock('../../models/Tours', () => ({
  findById: jest.fn()
}));

jest.mock('../../models/Location', () => ({}));

const Wishlist = require('../../models/Wishlist');
const Tour = require('../../models/Tours');

describe('Wishlist Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { sub: 'user123' },
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getMyWishlist', () => {
    it('should return user wishlist', async () => {
      const mockItems = [
        {
          _id: 'item1',
          tourId: { title: 'Tour 1', description: 'Desc' },
          userId: 'user123'
        }
      ];

      Wishlist.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockItems)
      });

      await wishlistController.getMyWishlist(req, res);

      expect(Wishlist.find).toHaveBeenCalledWith({ userId: expect.any(Object) });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockItems
      });
    });
  });

  describe('addToWishlist', () => {
    it('should add tour to wishlist', async () => {
      const mockTour = { _id: 'tour123', title: 'Test Tour' };
      const mockWishlistItem = { _id: 'item123', userId: 'user123', tourId: 'tour123' };

      Tour.findById.mockResolvedValue(mockTour);
      Wishlist.findOne.mockResolvedValue(null);
      Wishlist.create.mockResolvedValue(mockWishlistItem);

      req.body.tourId = 'tour123';

      await wishlistController.addToWishlist(req, res);

      expect(Tour.findById).toHaveBeenCalledWith('tour123');
      expect(Wishlist.create).toHaveBeenCalledWith({
        userId: expect.any(Object),
        tourId: 'tour123'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Tour added to wishlist successfully',
        data: mockWishlistItem
      });
    });

    it('should return error if tour not found', async () => {
      Tour.findById.mockResolvedValue(null);

      req.body.tourId = 'invalid';

      await wishlistController.addToWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Tour not found'
      });
    });

    it('should return error if tour already in wishlist', async () => {
      const mockTour = { _id: 'tour123' };
      const existingItem = { _id: 'item123' };

      Tour.findById.mockResolvedValue(mockTour);
      Wishlist.findOne.mockResolvedValue(existingItem);

      req.body.tourId = 'tour123';

      await wishlistController.addToWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Tour already in wishlist'
      });
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove tour from wishlist', async () => {
      const mockItem = { _id: 'item123', userId: 'user123', tourId: 'tour123' };

      Wishlist.findOneAndDelete.mockResolvedValue(mockItem);

      req.params.tourId = 'tour123';

      await wishlistController.removeFromWishlist(req, res);

      expect(Wishlist.findOneAndDelete).toHaveBeenCalledWith({
        userId: expect.any(Object),
        tourId: 'tour123'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Tour removed from wishlist successfully'
      });
    });

    it('should return error if item not found', async () => {
      Wishlist.findOneAndDelete.mockResolvedValue(null);

      req.params.tourId = 'tour123';

      await wishlistController.removeFromWishlist(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Tour not found in wishlist'
      });
    });
  });
});