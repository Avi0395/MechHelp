import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import socket, { joinRequestRoom, leaveRequestRoom, emitLocationUpdate } from "../services/socketService";

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

// Custom Completed Icon (Green location pin)
const completedIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="50">
      <path fill="#10B981" stroke="#059669" stroke-width="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <path fill="white" d="M9 12l2 2 4-4" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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

// Component to handle map sizing & framing both pins reliably
const MapController = ({ userLoc, mechLoc, recenterTrigger }) => {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;

    const updateSize = () => {
      map.invalidateSize();
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });
    observer.observe(container);

    const delays = [50, 150, 300, 500, 800, 1200];
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

export default function MechanicSideMap({ 
  userLocation: rawUserLoc, 
  mechanicLocation: rawMechLoc, 
  onServiceCompleted, 
  requestId, 
  mechanicId,
  initialStatus 
}) {
  const [mechanicLocation, setMechanicLocation] = useState(rawMechLoc);
  const [distance, setDistance] = useState(null);
  const [eta, setETA] = useState(null);
  const [isCompleted, setIsCompleted] = useState(initialStatus === "completed");
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const [useRealGps, setUseRealGps] = useState(false);
  const [recenterCount, setRecenterCount] = useState(0);

  const simIntervalRef = useRef(null);
  const watchIdRef = useRef(null);

  const userLocation = normalizeLatLng(rawUserLoc);
  const currentMechLoc = normalizeLatLng(mechanicLocation);

  useEffect(() => {
    if (rawMechLoc) {
      setMechanicLocation(rawMechLoc);
    }
  }, [rawMechLoc]);

  // Socket room join & leave
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

  // Real Device GPS Watching
  useEffect(() => {
    if (!useRealGps || isAutoSimulating || isCompleted) return;

    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newLoc = [position.coords.latitude, position.coords.longitude];
          setMechanicLocation(newLoc);

          if (requestId) {
            emitLocationUpdate({
              requestId,
              mechanicId,
              location: newLoc,
            });
          }
        },
        (err) => {
          console.warn("Watch position error:", err.message);
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      );
    }

    return () => {
      if (watchIdRef.current !== null && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [requestId, mechanicId, isAutoSimulating, isCompleted, useRealGps]);

  // Step movement function (move closer by a fraction e.g. 10%)
  const moveMechanicCloser = (stepFraction = 0.1) => {
    if (!userLocation || !currentMechLoc || isCompleted) return;

    const latDiff = userLocation[0] - currentMechLoc[0];
    const lngDiff = userLocation[1] - currentMechLoc[1];

    if (Math.abs(latDiff) < 0.0001 && Math.abs(lngDiff) < 0.0001) {
      setIsCompleted(true);
      if (onServiceCompleted && requestId) {
        onServiceCompleted(requestId);
      }
      return;
    }

    const newLat = currentMechLoc[0] + latDiff * stepFraction;
    const newLng = currentMechLoc[1] + lngDiff * stepFraction;
    const newLoc = [newLat, newLng];

    setMechanicLocation(newLoc);

    if (requestId) {
      emitLocationUpdate({
        requestId,
        mechanicId,
        location: newLoc,
      });
    }
  };

  // Optional Auto Drive Timer Logic
  useEffect(() => {
    if (isAutoSimulating && userLocation && currentMechLoc && !isCompleted) {
      simIntervalRef.current = setInterval(() => {
        moveMechanicCloser(0.08);
      }, 1000);
    } else {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    }

    return () => {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    };
  }, [isAutoSimulating, userLocation, currentMechLoc, isCompleted]);

  // Calculate distance & ETA ONLY
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
      {/* Header Bar */}
      <div className="bg-blue-600 text-white px-6 py-3.5 flex items-center justify-between shadow-md z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className={`w-3.5 h-3.5 ${isCompleted ? 'bg-emerald-400' : 'bg-emerald-400 animate-ping'} rounded-full`}></div>
          <div>
            <h3 className="font-bold text-lg leading-none">
              {isCompleted ? "Service Completed ✅" : "Mechanic Live Navigation 🗺️"}
            </h3>
            <p className="text-xs opacity-90 mt-1">
              {isCompleted ? "You have arrived at destination" : "Navigating live to breakdown location"}
            </p>
          </div>
        </div>

        {/* Movement Controls */}
        <div className="flex items-center space-x-2">
          {!isCompleted && (
            <>
              {/* Manual Step Movement Button */}
              <button
                onClick={() => moveMechanicCloser(0.1)}
                className="bg-white text-blue-600 hover:bg-blue-50 font-extrabold px-3 py-1.5 text-xs rounded-lg shadow-md transition-all active:scale-95 flex items-center space-x-1"
                title="Move mechanic closer step-by-step"
              >
                <span>🚗 Move 1 km Closer</span>
              </button>

              {/* Auto Simulation Toggle */}
              <button
                onClick={() => setIsAutoSimulating(!isAutoSimulating)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                  isAutoSimulating
                    ? "bg-red-500 text-white border-red-400 animate-pulse"
                    : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                }`}
              >
                {isAutoSimulating ? "⏸ Stop Auto Drive" : "▶ Auto Drive"}
              </button>

              {/* Real Device GPS Toggle */}
              <button
                onClick={() => setUseRealGps(!useRealGps)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                  useRealGps
                    ? "bg-green-500 text-white border-green-400"
                    : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                }`}
                title="Use physical device GPS sensor"
              >
                📡 Device GPS: {useRealGps ? "ON" : "OFF"}
              </button>
            </>
          )}

          <button
            onClick={() => setRecenterCount(prev => prev + 1)}
            className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm transition-all"
          >
            🎯 Frame Both Pins
          </button>
        </div>
      </div>

      {/* Map Canvas Wrapper */}
      <div className="relative flex-1 w-full h-full min-h-[400px]">
        <div className="absolute inset-0">
          <MapContainer
            center={centerPos}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {userLocation && (
              <>
                <Circle
                  center={userLocation}
                  radius={60}
                  fillColor={isCompleted ? "#10B981" : "#3B82F6"}
                  fillOpacity={0.2}
                  color={isCompleted ? "#10B981" : "#3B82F6"}
                  weight={2}
                />
                <Marker position={userLocation} icon={isCompleted ? completedIcon : userIcon}>
                  <Popup>
                    <div className="text-center p-1 font-sans">
                      <strong className={isCompleted ? "text-green-600 text-sm" : "text-blue-600 text-sm"}>
                        📍 Customer Location
                      </strong>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {isCompleted ? "Service completed!" : "Waiting for your arrival"}
                      </div>
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
                  fillColor={isCompleted ? "#10B981" : "#F97316"}
                  fillOpacity={0.2}
                  color={isCompleted ? "#10B981" : "#F97316"}
                  weight={2}
                />
                <Marker position={currentMechLoc} icon={isCompleted ? completedIcon : mechanicIcon}>
                  <Popup>
                    <div className="text-center p-1 font-sans">
                      <strong className={isCompleted ? "text-green-600 text-sm" : "text-orange-600 text-sm"}>
                        🔧 Your Location (Mechanic)
                      </strong>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {isCompleted ? "Arrived at location" : "En route to customer"}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}

            {userLocation && currentMechLoc && !isCompleted && (
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

        {/* Live Details Floating Box */}
        {distance && (
          <div className={`absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border p-4 z-[1000] min-w-[220px] ${isCompleted ? 'border-green-300' : 'border-gray-100'}`}>
            <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-gray-100">
              <div className={`w-2.5 h-2.5 ${isCompleted ? 'bg-green-500' : 'bg-orange-500 animate-pulse'} rounded-full`}></div>
              <span className="font-bold text-gray-800 text-sm">
                {isCompleted ? "Service Status" : "Live Distance"}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              {isCompleted ? (
                <div className="text-green-600 font-bold text-center py-1">
                  ✅ Service Completed!
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Distance:</span>
                    <span className="font-bold text-gray-900">{formatDistance(distance)}</span>
                  </div>
                  {eta && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">ETA:</span>
                      <span className="font-bold text-orange-600">{eta}</span>
                    </div>
                  )}
                  {isAutoSimulating && (
                    <div className="text-orange-600 font-semibold text-xs mt-1 text-center bg-orange-50 py-1 rounded border border-orange-200 animate-pulse">
                      📡 Auto Driving...
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Hurrah Banner on Completion */}
        {isCompleted && (
          <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center z-[1000] pointer-events-none">
            <div className="bg-white rounded-2xl p-6 shadow-2xl border-2 border-green-400 text-center animate-bounce">
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-xl font-extrabold text-green-600">Mechanic Arrived!</div>
              <div className="text-sm text-gray-600 mt-1">Service completed at customer location</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}