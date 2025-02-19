/**
 * Root Application Component
 * 
 * Main application container that handles:
 * - Route configuration
 * - Authentication state
 * - Protected routes
 * - Layout structure
 * - Global error boundaries
 * - Theme provider
 * - Redux store provider
 * 
 * Features:
 * - Protected route handling
 * - Authentication persistence
 * - Global error handling
 * - Loading states
 * - Route transitions
 * - Responsive layouts
 * 
 * Component Structure:
 * - App
 *   - AuthProvider
 *     - Router
 *       - Layout
 *         - Navbar
 *         - Sidebar
 *         - Content
 *           - Routes
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import PrivateRoute from './components/auth/PrivateRoute';
import InventoryPredictions from './components/predictions/InventoryPredictions';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

// Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Page Components
import Dashboard from './components/dashboard/Dashboard';
import Products from './components/products/Products';
import Categories from './components/categories/Categories';
import Stock from './components/stock/Stock';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/Profile';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public Routes - Keep these BEFORE the protected routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route path="/*" element={
            <PrivateRoute>
              <>
                <Navbar />
                <div className="container-fluid">
                  <div className="row">
                    <Sidebar />
                    <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/stock" element={<Stock />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/predictions" element={<InventoryPredictions />} />
                      </Routes>
                    </main>
                  </div>
                </div>
                <Footer />
              </>
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
