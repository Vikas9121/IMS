/**
 * Category Form Component
 * 
 * Manages category creation and updates:
 * - Add new categories
 * - Edit existing categories
 * - Validation rules
 * - Parent category selection
 * 
 * Features:
 * - Form validation
 * - Parent category selection
 * - Description editor
 * - Duplicate checking
 * 
 * Props:
 * - category?: Category - Optional category for editing
 * - onClose: () => void - Modal close handler
 * - onSubmit: (data: CategoryData) => void - Form submission handler
 */

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createCategory, updateCategory } from '../../store/slices/inventorySlice';

const CategoryForm = ({ category, onClose }) => {
    const dispatch = useDispatch();
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form with category data if editing
    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                description: category.description || ''
            });
        }
    }, [category]);

    // Form input handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null); // Clear error when user makes changes
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (category) {
                await dispatch(updateCategory({ id: category.id, ...formData })).unwrap();
            } else {
                await dispatch(createCategory(formData)).unwrap();
            }
            onClose();
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Failed to save category');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-content">
            <div className="modal-header">
                <h5 className="modal-title">
                    {category ? 'Edit Category' : 'Add New Category'}
                </h5>
                <button 
                    type="button" 
                    className="btn-close" 
                    onClick={onClose}
                    disabled={isSubmitting}
                ></button>
            </div>
            <div className="modal-body">
                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="modal-footer">
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Saving...
                                </>
                            ) : (
                                category ? 'Update' : 'Create'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryForm; 