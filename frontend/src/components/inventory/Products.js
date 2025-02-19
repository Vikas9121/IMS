/**
 * Products Component
 * 
 * Manages product listing and operations including:
 * - Product listing with search and sort
 * - Add/Edit/Delete operations
 * - Category filtering
 * - Error handling and loading states
 * - Pagination (if implemented)
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    setSelectedProduct,
    clearError 
} from '../../store/slices/inventorySlice';
import { toggleModal } from '../../store/slices/uiSlice';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const Products = () => {
    const dispatch = useDispatch();
    const { 
        products, 
        loading: { products: isLoading }, 
        error: { products: error },
        selectedProduct 
    } = useSelector(state => state.inventory);
    const { modals } = useSelector(state => state.ui);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        quantity: 0,
        unit_price: 0
    });

    // Clear error when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearError('products'));
        };
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    // Reset form when selectedProduct changes
    useEffect(() => {
        if (selectedProduct) {
            setFormData(selectedProduct);
        } else {
            setFormData({
                name: '',
                description: '',
                category: '',
                quantity: 0,
                unit_price: 0
            });
        }
    }, [selectedProduct]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedProduct) {
            await dispatch(updateProduct({ id: selectedProduct.id, ...formData }));
        } else {
            await dispatch(createProduct(formData));
        }
        dispatch(toggleModal('addProduct'));
        dispatch(setSelectedProduct(null));
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            const resultAction = await dispatch(deleteProduct(id));
            if (deleteProduct.fulfilled.match(resultAction)) {
                // Show success message using UI slice if needed
            }
        }
    };

    const handleAddNew = () => {
        dispatch(setSelectedProduct(null));
        dispatch(toggleModal('addProduct'));
    };

    const handleEdit = (product) => {
        dispatch(setSelectedProduct(product));
        dispatch(toggleModal('addProduct'));
    };

    if (isLoading) return (
        <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    return (
        <div className="products-container">
            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => dispatch(clearError('products'))}
                    ></button>
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Products</h2>
                <button 
                    className="btn btn-primary"
                    onClick={handleAddNew}
                >
                    <FaPlus /> Add Product
                </button>
            </div>

            {/* Products Table */}
            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{product.category}</td>
                                <td>{product.quantity}</td>
                                <td>${product.unit_price}</td>
                                <td>
                                    <button 
                                        className="btn btn-sm btn-info me-2"
                                        onClick={() => handleEdit(product)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(product.id)}
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
            {modals.addProduct && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {selectedProduct ? 'Edit Product' : 'Add Product'}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close"
                                    onClick={() => {
                                        dispatch(toggleModal('addProduct'));
                                        dispatch(setSelectedProduct(null));
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
                                    <div className="modal-footer">
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                dispatch(toggleModal('addProduct'));
                                                dispatch(setSelectedProduct(null));
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            {selectedProduct ? 'Update' : 'Save'}
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

export default Products; 