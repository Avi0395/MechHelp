import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom"; // No need for useParams anymore
import { IoMdMenu } from "react-icons/io";
import axios from "axios";

const USER_API_END_POINT = import.meta.env.VITE_USER_API_END_POINT;

const MechNavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Retrieve mechanic's id from localStorage (or another source if stored elsewhere)
  const mechanicId = localStorage.getItem("mechanicId");

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${USER_API_END_POINT}/mechanics/logout`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      localStorage.removeItem("token");
      localStorage.removeItem("mechanicInfo");
      localStorage.removeItem("mechanicId"); // Remove mechanicId as well
      navigate("/");
    } catch (error) {
      console.log("Logout failed:", error);
    }
    console.log("mechID from localStorage", mechanicId);
  };

  return (
    <div>
      <nav className="flex justify-between bg-black text-white items-center p-4 text-xl">
        <h1 className="ml-2 font-semibold text-2xl">
          <span className="text-blue-600">M</span>ech
          <span className="text-orange-600">H</span>elp
        </h1>

        <div className="hidden md:flex gap-10 justify-center">
          <NavLink
            to="/MechDashboard"
            className={({ isActive }) =>
              `font-semibold hover:text-gray-400 ${isActive ? "text-blue-300" : "text-white"}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/MechDashboard/profile" 
            className={({ isActive }) =>
              `font-semibold hover:text-gray-400 ${isActive ? "text-blue-300" : "text-white"}`
            }
          >
            Profile
          </NavLink>
          <NavLink
           to="/MechDashboard/requests"
          
 
            className={({ isActive }) =>
              `font-semibold hover:text-gray-400 ${isActive ? "text-blue-300" : "text-white"}`
            }
          >
            Customer Requests
          </NavLink>
          <NavLink
            to="/displayreq" 
            className={({ isActive }) =>
              `font-semibold hover:text-gray-400 ${isActive ? "text-blue-300" : "text-white"}`
            }
          >
            History
          </NavLink>
        </div>

        <button
          onClick={handleLogout}
          className="hidden md:block bg-blue-700 px-3 py-1 rounded-full text-white font-semibold cursor-pointer hover:bg-amber-200 hover:text-black mr-2"
        >
          Logout
        </button>

        <button
          className="md:hidden text-white text-3xl mr-4"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          <IoMdMenu />
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden bg-black text-white p-4 space-y-3 text-center">
          <NavLink
            to="/MechDashboard"
            onClick={toggleMenu}
            className="block font-semibold hover:text-gray-400"
          >
            Home
          </NavLink>
          <NavLink
            to="/MechDashboard/profile" 
            onClick={toggleMenu}
            className="block font-semibold hover:text-gray-400"
          >
            Profile
          </NavLink>
          <NavLink
           to="/MechDashboard/requests"
            onClick={toggleMenu}
            className="block font-semibold hover:text-gray-400"
          >
            Customer Requests
          </NavLink>
          <NavLink
            to="/displayreq" 
            onClick={toggleMenu}
            className="block font-semibold hover:text-gray-400"
          >
            History
          </NavLink>
          <button
            onClick={() => {
              handleLogout();
              toggleMenu();
            }}
            className="bg-blue-700 px-3 py-1 rounded-full text-white font-semibold cursor-pointer hover:bg-amber-200 hover:text-black mt-3"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default MechNavBar;
