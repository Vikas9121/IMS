/**
 * Dashboard Component
 * 
 * Main dashboard displaying:
 * - Key metrics and statistics
 * - Stock level warnings
 * - Recent activities
 * - Charts and graphs
 * - Transaction summary
 * Uses Chart.js for visualizations
 * 
 * Features:
 * - Real-time updates
 * - Interactive charts
 * - Data summaries
 * - Quick navigation
 * - Status indicators
 * - Alert notifications
 * 
 * Data Display:
 * - Inventory levels
 * - Recent transactions
 * - Stock alerts
 * - Performance metrics
 * - User activities
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from '../../store/slices/inventorySlice';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const dispatch = useDispatch();
    const { data, loading, error } = useSelector(state => state.inventory);
    const [timeRange, setTimeRange] = useState('30');

    useEffect(() => {
        dispatch(fetchDashboardData(timeRange));
    }, [dispatch, timeRange]);

    const handleTimeRangeChange = (e) => {
        setTimeRange(e.target.value);
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{height: '80vh'}}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    if (error) return <div className="alert alert-danger m-3">{error}</div>;

    if (!data) return <div className="alert alert-info m-3">No data available</div>;

    // Prepare data for stock movements chart
    const stockMovementsData = {
        labels: ['Stock Movements'],
        datasets: [
            {
                label: 'Stock In',
                data: [data.stock_movements?.stock_in || 0],
                backgroundColor: 'rgba(40, 167, 69, 0.5)',
            },
            {
                label: 'Stock Out',
                data: [data.stock_movements?.stock_out || 0],
                backgroundColor: 'rgba(220, 53, 69, 0.5)',
            },
        ],
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Dashboard</h1>
                <select 
                    className="form-select" 
                    style={{width: 'auto'}} 
                    value={timeRange}
                    onChange={handleTimeRangeChange}
                >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card bg-primary text-white h-100">
                        <div className="card-body">
                            <h5 className="card-title">Total Products</h5>
                            <h2 className="card-text">{data.inventory_summary?.total_products || 0}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success text-white h-100">
                        <div className="card-body">
                            <h5 className="card-title">Categories</h5>
                            <h2 className="card-text">{data.inventory_summary?.total_categories || 0}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-warning text-dark h-100">
                        <div className="card-body">
                            <h5 className="card-title">Low Stock</h5>
                            <h2 className="card-text">{data.inventory_summary?.low_stock_products || 0}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-info text-white h-100">
                        <div className="card-body">
                            <h5 className="card-title">Total Value</h5>
                            <h2 className="card-text">${data.inventory_summary?.total_inventory_value || 0}</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Stock Movements</h5>
                            <Bar data={stockMovementsData} />
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Recent Activity</h5>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Product</th>
                                            <th>Type</th>
                                            <th>Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.recent_activity?.map((activity, index) => (
                                            <tr key={index}>
                                                <td>{new Date(activity.created_at).toLocaleDateString()}</td>
                                                <td>{activity.product__name}</td>
                                                <td>
                                                    <span className={`badge ${
                                                        activity.type === 'IN' ? 'bg-success' : 'bg-danger'
                                                    }`}>
                                                        {activity.type}
                                                    </span>
                                                </td>
                                                <td>{activity.quantity_changed}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 