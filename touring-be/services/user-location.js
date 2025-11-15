const { getProvinceCoordinates } = require('../utils/vietnam-provinces');

function getUserLocation(user, requestBody) {
  if (requestBody && requestBody.userLocation) {
    const { lat, lng } = requestBody.userLocation;
    if (lat && lng) {
      console.log(`📍 Using precise GPS location: (${lat}, ${lng})`);
      return {
        lat,
        lng,
        source: 'gps',
        accuracy: 'precise' 
      };
    }
  }
  // Priority 2: Province-based approximate location from profile
  if (user && user.location) {
    const { provinceId, provinceName } = user.location;
    
    // Try to get province coordinates
    const provinceData = getProvinceCoordinates(provinceId || provinceName);
    
    if (provinceData) {
      console.log(`📍 Using profile province location: ${provinceData.name} (${provinceData.lat}, ${provinceData.lng})`);
      return {
        lat: provinceData.lat,
        lng: provinceData.lng,
        source: 'profile',
        accuracy: 'province', // Accurate to province center (~50-100km radius)
        provinceName: provinceData.name,
        region: provinceData.region
      };
    }
  }

  // Priority 3: No location available
  console.log('ℹ️ No user location available');
  return null;
}
module.exports = {
  getUserLocation,
};
