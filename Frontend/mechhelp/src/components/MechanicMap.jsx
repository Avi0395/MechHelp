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

const FitBounds = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds.length === 2) {
      map.fitBounds(bounds);
    }
  }, [bounds, map]);
  return null;
};

const MechanicLocationMap = ({ mechanicId }) => {
  const [mechanicLocation, setMechanicLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMechanic = async () => {
      try {
        const res = await fetch(`${USER_API_END_POINT}/mechanics/profile/${mechanicId}`);
        const data = await res.json();

        // ✅ Check and set mechanic location
        if (data.location?.coordinates?.length === 2) {
          const [lng, lat] = data.location.coordinates;
          setMechanicLocation({ lat, lng, name: data.name || "Mechanic" });
        } else {
          console.error("Mechanic location missing in response:", data);
        }
      } catch (err) {
        console.error("Failed to fetch mechanic:", err);
      }
    };

    if (mechanicId) fetchMechanic();

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
  }, [mechanicId]);

  useEffect(() => {
    if (userLocation && mechanicLocation) {
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
    <div className="h-[500px] w-full rounded-lg shadow-md overflow-hidden">
      <MapContainer
        center={userLocation}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        />

        <Marker position={userLocation} icon={icon}>
          <Popup>Your Location</Popup>
        </Marker>

        <Marker position={mechanicLocation} icon={icon}>
          <Popup>Mechanic: {mechanicLocation.name}</Popup>
        </Marker>

        <Polyline
          positions={[userLocation, mechanicLocation]}
          pathOptions={{ color: "blue", weight: 3 }}
        />

        <FitBounds bounds={bounds} />
      </MapContainer>
    </div>
  );
};

export default MechanicLocationMap;
