/**
 * Stock Management Component
 * 
 * Handles inventory operations:
 * - Stock level tracking
 * - Stock movements
 * - Inventory adjustments
 * - Stock alerts
 * - Movement history
 * 
 * Features:
 * - Real-time updates
 * - Movement tracking
 * - Alert system
 * - History logging
 * - Report generation
 * 
 * Operations:
 * - Stock in/out
 * - Adjustments
 * - Transfers
 * - Returns
 * - Audits
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchStock, 
    fetchProducts,
    deleteStock 
} from '../../store/slices/inventorySlice';
import StockForm from './StockForm';
import { FaEdit, FaTrash, FaPlus, FaFilter, FaFileExport } from 'react-icons/fa';
import { CSVLink } from 'react-csv';

const Stock = () => {
    const dispatch = useDispatch();
    const { stock, products, loading, error } = useSelector(state => state.inventory);
    const [showForm, setShowForm] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        product: '',
        type: '',
        dateFrom: '',
        dateTo: '',
        search: ''
    });

    useEffect(() => {
        dispatch(fetchStock());
        dispatch(fetchProducts());
    }, [dispatch]);

    const handleEdit = (stockMovement) => {
        setSelectedStock(stockMovement);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this stock movement?')) {
            try {
                await dispatch(deleteStock(id)).unwrap();
            } catch (err) {
                console.error('Failed to delete stock movement:', err);
            }
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            product: '',
            type: '',
            dateFrom: '',
            dateTo: '',
            search: ''
        });
    };

    const filteredStock = stock.filter(movement => {
        const matchesProduct = !filters.product || movement.product === Number(filters.product);
        const matchesType = !filters.type || movement.type === filters.type;
        const matchesSearch = !filters.search || 
            movement.notes?.toLowerCase().includes(filters.search.toLowerCase()) ||
            movement.product_name.toLowerCase().includes(filters.search.toLowerCase());
        
        const movementDate = new Date(movement.created_at);
        const matchesDateFrom = !filters.dateFrom || movementDate >= new Date(filters.dateFrom);
        const matchesDateTo = !filters.dateTo || movementDate <= new Date(filters.dateTo);

        return matchesProduct && matchesType && matchesSearch && matchesDateFrom && matchesDateTo;
    });

    // Prepare CSV data
    const csvData = filteredStock.map(movement => ({
        Date: new Date(movement.created_at).toLocaleDateString(),
        Product: movement.product_name,
        Type: movement.type,
        Quantity: movement.quantity_changed,
        'Created By': movement.created_by_username,
        Notes: movement.notes
    }));

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
                <h1>Stock Movements</h1>
                <div className="d-flex gap-2">
                    <button 
                        className="btn btn-outline-primary"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FaFilter /> Filters
                    </button>
                    <CSVLink 
                        data={csvData}
                        filename={"stock-movements.csv"}
                        className="btn btn-success"
                        target="_blank"
                    >
                        <FaFileExport /> Export CSV
                    </CSVLink>
                    <button 
                        className="btn btn-primary"
                        onClick={() => {
                            setSelectedStock(null);
                            setShowForm(true);
                        }}
                    >
                        <FaPlus /> Add Movement
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-2">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search..."
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div className="col-md-2">
                                <select
                                    className="form-select"
                                    name="product"
                                    value={filters.product}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Products</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <select
                                    className="form-select"
                                    name="type"
                                    value={filters.type}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Types</option>
                                    <option value="IN">Stock In</option>
                                    <option value="OUT">Stock Out</option>
                                </select>
                            </div>
                            <div className="col-md-2">
                                <input
                                    type="date"
                                    className="form-control"
                                    name="dateFrom"
                                    value={filters.dateFrom}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div className="col-md-2">
                                <input
                                    type="date"
                                    className="form-control"
                                    name="dateTo"
                                    value={filters.dateTo}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div className="col-md-2">
                                <button
                                    className="btn btn-secondary w-100"
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stock Movements Table */}
            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Product</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Created By</th>
                                    <th>Notes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStock.map(movement => (
                                    <tr key={movement.id}>
                                        <td>{new Date(movement.created_at).toLocaleDateString()}</td>
                                        <td>{movement.product_name}</td>
                                        <td>
                                            <span className={`badge ${
                                                movement.type === 'IN' ? 'bg-success' : 'bg-danger'
                                            }`}>
                                                {movement.type}
                                            </span>
                                        </td>
                                        <td>{movement.quantity_changed}</td>
                                        <td>{movement.created_by_username}</td>
                                        <td>{movement.notes}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-primary me-2"
                                                onClick={() => handleEdit(movement)}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(movement.id)}
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

            {/* Stock Form Modal */}
            {showForm && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <StockForm
                            stockMovement={selectedStock}
                            onClose={() => {
                                setShowForm(false);
                                setSelectedStock(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stock; 