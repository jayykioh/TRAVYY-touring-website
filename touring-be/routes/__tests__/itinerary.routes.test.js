const express = require('express');
const request = require('supertest');

// Mock authJwt to inject a user
jest.mock('../../middlewares/authJWT', () => (req, res, next) => {
  req.user = { sub: 'test-user' };
  return next();
});

// Mock Itinerary model with an internal fake document (avoid referencing out-of-scope vars)
jest.mock('../../models/Itinerary', () => {
  const doc = {
    _id: 'it1',
    items: [
      { poiId: 'p1', location: { lat: 10.0, lng: 106.0 }, name: 'A' },
      { poiId: 'p2', location: { lat: 10.1, lng: 106.1 }, name: 'B' },
    ],
    preferences: { bestTime: 'anytime' },
    save: jest.fn().mockResolvedValue(true),
    toObject() { return { ...this }; },
  };
  return {
    findOne: jest.fn(() => Promise.resolve(doc)),
  };
});

// Mock goong tripV2
jest.mock('../../services/ai/libs/goong', () => ({
  tripV2: jest.fn(async (points, opts) => ({
    trips: [
      {
        distance: 20000, // meters
        duration: 3600, // seconds
        geometry: 'encoded-polyline',
        legs: [
          { distance: 10000, duration: 1800 },
          { distance: 10000, duration: 1800 },
        ],
      },
    ],
  })),
}));

// Mock background AI generator to avoid actual LLM calls
jest.mock('../../services/itinerary/optimizer', () => ({
  generateAIInsightsAsync: jest.fn().mockResolvedValue(true),
  buildItineraryPrompt: jest.requireActual('../../services/itinerary/optimizer').buildItineraryPrompt,
  callLLMAndParse: jest.requireActual('../../services/itinerary/optimizer').callLLMAndParse,
}));

// We'll require the mocked modules inside the test after router is loaded to ensure
// jest.resetModules() in beforeEach doesn't invalidate references.

describe('POST /api/itinerary/:id/optimize-ai', () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    const router = require('../itinerary.routes');
    app.use('/api/itinerary', router);
  });

  test('optimizes route and returns itinerary with aiProcessing=true', async () => {
    // Itinerary.findOne is mocked by the module factory to return a fake doc

    const res = await request(app)
      .post('/api/itinerary/it1/optimize-ai')
      .send()
      .expect(200);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('itinerary');
    const it = res.body.itinerary;
    expect(it).toHaveProperty('isOptimized', true);
    expect(it).toHaveProperty('aiProcessing', true);
    expect(it).toHaveProperty('routePolyline');

    // tripV2 and background AI should have been invoked by the route; require them
    // after router is loaded so we get the mocked references
    const { tripV2 } = require('../../services/ai/libs/goong');
    const { generateAIInsightsAsync } = require('../../services/itinerary/optimizer');

    expect(tripV2).toHaveBeenCalled();
    expect(generateAIInsightsAsync).toHaveBeenCalledWith(expect.anything(), expect.any(Object), expect.any(Object));
  });
});
