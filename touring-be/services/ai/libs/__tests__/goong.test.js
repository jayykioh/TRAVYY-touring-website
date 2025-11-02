jest.mock('axios');
const axios = require('axios');
const goong = require('../goong');

describe('goong lib - core helpers', () => {
  test('calculateDistance (haversine) returns non-zero for distant points', () => {
    const a = { lat: 10.0, lng: 106.0 };
    const b = { lat: 21.0, lng: 105.8 };
    const km = goong.calculateDistance(a, b);
    expect(typeof km).toBe('number');
    expect(km).toBeGreaterThan(0);
  });

  test('tripV2 throws when fewer than 2 points', async () => {
    await expect(goong.tripV2([[106.0, 10.0]])).rejects.toThrow(/Trip requires at least 2 points/);
  });

  test('tripV2 returns data when axios responds with trips', async () => {
    const fakeData = {
      code: 'Ok',
      trips: [
        { distance: 12345, duration: 1800, geometry: 'geom', legs: [] }
      ],
      waypoints: []
    };
    axios.get.mockResolvedValue({ status: 200, data: fakeData });

    const pts = [ [106.0, 10.0], [106.1, 10.1] ];
    const res = await goong.tripV2(pts, { vehicle: 'car', roundtrip: false });
    expect(res).toHaveProperty('trips');
    expect(res.trips[0].distance).toBe(12345);
  });

  test('searchNearbyPOIs combines autocomplete + details into POI objects', async () => {
    // Mock axios.get to return autocomplete predictions and detail results
    const prediction = {
      place_id: 'p1',
      structured_formatting: { main_text: 'Place One', secondary_text: 'Addr 1' },
      description: 'Place One - Addr 1',
      types: ['restaurant']
    };

    const detail = {
      geometry: { location: { lat: 10.5, lng: 106.5 } },
      name: 'Place One',
      formatted_address: 'Addr 1',
      rating: 4.2,
      types: ['restaurant']
    };

    axios.get.mockImplementation(async (url) => {
      if (url.includes('/place/autocomplete')) {
        return { status: 200, data: { predictions: [prediction] } };
      }
      if (url.includes('/place/detail')) {
        return { status: 200, data: { result: detail } };
      }
      return { status: 200, data: {} };
    });

    const pois = await goong.searchNearbyPOIs(10.5, 106.5, 1000, { vibes: ['food'], limit: 5 });
    expect(Array.isArray(pois)).toBe(true);
    expect(pois.length).toBeGreaterThanOrEqual(1);
    expect(pois[0]).toHaveProperty('place_id', 'p1');
    expect(pois[0]).toHaveProperty('lat', 10.5);
    expect(pois[0]).toHaveProperty('lng', 106.5);
  });
});
