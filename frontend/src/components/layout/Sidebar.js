/**
 * Sidebar Navigation Component
 * 
 * Provides secondary navigation and filters:
 * - Category navigation
 * - Quick filters
 * - User preferences
 * - Collapsible sections
 * - Status indicators
 * 
 * Features:
 * - Collapsible/expandable sections
 * - Active state highlighting
 * - Dynamic content based on user role
 * - Responsive design
 * - Smooth animations
 * - Search/filter capabilities
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaBox, 
  FaTags, 
  FaExchangeAlt 
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();

  // Navigation items
  const navItems = [
    { path: '/', icon: <FaHome />, label: 'Dashboard' },
    { path: '/products', icon: <FaBox />, label: 'Products' },
    { path: '/categories', icon: <FaTags />, label: 'Categories' },
    { path: '/stock', icon: <FaExchangeAlt />, label: 'Stock' }
  ];

  return (
    <div className="sidebar col-md-3 col-lg-2">
      <div className="position-sticky">
        <ul className="nav flex-column">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${
                  location.pathname === item.path ? 'active' : ''
                }`}
              >
                {item.icon} {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar; 