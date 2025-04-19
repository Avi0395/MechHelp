import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { info } from "../assets/info";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const USER_API_END_POINT = import.meta.env.VITE_USER_API_END_POINT; // ✅ Using .env

const SignUp = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    email: "",
    password: "",
  });

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (login) {
        // Login API Call
        const { data } = await axios.post(`${USER_API_END_POINT}login`, {
          email: formData.email,
          password: formData.password,
        });

        toast.success("Login Successful! ✅", { position: "top-center" });

        setTimeout(() => {
          navigate("/layout");
        }, 1000);

        console.log("User Logged In:", data);
      } else {
        // Register API Call
        const { data } = await axios.post(`${USER_API_END_POINT}register`, formData);
        console.log(data);

        toast.success("Registration Successful! 🎉", { position: "top-center" });
        console.log("User Registered:", data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong! ❌", {
        position: "top-center",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 shadow-amber-900 p-6">
      <ToastContainer />

      <div className="bg-white shadow-xl rounded-2xl p-10 flex flex-col sm:flex-row items-center max-w-5xl w-[80%]">
        
        {/* Left Side - Image */}
        <div className="hidden sm:block w-1/2">
          <img
            src={info[0].image}
            alt={info[0].name}
            className="w-[80%] h-[80%] object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full sm:w-1/2 p-8">
          <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-6">
            {login ? "Login" : "Sign Up"}
          </h1>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!login && (
              <>
                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Phone No & Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Phone No</label>
                    <input
                      type="number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  {/* <div>
                    <label className="block text-gray-700 font-semibold mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div> */}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </>
            )}

            {/* Email & Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button className="w-full bg-blue-700 text-white font-semibold py-3 rounded-full transition duration-300 hover:bg-amber-400 hover:text-black shadow-lg">
              {login ? "Login" : "Sign Up"}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <p className="text-center text-gray-600 mt-5">
            {login ? "Don't have an account?" : "Already have an account?"}
            <span
              onClick={() => setLogin(!login)}
              className="text-blue-700 font-semibold cursor-pointer hover:underline ml-1"
            >
              {login ? "Sign Up" : "Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
