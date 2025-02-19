/**
 * Inventory Predictions Redux Slice
 * 
 * Manages the state for AI-powered predictions:
 * - Demand forecasting
 * - Stock level predictions
 * - Reorder recommendations
 * 
 * Features:
 * - ML-based predictions
 * - Historical data analysis
 * - Confidence scoring
 * - Alert generation
 * 
 * State Structure:
 * - predictions: PredictionData
 * - loading: boolean
 * - error: string | null
 * - timeRange: number
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchPredictions = createAsyncThunk(
    'predictions/fetchPredictions',
    async ({ productId, days }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/api/predictions/${productId}/?days=${days}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch predictions');
        }
    }
);

const predictionSlice = createSlice({
    name: 'predictions',
    initialState: {
        predictions: null,
        loading: false,
        error: null
    },
    reducers: {
        clearPredictions: (state) => {
            state.predictions = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPredictions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPredictions.fulfilled, (state, action) => {
                state.loading = false;
                state.predictions = action.payload;
            })
            .addCase(fetchPredictions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearPredictions } = predictionSlice.actions;
export default predictionSlice.reducer; 