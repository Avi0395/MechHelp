import { useState, useEffect, useRef } from "react";
import { MapPin, Search, X, Map, Clock, User, Phone, Mail, Settings, AlertCircle, CheckCircle } from "lucide-react";
import axios from 'axios';
import { useNavigate } from "react-router-dom"; //  Import this

const API_ENDPOINT = import.meta.env.VITE_MECHANIC_API_END_POINT;

const MechanicAuth = () => {
  const [isRegister, setIsRegister] = useState(true);
  const [showMapModal, setShowMapModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [registeredCredentials, setRegisteredCredentials] = useState(null);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    coordinates: null,
    specializations: "",
    serviceTypes: "",
    workingHoursStart: "",
    workingHoursEnd: "",
  });

  // Auto-fill login form when switching from register to login
  useEffect(() => {
    if (!isRegister && registeredCredentials) {
      setFormData(prev => ({
        ...prev,
        email: registeredCredentials.email,
        password: registeredCredentials.password
      }));
    }
  }, [isRegister, registeredCredentials]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLocationSelect = (locationData) => {
    setFormData({
      ...formData,
      address: locationData.address,
      coordinates: locationData.coordinates
    });

    // Show location success toast
    showToast('Location selected successfully!', 'success');
    console.log('Selected coordinates:', formatCoordinates(locationData.coordinates));
  };

  // Toast management
  const showToast = (message, type = 'error') => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Navigation function (simulated)
  const navigateToMechDashboard = () => {
   
    showToast('Redirecting to Mechanic Dashboard...', 'success');
    console.log('Navigation to /mechdashboard triggered');

    navigate("/mechdashboard");
   
  };

  // Register Mechanic API call
  const registerMechanic = async (payload) => {
    try {
      const response = await axios.post(`${API_ENDPOINT}/register`, payload, {
        withCredentials: true, 
      });
      const res = await axios.post(url, payload, { withCredentials: true });

      const data = response.data;

      if (!response.status || response.status >= 400) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Network error occurred');
    }
  };

  // Login Mechanic API call
  const loginMechanic = async (payload) => {
    try {
      const response = await axios.post(`${API_ENDPOINT}/login`, payload, {
        withCredentials: true, // allows cookie (MechToken) to be sent and received
      });

      const data = response.data;

      if (!response.status || response.status >= 400) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Network error occurred');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate coordinates for registration
    if (isRegister && !formData.coordinates) {
      showToast('Please select your location using the map.');
      return;
    }

    // Validate working hours for registration
    if (isRegister && (!formData.workingHoursStart || !formData.workingHoursEnd)) {
      showToast('Please select your working hours.');
      return;
    }

    setIsLoading(true);

    try {
      let result;

      if (isRegister) {
        // Prepare registration payload
        const workingHoursStart12Hr = convertTo12HourFormat(formData.workingHoursStart);
        const workingHoursEnd12Hr = convertTo12HourFormat(formData.workingHoursEnd);

        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          address: formData.address,
          coordinates: formData.coordinates,
          specializations: formData.specializations,
          serviceTypes: formData.serviceTypes,
          workingHours: {
            start: workingHoursStart12Hr,
            end: workingHoursEnd12Hr,
          },
          isAvailable: true,
          verified: false,
          rating: 0,
          totalCompletedServices: 0,
        };

        console.log('Registration payload coordinates:', formatCoordinates(payload.coordinates));

        result = await registerMechanic(payload);

        // Store credentials for auto-fill
        setRegisteredCredentials({
          email: formData.email,
          password: formData.password
        });

        // Store token and user data
        if (result.token) {
          localStorage.setItem('mechanicToken', result.token);
          localStorage.setItem('mechanicData', JSON.stringify(result.mechanic));
        }

        showToast('Registration successful! You can now sign in with your credentials.', 'success');

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          address: "",
          coordinates: null,
          specializations: "",
          serviceTypes: "",
          workingHoursStart: "",
          workingHoursEnd: "",
        });

        // Auto-switch to login mode
        setTimeout(() => {
          setIsRegister(false);
          showToast('Login form pre-filled with your credentials. Click Sign In to continue.', 'success');
        }, 2000);

      } else {
        // Login payload
        const payload = {
          email: formData.email,
          password: formData.password,
          
        };

        result = await loginMechanic(payload);

        // Store token and user data
        if (result.token) {
          localStorage.setItem('mechanicToken', result.token);
          localStorage.setItem('mechanicData', JSON.stringify(result.mechanic));
        }

        showToast('Login successful! Welcome back.', 'success');

        // Navigate to dashboard after a short delay
        setTimeout(() => {
          navigateToMechDashboard();
        }, 1500);
      }

      console.log('API Response:', result);

    } catch (error) {
      console.error('API Error:', error);
      showToast(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister((prev) => !prev);

    // Only reset form if switching to register or if no registered credentials
    if (isRegister || !registeredCredentials) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        address: "",
        coordinates: null,
        specializations: "",
        serviceTypes: "",
        workingHoursStart: "",
        workingHoursEnd: "",
      });
    }
  };

  return (
    <>
      {/* Toast Container */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-700">
          {isRegister ? "Mechanic Registration" : "Mechanic Login"}
        </h2>

        {/* Show credential hint for login after registration */}
        {!isRegister && registeredCredentials && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <p className="text-blue-800 font-medium">Ready to Sign In</p>
              <p className="text-blue-700 text-sm">Your login credentials have been pre-filled. Click Sign In to continue.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {isRegister && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">
                  <User size={16} className="inline mr-1" />
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-1">
                  <Phone size={16} className="inline mr-1" />
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-600 mb-1">
                  <MapPin size={16} className="inline mr-1" />
                  Service Location
                </label>
                <div className="relative">
                  <input
                    name="address"
                    type="text"
                    placeholder="Click the map icon to select precise location"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full p-3 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => setShowMapModal(true)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-blue-600 hover:text-blue-800 transition-colors hover:bg-blue-50 rounded"
                    title="Select location on map"
                  >
                    <Map size={20} />
                  </button>
                </div>
                {formData.coordinates && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-green-600 bg-green-50 p-2 rounded">
                    <MapPin size={12} />
                    <span>Precise location selected ✓ {formatCoordinates(formData.coordinates)}</span>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="specializations" className="block text-sm font-medium text-gray-600 mb-1">
                  <Settings size={16} className="inline mr-1" />
                  Specializations
                </label>
                <input
                  name="specializations"
                  type="text"
                  placeholder="e.g., Engine Repair, Brake Service, AC Repair"
                  value={formData.specializations}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple specializations with commas</p>
              </div>

              <div>
                <label htmlFor="serviceTypes" className="block text-sm font-medium text-gray-600 mb-1">
                  Service Types
                </label>
                <input
                  name="serviceTypes"
                  type="text"
                  placeholder="e.g., On-site Service, Workshop Service, Emergency Service"
                  value={formData.serviceTypes}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  <Clock size={16} className="inline mr-1" />
                  Working Hours
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="workingHoursStart" className="block text-xs text-gray-500 mb-1">
                      Start Time
                    </label>
                    <input
                      name="workingHoursStart"
                      type="time"
                      value={formData.workingHoursStart}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="workingHoursEnd" className="block text-xs text-gray-500 mb-1">
                      End Time
                    </label>
                    <input
                      name="workingHoursEnd"
                      type="time"
                      value={formData.workingHoursEnd}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                {formData.workingHoursStart && formData.workingHoursEnd && (
                  <p className="text-xs text-blue-600 mt-1">
                    Working hours: {convertTo12HourFormat(formData.workingHoursStart)} - {convertTo12HourFormat(formData.workingHoursEnd)}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Common Email & Password Fields */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
              <Mail size={16} className="inline mr-1" />
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                {isRegister ? "Creating Account..." : "Signing In..."}
              </>
            ) : (
              isRegister ? "Create Account" : "Sign In"
            )}
          </button>
        </form>

        <p
          onClick={toggleMode}
          className="text-sm text-center text-blue-600 cursor-pointer hover:text-blue-800 transition-colors hover:underline"
        >
          {isRegister
            ? "Already have an account? Sign in here"
            : "Don't have an account? Register here"}
        </p>
      </div>

      {/* Map Modal */}
      <LeafletMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        onLocationSelect={handleLocationSelect}
        initialAddress={formData.address}
      />
    </>
  );
};
// Convert 24-hour time to 12-hour format
const convertTo12HourFormat = (time) => {
  if (!time) return '';
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours);
  const period = hours >= 12 ? "PM" : "AM";

  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  return `${hours}:${minutes} ${period}`;
};

// Format coordinates helper function
const formatCoordinates = (coordinates) => {
  if (!coordinates || coordinates.length !== 2) return '';
  return `[${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}]`;
};

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertCircle : AlertCircle;

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 max-w-md`}>
      <Icon size={16} />
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-white hover:bg-opacity-20 rounded p-1">
        <X size={14} />
      </button>
    </div>
  );
};

// Leaflet Map Component
const LeafletMapModal = ({ isOpen, onClose, onLocationSelect, initialAddress = "" }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !map) {
      // Load Leaflet CSS and JS
      loadLeafletResources().then(() => {
        initializeMap();
      });
    }
  }, [isOpen]);

  const loadLeafletResources = async () => {
    return new Promise((resolve) => {
      // Check if Leaflet is already loaded
      if (window.L) {
        resolve();
        return;
      }

      // Load Leaflet CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
      document.head.appendChild(cssLink);

      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.L) return;

    const defaultCenter = [21.1458, 79.0882]; // Nagpur coordinates

    const newMap = window.L.map(mapRef.current).setView(defaultCenter, 13);

    // Add OpenStreetMap tiles
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(newMap);

    // Add draggable marker
    const newMarker = window.L.marker(defaultCenter, { draggable: true }).addTo(newMap);

    // Handle map click
    newMap.on('click', (e) => {
      const { lat, lng } = e.latlng;
      newMarker.setLatLng([lat, lng]);
      updateLocationInfo(lat, lng);
    });

    // Handle marker drag
    newMarker.on('dragend', (e) => {
      const { lat, lng } = e.target.getLatLng();
      updateLocationInfo(lat, lng);
    });

    setMap(newMap);
    setMarker(newMarker);

    // Try to get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          newMap.setView([lat, lng], 15);
          newMarker.setLatLng([lat, lng]);
          updateLocationInfo(lat, lng);
        },
        () => {
          // If geolocation fails, use default location
          updateLocationInfo(defaultCenter[0], defaultCenter[1]);
        }
      );
    } else {
      updateLocationInfo(defaultCenter[0], defaultCenter[1]);
    }
  };

  const updateLocationInfo = async (lat, lng) => {
    setIsLoading(true);
    try {
      // Use Nominatim reverse geocoding (free alternative to Google)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();

      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

      setSelectedLocation({
        address,
        coordinates: [lat, lng], // Changed to [lat, lng] format
        lat,
        lng
      });
    } catch (error) {
      console.error('Error getting address:', error);
      // Fallback to coordinates
      setSelectedLocation({
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        coordinates: [lat, lng], // Changed to [lat, lng] format
        lat,
        lng
      });
    }
    setIsLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !map) return;

    setIsLoading(true);
    try {
      // Use Nominatim search (free alternative to Google Geocoding)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        map.setView([lat, lng], 15);
        marker.setLatLng([lat, lng]);
        updateLocationInfo(lat, lng);
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    }
    setIsLoading(false);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    } else {
      alert('Please select a location on the map.');
    }
  };

  // Cleanup map on component unmount
  useEffect(() => {
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [map]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Map size={20} />
            Select Your Location
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a location..."
                className="w-full p-3 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Click anywhere on the map or drag the red marker to set your location
          </p>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <div
            ref={mapRef}
            className="w-full h-full"
            style={{ minHeight: '300px' }}
          ></div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          )}
        </div>

        {/* Selected Location Info */}
        {selectedLocation && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-start gap-2">
              <MapPin className="text-red-500 mt-1 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Selected Location:</p>
                <p className="text-sm text-gray-600 mt-1 break-words">{selectedLocation.address}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Coordinates: {formatCoordinates(selectedLocation.coordinates)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmLocation}
            disabled={!selectedLocation}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};



export default MechanicAuth;