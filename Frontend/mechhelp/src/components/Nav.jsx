import React, { useState } from "react";
import { IoMdMenu } from "react-icons/io";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ Import axios
const USER_API_END_POINT = import.meta.env.VITE_USER_API_END_POINT;
const Nav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = async () => {
    try {
      await axios.post(`${USER_API_END_POINT}/logout`, {}, { withCredentials: true });
      navigate("/"); 
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="nav flex justify-between bg-linear-to-r from-gray-800 via-blue-700 to-gray-900 text-white items-center p-4 text-xl">
        <h1 className="ml-2 font-semibold text-2xl">
          <span className="text-blue-600">M</span>ech
          <span className="text-orange-600">H</span>elp
        </h1>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-10 justify-center">
          <NavLink
            to="/layout"
            className={({ isActive }) =>
              `font-semibold hover:text-gray-400 ${isActive ? "text-blue-300" : "text-white"
              }`
            }
          >
            Home
          </NavLink>
          
          <NavLink
            to="/layout/nearby-mechanic"
            className={({ isActive }) =>
              `font-semibold hover:text-gray-400 ${isActive ? "text-blue-300" : "text-white"
              }`
            }
          >
            Nearby Mechanics
          </NavLink>
          <NavLink
            to="/layout/profile"
            className={({ isActive }) =>
              `font-semibold hover:text-gray-400 ${isActive ? "text-blue-300" : "text-white"
              }`
            }
          >
            Profile
          </NavLink>
          <NavLink
            to="/layout/track"
            onClick={toggleMenu}
            className="block font-semibold hover:text-gray-400"
          >
            Track
          </NavLink>
          <NavLink
            to="/layout/history"
            onClick={toggleMenu}
            className="block font-semibold hover:text-gray-400"
          >
            History
          </NavLink>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="hidden md:block bg-blue-700 px-3 py-1 rounded-full text-white font-semibold cursor-pointer hover:bg-amber-200 hover:text-black mr-2"
        >
          Logout
        </button>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white text-3xl mr-4"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          <IoMdMenu />
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="nav md:hidden bg-linear-to-r from-gray-800 via-blue-700 to-gray-900 text-white p-4 space-y-3 text-center">
          <NavLink
            to="/layout"
            onClick={toggleMenu}
            className="block font-semibold hover:text-gray-400"
          >
            Home
          </NavLink>
          
          <NavLink
            to="/layout/nearby-mechanic"
            onClick={toggleMenu}
            className="block font-semibold hover:text-gray-400"
          >
            Nearby Mechanics
          </NavLink>
          <NavLink
            to="/layout/profile"
            onClick={toggleMenu}
            className="block font-semibold hover:text-gray-400"
          >
            Profile
          </NavLink>
          <NavLink
            to="/layout/track"
            onClick={toggleMenu}
            className="block font-semibold hover:text-gray-400"
          >
            Track
          </NavLink>
          <NavLink
            to="/layout/history"
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
            className="bg-black px-3 py-1 rounded-full text-white font-semibold cursor-pointer hover:bg-amber-200 hover:text-black mt-3"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Nav;
