const { buildGpx, safeFilename } = require('../../utils/gpx');

describe('gpx utilities', () => {
  test('buildGpx includes header and waypoints and track', () => {
    const g = buildGpx({
      name: 'My Route',
      trackPoints: [[10.0, 106.0], [10.01, 106.01]],
      waypoints: [{ lat: 10.0, lng: 106.0, name: 'A', desc: 'Desc' }]
    });

    expect(g).toContain('<?xml');
    expect(g).toContain('<name>My Route</name>');
    expect(g).toContain('<wpt lat="10" lon="106">');
    expect(g).toContain('<trkpt lat="10" lon="106"></trkpt>');
  });

  test('safeFilename strips diacritics and returns ascii and utf8Star', () => {
    const s = safeFilename('Hành trình & đặc biệt/ê');
    expect(s.ascii).toBeTruthy();
    expect(typeof s.utf8Star).toBe('string');
    expect(s.utf8Star).toContain('%');
  });
});
