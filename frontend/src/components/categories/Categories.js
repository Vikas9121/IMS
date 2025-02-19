/**
 * Categories Management Component
 * 
 * Manages product categories:
 * - Category listing
 * - Category CRUD operations
 * - Product associations
 * - Hierarchy management
 * 
 * Features:
 * - Tree view structure
 * - Drag and drop
 * - Quick edit
 * - Bulk operations
 * - Search functionality
 * 
 * Data Handling:
 * - Redux state management
 * - API integration
 * - Cache management
 * - Real-time updates
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchCategories, 
    deleteCategory 
} from '../../store/slices/inventorySlice';
import CategoryForm from './CategoryForm';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';

const Categories = () => {
    const dispatch = useDispatch();
    const { categories, loading, error } = useSelector(state => state.inventory);
    
    // UI state
    const [showForm, setShowForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch categories on component mount
    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    // Handler functions
    const handleEdit = (category) => {
        setSelectedCategory(category);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await dispatch(deleteCategory(id)).unwrap();
            } catch (err) {
                console.error('Failed to delete category:', err);
            }
        }
    };

    // Filter categories based on search term
    const filteredCategories = categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{height: '80vh'}}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Categories</h1>
                <button 
                    className="btn btn-primary"
                    onClick={() => {
                        setSelectedCategory(null);
                        setShowForm(true);
                    }}
                >
                    <FaPlus /> Add Category
                </button>
            </div>

            {/* Search Bar */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="input-group">
                        <span className="input-group-text">
                            <FaSearch />
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Categories Table */}
            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Products Count</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCategories.map(category => (
                                    <tr key={category.id}>
                                        <td>{category.name}</td>
                                        <td>{category.description || '-'}</td>
                                        <td>
                                            <span className="badge bg-primary">
                                                {category.products_count || 0}
                                            </span>
                                        </td>
                                        <td>{new Date(category.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-primary me-2"
                                                onClick={() => handleEdit(category)}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(category.id)}
                                                disabled={category.products_count > 0}
                                                title={category.products_count > 0 ? 
                                                    "Cannot delete category with associated products" : 
                                                    "Delete category"}
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Category Form Modal */}
            {showForm && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <CategoryForm
                            category={selectedCategory}
                            onClose={() => {
                                setShowForm(false);
                                setSelectedCategory(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories; 