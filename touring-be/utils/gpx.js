// utils/gpx.js
const dayjs = require('dayjs');

/** Escape XML special chars */
function escapeXml(s = '') {
  return String(s).replace(/[<>&'"]/g, c => (
    { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]
  ));
}

/** GPX header */
function gpxHeader(name = 'Route', creator = 'Travyy/DUFDUF') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="${creator}" xmlns="http://www.topografix.com/GPX/1/1"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 
     http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXml(name)}</name>
    <time>${dayjs().toISOString()}</time>
  </metadata>
`;
}

/** Waypoints (POIs) */
function gpxWaypoints(waypoints = []) {
  return waypoints.map(w =>
`  <wpt lat="${w.lat}" lon="${w.lng}">
    <name>${escapeXml(w.name || 'POI')}</name>
    ${w.desc ? `<desc>${escapeXml(w.desc)}</desc>` : ''}
  </wpt>`).join('\n');
}

/** Track (route line) */
function gpxTrack(points, name = 'Itinerary Track') {
  const seg = points.map(([lat, lon]) =>
    `      <trkpt lat="${lat}" lon="${lon}"></trkpt>`
  ).join('\n');
  return `  <trk>
    <name>${escapeXml(name)}</name>
    <trkseg>
${seg}
    </trkseg>
  </trk>
`;
}

/** Build GPX */
function buildGpx({ name, trackPoints, waypoints }) {
  return gpxHeader(name) + gpxWaypoints(waypoints) + gpxTrack(trackPoints, name) + '</gpx>\n';
}

/** Safe filename for Content-Disposition */
function safeFilename(raw, fallback = 'route') {
  const base = String(raw || '').replace(/[\r\n]/g, ' ').trim();
  const ascii =
    base
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
      .replace(/[^A-Za-z0-9._-]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 60) || fallback;

  const utf8Star = encodeURIComponent(base || ascii);
  return { ascii, utf8Star };
}

module.exports = { buildGpx, safeFilename };
