const { scoreZone } = require('../scorer');

describe('scorer', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('scoreZone: gives boost for vibe matches and penalizes avoids', () => {
    // Arrange
    const zone = {
      name: 'Beautiful Beach',
      description: 'A lovely beach with seafood and sunset views',
      tags: ['beach', 'photo'],
      vibes: ['beach', 'sunset'],
      rating: 4.5
    };

    const prefs = {
      vibes: ['beach', 'photo'],
      avoid: ['crowded'],
      keywords: [],
      _rawText: 'I want beach and photo'
    };

    // Act
    const res = scoreZone(zone, prefs);

    // Assert
    expect(typeof res.score).toBe('number');
    expect(res.score).toBeGreaterThan(0);
    expect(res.details.matchedVibes.length).toBeGreaterThan(0);
    expect(Array.isArray(res.reasons)).toBe(true);
  });

  test('scoreZone: penalty applied when avoid matches zone text', () => {
    // Arrange
    const zone = {
      name: 'Noisy Market',
      description: 'Crowded market with many stalls',
      tags: ['shopping']
    };

    const prefs = {
      vibes: [],
      avoid: ['crowded'],
      keywords: [],
      _rawText: ''
    };

    // Act
    const res = scoreZone(zone, prefs);

    // Assert
    expect(res.details.matchedAvoids.length).toBeGreaterThanOrEqual(1);
    expect(res.score).toBeGreaterThanOrEqual(0);
  });
});
