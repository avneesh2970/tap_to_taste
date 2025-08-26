import { ArrowRight, Menu, X } from "lucide-react";
import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const onHome = location.pathname === "/";

  // const navItems = [
  //   { name: "Home", path: "/" },
  //   { name: "Features", path: "/features" },
  //   { name: "Pricing", path: "/pricing" },
  //   { name: "About Us", path: "/about" },
  //   { name: "Contact Us", path: "/contact" },
  // ];
  const items = [
    { name: "Home", id: "home" },
    { name: "Features", id: "features" },
    { name: "Pricing", id: "pricing" },
    { name: "About Us", id: "about" },
    { name: "Contact Us", id: "contact" },
  ];

  // const navLinkClasses = ({ isActive }) =>
  //   `block py-2 px-1 transition-colors duration-200 ${
  //     isActive
  //       ? "text-yellow-500 font-semibold"
  //       : "hover:text-black text-gray-700"
  //   }`;
  const linkBase =
    "block py-2 px-1 transition-colors duration-200 hover:text-yellow-400 text-gray-700";
  const activeClass = "text-yellow-500 font-semibold";
  const OFFSET = -80; // height of your fixed navbar
  return (
    <nav className="border-b border-gray-200 fixed top-0 left-0 right-0 z-50 bg-white shadow">
      <div className="flex items-center justify-between px-6 lg:px-20 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold">
          {/* <img
            src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png"
            alt="logo"
            className="w-6 h-6"
          /> */}
          {/* <span className="text-4xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-md hover:drop-shadow-xl transition-all duration-300">
            TapToTaste
          </span> */}
          <span className="lobster-regular text-3xl text-orange-600">
            Tap to Taste
          </span>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex gap-8 text-gray-700 font-medium cursor-pointer">
          {items.map(({ name, id }) => (
            <li key={id}>
              {onHome ? (
                <ScrollLink
                  to={id}
                  smooth={true}
                  duration={500}
                  offset={OFFSET}
                  spy={true}
                  activeClass={activeClass}
                  className={linkBase}
                >
                  {name}
                </ScrollLink>
              ) : (
                <Link to={`/#${id}`} className={linkBase}>
                  {name}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <a
          href={import.meta.env.VITE_ADMIN_SIGNUP_URL || "/"}
          className="hidden lg:flex items-center gap-2 bg-[#ff6900] hover:bg-[#ff2f00] transition text-white font-semibold py-2 px-4 rounded-full cursor-pointer"
        >
          Get Started For Free <ArrowRight size={24} />
        </a>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu with Slide Animation */}
      <div
        className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-4 flex flex-col gap-3 text-gray-700 font-medium">
          {items.map(({ name, id }) =>
            onHome ? (
              <ScrollLink
                key={id}
                to={id}
                smooth={true}
                duration={500}
                offset={OFFSET}
                spy={true}
                activeClass={activeClass}
                className={linkBase}
                onClick={() => setIsOpen(false)}
              >
                {name}
              </ScrollLink>
            ) : (
              <Link
                key={id}
                to={`/#${id}`}
                className={linkBase}
                onClick={() => setIsOpen(false)}
              >
                {name}
              </Link>
            )
          )}

          <a
            href={import.meta.env.VITE_ADMIN_SIGNUP_URL || "/"}
            className="mt-4 bg-yellow-400 hover:bg-yellow-500 transition text-black font-semibold py-2 px-4 rounded-full cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Get Started For Free
          </a>
        </div>
      </div>
    </nav>
  );
}
