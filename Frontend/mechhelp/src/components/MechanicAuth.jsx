import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

// Convert 24-hour time to 12-hour format
const convertTo12HourFormat = (time) => {
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours);
  const period = hours >= 12 ? "PM" : "AM";

  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  return `${hours}:${minutes} ${period}`;
};

const MechanicAuth = () => {
  const [isRegister, setIsRegister] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    specializations: "",
    serviceTypes: "",
    workingHoursStart: "",
    workingHoursEnd: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `${import.meta.env.VITE_USER_API_END_POINT}/mechanics/${
        isRegister ? "register" : "login"
      }`;

      const workingHoursStart12Hr = convertTo12HourFormat(formData.workingHoursStart);
      const workingHoursEnd12Hr = convertTo12HourFormat(formData.workingHoursEnd);

      const payload = isRegister
        ? {
            ...formData,
            workingHours: {
              start: workingHoursStart12Hr,
              end: workingHoursEnd12Hr,
            },
            isAvailable: true,
            verified: false,
            rating: 0,
            totalCompletedServices: 0,
          }
        : {
            email: formData.email,
            password: formData.password,
          };

      // Clean up unnecessary keys
      delete payload.workingHoursStart;
      delete payload.workingHoursEnd;

      const res = await axios.post(url, payload, { withCredentials: true });
      alert(`${isRegister ? "Registration" : "Login"} successful!`);

      if (!isRegister) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("mechanicInfo", JSON.stringify(res.data.mechanic));
        localStorage.setItem(
          "workingHours",
          JSON.stringify({
            start: workingHoursStart12Hr,
            end: workingHoursEnd12Hr,
          })
        );
        Cookies.set("mechanicId", res.data.mechanic._id, { expires: 7 });
        setIsLoggedIn(true);
        navigate("/mechdashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  const toggleMode = () => {
    setIsRegister((prev) => !prev);
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      address: "",
      specializations: "",
      serviceTypes: "",
      workingHoursStart: "",
      workingHoursEnd: "",
    });
  };

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-700">
        {isRegister ? "Mechanic Registration" : "Mechanic Login"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-600">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-600">
                Phone
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-600">
                Address
              </label>
              <input
                name="address"
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="specializations" className="block text-sm font-medium text-gray-600">
                Specializations (e.g., engine, brakes)
              </label>
              <input
                name="specializations"
                type="text"
                placeholder="Specializations"
                value={formData.specializations}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-md"
              />
            </div>

            <div>
              <label htmlFor="serviceTypes" className="block text-sm font-medium text-gray-600">
                Service Types (e.g., on-site, in-garage)
              </label>
              <input
                name="serviceTypes"
                type="text"
                placeholder="Service Types"
                value={formData.serviceTypes}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-md"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">Working Hours</label>
              <div className="flex space-x-4">
                <div className="w-full">
                  <label htmlFor="workingHoursStart" className="block text-sm font-medium text-gray-600">
                    Start Time
                  </label>
                  <input
                    name="workingHoursStart"
                    type="time"
                    value={formData.workingHoursStart}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-md"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="workingHoursEnd" className="block text-sm font-medium text-gray-600">
                    End Time
                  </label>
                  <input
                    name="workingHoursEnd"
                    type="time"
                    value={formData.workingHoursEnd}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-md"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Common Email & Password Fields */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600">
            Email
          </label>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-600">
            Password
          </label>
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-md"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          {isRegister ? "Register" : "Login"}
        </button>
      </form>

      <p
        onClick={toggleMode}
        className="text-sm text-center text-blue-600 cursor-pointer"
      >
        {isRegister
          ? "Already have an account? Login"
          : "Don't have an account? Register"}
      </p>
    </div>
  );
};

export default MechanicAuth;
