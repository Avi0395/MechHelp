import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; //  Import this
import toast, { Toaster } from "react-hot-toast";

const API_ENDPOINT = import.meta.env.VITE_USER_API_END_POINT;

const UserAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: ""
  });

  const navigate = useNavigate(); 

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(`${isLogin ? "Logging in" : "Registering"}...`);
    try {
      const url = `${API_ENDPOINT}/${isLogin ? "login" : "register"}`;
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await axios.post(url, payload, { withCredentials: true });
      toast.success(`${isLogin ? "Login" : "Registration"} successful!`);
      console.log(res.data);

      if (isLogin) {
        navigate("/layout");
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || (isLogin ? "Login failed!" : "Registration failed!");
      toast.error(errorMsg);
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl space-y-6">
      <Toaster position="top-right" />

      <h2 className="text-3xl font-bold text-center text-gray-700">
        {isLogin ? "User Login" : "User Registration"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <input
              name="name"
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
            <input
              name="phoneNumber"
              type="tel"
              placeholder="Mobile Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
          </>
        )}
        
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        />


        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          {isLogin ? "Login" : "Register"}
        </button>
      </form>
      <p
        onClick={() => setIsLogin(!isLogin)}
        className="text-sm text-center text-blue-600 cursor-pointer"
      >
        {isLogin
          ? "Don't have an account? Register"
          : "Already have an account? Login"}
      </p>
    </div>
  );
};

export default UserAuth;
