/**
 * Stock Component
 * 
 * Manages stock movements (in/out) with:
 * - Stock movement history
 * - Add new stock movements
 * - Filter by product and date
 * - Stock level warnings
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaFilter } from 'react-icons/fa';

const Stock = () => {
  // State management
  const [stockMovements, setStockMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    product: '',
    quantity_changed: 0,
    type: 'IN',
    notes: ''
  });

  // Filter state
  const [filters, setFilters] = useState({
    product: '',
    type: '',
    date_from: '',
    date_to: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchStockMovements();
    fetchProducts();
  }, []);

  // Fetch stock movements from API
  const fetchStockMovements = async () => {
    try {
      const response = await axios.get('/api/stocks/');
      setStockMovements(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch stock movements');
      setLoading(false);
    }
  };

  // Fetch products for dropdown
  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products/');
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/stocks/', formData);
      fetchStockMovements();
      setShowModal(false);
    } catch (err) {
      setError('Failed to save stock movement');
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  // Apply filters
  const filteredMovements = stockMovements.filter(movement => {
    if (filters.product && movement.product.id !== parseInt(filters.product)) return false;
    if (filters.type && movement.type !== filters.type) return false;
    if (filters.date_from && new Date(movement.created_at) < new Date(filters.date_from)) return false;
    if (filters.date_to && new Date(movement.created_at) > new Date(filters.date_to)) return false;
    return true;
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="stock-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Stock Movements</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <FaPlus /> Add Movement
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">
            <FaFilter /> Filters
          </h5>
          <div className="row">
            <div className="col-md-3 mb-3">
              <label className="form-label">Product</label>
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
            <div className="col-md-3 mb-3">
              <label className="form-label">Type</label>
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
            <div className="col-md-3 mb-3">
              <label className="form-label">From Date</label>
              <input
                type="date"
                className="form-control"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">To Date</label>
              <input
                type="date"
                className="form-control"
                name="date_to"
                value={filters.date_to}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stock Movements Table */}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Notes</th>
              <th>Created By</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovements.map(movement => (
              <tr key={movement.id}>
                <td>{new Date(movement.created_at).toLocaleDateString()}</td>
                <td>{movement.product.name}</td>
                <td>
                  <span className={`badge ${movement.type === 'IN' ? 'bg-success' : 'bg-danger'}`}>
                    {movement.type}
                  </span>
                </td>
                <td>{movement.quantity_changed}</td>
                <td>{movement.notes}</td>
                <td>{movement.created_by.username}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Movement Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Stock Movement</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Product</label>
                    <select
                      className="form-select"
                      value={formData.product}
                      onChange={(e) => setFormData({
                        ...formData,
                        product: e.target.value
                      })}
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => setFormData({
                        ...formData,
                        type: e.target.value
                      })}
                      required
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
                      value={formData.quantity_changed}
                      onChange={(e) => setFormData({
                        ...formData,
                        quantity_changed: parseInt(e.target.value)
                      })}
                      required
                      min="1"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      value={formData.notes}
                      onChange={(e) => setFormData({
                        ...formData,
                        notes: e.target.value
                      })}
                    />
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save
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

export default Stock; 