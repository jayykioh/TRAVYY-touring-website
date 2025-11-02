const express = require('express');
const request = require('supertest');

// Mock services used by the route
jest.mock('../../services/ai', () => ({
  parsePreferences: jest.fn()
}));

jest.mock('../../services/zones', () => ({
  getMatchingZones: jest.fn()
}));

const { parsePreferences } = require('../../services/ai');
const { getMatchingZones } = require('../../services/zones');

const discoverRouter = require('../discover.routes');

describe('POST /api/discover/parse', () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/discover', discoverRouter);
  });

  test('returns parsed prefs and matched zones (happy path)', async () => {
    // Arrange
    const fakePrefs = { vibes: ['beach'], avoid: [], _rawText: 'beach' };
    parsePreferences.mockResolvedValue(fakePrefs);

    const fakeZones = { strategy: 'keyword', zones: [{ id: 'z1', name: 'Zone 1' }], reason: 'Found 1' };
    getMatchingZones.mockResolvedValue(fakeZones);

    // Act
    const res = await request(app)
      .post('/api/discover/parse')
      .send({ text: 'I want beach and food' })
      .expect(200);

    // Assert
    expect(parsePreferences).toHaveBeenCalledWith(expect.any(String));
    expect(getMatchingZones).toHaveBeenCalledWith(expect.objectContaining({ vibes: expect.any(Array) }), expect.objectContaining({ province: undefined, useEmbedding: true }));
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('prefs');
    expect(res.body).toHaveProperty('strategy');
    expect(Array.isArray(res.body.zones)).toBe(true);
  });
});
