/**
 * Redux Store Configuration
 * 
 * Configures and exports the Redux store with all reducers
 * and middleware
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import inventoryReducer from './slices/inventorySlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        inventory: inventoryReducer,
        ui: uiReducer
    }
});

// Now TypeScript types are valid
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 