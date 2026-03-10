import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navigation.css';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
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

            {isAuthenticated ? (
              <div className="user-menu">
                <div className="user-info">
                  <FiUser />
                  <span className="user-name">{user?.firstName}</span>
                </div>
                <div className="user-dropdown">
                  <Link to="/profile" className="dropdown-item">
                    Profile
                  </Link>
                  <Link to="/orders" className="dropdown-item">
                    Orders
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <FiLogOut /> Logout
                  </button>
                </div>
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