/**
 * Redux Store Configuration
 * 
 * Central store configuration that combines all reducers and middleware.
 * Configures:
 * - Auth state management
 * - Inventory management
 * - UI state (modals, alerts, etc.)
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import inventoryReducer from './slices/inventorySlice';
import predictionReducer from './slices/predictionSlice';

// Configure the Redux store with all reducers
export const store = configureStore({
    reducer: {
        auth: authReducer,        // Authentication state
        inventory: inventoryReducer, // Inventory management state
        predictions: predictionReducer
    },
    // Add middleware configuration if needed
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false // Disable for non-serializable data
        })
});

// Export store methods for components
export const getState = store.getState;
export const dispatch = store.dispatch;

export default store; 