/**
 * Authentication Redux Slice
 * 
 * Manages the authentication state of the application including:
 * - User authentication status
 * - Login/logout functionality
 * - Loading states
 * - Error handling
 * - Token management
 * 
 * This slice is part of the Redux store and handles all authentication-related
 * state changes in a centralized manner.
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    token: localStorage.getItem('token'),        // JWT token from localStorage
    isAuthenticated: !!localStorage.getItem('token'), // Auth status based on token
    loading: false,                              // Loading state for async operations
    error: null,                                  // Error messages
    user: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        /**
         * Sets the authentication token and updates localStorage
         * @param {string} token - JWT authentication token
         */
        setToken: (state, action) => {
            state.token = action.payload;
            state.isAuthenticated = true;
            localStorage.setItem('token', action.payload);
        },
        // Handles user logout by clearing token and auth status
        logout: (state) => {
            localStorage.removeItem('token');
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        /**
         * Updates loading state during async operations
         * @param {boolean} loading - Loading state
         */
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        // Sets error messages
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
            // Clear token and auth status on authentication error
            if (action.payload && action.payload.includes('Invalid username or password')) {
                state.token = null;
                state.isAuthenticated = false;
                localStorage.removeItem('token');
            }
        },
        // Clears error messages
        clearError: (state) => {
            state.error = null;
        }
    }
});

export const { 
    setToken, 
    logout, 
    setLoading, 
    setError, 
    clearError 
} = authSlice.actions;

export default authSlice.reducer; 