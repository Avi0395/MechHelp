import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const USER_API_END_POINT = import.meta.env.VITE_USER_API_END_POINT;

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const FitBounds = ({ bounds, autoFit }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds.length === 2 && autoFit) {
      map.fitBounds(bounds);
    }
  }, [bounds, autoFit, map]);

  return null;
};

const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MechanicMap = ({ mechanicId }) => {
  const [mechanicLocation, setMechanicLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoFit, setAutoFit] = useState(true);

  const fetchMechanicLocation = async () => {
    try {
      const res = await fetch(`${USER_API_END_POINT}/mechanics/profile/${mechanicId}`);
      const data = await res.json();

      if (data.location?.coordinates?.length === 2) {
        const [lng, lat] = data.location.coordinates;
        setMechanicLocation({ lat, lng, name: data.name || "Mechanic" });
      }
    } catch (err) {
      console.error("Error fetching mechanic location:", err);
    }
  };

  const fetchUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (err) => {
        console.error("Error getting user location:", err);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (mechanicId) {
      fetchMechanicLocation();
      fetchUserLocation();

      const interval = setInterval(() => {
        fetchMechanicLocation();
        fetchUserLocation();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [mechanicId]);

  useEffect(() => {
    if (userLocation && mechanicLocation) {
      const dist = getDistanceInKm(
        userLocation.lat,
        userLocation.lng,
        mechanicLocation.lat,
        mechanicLocation.lng
      );
      setDistance(dist.toFixed(2));
      setLoading(false);
    }
  }, [userLocation, mechanicLocation]);

  if (loading) {
    return <div>Loading map and locations...</div>;
  }

  const bounds = [
    [userLocation.lat, userLocation.lng],
    [mechanicLocation.lat, mechanicLocation.lng],
  ];

  return (
    <div className="space-y-2">
      <div className="text-center font-semibold text-lg text-blue-600">
        Distance: {distance} km
      </div>

      <div className="h-[500px] w-full rounded-lg shadow-md overflow-hidden">
        <MapContainer
          center={userLocation}
          zoom={13}
          className="h-full w-full"
          whenCreated={(map) => {
            map.on("movestart", () => setAutoFit(false));
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          />

          <Marker position={userLocation} icon={icon}>
            <Popup>You (User)</Popup>
          </Marker>

          <Marker position={mechanicLocation} icon={icon}>
            <Popup>Mechanic: {mechanicLocation.name}</Popup>
          </Marker>

          <Polyline
            positions={[userLocation, mechanicLocation]}
            pathOptions={{ color: "blue", weight: 3 }}
          />

          <FitBounds bounds={bounds} autoFit={autoFit} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MechanicMap;
