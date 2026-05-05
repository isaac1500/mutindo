import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DeliveryMap = ({ riderLocation, destinationLocation, onRouteCalculated }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current && mapInstanceRef.current === null) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [riderLocation?.lat || 0.3476, riderLocation?.lng || 32.5825], 
        13
      );
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (riderLocation) {
      if (riderMarkerRef.current) {
        riderMarkerRef.current.setLatLng([riderLocation.lat, riderLocation.lng]);
      } else {
        riderMarkerRef.current = L.marker([riderLocation.lat, riderLocation.lng]).addTo(map);
        riderMarkerRef.current.bindPopup('You are here').openPopup();
      }
      map.setView([riderLocation.lat, riderLocation.lng], 14);
    }

    if (destinationLocation) {
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setLatLng([destinationLocation.lat, destinationLocation.lng]);
      } else {
        destinationMarkerRef.current = L.marker([destinationLocation.lat, destinationLocation.lng]).addTo(map);
        destinationMarkerRef.current.bindPopup('Customer Location').openPopup();
      }
    }

    if (riderLocation && destinationLocation) {
      calculateAndDrawRoute(riderLocation, destinationLocation);
    }
  }, [riderLocation, destinationLocation]);

  const calculateAndDrawRoute = async (start, end) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      );
      
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes[0]) {
        const route = data.routes[0];
        const distance = (route.distance / 1000).toFixed(1);
        const duration = Math.round(route.duration / 60);
        
        if (routeLayerRef.current) {
          mapInstanceRef.current.removeLayer(routeLayerRef.current);
        }
        
        routeLayerRef.current = L.geoJSON(route.geometry, {
          style: { color: '#3b82f6', weight: 4, opacity: 0.8 }
        }).addTo(mapInstanceRef.current);
        
        const bounds = L.latLngBounds([
          [start.lat, start.lng],
          [end.lat, end.lng]
        ]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        
        if (onRouteCalculated) {
          onRouteCalculated({ distance, duration });
        }
      }
    } catch (error) {
      console.error('Route calculation error:', error);
    }
  };

  return <div ref={mapRef} style={{ height: '100%', width: '100%', minHeight: '400px', borderRadius: '8px' }} />;
};

export default DeliveryMap;