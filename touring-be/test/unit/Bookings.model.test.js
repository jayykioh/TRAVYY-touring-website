const Booking = require('../../models/Bookings');
const mongoose = require('mongoose');

// Mock mongoose
jest.mock('mongoose', () => ({
  Schema: jest.fn().mockImplementation((definition, options) => ({
    pre: jest.fn(),
    methods: {},
    statics: {},
    index: jest.fn(),
    _definition: definition,
    _options: options
  })),
  model: jest.fn().mockReturnValue({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    findByIdAndDelete: jest.fn()
  }),
  SchemaTypes: {
    ObjectId: jest.fn()
  },
  models: {}
}));

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

  it('should have required userId field', () => {
    const schemaDefinition = mongoose.Schema.mock.calls[0][0];

    expect(schemaDefinition.userId).toEqual({
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true
    });
  });

  it('should have items array with bookingItemSchema', () => {
    const schemaDefinition = mongoose.Schema.mock.calls[0][0];

    expect(schemaDefinition.items).toBeDefined();
    expect(Array.isArray(schemaDefinition.items)).toBe(true);
  });

  it('should have pricing fields', () => {
    const schemaDefinition = mongoose.Schema.mock.calls[0][0];

    expect(schemaDefinition.currency).toEqual({
      type: String,
      default: 'VND',
      enum: ['VND', 'USD']
    });

    expect(schemaDefinition.originalAmount).toEqual({
      type: Number,
      required: true
    });

    expect(schemaDefinition.discountAmount).toEqual({
      type: Number,
      default: 0
    });

    expect(schemaDefinition.totalAmount).toEqual({
      type: Number,
      required: true
    });
  });

  it('should have payment object with provider enum', () => {
    const schemaDefinition = mongoose.Schema.mock.calls[0][0];

    expect(schemaDefinition.payment.provider).toEqual({
      type: String,
      enum: ['paypal', 'momo', 'cash'],
      required: true
    });

    expect(schemaDefinition.payment.status).toEqual({
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending'
    });
  });

  it('should have booking status enum', () => {
    const schemaDefinition = mongoose.Schema.mock.calls[0][0];

    expect(schemaDefinition.status).toEqual({
      type: String,
      enum: ['pending', 'confirmed', 'paid', 'cancelled', 'refunded'],
      default: 'pending'
    });
  });

  it('should have orderRef field with unique sparse index', () => {
    const schemaDefinition = mongoose.Schema.mock.calls[0][0];

    expect(schemaDefinition.orderRef).toEqual({
      type: String,
      unique: true,
      sparse: true
    });
  });

  it('should have contactInfo object', () => {
    const schemaDefinition = mongoose.Schema.mock.calls[0][0];

    expect(schemaDefinition.contactInfo).toEqual({
      email: { type: String },
      phone: { type: String },
      fullName: { type: String }
    });
  });

  it('should have timestamps and virtuals enabled', () => {
    const schemaOptions = mongoose.Schema.mock.calls[0][1];

    expect(schemaOptions).toEqual({
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
    });
  });

  describe('Schema Indexes', () => {
    it('should create userId and createdAt index', () => {
      const schemaMock = mongoose.Schema.mock.results[0].value;

      expect(schemaMock.index).toHaveBeenCalledWith({ userId: 1, createdAt: -1 });
    });

    it('should create payment orderId index', () => {
      const schemaMock = mongoose.Schema.mock.results[0].value;

      expect(schemaMock.index).toHaveBeenCalledWith({ 'payment.orderId': 1 });
    });

    it('should create payment transactionId index', () => {
      const schemaMock = mongoose.Schema.mock.results[0].value;

      expect(schemaMock.index).toHaveBeenCalledWith({ 'payment.transactionId': 1 });
    });

    it('should create status and createdAt index', () => {
      const schemaMock = mongoose.Schema.mock.results[0].value;

      expect(schemaMock.index).toHaveBeenCalledWith({ status: 1, createdAt: -1 });
    });
  });

  describe('Instance Methods', () => {
    let mockBooking;

    beforeEach(() => {
      mockBooking = {
        orderRef: null,
        status: 'pending',
        payment: {
          status: 'pending',
          paidAt: null
        },
        generateOrderRef: jest.fn(),
        markAsPaid: jest.fn(),
        isPaymentExpired: jest.fn()
      };
    });

    it('should have generateOrderRef method', () => {
      // Method should exist (tested via schema.methods)
      const schemaMock = mongoose.Schema.mock.results[0].value;
      expect(schemaMock.methods.generateOrderRef).toBeDefined();
    });

    it('should have markAsPaid method', () => {
      const schemaMock = mongoose.Schema.mock.results[0].value;
      expect(schemaMock.methods.markAsPaid).toBeDefined();
    });

    it('should have isPaymentExpired method', () => {
      const schemaMock = mongoose.Schema.mock.results[0].value;
      expect(schemaMock.methods.isPaymentExpired).toBeDefined();
    });
  });

  describe('Static Methods', () => {
    it('should have findByOrderId static method', () => {
      const schemaMock = mongoose.Schema.mock.results[0].value;
      expect(schemaMock.statics.findByOrderId).toBeDefined();
    });

    it('should have findByTransactionId static method', () => {
      const schemaMock = mongoose.Schema.mock.results[0].value;
      expect(schemaMock.statics.findByTransactionId).toBeDefined();
    });
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