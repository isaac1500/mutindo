import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Create custom blue marker for rider
const riderIcon = L.divIcon({
  html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #3b82f6;"></div>',
  iconSize: [20, 20],
  className: 'rider-marker'
});

// Create custom red marker for destination
const destIcon = L.divIcon({
  html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #ef4444;"></div>',
  iconSize: [20, 20],
  className: 'dest-marker'
});

const RealDeliveryMap = ({ riderLocation, destinationLocation, onRouteCalculated }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const centerLat = riderLocation?.lat || 0.3476;
    const centerLng = riderLocation?.lng || 32.5825;

    mapInstanceRef.current = L.map(mapRef.current).setView([centerLat, centerLng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers and route
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Rider marker (blue dot)
    if (riderLocation) {
      if (riderMarkerRef.current) {
        riderMarkerRef.current.setLatLng([riderLocation.lat, riderLocation.lng]);
      } else {
        riderMarkerRef.current = L.marker([riderLocation.lat, riderLocation.lng], { icon: riderIcon }).addTo(map);
        riderMarkerRef.current.bindPopup('<b>📍 You are here</b><br/>Your current location').openPopup();
      }
      map.setView([riderLocation.lat, riderLocation.lng], 15);
      console.log('Rider marker updated:', riderLocation);
    } else {
      console.log('No rider location yet');
    }

    // Destination marker (red dot)
    if (destinationLocation) {
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setLatLng([destinationLocation.lat, destinationLocation.lng]);
      } else {
        destinationMarkerRef.current = L.marker([destinationLocation.lat, destinationLocation.lng], { icon: destIcon }).addTo(map);
        const popupText = destinationLocation.isRestaurant ? '<b>🍽️ Restaurant</b><br/>Pick up order here' : '<b>🏠 Customer Location</b><br/>Deliver order here';
        destinationMarkerRef.current.bindPopup(popupText).openPopup();
      }
    }

    // Draw route if both locations exist
    if (riderLocation && destinationLocation) {
      drawRoute(riderLocation, destinationLocation);
    }
  }, [riderLocation, destinationLocation]);

  const drawRoute = async (start, end) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      );
      
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes?.[0]) {
        const route = data.routes[0];
        const distance = (route.distance / 1000).toFixed(1);
        const duration = Math.round(route.duration / 60);

        // Remove old route
        if (routeLayerRef.current) {
          mapInstanceRef.current.removeLayer(routeLayerRef.current);
        }

        // Add new route
        routeLayerRef.current = L.geoJSON(route.geometry, {
          style: { color: '#3b82f6', weight: 5, opacity: 0.9 }
        }).addTo(mapInstanceRef.current);

        // Fit bounds to show entire route
        const bounds = L.latLngBounds([
          [start.lat, start.lng],
          [end.lat, end.lng]
        ]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });

        // Send route info to parent
        if (onRouteCalculated) {
          onRouteCalculated({ distance, duration });
        }
      }
    } catch (error) {
      console.error('Route error:', error);
    }
  };

  return <div ref={mapRef} style={{ height: '100%', width: '100%', minHeight: '450px', borderRadius: '8px' }} />;
};

export default RealDeliveryMap;