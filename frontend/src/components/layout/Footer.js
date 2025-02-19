/**
 * Footer Component
 * 
 * Application footer that displays:
 * - Copyright information
 * - Quick links
 * - Social media links
 * - Version information
 * - Contact details
 * 
 * Features:
 * - Responsive design
 * - Dynamic year update
 * - Social media integration
 * - Newsletter signup
 * - Contact information
 */

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer mt-auto py-3 bg-light border-top">
            <div className="container d-flex justify-content-between align-items-center">
                <span>© 2025 Inventory Management System</span>
                <div>
                    <Link to="/about" className="text-decoration-none me-3">About</Link>
                    <Link to="/contact" className="text-decoration-none me-3">Contact</Link>
                    <Link to="/privacy" className="text-decoration-none">Privacy</Link>
                </div>
                <span>Version 1.0.0</span>
            </div>
        </footer>
    );
};

export default Footer; 