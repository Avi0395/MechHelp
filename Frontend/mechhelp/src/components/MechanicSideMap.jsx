import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

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

// Custom Mechanic Icon (Orange wrench icon)
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

const isValidLocation = (loc) =>
  loc && Array.isArray(loc) && loc.length === 2 && !isNaN(loc[0]) && !isNaN(loc[1]);

const calculateDistance = (loc1, loc2) => {
  if (!isValidLocation(loc1) || !isValidLocation(loc2)) return null;
  const R = 6371;
  const dLat = ((loc2[0] - loc1[0]) * Math.PI) / 180;
  const dLon = ((loc2[1] - loc1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1[0] * Math.PI) / 180) *
      Math.cos((loc2[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
};

const calculateETA = (distance) => {
  if (!distance) return null;
  const avgSpeed = 30;
  const timeInHours = parseFloat(distance) / avgSpeed;
  const minutes = Math.round(timeInHours * 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

const AutoCenter = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 14, { animate: true, duration: 1 });
    }
  }, [position, map]);
  return null;
};

const Routing = ({ from, to }) => {
  const map = useMap();

  useEffect(() => {
    if (!from || !to) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      createMarker: () => null,
      lineOptions: {
        styles: [
          { color: '#F97316', weight: 6, opacity: 0.8 },
          { color: '#FED7AA', weight: 10, opacity: 0.4 }
        ]
      }
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [from, to, map]);

  return null;
};

export default function MechanicSideMap({ userLocation, mechanicLocation }) {
  const [distance, setDistance] = useState(null);
  const [eta, setETA] = useState(null);

  useEffect(() => {
    if (isValidLocation(userLocation) && isValidLocation(mechanicLocation)) {
      const dist = calculateDistance(userLocation, mechanicLocation);
      setDistance(dist);
      setETA(calculateETA(dist));
    }
  }, [userLocation, mechanicLocation]);

  return (
    <div className="relative">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-semibold">Live Tracking</span>
          </div>
          <div className="text-sm opacity-90">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="h-[500px] w-full overflow-hidden shadow-2xl border-2 border-orange-200 relative bg-gray-100">
        <MapContainer
          center={isValidLocation(mechanicLocation) ? mechanicLocation : isValidLocation(userLocation) ? userLocation : [0, 0]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {isValidLocation(userLocation) && (
            <>
              <Circle
                center={userLocation}
                radius={50}
                fillColor="#3B82F6"
                fillOpacity={0.1}
                color="#3B82F6"
                weight={1}
              />
              <Marker position={userLocation} icon={userIcon}>
                <Popup className="custom-popup">
                  <div className="text-center p-2">
                    <div className="font-semibold text-blue-600 mb-1">Customer Location</div>
                    <div className="text-sm text-gray-600">Waiting for service</div>
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {isValidLocation(mechanicLocation) && (
            <>
              <Circle
                center={mechanicLocation}
                radius={100}
                fillColor="#F97316"
                fillOpacity={0.1}
                color="#F97316"
                weight={1}
              />
              <Marker position={mechanicLocation} icon={mechanicIcon}>
                <Popup className="custom-popup">
                  <div className="text-center p-2">
                    <div className="font-semibold text-orange-600 mb-1">Mechanic Location</div>
                    <div className="text-sm text-gray-600">En route to customer</div>
                    {distance && (
                      <div className="text-xs text-gray-500 mt-1">
                        {distance} km away
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          <AutoCenter position={mechanicLocation} />

          {isValidLocation(userLocation) && isValidLocation(mechanicLocation) && (
            <Routing from={mechanicLocation} to={userLocation} />
          )}
        </MapContainer>

        {distance && (
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4 z-[999] min-w-[200px]">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="font-semibold text-gray-800">Service Details</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Distance:</span>
                <span className="font-semibold text-gray-800">{distance} km</span>
              </div>
              
              {eta && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ETA:</span>
                  <span className="font-semibold text-orange-600">{eta}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-green-600">En Route</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
