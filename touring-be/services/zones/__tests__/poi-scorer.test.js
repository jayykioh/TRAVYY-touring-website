const { scorePOI } = require('../poi-scorer');

describe('poi-scorer', () => {
  test('returns invalid data when inputs missing', () => {
    const out = scorePOI(null, null, []);
    expect(out.matchScore).toBe(0);
    expect(out.distanceKm).toBe(999);
    expect(Array.isArray(out.reasons)).toBe(true);
    expect(out.reasons[0]).toMatch(/invalid data/);
  });

  test('distance influences score and reasons', () => {
    const poi = { name: 'Near Cafe', types: ['cafe'], loc: { lat: 0.0, lng: 0.0 }, rating: 4.2 };
    const zone = { center: { lat: 0.0, lng: 0.005 }, vibeKeywords: [] };
    const out = scorePOI(poi, zone, []);
    // distance should be small (<1km)
    expect(out.distanceKm).toBeLessThan(1.5);
    expect(out.reasons).toContain('very close' || 'nearby');
    expect(out.matchScore).toBeGreaterThan(0.5);
  });

  test('vibe matching and rating bonus', () => {
    const poi = { name: 'Sunny Beach Cafe', types: ['beach', 'cafe'], loc: { lat: 10, lng: 10 }, rating: 4.6 };
    const zone = { center: { lat: 10.01, lng: 10.01 }, vibeKeywords: ['beach'] };
    const out = scorePOI(poi, zone, ['beach', 'food']);
    expect(out.reasons).toEqual(expect.arrayContaining([expect.stringMatching(/matches|in name|excellent rating/)]));
    expect(out.matchScore).toBeGreaterThan(0.7);
  });
});
