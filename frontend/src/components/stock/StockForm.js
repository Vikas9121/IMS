/**
 * Stock Movement Form Component
 * 
 * Handles stock movement operations:
 * - Stock in/out recording
 * - Quantity validation
 * - Product selection
 * - Movement type selection
 * 
 * Features:
 * - Quantity validation
 * - Product search
 * - Movement type selection
 * - Notes/comments
 * - Date selection
 * 
 * Props:
 * - stockMovement?: StockMovement - Optional movement for editing
 * - onClose: () => void - Modal close handler
 * - onSubmit: (data: StockMovementData) => void - Form submission handler
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createStock, updateStock } from '../../store/slices/inventorySlice';

const StockForm = ({ stockMovement, onClose }) => {
    const dispatch = useDispatch();
    const { products } = useSelector(state => state.inventory);
    const [formData, setFormData] = useState({
        product: '',
        type: 'IN',
        quantity_changed: 0,
        notes: ''
    });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (stockMovement) {
            setFormData({
                product: stockMovement.product,
                type: stockMovement.type,
                quantity_changed: stockMovement.quantity_changed,
                notes: stockMovement.notes || ''
            });
        }
    }, [stockMovement]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const dataToSubmit = {
                ...formData,
                product: Number(formData.product),
                quantity_changed: Number(formData.quantity_changed)
            };

            if (stockMovement) {
                await dispatch(updateStock({ id: stockMovement.id, ...dataToSubmit })).unwrap();
            } else {
                await dispatch(createStock(dataToSubmit)).unwrap();
            }
            onClose();
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Failed to save stock movement');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-content">
            <div className="modal-header">
                <h5 className="modal-title">
                    {stockMovement ? 'Edit Stock Movement' : 'Add Stock Movement'}
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
                        <label className="form-label">Product</label>
                        <select
                            className="form-select"
                            name="product"
                            value={formData.product}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="">Select Product</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.name} (Current Stock: {product.quantity})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Type</label>
                        <select
                            className="form-select"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="IN">Stock In</option>
                            <option value="OUT">Stock Out</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Quantity</label>
                        <input
                            type="number"
                            className="form-control"
                            name="quantity_changed"
                            value={formData.quantity_changed}
                            onChange={handleChange}
                            required
                            min="1"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Notes</label>
                        <textarea
                            className="form-control"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Add any relevant notes about this stock movement"
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
                                stockMovement ? 'Update' : 'Create'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockForm; 