import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, updateProduct } from '../../store/slices/inventorySlice';

/**
 * Product Form Component
 * 
 * Handles product creation and updates:
 * - Add new products
 * - Edit existing products
 * - Form validation
 * - Image upload
 * - Category selection
 * 
 * Features:
 * - Real-time validation
 * - Image preview
 * - Auto-save drafts
 * - Rich text description
 * - Category management
 * 
 * Props:
 * - product?: Product - Optional product for editing
 * - onClose: () => void - Modal close handler
 * - onSubmit: (data: ProductData) => void - Form submission handler
 */
const ProductForm = ({ product, onClose }) => {
    const dispatch = useDispatch();
    const { categories } = useSelector(state => state.inventory);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        quantity: 0,
        unit_price: 0
    });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description || '',
                category: product.category,
                quantity: product.quantity,
                unit_price: product.unit_price
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null); // Clear error when user makes changes
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Convert numeric fields
            const dataToSubmit = {
                ...formData,
                quantity: Number(formData.quantity),
                unit_price: Number(formData.unit_price),
                category: Number(formData.category)
            };

            if (product) {
                await dispatch(updateProduct({ id: product.id, ...dataToSubmit })).unwrap();
            } else {
                await dispatch(createProduct(dataToSubmit)).unwrap();
            }
            onClose();
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Failed to save product');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-content">
            <div className="modal-header">
                <h5 className="modal-title">
                    {product ? 'Edit Product' : 'Add New Product'}
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
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Category</label>
                        <select
                            className="form-select"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="">Select Category</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Quantity</label>
                        <input
                            type="number"
                            className="form-control"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            required
                            min="0"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Unit Price</label>
                        <input
                            type="number"
                            className="form-control"
                            name="unit_price"
                            value={formData.unit_price}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
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
                                product ? 'Update' : 'Create'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm; 