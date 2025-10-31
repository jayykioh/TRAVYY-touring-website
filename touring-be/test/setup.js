// test/setup.js
const mongoose = require('mongoose');

// Mock mongoose
jest.mock('mongoose', () => {
  const MockSchema = function(definition, options) {
    this.definition = definition;
    this.options = options;
    this.pre = jest.fn();
    this.post = jest.fn();
    this.index = jest.fn();
    this.methods = {};
    this.statics = {};
    this.virtual = jest.fn(() => ({
      get: jest.fn(),
      set: jest.fn(),
    }));
    this.set = jest.fn();
  };

  MockSchema.Types = {
    ObjectId: jest.fn(() => 'mockObjectId'),
    String: String,
    Number: Number,
    Date: Date,
    Boolean: Boolean,
  };

  MockSchema.prototype.startSession = jest.fn().mockReturnValue({
    withTransaction: jest.fn((fn) => fn()),
    endSession: jest.fn(),
  });

  const mockModel = jest.fn().mockImplementation((name, schema) => {
    const Model = jest.fn();
    Model.find = jest.fn(() => ({
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      session: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([])
    }));
    Model.findOne = jest.fn(() => ({
      populate: jest.fn().mockReturnThis(),
      session: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(null)
    }));
    Model.findById = jest.fn(() => ({
      populate: jest.fn().mockReturnThis(),
      session: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(null)
    }));
    Model.create = jest.fn();
    Model.findByIdAndUpdate = jest.fn();
    Model.findByIdAndDelete = jest.fn();
    Model.exists = jest.fn();
    Model.deleteOne = jest.fn();
    return Model;
  });

  return {
    Schema: MockSchema,
    Types: MockSchema.Types,
    model: mockModel,
    connect: jest.fn().mockResolvedValue({}),
    set: jest.fn(),
    createConnection: jest.fn(() => ({
      once: jest.fn(),
      model: jest.fn(),
    })),
    models: {},
    connection: {
      readyState: 1,
      on: jest.fn(),
      once: jest.fn(),
    },
    startSession: jest.fn().mockReturnValue({
      withTransaction: jest.fn((fn) => fn()),
      endSession: jest.fn(),
    }),
    Schema: MockSchema,
    model: mockModel,
  };
});

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(),
    verify: jest.fn((callback) => callback(null, true)),
  })),
}));

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
}));

// Mock passport
jest.mock('passport', () => ({
  use: jest.fn(),
  serializeUser: jest.fn(),
  deserializeUser: jest.fn(),
  initialize: jest.fn(() => (req, res, next) => next()),
  session: jest.fn(() => (req, res, next) => next()),
  authenticate: jest.fn(() => (req, res, next) => next()),
}));

// Mock express-session
jest.mock('express-session', () => jest.fn(() => (req, res, next) => next()));

// Mock connect-mongo
jest.mock('connect-mongo', () => ({
  create: jest.fn(() => ({})),
}));

// Set test environment variables
process.env.JWT_ACCESS_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test_session_secret';