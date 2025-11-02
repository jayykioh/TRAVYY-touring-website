const express = require('express');

// Mock Zone model (factory returns a document)
jest.mock('../../../models/Zones', () => {
  const zone = {
    id: 'zone1',
    name: 'Test Zone',
    center: { lat: 10.0, lng: 106.0 },
    radiusM: 5000,
    polygon: [],
  };
  return {
    findOne: jest.fn(() => ({ lean: () => Promise.resolve(zone) })),
  };
});

// Mock map4d search function
jest.mock('../../ai/libs/map4d', () => ({
  searchPOIsByText: jest.fn(async (lat, lng, radiusM, opts) => {
    // Return different results depending on query to simulate multiple queries
    if ((opts.query || '').toLowerCase().includes('food')) {
      return [
        { id: 'p1', place_id: 'p1', name: 'Food Place', lat: 10.001, lng: 106.001, loc: { lat: 10.001, lng: 106.001 }, types: ['restaurant'], rating: 4.2 },
        { id: 'p2', place_id: 'p2', name: 'Cafe Spot', lat: 10.002, lng: 106.002, loc: { lat: 10.002, lng: 106.002 }, types: ['cafe'], rating: 4.0 },
      ];
    }

    return [
      { id: 'p3', place_id: 'p3', name: 'Sight Spot', lat: 10.01, lng: 106.01, loc: { lat: 10.01, lng: 106.01 }, types: ['tourist_attraction'], rating: 4.5 },
      { id: 'p1', place_id: 'p1', name: 'Food Place', lat: 10.001, lng: 106.001, loc: { lat: 10.001, lng: 106.001 }, types: ['restaurant'], rating: 4.2 },
    ];
  }),
}));

describe('poi-finder.findPOIsByCategory', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('returns scored POIs without duplicates and respects limit', async () => {
    const { findPOIsByCategory } = require('../poi-finder');

    // Use a category key that exists in POI_CATEGORIES; choose 'food' which should be defined in project
    // If not present, the function will throw; for test we call with 'food'
    const results = await findPOIsByCategory('zone1', 'food', { limit: 3 });

    expect(Array.isArray(results)).toBe(true);
    // deduplication: p1 should appear only once
    const ids = results.map(r => r.place_id || r.id);
    const occurrences = ids.filter(id => id === 'p1').length;
    expect(occurrences).toBeLessThanOrEqual(1);
    // length should be <= limit
    expect(results.length).toBeLessThanOrEqual(3);
    // each result should have matchScore and distanceKm
    results.forEach(r => {
      expect(r).toHaveProperty('matchScore');
      expect(r).toHaveProperty('distanceKm');
    });
  });
});
