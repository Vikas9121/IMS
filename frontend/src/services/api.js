/**
 * API Service Configuration
 * 
 * This module provides a centralized API client configuration using Axios.
 * It handles:
 * - Base URL configuration using environment variables
 * - Authentication token management
 * - Request/response interceptors
 * - Error handling with automatic logout on authentication failures
 * - Consistent error handling across the application
 * 
 * Usage:
 * import api from '../services/api';
 * 
 * // Making API calls
 * api.get('/endpoint');
 * api.post('/endpoint', data);
 */

import axios from 'axios';

// Create axios instance with environment-specific configuration
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request Interceptor
 * 
 * Automatically adds authentication token to all outgoing requests
 * Token is retrieved from localStorage where it's stored during login
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * 
 * Handles common API response scenarios:
 * - 401 Unauthorized: Clears local storage and redirects to login
 * - Other errors: Passes to the calling function for handling
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access by clearing token and redirecting
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Update the profile URL in any API calls
const getProfile = () => {
    return api.get('/api/auth/profile/');
};

export default api; 