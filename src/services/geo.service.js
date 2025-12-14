/**
 * Geo Service
 * Geographic calculations, distance measurements, and location utilities
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First point latitude
 * @param {number} lng1 - First point longitude  
 * @param {number} lat2 - Second point latitude
 * @param {number} lng2 - Second point longitude
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees to convert
 * @returns {number} Radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Validate coordinate values
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {boolean} True if valid
 */
export function validateCoordinates(latitude, longitude) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return false;
  }
  
  if (isNaN(latitude) || isNaN(longitude)) {
    return false;
  }
  
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

/**
 * Check if a point is within specified radius of center point
 * @param {number} centerLat - Center point latitude
 * @param {number} centerLng - Center point longitude
 * @param {number} pointLat - Point to check latitude
 * @param {number} pointLng - Point to check longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {boolean} True if within radius
 */
export function isWithinRadius(centerLat, centerLng, pointLat, pointLng, radiusKm) {
  if (radiusKm < 0) radiusKm = 0;
  
  const distance = calculateDistance(centerLat, centerLng, pointLat, pointLng);
  return distance <= radiusKm;
}

/**
 * Get bounding box coordinates for a given center point and radius
 * @param {number} latitude - Center latitude
 * @param {number} longitude - Center longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {object} Bounding box with min/max lat/lng
 */
export function getBoundingBox(latitude, longitude, radiusKm) {
  const R = 6371; // Earth's radius in km
  
  // Calculate angular distance
  const angularDistance = radiusKm / R;
  
  // Calculate latitude bounds
  const minLat = Math.max(-90, latitude - Math.toDegrees(angularDistance));
  const maxLat = Math.min(90, latitude + Math.toDegrees(angularDistance));
  
  // Calculate longitude bounds (adjusted for latitude)
  const deltaLng = Math.asin(Math.sin(angularDistance) / Math.cos(toRadians(latitude)));
  const minLng = longitude - Math.toDegrees(deltaLng);
  const maxLng = longitude + Math.toDegrees(deltaLng);
  
  return {
    minLat,
    maxLat,
    minLng: Math.max(-180, minLng),
    maxLng: Math.min(180, maxLng)
  };
}

/**
 * Normalize coordinates from string or number to precise number
 * @param {string|number} latitude - Latitude coordinate
 * @param {string|number} longitude - Longitude coordinate
 * @returns {object} Normalized coordinates
 */
export function normalizeCoordinates(latitude, longitude) {
  const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
  const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
  
  if (!validateCoordinates(lat, lng)) {
    throw new Error('Invalid coordinates');
  }
  
  return {
    latitude: Math.round(lat * 1000000) / 1000000, // 6 decimal places
    longitude: Math.round(lng * 1000000) / 1000000
  };
}

/**
 * Convert meters to kilometers
 * @param {number} meters - Distance in meters
 * @returns {number} Distance in kilometers
 */
export function metersToKilometers(meters) {
  return meters / 1000;
}

/**
 * Convert kilometers to meters
 * @param {number} kilometers - Distance in kilometers
 * @returns {number} Distance in meters
 */
export function kilometersToMeters(kilometers) {
  return kilometers * 1000;
}

/**
 * Get center point of multiple coordinates
 * @param {Array} coordinates - Array of {lat, lng} objects
 * @returns {object} Center point coordinates
 */
export function getCenterPoint(coordinates) {
  if (!coordinates || coordinates.length === 0) {
    throw new Error('No coordinates provided');
  }
  
  const sum = coordinates.reduce((acc, coord) => ({
    lat: acc.lat + coord.lat,
    lng: acc.lng + coord.lng
  }), { lat: 0, lng: 0 });
  
  return {
    latitude: sum.lat / coordinates.length,
    longitude: sum.lng / coordinates.length
  };
}

export default {
  calculateDistance,
  validateCoordinates,
  isWithinRadius,
  getBoundingBox,
  normalizeCoordinates,
  metersToKilometers,
  kilometersToMeters,
  getCenterPoint
};