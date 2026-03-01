import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Mountain,
  Menu,
  X,
  LogOut,
  User,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import clsx from "clsx";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/");
  };

  const publicLinks = [
    { to: "/", label: "Home" },
    { to: "/feed", label: "Community" },
  ];

  const privateLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/chat", label: "AI Guide" },
    { to: "/map", label: "Route Map" },
    { to: "/feed", label: "Community" },
  ];

  const links = isAuthenticated ? privateLinks : publicLinks;
  const isLight = theme === "light";

  return (
    <nav
      className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300 ${
        isLight
          ? "border-slate-200 bg-white/80"
          : "border-mountain-700/50 bg-mountain-900/80"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Mountain className="w-7 h-7 text-saffron-500 group-hover:text-saffron-400 transition-colors" />
            <span className="font-display text-lg font-bold tracking-wide text-stone-100">
              Yatra <span className="text-saffron-500">Saathi</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  clsx("nav-link", isActive && "text-saffron-400")
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right side: theme toggle + auth buttons OR avatar dropdown */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-stone-400 hover:text-saffron-400 hover:bg-mountain-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-saffron-500/60 transition-all focus:outline-none focus:ring-2 focus:ring-saffron-500"
                >
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border-2 border-mountain-600"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-mountain-600 flex items-center justify-center border-2 border-mountain-600">
                      <User className="w-4 h-4 text-stone-300" />
                    </div>
                  )}
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-56 rounded-xl border shadow-xl py-2 z-50 transition-colors duration-300 ${
                      isLight
                        ? "bg-white border-slate-200 shadow-slate-200/50"
                        : "bg-mountain-800 border-mountain-600 shadow-black/30"
                    }`}
                  >
                    {/* User info header */}
                    <div
                      className={`px-4 py-2.5 border-b ${isLight ? "border-slate-200" : "border-mountain-700"}`}
                    >
                      <p className="text-sm font-semibold text-stone-100 truncate">
                        {user?.full_name}
                      </p>
                      <p className="text-xs text-stone-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                        isLight
                          ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          : "text-stone-300 hover:bg-mountain-700 hover:text-stone-100"
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      Edit Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors w-full text-left ${
                        isLight
                          ? "text-slate-600 hover:bg-red-50 hover:text-red-500"
                          : "text-stone-300 hover:bg-mountain-700 hover:text-red-400"
                      }`}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary py-2 px-4 text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-stone-400 hover:text-stone-200"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className={`md:hidden border-t px-4 py-4 flex flex-col gap-4 transition-colors duration-300 ${
            isLight
              ? "border-slate-200 bg-white/95"
              : "border-mountain-700/50 bg-mountain-900/95"
          }`}
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="nav-link text-base"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <button
            onClick={toggleTheme}
            className="nav-link text-base flex items-center gap-2"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="nav-link text-base flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm w-full"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <Link
                to="/login"
                className="btn-secondary text-sm flex-1 text-center"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary text-sm flex-1 text-center"
                onClick={() => setMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
