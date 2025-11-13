const PROVINCE_COORDINATES = {
  '01': { name: 'Hà Nội', lat: 21.0285, lng: 105.8542, region: 'north' },
  '31': { name: 'Hải Phòng', lat: 20.8449, lng: 106.6881, region: 'north' },
  '22': { name: 'Quảng Ninh', lat: 21.0064, lng: 107.2925, region: 'north' },
  '19': { name: 'Thái Nguyên', lat: 21.5671, lng: 105.8252, region: 'north' },
  '27': { name: 'Bắc Ninh', lat: 21.1861, lng: 106.0763, region: 'north' },
  '30': { name: 'Hải Dương', lat: 20.9373, lng: 106.3145, region: 'north' },
  '33': { name: 'Hưng Yên', lat: 20.6463, lng: 106.0511, region: 'north' },
  '35': { name: 'Hà Nam', lat: 20.5835, lng: 105.9230, region: 'north' },
  '36': { name: 'Nam Định', lat: 20.4388, lng: 106.1621, region: 'north' },
  '37': { name: 'Ninh Bình', lat: 20.2506, lng: 105.9745, region: 'north' },

  '38': { name: 'Thanh Hóa', lat: 19.8067, lng: 105.7851, region: 'central' },
  '40': { name: 'Nghệ An', lat: 18.6792, lng: 105.6811, region: 'central' },
  '42': { name: 'Hà Tĩnh', lat: 18.3559, lng: 105.9059, region: 'central' },
  '44': { name: 'Quảng Bình', lat: 17.4676, lng: 106.6222, region: 'central' },
  '45': { name: 'Quảng Trị', lat: 16.7404, lng: 107.1854, region: 'central' },
  '46': { name: 'Thừa Thiên Huế', lat: 16.4637, lng: 107.5909, region: 'central' },
  '48': { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022, region: 'central' },
  '49': { name: 'Quảng Nam', lat: 15.5394, lng: 108.0191, region: 'central' },
  '51': { name: 'Quảng Ngãi', lat: 15.1214, lng: 108.8044, region: 'central' },
  '52': { name: 'Bình Định', lat: 13.7830, lng: 109.2196, region: 'central' },

  '54': { name: 'Phú Yên', lat: 13.0881, lng: 109.0929, region: 'central' },
  '56': { name: 'Khánh Hòa', lat: 12.2388, lng: 109.1967, region: 'central' },
  '58': { name: 'Ninh Thuận', lat: 11.6739, lng: 108.8629, region: 'central' },
  '60': { name: 'Bình Thuận', lat: 10.9273, lng: 108.1017, region: 'central' },
  '68': { name: 'Lâm Đồng', lat: 11.5753, lng: 108.1429, region: 'central' },

  '62': { name: 'Kon Tum', lat: 14.3497, lng: 108.0005, region: 'central' },
  '64': { name: 'Gia Lai', lat: 13.9830, lng: 108.0005, region: 'central' },
  '66': { name: 'Đắk Lắk', lat: 12.7100, lng: 108.2378, region: 'central' },
  '70': { name: 'Bình Phước', lat: 11.7511, lng: 106.7234, region: 'south' },
  '74': { name: 'Bình Dương', lat: 11.3254, lng: 106.4770, region: 'south' },

  '75': { name: 'Đồng Nai', lat: 10.9524, lng: 106.8365, region: 'south' },
  '79': { name: 'TP. Hồ Chí Minh', lat: 10.8231, lng: 106.6297, region: 'south' },
  '80': { name: 'Long An', lat: 10.6956, lng: 106.2431, region: 'south' },
  '91': { name: 'Kiên Giang', lat: 10.0125, lng: 105.0808, region: 'south' }
};

function getProvinceCoordinates(provinceIdOrName) {
  if (!provinceIdOrName) return null;
  
  const byId = PROVINCE_COORDINATES[provinceIdOrName];
  if (byId) return byId;
  const searchName = normalizeVietnamese(String(provinceIdOrName).trim());
  for (const [id, data] of Object.entries(PROVINCE_COORDINATES)) {
    const provinceName = normalizeVietnamese(data.name);
    if (provinceName === searchName || 
        provinceName.includes(searchName) || 
        searchName.includes(provinceName)) {
      return data;
    }
  }
  
  return null;
}

function normalizeVietnamese(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') 
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
}

function getProvincesByRegion(region) {
  return Object.values(PROVINCE_COORDINATES)
    .filter(p => p.region === region);
}

function findNearestProvinces(lat, lng, limit = 5) {
  const provinces = Object.entries(PROVINCE_COORDINATES).map(([id, data]) => {
    const distance = calculateDistance(lat, lng, data.lat, data.lng);
    return { id, ...data, distance };
  });
  
  return provinces.sort((a, b) => a.distance - b.distance).slice(0, limit);
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = {
  PROVINCE_COORDINATES,
  getProvinceCoordinates,
  getProvincesByRegion,
  findNearestProvinces
};
