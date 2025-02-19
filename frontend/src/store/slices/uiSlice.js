/**
 * UI Slice
 * 
 * Manages global UI state including:
 * - Alert messages (success, error, info)
 * - Modal visibility states
 * - Sidebar state
 * - Loading indicators
 */

import { createSlice } from '@reduxjs/toolkit';

// Initial UI state
const initialState = {
    // Alert message queue
    alerts: [], // [{id, type, message, timeout}]
    
    // Modal visibility states
    modals: {
        addProduct: false,    // Product creation/edit modal
        addCategory: false,   // Category creation/edit modal
        confirmDelete: false  // Delete confirmation modal
    },
    
    // Sidebar state
    sidebarOpen: true,       // Sidebar visibility toggle
    
    // Global loading state
    isLoading: false         // Global loading indicator
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        // Add a new alert to the queue
        addAlert: (state, action) => {
            const { type, message, timeout = 5000 } = action.payload;
            state.alerts.push({
                id: Date.now(),
                type,
                message,
                timeout
            });
        },
        
        // Remove an alert by ID
        removeAlert: (state, action) => {
            state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
        },
        
        // Toggle modal visibility
        toggleModal: (state, action) => {
            state.modals[action.payload] = !state.modals[action.payload];
        },
        
        // Set modal state explicitly
        setModal: (state, action) => {
            const { modal, isOpen } = action.payload;
            state.modals[modal] = isOpen;
        },
        
        // Toggle sidebar visibility
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        
        // Set global loading state
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        }
    }
});

export const { 
    addAlert, 
    removeAlert, 
    toggleModal, 
    setModal,
    toggleSidebar,
    setLoading 
} = uiSlice.actions;

export default uiSlice.reducer; 