// Mock dependencies before requiring the controller
const mockSession = {
  withTransaction: jest.fn(),
  endSession: jest.fn(),
};

const mockFindResult = {
  sort: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  session: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),
  then: jest.fn().mockImplementation((resolve) => resolve([])),
  catch: jest.fn(),
};

jest.mock('../../models/Carts', () => {
  const Cart = jest.fn().mockImplementation(() => ({ save: jest.fn() }));
  Cart.findOne = jest.fn(() => ({
    session: jest.fn().mockResolvedValue(null)
  }));
  Cart.create = jest.fn().mockResolvedValue({ _id: 'newCart', userId: 'user123' });

  return {
    Cart,
    CartItem: {
      find: jest.fn(() => mockFindResult),
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
      deleteOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
    },
  };
});

const mockTourQuery = {
  lean: jest.fn().mockResolvedValue(null),
};

jest.mock('../../models/Tours', () => ({
  findById: jest.fn(() => mockTourQuery),
}));

const cartController = require('../../controller/cart.controller');

// Get references to the mocked functions
const { Cart, CartItem } = require('../../models/Carts');
const Tour = require('../../models/Tours');
const mongoose = require('mongoose');

describe('Cart Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: { sub: 'user123' },
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Clear all mocks
    jest.clearAllMocks();

    // Setup default mocks
    mockSession.withTransaction.mockImplementation(async (fn) => await fn());
    mockFindResult.exec.mockResolvedValue([]);
    mockFindResult.then.mockImplementation((resolve) => resolve([]));
    Tour.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
  });

  describe('getCart', () => {
    it('should return user cart with enriched items', async () => {
      const cartData = { _id: 'cart123', userId: 'user123' };
      const mockItems = [
        {
          _id: 'item1',
          cartId: 'cart123',
          tourId: 'tour123',
          date: '2024-01-15',
          adults: 2,
          children: 1,
          unitPriceAdult: 100,
          unitPriceChild: 50,
          unitOriginalAdult: null,
          unitOriginalChild: null,
          name: 'Test Tour',
          image: 'test.jpg',
          selected: true,
          available: true
        }
      ];

      const tourData = {
        departures: [{
          date: '2024-01-15',
          seatsLeft: 20,
          seatsTotal: 30
        }]
      };

      Cart.findOne.mockReturnValue({
        session: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation((resolve) => resolve(cartData))
      });
      mockFindResult.exec.mockResolvedValue(mockItems);
      mockFindResult.then.mockImplementation((resolve) => resolve(mockItems));
      Tour.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(tourData) });

      await cartController.getCart(req, res);

      expect(Cart.findOne).toHaveBeenCalledWith({ userId: 'user123' });
      expect(CartItem.find).toHaveBeenCalledWith({ cartId: 'cart123' });
      expect(res.json).toHaveBeenCalledWith({
        items: [{
          itemId: 'item1',
          id: 'tour123',
          name: 'Test Tour',
          date: '2024-01-15',
          adults: 2,
          children: 1,
          adultPrice: 100,
          childPrice: 50,
          adultOriginalPrice: null,
          childOriginalPrice: null,
          selected: true,
          available: true,
          image: 'test.jpg',
          seatsLeft: 20,
          seatsTotal: 30
        }]
      });
    });

    it('should create cart if not exists', async () => {
      Cart.findOne.mockReturnValue({
        session: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation((resolve) => resolve(null))
      });
      Cart.create.mockResolvedValue({ _id: 'newCart', userId: 'user123' });
      mockFindResult.then.mockImplementation((resolve) => resolve([]));

      await cartController.getCart(req, res);

      expect(Cart.create).toHaveBeenCalledWith({ userId: 'user123' });
      expect(res.json).toHaveBeenCalledWith({ items: [] });
    });

    it('should handle database errors', async () => {
      Cart.findOne.mockReturnValue({
        session: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation((resolve, reject) => reject(new Error('Database error')))
      });

      await cartController.getCart(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'GET_CART_FAILED' });
    });
  });

  describe('syncCart', () => {
    it('should merge local cart items with existing cart', async () => {
      const mockCart = { _id: 'cart123', userId: 'user123' };
      const existingItems = [
        { tourId: 'existingTour', date: '2024-01-15', adults: 1, children: 0 }
      ];

      const mockTour = {
        title: 'New Tour',
        imageItems: [{ imageUrl: 'new.jpg' }],
        departures: [{
          date: '2024-01-16',
          priceAdult: 150,
          priceChild: 75
        }]
      };

      Cart.findOne.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockCart)
      });
      mockFindResult.exec.mockResolvedValue(existingItems);
      mockTourQuery.lean.mockResolvedValue(mockTour);
      CartItem.findOne.mockResolvedValue(null); // new item
      CartItem.create.mockResolvedValue({ _id: 'newItem' });

      req.body.items = [{
        tourId: '507f1f77bcf86cd799439011',
        date: '2024-01-16',
        adults: 2,
        children: 1,
        selected: true,
        available: true,
        name: 'Local Tour',
        image: 'local.jpg'
      }];

      await cartController.syncCart(req, res);

      expect(CartItem.create).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle invalid tour IDs', async () => {
      const mockCart = { _id: 'cart123', userId: 'user123' };
      Cart.findOne.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockCart)
      });
      mockFindResult.exec.mockResolvedValue([]);

      req.body.items = [{
        tourId: 'invalid-id',
        date: '2024-01-15',
        adults: 1,
        children: 0
      }];

      await cartController.syncCart(req, res);

      // Should skip invalid items and return cart
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('addToCart', () => {
    it('should add item to cart with capacity check', async () => {
      const mockCart = { _id: 'cart123', userId: 'user123' };
      const mockTour = {
        departures: [{
          date: '2024-01-15',
          priceAdult: 100,
          priceChild: 50,
          seatsLeft: 10
        }]
      };

      Cart.findOne.mockReturnValue({
        session: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation((resolve) => resolve(mockCart))
      });
      mockTourQuery.lean.mockResolvedValue(mockTour);
      CartItem.findOne.mockReturnValue({
        session: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation((resolve) => resolve(null))
      });
      CartItem.findOneAndUpdate.mockResolvedValue({ _id: 'newItem' });

      req.body = {
        tourId: '507f1f77bcf86cd799439011',
        date: '2024-01-15',
        adults: 2,
        children: 1
      };

      await cartController.addToCart(req, res);

      expect(CartItem.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ cartId: 'cart123', date: '2024-01-15' }),
        expect.objectContaining({
          $setOnInsert: expect.objectContaining({
            selected: true,
            available: true
          }),
          $inc: { adults: 2, children: 1 }
        }),
        expect.any(Object)
      );
    });

    it('should return error for missing tour or date', async () => {
      req.body = { adults: 1, children: 0 };

      await cartController.addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'MISSING_TOUR_OR_DATE' });
    });

    it('should return error for invalid quantity', async () => {
      mockTourQuery.lean.mockResolvedValue({
        departures: [{
          date: '2024-01-15',
          seatsLeft: 10
        }]
      });

      req.body = {
        tourId: '507f1f77bcf86cd799439011',
        date: '2024-01-15',
        adults: -1,
        children: 0
      };

      await cartController.addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'INVALID_QUANTITY' });
    });

    it('should return error when exceeding capacity', async () => {
      const mockCart = { _id: 'cart123', userId: 'user123' };
      const mockTour = {
        departures: [{
          date: '2024-01-15',
          seatsLeft: 5
        }]
      };

      Cart.findOne.mockReturnValue({
        session: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation((resolve) => resolve(mockCart))
      });
      Tour.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockTour) });
      CartItem.findOne.mockReturnValue({
        session: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation((resolve) => resolve({ adults: 3, children: 2 }))
      });

      req.body = {
        tourId: '507f1f77bcf86cd799439011',
        date: '2024-01-15',
        adults: 3,
        children: 3
      };

      await cartController.addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: 'EXCEEDS_DEPARTURE_CAPACITY',
        limit: 5
      });
    });
  });

  describe('updateCartItem', () => {
    it('should update cart item quantities', async () => {
      const mockCart = { _id: 'cart123', userId: 'user123' };
      const mockItem = {
        _id: 'item123',
        cartId: 'cart123',
        tourId: 'tour123',
        date: '2024-01-15',
        adults: 2,
        children: 1,
        save: jest.fn()
      };

      Cart.findOne.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockCart)
      });
      CartItem.findOne.mockResolvedValue(mockItem);
      mockTourQuery.lean.mockResolvedValue({
        departures: [{
          date: '2024-01-15',
          priceAdult: 100,
          priceChild: 50,
          seatsLeft: 10
        }]
      });

      req.params.itemId = 'item123';
      req.body = { adults: 3, children: 2, selected: false };

      await cartController.updateCartItem(req, res);

      expect(mockItem.adults).toBe(3);
      expect(mockItem.children).toBe(2);
      expect(mockItem.selected).toBe(false);
    });

    it('should return error for item not found', async () => {
      const mockCart = { _id: 'cart123', userId: 'user123' };

      Cart.findOne.mockResolvedValue(mockCart);
      CartItem.findOne.mockResolvedValue(null);

      req.params.itemId = 'nonexistent';

      await cartController.updateCartItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'ITEM_NOT_FOUND' });
    });
  });

  describe('deleteCartItem', () => {
    it('should delete cart item successfully', async () => {
      const mockCart = { _id: 'cart123', userId: 'user123' };
      const mockItem = { _id: 'item123', cartId: 'cart123' };

      Cart.findOne.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockCart)
      });
      CartItem.findOne.mockResolvedValue(mockItem);
      CartItem.deleteOne.mockResolvedValue({ deletedCount: 1 });
      mockFindResult.exec.mockResolvedValue([]);

      req.params.itemId = 'item123';

      await cartController.deleteCartItem(req, res);

      expect(CartItem.deleteOne).toHaveBeenCalledWith({ _id: 'item123' });
      expect(res.json).toHaveBeenCalledWith({ items: [] });
    });

    it('should return error for item not found', async () => {
      const mockCart = { _id: 'cart123', userId: 'user123' };

      Cart.findOne.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockCart)
      });
      CartItem.findOne.mockResolvedValue(null);

      req.params.itemId = 'nonexistent';

      await cartController.deleteCartItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'ITEM_NOT_FOUND' });
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      const mockCart = { _id: 'cart123', userId: 'user123' };

      Cart.findOne.mockResolvedValue(mockCart);
      CartItem.deleteMany.mockResolvedValue({ deletedCount: 5 });

      await cartController.clearCart(req, res);

      expect(CartItem.deleteMany).toHaveBeenCalledWith({ cartId: 'cart123' });
      expect(res.json).toHaveBeenCalledWith({ items: [] });
    });
  });
});
