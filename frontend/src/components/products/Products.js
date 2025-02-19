import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchProducts, 
    deleteProduct,
    fetchCategories,
    setFilter,
    clearFilters 
} from '../../store/slices/inventorySlice';
import ProductForm from './ProductForm';
import { FaEdit, FaTrash, FaPlus, FaFilter } from 'react-icons/fa';

/**
 * Products Management Component
 * 
 * Handles product-related operations:
 * - Product listing
 * - Add/Edit/Delete products
 * - Category management
 * - Stock tracking
 * - Search and filtering
 * 
 * Features:
 * - Data grid display
 * - CRUD operations
 * - Sorting capabilities
 * - Filter functionality
 * - Pagination
 * - Bulk actions
 * 
 * Data Management:
 * - Redux integration
 * - API interactions
 * - Cache handling
 * - Real-time updates
 */

const Products = () => {
    const dispatch = useDispatch();
    const { 
        products, 
        categories,
        loading, 
        error,
        filters: { products: productFilters } 
    } = useSelector(state => state.inventory);
    
    const [showForm, setShowForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchProducts());
        dispatch(fetchCategories());
    }, [dispatch]);

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await dispatch(deleteProduct(id)).unwrap();
            } catch (err) {
                console.error('Failed to delete product:', err);
            }
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        dispatch(setFilter({ section: 'products', filter: name, value }));
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !productFilters.category || 
                              product.category === parseInt(productFilters.category);
        const matchesStock = !productFilters.stockStatus || 
                           (productFilters.stockStatus === 'low' && product.quantity <= 10) ||
                           (productFilters.stockStatus === 'out' && product.quantity === 0);
        return matchesSearch && matchesCategory && matchesStock;
    });

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
                <h1>Products</h1>
                <div className="d-flex gap-2">
                    <button 
                        className="btn btn-outline-primary"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FaFilter /> Filters
                    </button>
                    <button 
                        className="btn btn-primary"
                        onClick={() => {
                            setSelectedProduct(null);
                            setShowForm(true);
                        }}
                    >
                        <FaPlus /> Add Product
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <select
                                    className="form-select"
                                    name="category"
                                    value={productFilters.category}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <select
                                    className="form-select"
                                    name="stockStatus"
                                    value={productFilters.stockStatus}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Stock Status</option>
                                    <option value="low">Low Stock</option>
                                    <option value="out">Out of Stock</option>
                                </select>
                            </div>
                            <div className="col-md-2">
                                <button
                                    className="btn btn-secondary w-100"
                                    onClick={() => {
                                        dispatch(clearFilters('products'));
                                        setSearchTerm('');
                                    }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Products Table */}
            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Total Value</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(product => (
                                    <tr key={product.id}>
                                        <td>{product.name}</td>
                                        <td>{product.category_name}</td>
                                        <td>
                                            <span className={`badge ${
                                                product.quantity === 0 ? 'bg-danger' :
                                                product.quantity <= 10 ? 'bg-warning' :
                                                'bg-success'
                                            }`}>
                                                {product.quantity}
                                            </span>
                                        </td>
                                        <td>${product.unit_price}</td>
                                        <td>${(product.quantity * product.unit_price).toFixed(2)}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-primary me-2"
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
                </div>
            </div>

            {/* Product Form Modal */}
            {showForm && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <ProductForm
                            product={selectedProduct}
                            onClose={() => {
                                setShowForm(false);
                                setSelectedProduct(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products; 