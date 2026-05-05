// Convert address to coordinates using OpenStreetMap Nominatim (free, no API key)
export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'MutindoCateringApp/1.0'
        }
      }
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
        success: true
      };
    }
    return { success: false, message: 'Address not found' };
  } catch (error) {
    console.error('Geocoding error:', error);
    return { success: false, message: error.message };
  }
};

// Convert coordinates to address (reverse geocoding)
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: { 'User-Agent': 'MutindoCateringApp/1.0' }
      }
    );
    
    const data = await response.json();
    return data.display_name || `${lat}, ${lng}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${lat}, ${lng}`;
  }
};