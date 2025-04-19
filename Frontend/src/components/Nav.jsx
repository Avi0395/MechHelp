import React, { useState } from "react";
import { IoMdMenu } from "react-icons/io";
import { NavLink } from "react-router-dom";

const Nav = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div>
      {/* Navbar */}
      <nav className="flex justify-between bg-black text-white items-center p-4 text-xl">
        <h1 className="ml-2 font-semibold text-2xl">
          <span className="text-blue-600">M</span>ech
          <span className="text-orange-600">H</span>elp
        </h1>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-10 justify-center">
          <NavLink
            to="/layout"
            className={({ isActive }) =>
              `font-semibold hover:text-gray-400 ${
                isActive ? "text-blue-300" : "text-white"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/services"
            className={({ isActive }) =>
              `font-semibold hover:text-gray-400 ${
                isActive ? "text-blue-300" : "text-white"
              }`
            }
          >
            Services
          </NavLink>
          <NavLink
            to="/nearby-stores"
            className={({ isActive }) =>
              `font-semibold hover:text-gray-400 ${
                isActive ? "text-blue-300" : "text-white"
              }`
            }
          >
            Nearby Stores
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `font-semibold hover:text-gray-400 ${
                isActive ? "text-blue-300" : "text-white"
              }`
            }
          >
            Profile
          </NavLink>
        </div>

        {/* Logout Button */}
        <button className="hidden md:block bg-blue-700 px-3 py-1 rounded-full text-white font-semibold cursor-pointer hover:bg-amber-200 hover:text-black mr-2">
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
        <div className="md:hidden bg-black text-white p-4 space-y-3 text-center">
          <NavLink to="/layout" onClick={toggleMenu} className="block font-semibold hover:text-gray-400">
            Home
          </NavLink>
          <NavLink to="/services" onClick={toggleMenu} className="block font-semibold hover:text-gray-400">
            Services
          </NavLink>
          <NavLink to="/nearby-stores" onClick={toggleMenu} className="block font-semibold hover:text-gray-400">
            Nearby Stores
          </NavLink>
          <NavLink to="/profile" onClick={toggleMenu} className="block font-semibold hover:text-gray-400">
            Profile
          </NavLink>
          <button className="bg-blue-700 px-3 py-1 rounded-full text-white font-semibold cursor-pointer hover:bg-amber-200 hover:text-black mt-3">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Nav;
