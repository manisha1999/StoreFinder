import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StoreMap.css';

interface Store {
  id?: string | number;
  name?: string;
  storeName: string;
  location: {         // Add this
    latitude: number;
    longitude: number;
  };
  distance?: number;
  address?: any;
  telephone?: string;
}

interface StoreMapProps {
  stores: Store[];
  center?: { lat: number; lng: number };
}

const StoreMap: React.FC<StoreMapProps> = ({ stores, center }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const navigate = useNavigate();
  console.log(stores)

  console.log('🗺️ StoreMap rendered:', {
    storesCount: stores.length,
    center,
    googleMapsLoaded: !!(window as any).google?.maps
  });
  console.log(center ? `Center at lat: ${center.lat}, lng: ${center.lng}` : 'No center provided');

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      console.log('⏳ Map ref not ready');
      return;
    }

    if (!(window as any).google?.maps) {
      console.log('⏳ Google Maps not loaded');
      return;
    }

    if (map) {
      console.log('ℹ️ Map already initialized');
      return;
    }

    console.log('🗺️ Initializing Google Map...');

    const defaultCenter = center || { lat: 51.5074, lng: -0.1278 };

    const newMap = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 10,
      mapId: 'STORE_FINDER_MAP', // Modern map styling
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
    });

    setMap(newMap);
    console.log('✅ Map initialized at', defaultCenter);
  }, [center, map]);

  // Add markers when map and stores are ready
  useEffect(() => {
    if (!map) {
      console.log('⏳ Map not ready for markers');
      return;
    }

    if (!stores || stores.length === 0) {
      console.log('ℹ️ No stores to display');
      return;
    }

    console.log(`📍 Adding ${stores.length} markers...`);

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const bounds = new google.maps.LatLngBounds();
    const newMarkers: google.maps.Marker[] = [];

    stores.forEach((store, index) => {
      const lat = store.location.latitude;
      const lng = store.location.longitude;
      console.log("latitude and longitude", lat, lng);

      // Validate coordinates
      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        console.warn(`❌ Store ${index} (${store.storeName}) has invalid coordinates:`, { lat, lng });
        return;
      }

      const position = { lat, lng };

      // Create Advanced Marker (recommended by Google)
      const marker = new google.maps.Marker({
        position,
        map,
        title: store.storeName,
        // Custom marker styling
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#00843D', // Morrisons green
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        animation: google.maps.Animation.DROP,
        optimized: true,
      });

      // Create info window content
      const infoWindowContent = `
        <div style="
          padding: 16px;
          max-width: 280px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        ">
          <h3 style="
            margin: 0 0 12px 0;
            font-size: 18px;
            font-weight: 600;
            color: #00843D;
          ">
            ${store.storeName}
          </h3>
          
          ${store.address ? `
            <div style="margin: 8px 0; font-size: 14px; color: #555; line-height: 1.4;">
              📍 ${store.address.addressLine1 || ''}<br/>
              ${store.address.addressLine2 ? store.address.addressLine2 + '<br/>' : ''}
              ${store.address.city || ''} ${store.address.postcode || ''}
            </div>
          ` : ''}
          
          ${store.distance ? `
            <div style="margin: 8px 0; font-size: 14px; color: #666;">
              🚗 ${(store.distance / 1609.344).toFixed(2)} miles away
            </div>
          ` : ''}
          
          ${store.telephone ? `
            <div style="margin: 8px 0; font-size: 14px; color: #666;">
              📞 <a href="tel:${store.telephone}" style="color: #00843D; text-decoration: none;">
                ${store.telephone}
              </a>
            </div>
          ` : ''}
          
          <button 
            id="view-details-${store.id || store.name || index}" 
            style="
              margin-top: 12px;
              padding: 10px 20px;
              background: #00843D;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 600;
              width: 100%;
              transition: background 0.3s ease;
            "
            onmouseover="this.style.background='#006d32'"
            onmouseout="this.style.background='#00843D'"
          >
            View Store Details →
          </button>
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent,
        ariaLabel: store.storeName,
      });

      // Click marker to open info window
      marker.addListener('click', () => {
        // Close all other info windows
        newMarkers.forEach(m => {
          const iw = (m as any).infoWindow;
          if (iw) iw.close();
        });

        infoWindow.open({
          anchor: marker,
          map,
        });

        // Add click listener to button after info window opens
        google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
          const button = document.getElementById(`view-details-${store.id || store.name || index}`);
          if (button) {
            button.addEventListener('click', () => {
              const storeId = store.id || store.name;
              const slug = store.storeName
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
              navigate(`/storefinder/${storeId}/${slug}`);
            });
          }
        });
      });

      // Store info window reference
      (marker as any).infoWindow = infoWindow;

      newMarkers.push(marker);
      bounds.extend(position);

      console.log(`✅ Marker ${index + 1}/${stores.length}: ${store.storeName} at [${lat}, ${lng}]`);
    });

    setMarkers(newMarkers);

    console.log(`✅ Created ${newMarkers.length} markers successfully`);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);

      // Adjust zoom if only one marker
      if (newMarkers.length === 1) {
        google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          const zoom = map.getZoom();
          if (zoom && zoom > 15) {
            map.setZoom(15);
          }
        });
      }
    }

    // Cleanup function
    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [map, stores, navigate]);

  // Loading state
  if (!(window as any).google?.maps) {
    return (
      <div className="store-map-container">
        <div className="map-loading">
          <div className="spinner"></div>
          <p>Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="store-map-container">
      <div ref={mapRef} className="map-canvas" />
      
      {/* Store count badge */}
      {stores.length > 0 && (
        <div className="map-overlay">
          <div className="store-count-badge">
            📍 {stores.length} {stores.length === 1 ? 'store' : 'stores'}
          </div>
        </div>
      )}
      
      {/* No stores message */}
      {stores.length === 0 && (
        <div className="map-no-stores">
          <p>No stores to display on map</p>
        </div>
      )}
    </div>
  );
};

export default StoreMap;