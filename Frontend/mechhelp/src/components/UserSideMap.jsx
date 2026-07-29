import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import socket, { joinRequestRoom, leaveRequestRoom } from "../services/socketService";

// Custom User Icon (Blue location pin)
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="50">
      <path fill="#3B82F6" stroke="#1E40AF" stroke-width="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="3" fill="white"/>
    </svg>
  `),
  iconSize: [40, 50],
  iconAnchor: [20, 50],
  popupAnchor: [0, -50],
});

// Custom Mechanic Icon (Orange wrench pin)
const mechanicIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="50">
      <path fill="#F97316" stroke="#EA580C" stroke-width="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="3" fill="white"/>
    </svg>
  `),
  iconSize: [40, 50],
  iconAnchor: [20, 50],
  popupAnchor: [0, -50],
});

// Normalize coordinates to [latitude, longitude]
const normalizeLatLng = (loc) => {
  if (!loc || !Array.isArray(loc) || loc.length < 2) return null;
  const a = Number(loc[0]);
  const b = Number(loc[1]);
  if (isNaN(a) || isNaN(b) || (a === 0 && b === 0)) return null;

  // In India & Asia: Lng is 50-100, Lat is 8-45.
  if (Math.abs(a) > 50 && Math.abs(b) < 45) {
    return [b, a]; // Return [lat, lng]
  }
  if (Math.abs(a) > 90 && Math.abs(b) <= 90) {
    return [b, a];
  }
  return [a, b];
};

const calculateDistance = (loc1, loc2) => {
  const norm1 = normalizeLatLng(loc1);
  const norm2 = normalizeLatLng(loc2);
  if (!norm1 || !norm2) return null;

  const R = 6371; // Earth radius in km
  const dLat = ((norm2[0] - norm1[0]) * Math.PI) / 180;
  const dLon = ((norm2[1] - norm1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((norm1[0] * Math.PI) / 180) *
    Math.cos((norm2[0] * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Return distance in meters
};

const calculateETA = (distance) => {
  if (!distance) return null;
  const distanceInKm = distance / 1000;
  const avgSpeed = 30; // 30 km/h
  const timeInHours = distanceInKm / avgSpeed;
  const minutes = Math.round(timeInHours * 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

// Component to handle map sizing & framing both pins reliably (Ultra-fast instant render)
const MapController = ({ userLoc, mechLoc, recenterTrigger }) => {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;

    const updateSize = () => {
      map.invalidateSize();
    };

    // Instant immediate rendering on animation frame
    updateSize();
    requestAnimationFrame(updateSize);

    const observer = new ResizeObserver(() => {
      updateSize();
    });
    observer.observe(container);

    // Tight fast intervals (0ms, 20ms, 50ms, 100ms, 200ms, 350ms)
    const delays = [0, 20, 50, 100, 200, 350];
    const timers = delays.map((delay) => setTimeout(updateSize, delay));

    window.addEventListener("resize", updateSize);

    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", updateSize);
    };
  }, [map]);

  useEffect(() => {
    if (userLoc && mechLoc) {
      const bounds = L.latLngBounds([userLoc, mechLoc]);
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 15 });
    } else if (userLoc) {
      map.setView(userLoc, 14);
    } else if (mechLoc) {
      map.setView(mechLoc, 14);
    }
  }, [userLoc, mechLoc, map, recenterTrigger]);

  return null;
};

export default function UserSideMap({ userLocation: rawUserLoc, mechanicLocation: rawMechLoc, requestId }) {
  const [mechanicLocation, setMechanicLocation] = useState(rawMechLoc);
  const [distance, setDistance] = useState(null);
  const [eta, setETA] = useState(null);
  const [recenterCount, setRecenterCount] = useState(0);

  const userLocation = normalizeLatLng(rawUserLoc);
  const currentMechLoc = normalizeLatLng(mechanicLocation);

  useEffect(() => {
    if (rawMechLoc) {
      setMechanicLocation(rawMechLoc);
    }
  }, [rawMechLoc]);

  useEffect(() => {
    if (!requestId) return;

    joinRequestRoom(requestId);

    const handleLocationUpdate = (data) => {
      if (data.requestId === requestId && data.location) {
        setMechanicLocation(data.location);
      }
    };

    socket.on("mechanic_location_updated", handleLocationUpdate);

    return () => {
      socket.off("mechanic_location_updated", handleLocationUpdate);
      leaveRequestRoom(requestId);
    };
  }, [requestId]);

  useEffect(() => {
    if (userLocation && currentMechLoc) {
      const dist = calculateDistance(userLocation, currentMechLoc);
      setDistance(dist);
      setETA(calculateETA(dist));
    }
  }, [rawUserLoc, mechanicLocation]);

  const formatDistance = (distanceInMeters) => {
    if (!distanceInMeters) return null;
    if (distanceInMeters >= 1000) {
      return `${(distanceInMeters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(distanceInMeters)} m`;
  };

  const centerPos = currentMechLoc || userLocation || [28.6139, 77.2090];

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3.5 flex items-center justify-between shadow-md z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-3.5 h-3.5 bg-green-400 rounded-full animate-ping"></div>
          <div>
            <h3 className="font-bold text-lg leading-none">Live Mechanic Tracking 🛵</h3>
            <p className="text-xs opacity-80 mt-1">Real-time GPS updates from mechanic</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setRecenterCount(prev => prev + 1)}
            className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm transition-all"
          >
            🎯 Frame Both Pins
          </button>
        </div>
      </div>

      {/* Map Content Wrapper */}
      <div className="relative flex-1 w-full h-full min-h-[400px]">
        <div className="absolute inset-0">
          <MapContainer
            center={centerPos}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
          >
            {/* High-speed CartoDB CDN Tile Layer with instant pre-buffering */}
            <TileLayer 
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              subdomains="abcd"
              maxZoom={19}
              updateWhenIdle={false}
              updateWhenZooming={false}
              keepBuffer={6}
            />

            {userLocation && (
              <>
                <Circle
                  center={userLocation}
                  radius={60}
                  fillColor="#3B82F6"
                  fillOpacity={0.2}
                  color="#3B82F6"
                  weight={2}
                />
                <Marker position={userLocation} icon={userIcon}>
                  <Popup>
                    <div className="text-center p-1 font-sans">
                      <strong className="text-blue-600 text-sm">📍 Your Location (Customer)</strong>
                      <div className="text-xs text-gray-500 mt-0.5">Waiting for mechanic arrival</div>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}

            {currentMechLoc && (
              <>
                <Circle
                  center={currentMechLoc}
                  radius={80}
                  fillColor="#F97316"
                  fillOpacity={0.2}
                  color="#F97316"
                  weight={2}
                />
                <Marker position={currentMechLoc} icon={mechanicIcon}>
                  <Popup>
                    <div className="text-center p-1 font-sans">
                      <strong className="text-orange-600 text-sm">🔧 Mechanic Location</strong>
                      <div className="text-xs text-gray-500 mt-0.5">En route to your breakdown point</div>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}

            {userLocation && currentMechLoc && (
              <Polyline
                positions={[currentMechLoc, userLocation]}
                color="#F97316"
                weight={5}
                opacity={0.8}
                dashArray="10, 10"
              />
            )}

            <MapController userLoc={userLocation} mechLoc={currentMechLoc} recenterTrigger={recenterCount} />
          </MapContainer>
        </div>

        {/* Live Service Details Card Overlay */}
        {distance && (
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-4 z-[1000] min-w-[220px]">
            <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-gray-100">
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-gray-800 text-sm">Service Tracking</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Distance:</span>
                <span className="font-bold text-gray-900">{formatDistance(distance)}</span>
              </div>
              
              {eta && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Estimated Arrival:</span>
                  <span className="font-bold text-orange-600">{eta}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-gray-400">Live Status:</span>
                <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                  En Route 🛵
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
