/**
 * Navigation Bar Component
 * 
 * Main navigation header that provides:
 * - Brand logo and name
 * - Primary navigation links
 * - User account menu
 * - Responsive mobile menu
 * - Authentication status
 * - Search functionality
 * - Notifications
 * 
 * Features:
 * - Responsive design
 * - Dynamic menu based on auth status
 * - Active link highlighting
 * - Dropdown menus
 * - Mobile-friendly navigation
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { FaUser, FaSignOutAlt, FaChartLine } from 'react-icons/fa';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle user logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Inventory Management
        </Link>
        
        <div className="d-flex align-items-center">
          <Link to="/predictions" className="btn btn-link text-white me-3">
            <FaChartLine className="me-1" /> Predictions
          </Link>
          <Link to="/profile" className="btn btn-link text-white me-3">
            <FaUser className="me-1" /> Profile
          </Link>
          <button 
            onClick={handleLogout} 
            className="btn btn-outline-light"
          >
            <FaSignOutAlt className="me-1" /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 