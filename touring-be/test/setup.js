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
    ObjectId: jest.fn(),
  };

  return {
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
    Schema: MockSchema,
    model: jest.fn(),
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