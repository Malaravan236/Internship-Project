import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faBell,
  faSignInAlt,
  faSignOutAlt,
  faUser,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

type UserData = {
  username: string;
  email: string;
  uid: string;
  createdAt?: any;
};

interface NavbarProps {
  isHeaderScrolled: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isHeaderScrolled, isMenuOpen, setIsMenuOpen }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<UserData | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const profileRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const readUser = () => {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    };
    readUser();

    const onAuth = () => readUser();
    window.addEventListener("authStateChanged", onAuth);

    return () => window.removeEventListener("authStateChanged", onAuth);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("authStateChanged"));
    navigate("/login");
  };

  const isAdmin = user?.email === "admin@gmail.com";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${
        isHeaderScrolled ? "shadow-md py-2" : "shadow-sm py-3"
      }`}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          {/* Brand */}
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-gray-800 flex items-center"
          >
            <FontAwesomeIcon icon={faGraduationCap} className="text-emerald-600 mr-2" />
            Intern<span className="text-emerald-600">Connect</span>
          </button>

          {/* Mobile menu button */}
          <button
            className="lg:hidden flex flex-col space-y-1.5"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all ${isMenuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>

          {/* Menu */}
          <ul
            className={`lg:flex items-center gap-6 ${
              isMenuOpen
                ? "absolute top-full left-0 right-0 bg-white shadow-lg p-4 flex flex-col items-center gap-4"
                : "hidden lg:flex"
            }`}
          >
            <li>
              <button
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-emerald-600 flex items-center"
              >
                <FontAwesomeIcon icon={faHome} className="mr-2" />
                Home
              </button>
            </li>

            {/* Example links */}
            {user && !isAdmin && (
              <li>
                <button
                  onClick={() => navigate("/availableinterns")}
                  className="text-gray-600 hover:text-emerald-600 flex items-center"
                >
                  Available Internships
                </button>
              </li>
            )}

            {/* Right corner login/profile */}
            <li className="relative" ref={profileRef}>
              {!user ? (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                  Login
                </button>
              ) : (
                <div className="flex items-center">
                  <button
                    onClick={() => setShowUserDropdown((v) => !v)}
                    className="flex items-center text-gray-700 hover:text-emerald-600"
                  >
                    <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mr-2">
                      {user.username?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span className="font-medium">{user.username}</span>
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border z-50 overflow-hidden">
                      <button
                        onClick={() => navigate("/profile")}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        <FontAwesomeIcon icon={faUser} className="mr-2" />
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
