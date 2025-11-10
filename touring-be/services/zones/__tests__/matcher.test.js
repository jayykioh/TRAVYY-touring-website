// Tests for matcher.getMatchingZones
const path = require('path');

// Mock the embedding-client used by matcher
jest.mock('../../ai/libs/embedding-client', () => ({
  isAvailable: jest.fn(),
  hybridSearch: jest.fn()
}));

// We'll mock the Zone model module that matcher requires
jest.mock('../../../models/Zones', () => ({
  find: jest.fn()
}));

const { isAvailable, hybridSearch } = require('../../ai/libs/embedding-client');
const Zone = require('../../../models/Zones');
const { getMatchingZones } = require('../matcher');

describe('matcher.getMatchingZones', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('uses embedding path when service available and maps hits to DB zones', async () => {
    // Arrange
    isAvailable.mockResolvedValue(true);
    hybridSearch.mockResolvedValue({
      hits: [ { id: 'z1', score: 0.9, vibe_matches: ['beach'] } ],
      strategy: 'hybrid'
    });

    // DB returns the matching zone record (mock chainable query with .lean())
    Zone.find.mockReturnValue({
      lean: async () => [
        { id: 'z1', name: 'Zone One', description: 'nice beach', tags: ['beach'], isActive: true }
      ]
    });

    const prefs = { _rawText: 'beach', vibes: ['beach'], avoid: [] };

    // Act
    const res = await getMatchingZones(prefs, { useEmbedding: true });

    // Assert
    expect(isAvailable).toHaveBeenCalled();
    expect(hybridSearch).toHaveBeenCalledWith(expect.objectContaining({ free_text: expect.any(String) }));
  expect(Zone.find).toHaveBeenCalledWith(expect.objectContaining({ id: { $in: ['z1'] }, isActive: true }));
    expect(res.strategy).toBe('embedding');
    expect(Array.isArray(res.zones)).toBe(true);
    expect(res.zones[0].embedScore).toBeCloseTo(0.9);
  });

  test('falls back to keyword matching when embedding is down', async () => {
    // Arrange
    isAvailable.mockResolvedValue(false);
    // Keyword path: Zone.find should return candidate zones (mock chainable query)
    Zone.find.mockReturnValue({
      lean: async () => [
        { id: 'a', name: 'Calm Town', description: 'quiet peaceful spot', tags: ['nature'], isActive: true },
        { id: 'b', name: 'Crowded Mall', description: 'very crowded', tags: ['shopping'], isActive: true }
      ]
    });

    const prefs = { _rawText: 'quiet', vibes: ['nature'], avoid: ['crowded'] };

    // Act
    const res = await getMatchingZones(prefs, { useEmbedding: true });

    // Assert
    expect(isAvailable).toHaveBeenCalled();
    expect(res.strategy).toBe('keyword');
    // Ensure avoid filter removed the crowded zone
    expect(res.zones.some(z => z.name === 'Crowded Mall')).toBe(false);
  });
});
