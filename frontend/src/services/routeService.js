const ORS_API_KEY = process.env.REACT_APP_ORS_API_KEY;
const ORS_BASE_URL = 'https://api.openrouteservice.org/v2';

/**
 * Get route between two points (rider and customer)
 * @param {Object} start - { lat, lng } starting point (rider location or restaurant)
 * @param {Object} end - { lat, lng } destination (customer delivery address)
 * @returns {Promise} Route data with distance, duration, and path
 */
export const getRoute = async (start, end) => {
  try {
    const response = await fetch(`${ORS_BASE_URL}/directions/driving-car`, {
      method: 'POST',
      headers: {
        'Authorization': ORS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        coordinates: [
          [start.lng, start.lat],  // ORS uses [longitude, latitude] order
          [end.lng, end.lat]
        ],
        format: 'geojson',
        preference: 'fastest',
        units: 'km'
      })
    });

    const data = await response.json();
    
    if (data.features && data.features[0]) {
      const feature = data.features[0];
      const summary = feature.properties.summary;
      const coordinates = feature.geometry.coordinates;
      
      return {
        success: true,
        distance: summary.distance, // in km
        duration: summary.duration, // in minutes
        eta: Math.round(summary.duration),
        path: coordinates.map(coord => ({ lat: coord[1], lng: coord[0] })),
        message: 'Route calculated successfully'
      };
    } else {
      return { success: false, message: 'No route found' };
    }
  } catch (error) {
    console.error('Route calculation error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Get estimated time of arrival
 */
export const getETA = async (start, end) => {
  const route = await getRoute(start, end);
  return route.eta || 0;
};

/**
 * Get distance between two points
 */
export const getDistance = async (start, end) => {
  const route = await getRoute(start, end);
  return route.distance || 0;
};