import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiPackage } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import './Navigation.css';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout, isAuthenticated, isAuthLoading } = useAuth();
  const { getTotalItems } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    const userName = user?.firstName || 'user';
    setIsDropdownOpen(false);
    logout();
    showToast(`Goodbye ${userName}! You have been logged out.`);
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide navigation on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const getUserInitials = () => {
    if (!user) return '';
    const first = user.firstName?.[0] ?? '';
    const last = user.lastName?.[0] ?? '';
    return (first + last).toUpperCase() || (user.email[0]?.toUpperCase() ?? 'U');
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            RetailHub
          </Link>
        </div>

        <div className={`nav-links ${isMenuOpen ? 'nav-links-open' : ''}`}>
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/products" className="nav-link">
            Products
          </Link>
          <Link to="/categories" className="nav-link">
            Categories
          </Link>

          <div className="nav-actions">
            <Link to="/cart" className="cart-link">
              <FiShoppingCart />
              {getTotalItems() > 0 && (
                <span className="cart-badge">{getTotalItems()}</span>
              )}
            </Link>

            {isAuthLoading ? (
              <div className="auth-loading">
                <span>Loading...</span>
              </div>
            ) : isAuthenticated ? (
              <div className="user-menu" ref={dropdownRef}>
                <button
                  className="user-info"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  type="button"
                >
                  <span className="user-avatar">{getUserInitials()}</span>
                  <span className="user-name">{user?.firstName}</span>
                </button>
                {isDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <span className="dropdown-avatar">{getUserInitials()}</span>
                      <div className="dropdown-user-details">
                        <span className="dropdown-user-name">
                          {user?.firstName} {user?.lastName}
                        </span>
                        <span className="dropdown-user-email">{user?.email}</span>
                      </div>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <FiUser /> Profile
                    </Link>
                    <Link to="/orders" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <FiPackage /> Orders
                    </Link>
                    <div className="dropdown-divider" />
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <FiLogOut /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/signup" className="nav-link signup-btn">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;