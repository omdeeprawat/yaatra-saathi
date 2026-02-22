import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Mountain, Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const publicLinks = [
    { to: '/', label: 'Home' },
    { to: '/feed', label: 'Community' },
  ];

  const privateLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/chat', label: 'AI Guide' },
    { to: '/map', label: 'Route Map' },
    { to: '/feed', label: 'Community' },
  ];

  const links = isAuthenticated ? privateLinks : publicLinks;

  return (
    <nav className="sticky top-0 z-50 border-b border-mountain-700/50 bg-mountain-900/80 backdrop-blur-md">
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
                  clsx('nav-link', isActive && 'text-saffron-400')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-stone-300 font-sans">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-mountain-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-stone-300" />
                    </div>
                  )}
                  <span>{user?.full_name.split(' ')[0]}</span>
                </div>
                <button onClick={handleLogout} className="btn-secondary py-2 px-4 flex items-center gap-1.5 text-sm">
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary py-2 px-4 text-sm">Login</Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-stone-400 hover:text-stone-200"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-mountain-700/50 bg-mountain-900/95 px-4 py-4 flex flex-col gap-4">
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
          {isAuthenticated ? (
            <button onClick={handleLogout} className="btn-secondary text-sm w-full">
              Logout
            </button>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="btn-secondary text-sm flex-1 text-center" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm flex-1 text-center" onClick={() => setMenuOpen(false)}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}