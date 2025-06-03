import { useState, useRef, useEffect } from "react";
import {
  FiSettings,
  FiLogOut,
  FiUser,
  FiClock,
  FiChevronDown,
  FiShield,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useNLSContext } from "../context/NLSContext";

export function Navbar() {
  const { user, logout, timeUntilLogout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.is_admin;
  const { t } = useNLSContext();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-2 fixed top-0 left-0 right-0 z-40 h-16 flex-shrink-0">
      <div className="flex justify-between items-center h-full">
        <div className="flex items-center">
          <Link
            to="/dashboard"
            className="text-2xl font-bold text-white hover:text-blue-300 transition-colors"
          >
            Authron
          </Link>
        </div>
        {user && timeUntilLogout > 0 && (
          <div className="mr-4 flex items-center bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full text-blue-800 dark:text-blue-300 text-sm font-medium">
            <FiClock className="mr-2" size={14} />
            {formatTime(timeUntilLogout)}
          </div>
        )}

        <div className="flex items-center">
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={toggleMenu}
                className="flex items-center space-x-2 text-white hover:text-blue-300 focus:outline-none px-3 py-2 rounded-lg hover:bg-gray-800"
              >
                <span className="font-semibold">
                  {user.full_name || user.username}
                  {isAdmin && (
                    <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </span>
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white">
                  <FiUser size={18} />
                </div>
                <FiChevronDown size={16} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-700">
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm font-bold text-white">
                      {user.full_name || user.username}
                    </p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>

                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 flex items-center"
                  >
                    <FiSettings className="mr-2" size={16} />
                    {t("settings")}
                  </Link>

                  {isAdmin && (
                    <>
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 flex items-center"
                      >
                        <FiShield className="mr-2" size={16} />
                        {t("admin_panel")}
                      </Link>
                    </>
                  )}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                    }}
                    className="block px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center border-t border-gray-700"
                  >
                    <FiLogOut className="mr-2" size={16} />
                    {t("logout")}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
