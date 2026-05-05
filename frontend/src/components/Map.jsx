import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const Map = ({ 
  center = { lat: 0.3476, lng: 32.5825 }, // Kampala coordinates
  zoom = 13,
  markers = [],
  onMapLoad,
  onMarkerClick,
  showRoute = false,
  origin = null,
  destination = null,
  style = { height: '400px', width: '100%' }
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const directionsRendererRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places', 'geometry']
      });

      try {
        const google = await loader.load();
        
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ],
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        });

        setMapLoaded(true);
        
        if (onMapLoad) {
          onMapLoad(mapInstanceRef.current, google);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    const google = window.google;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach(markerData => {
      const marker = new google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: mapInstanceRef.current,
        title: markerData.title,
        icon: markerData.icon || null
      });

      if (markerData.info) {
        const infoWindow = new google.maps.InfoWindow({
          content: markerData.info
        });
        
        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
          if (onMarkerClick) onMarkerClick(markerData);
        });
      }

      markersRef.current.push(marker);
    });
  }, [markers, mapLoaded]);

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !showRoute) return;
    if (!origin || !destination) return;

    const google = window.google;
    
    // Clear existing route
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
    }

    directionsRendererRef.current = new google.maps.DirectionsRenderer({
      map: mapInstanceRef.current,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#e67e22',
        strokeWeight: 4
      }
    });

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(result);
        } else {
          console.error('Directions request failed:', status);
        }
      }
    );
  }, [origin, destination, showRoute, mapLoaded]);

  return <div ref={mapRef} style={style} />;
};

export default Map;