const Booking = require('../../models/Bookings');
const mongoose = require('mongoose');

// Improved mock mongoose for full schema and model support
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  // Always provide a working ObjectId mock
  const ObjectId = function ObjectIdMock() { return 'mock-object-id'; };
  return {
    ...actualMongoose,
    Schema: jest.fn().mockImplementation((definition, options) => {
      return {
        pre: jest.fn(),
        methods: {},
        statics: {},
        index: jest.fn(),
        add: jest.fn(),
        _definition: definition,
        _options: options
      };
    }),
    model: jest.fn().mockImplementation((name, schema, collection) => {
      return {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findOneAndUpdate: jest.fn(),
        deleteOne: jest.fn(),
        findByIdAndDelete: jest.fn(),
        updateOne: jest.fn(),
        populate: jest.fn(),
        collection: collection || name.toLowerCase() + 's',
        schema: schema
      };
    }),
    SchemaTypes: {
      ObjectId
    },
    Types: actualMongoose.Types,
    models: {},
  };
});

describe('Booking Model', () => {
  let bookingSchema;

  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();

    // Reset the module to trigger re-execution
    jest.resetModules();

    // Re-require the model to get fresh mocks
    require('../../models/Bookings');
  });

  it('should export a mongoose model', () => {
    expect(mongoose.model).toHaveBeenCalledWith('Booking', expect.any(Object));
  });


  describe('Model Operations (Mocked)', () => {
    let mockBookingModel;

    beforeEach(() => {
      mockBookingModel = mongoose.model.mock.results[0].value;
    });

    it('should support finding bookings', async () => {
      const mockBookings = [
        { _id: 'booking1', userId: 'user1', status: 'paid' },
        { _id: 'booking2', userId: 'user2', status: 'pending' }
      ];

      mockBookingModel.find.mockResolvedValue(mockBookings);

      const result = await Booking.find();

      expect(result).toEqual(mockBookings);
      expect(mockBookingModel.find).toHaveBeenCalled();
    });

    it('should support finding booking by id', async () => {
      const mockBooking = { _id: 'booking1', userId: 'user1', status: 'paid' };

      mockBookingModel.findById.mockResolvedValue(mockBooking);

      const result = await Booking.findById('booking1');

      expect(result).toEqual(mockBooking);
      expect(mockBookingModel.findById).toHaveBeenCalledWith('booking1');
    });

    it('should support creating bookings', async () => {
      const bookingData = {
        userId: 'user1',
        items: [{ tourId: 'tour1', adults: 2 }],
        totalAmount: 200
      };
      const mockCreatedBooking = { _id: 'booking3', ...bookingData };

      mockBookingModel.create.mockResolvedValue(mockCreatedBooking);

      const result = await Booking.create(bookingData);

      expect(result).toEqual(mockCreatedBooking);
      expect(mockBookingModel.create).toHaveBeenCalledWith(bookingData);
    });

    it('should support updating bookings', async () => {
      const updateData = { status: 'paid' };
      const mockUpdatedBooking = { _id: 'booking1', status: 'paid' };

      mockBookingModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedBooking);

      const result = await Booking.findByIdAndUpdate('booking1', updateData);

      expect(result).toEqual(mockUpdatedBooking);
      expect(mockBookingModel.findByIdAndUpdate).toHaveBeenCalledWith('booking1', updateData);
    });

    it('should support finding by order ID', async () => {
      const mockBooking = { _id: 'booking1', payment: { orderId: 'order123' } };

      mockBookingModel.findOne.mockResolvedValue(mockBooking);

      const result = await Booking.findByOrderId('order123');

      expect(result).toEqual(mockBooking);
      expect(mockBookingModel.findOne).toHaveBeenCalledWith({ 'payment.orderId': 'order123' });
    });

    it('should support finding by transaction ID', async () => {
      const mockBooking = { _id: 'booking1', payment: { transactionId: 'txn123' } };

      mockBookingModel.findOne.mockResolvedValue(mockBooking);

      const result = await Booking.findByTransactionId('txn123');

      expect(result).toEqual(mockBooking);
      expect(mockBookingModel.findOne).toHaveBeenCalledWith({ 'payment.transactionId': 'txn123' });
    });
  });
});