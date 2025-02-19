/**
 * Inventory Management Redux Slice
 * 
 * Manages the state for inventory-related features:
 * - Products management
 * - Categories management
 * - Stock movements
 * - Dashboard data
 * 
 * Features:
 * - CRUD operations for products
 * - CRUD operations for categories
 * - Stock movement tracking
 * - Data filtering and sorting
 * - Cache management
 * 
 * State Structure:
 * - products: Product[]
 * - categories: Category[]
 * - stock: StockMovement[]
 * - loading: boolean
 * - error: string | null
 * - filters: FilterState
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for Products
export const fetchProducts = createAsyncThunk(
    'inventory/fetchProducts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/products/');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch products');
        }
    }
);

export const createProduct = createAsyncThunk(
    'inventory/createProduct',
    async (productData, { rejectWithValue }) => {
        try {
            const response = await api.post('/api/products/', productData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create product');
        }
    }
);

export const updateProduct = createAsyncThunk(
    'inventory/updateProduct',
    async ({ id, ...productData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/api/products/${id}/`, productData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to update product');
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'inventory/deleteProduct',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/api/products/${id}/`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to delete product');
        }
    }
);

// Async thunks for Categories
export const fetchCategories = createAsyncThunk(
    'inventory/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/categories/');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch categories');
        }
    }
);

export const createCategory = createAsyncThunk(
    'inventory/createCategory',
    async (categoryData, { rejectWithValue }) => {
        try {
            const response = await api.post('/api/categories/', categoryData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create category');
        }
    }
);

// Update Category
export const updateCategory = createAsyncThunk(
    'inventory/updateCategory',
    async ({ id, ...categoryData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/api/categories/${id}/`, categoryData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to update category');
        }
    }
);

// Delete Category
export const deleteCategory = createAsyncThunk(
    'inventory/deleteCategory',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/categories/${id}/`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Dashboard thunk
export const fetchDashboardData = createAsyncThunk(
    'inventory/fetchDashboardData',
    async (days = 30, { rejectWithValue }) => {
        try {
            console.log('Fetching dashboard data...');
            const response = await api.get(`/api/dashboard/?days=${days}`);
            console.log('Dashboard response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Dashboard fetch error:', error);
            return rejectWithValue(
                error.response?.data?.error || 
                error.message || 
                'Failed to fetch dashboard data'
            );
        }
    }
);

// Add this with other thunks
export const fetchStock = createAsyncThunk(
    'inventory/fetchStock',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/stocks/');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch stock movements');
        }
    }
);

// Create Stock Movement
export const createStock = createAsyncThunk(
    'inventory/createStock',
    async (stockData, { rejectWithValue }) => {
        try {
            const response = await api.post('/api/stocks/', stockData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create stock movement');
        }
    }
);

// Update Stock Movement
export const updateStock = createAsyncThunk(
    'inventory/updateStock',
    async ({ id, ...stockData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/api/stocks/${id}/`, stockData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to update stock movement');
        }
    }
);

// Delete Stock Movement
export const deleteStock = createAsyncThunk(
    'inventory/deleteStock',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/api/stocks/${id}/`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to delete stock movement');
        }
    }
);

const initialState = {
    data: null,
    loading: false,
    error: null,
    products: [],
    categories: [],
    selectedProduct: null,
    selectedCategory: null,
    // Filter state for products and categories
    filters: {
        // Product filtering options
        products: {
            search: '',        // Text search for product name/description
            category: '',      // Filter by category ID
            sortBy: 'name',    // Field to sort by (name, price, etc.)
            sortOrder: 'asc',   // Sort direction (asc/desc)
            stockStatus: ''
        },
        // Category filtering options
        categories: {
            search: '',        // Text search for category name/description
            sortBy: 'name',    // Field to sort by
            sortOrder: 'asc'   // Sort direction
        }
    },
    stock: [],
};

const inventorySlice = createSlice({
    name: 'inventory',
    initialState,
    reducers: {
        clearError: (state, action) => {
            state.error = null;
        },
        setSelectedProduct: (state, action) => {
            state.selectedProduct = action.payload;
        },
        setSelectedCategory: (state, action) => {
            state.selectedCategory = action.payload;
        },
        // Update specific filter value for a section (products/categories)
        setFilter: (state, action) => {
            const { section, filter, value } = action.payload;
            state.filters[section][filter] = value;
        },
        // Reset filters to initial state for a specific section
        clearFilters: (state, action) => {
            state.filters[action.payload] = {
                category: '',
                stockStatus: ''
            };
        }
    },
    extraReducers: (builder) => {
        builder
            // Dashboard cases
            .addCase(fetchDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(fetchDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Products cases
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.products = action.payload;
                state.loading = false;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch products';
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.products.push(action.payload);
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.products.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products = state.products.filter(p => p.id !== action.payload);
            })

            // Categories cases
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
                state.loading = false;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.categories.push(action.payload);
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                const index = state.categories.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.categories[index] = action.payload;
                }
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.categories = state.categories.filter(c => c.id !== action.payload);
            })

            // Stock cases
            .addCase(fetchStock.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStock.fulfilled, (state, action) => {
                state.stock = action.payload;
                state.loading = false;
            })
            .addCase(fetchStock.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createStock.fulfilled, (state, action) => {
                state.stock.unshift(action.payload);
            })
            .addCase(updateStock.fulfilled, (state, action) => {
                const index = state.stock.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.stock[index] = action.payload;
                }
            })
            .addCase(deleteStock.fulfilled, (state, action) => {
                state.stock = state.stock.filter(s => s.id !== action.payload);
            });
    }
});

export const { clearError, setSelectedProduct, setSelectedCategory, setFilter, clearFilters } = inventorySlice.actions;
export default inventorySlice.reducer; 