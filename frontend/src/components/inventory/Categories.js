/**
 * Categories Component
 * 
 * Manages category listing and operations including:
 * - Category listing with search and sort
 * - Add/Edit/Delete operations
 * - Product count display
 * - Error handling and loading states
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    setSelectedCategory,
    clearError,
    setFilter 
} from '../../store/slices/inventorySlice';
import { toggleModal } from '../../store/slices/uiSlice';
import { FaEdit, FaTrash, FaPlus, FaSort, FaSearch } from 'react-icons/fa';

const Categories = () => {
    const dispatch = useDispatch();
    const { 
        categories, 
        loading: { categories: isLoading }, 
        error: { categories: error },
        selectedCategory,
        filters: { categories: categoryFilters } 
    } = useSelector(state => state.inventory);
    const { modals } = useSelector(state => state.ui);

    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    // Clear error when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearError('categories'));
        };
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    // Reset form when selectedCategory changes
    useEffect(() => {
        if (selectedCategory) {
            setFormData(selectedCategory);
        } else {
            setFormData({ name: '', description: '' });
        }
    }, [selectedCategory]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedCategory) {
            await dispatch(updateCategory({ id: selectedCategory.id, ...formData }));
        } else {
            await dispatch(createCategory(formData));
        }
        dispatch(toggleModal('addCategory'));
        dispatch(setSelectedCategory(null));
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            await dispatch(deleteCategory(id));
        }
    };

    // Filter and sort functions
    const handleSearch = (e) => {
        // Update search filter in Redux store
        dispatch(setFilter({
            section: 'categories',
            filter: 'search',
            value: e.target.value
        }));
    };

    const handleSort = (field) => {
        // Toggle sort order and update sort field
        const newOrder = categoryFilters.sortOrder === 'asc' ? 'desc' : 'asc';
        
        // Update sort field
        dispatch(setFilter({
            section: 'categories',
            filter: 'sortBy',
            value: field
        }));
        
        // Update sort direction
        dispatch(setFilter({
            section: 'categories',
            filter: 'sortOrder',
            value: newOrder
        }));
    };

    // Apply filters and sorting to categories
    const filteredCategories = categories
        // Filter by search term
        .filter(category => 
            category.name.toLowerCase().includes(categoryFilters.search.toLowerCase()) ||
            category.description.toLowerCase().includes(categoryFilters.search.toLowerCase())
        )
        // Sort by selected field and direction
        .sort((a, b) => {
            const sortField = categoryFilters.sortBy;
            const order = categoryFilters.sortOrder === 'asc' ? 1 : -1;
            return a[sortField].localeCompare(b[sortField]) * order;
        });

    if (isLoading) return (
        <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    return (
        <div className="categories-container">
            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => dispatch(clearError('categories'))}
                    ></button>
                </div>
            )}

            {/* Header with Search Bar */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Categories</h2>
                <div className="d-flex gap-2">
                    {/* Search Input */}
                    <div className="input-group">
                        <span className="input-group-text">
                            <FaSearch />
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search categories..."
                            value={categoryFilters.search}
                            onChange={handleSearch}
                        />
                    </div>
                    {/* Add Category Button */}
                    <button 
                        className="btn btn-primary"
                        onClick={() => dispatch(toggleModal('addCategory'))}
                    >
                        <FaPlus /> Add Category
                    </button>
                </div>
            </div>

            {/* Sortable Table Headers */}
            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            {/* Sortable column headers */}
                            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                                Name <FaSort />
                            </th>
                            <th onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>
                                Description <FaSort />
                            </th>
                            <th>Products Count</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.map(category => (
                            <tr key={category.id}>
                                <td>{category.name}</td>
                                <td>{category.description}</td>
                                <td>{category.products_count}</td>
                                <td>
                                    <button 
                                        className="btn btn-sm btn-info me-2"
                                        onClick={() => {
                                            dispatch(setSelectedCategory(category));
                                            dispatch(toggleModal('addCategory'));
                                        }}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(category.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {modals.addCategory && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {selectedCategory ? 'Edit Category' : 'Add Category'}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close"
                                    onClick={() => {
                                        dispatch(toggleModal('addCategory'));
                                        dispatch(setSelectedCategory(null));
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                name: e.target.value
                                            })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            value={formData.description}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                description: e.target.value
                                            })}
                                        />
                                    </div>
                                    <div className="modal-footer">
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                dispatch(toggleModal('addCategory'));
                                                dispatch(setSelectedCategory(null));
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            {selectedCategory ? 'Update' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories; 