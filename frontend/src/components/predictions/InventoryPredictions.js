/**
 * Inventory Predictions Component
 * 
 * Provides inventory forecasting:
 * - Demand prediction
 * - Stock level forecasting
 * - Reorder point calculation
 * - Trend analysis
 * - Alert generation
 * 
 * Features:
 * - ML-based predictions
 * - Interactive charts
 * - Customizable timeframes
 * - Export capabilities
 * - Alert thresholds
 * 
 * Analysis Tools:
 * - Trend visualization
 * - Seasonal patterns
 * - Historical analysis
 * - Confidence levels
 * - Risk assessment
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Line } from 'react-chartjs-2';
import { FaChartLine, FaExclamationTriangle, FaRobot } from 'react-icons/fa';
import { fetchPredictions } from '../../store/slices/predictionSlice';
import { fetchProducts } from '../../store/slices/inventorySlice';

const InventoryPredictions = () => {
    const dispatch = useDispatch();
    const { predictions, loading } = useSelector(state => state.predictions);
    const { products } = useSelector(state => state.inventory);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [timeRange, setTimeRange] = useState('30'); // days

    useEffect(() => {
        dispatch(fetchProducts()); // Fetch products for dropdown
    }, [dispatch]);

    useEffect(() => {
        if (selectedProduct) {
            dispatch(fetchPredictions({ productId: selectedProduct, days: timeRange }));
        }
    }, [dispatch, selectedProduct, timeRange]);

    // Chart configuration
    const chartData = {
        labels: predictions?.dates || [],
        datasets: [
            {
                label: 'Historical Demand',
                data: predictions?.historical || [],
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false
            },
            {
                label: 'Predicted Demand',
                data: predictions?.forecast || [],
                borderColor: 'rgba(255, 99, 132, 1)',
                borderDash: [5, 5],
                fill: false
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Demand Forecast'
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Units'
                }
            }
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>
                    <FaRobot className="me-2" />
                    AI Inventory Predictions
                </h1>
            </div>

            <div className="card mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Select Product</label>
                            <select
                                className="form-select"
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                            >
                                <option value="">Choose a product...</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>
                                        {product.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Time Range</label>
                            <select
                                className="form-select"
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                            >
                                <option value="7">7 Days</option>
                                <option value="30">30 Days</option>
                                <option value="90">90 Days</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : selectedProduct ? (
                        <>
                            <div className="chart-container mb-4" style={{ height: '400px' }}>
                                <Line data={chartData} options={chartOptions} />
                            </div>

                            {predictions?.alerts && (
                                <div className="alert alert-warning mb-4">
                                    <FaExclamationTriangle className="me-2" />
                                    {predictions.alerts}
                                </div>
                            )}

                            <div className="row g-4">
                                <div className="col-md-4">
                                    <div className="card bg-light h-100">
                                        <div className="card-body text-center">
                                            <h5 className="card-title text-primary">Recommended Reorder Point</h5>
                                            <p className="display-4">
                                                {predictions?.reorderPoint || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card bg-light h-100">
                                        <div className="card-body text-center">
                                            <h5 className="card-title text-primary">Predicted Peak Demand</h5>
                                            <p className="display-4">
                                                {predictions?.peakDemand || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card bg-light h-100">
                                        <div className="card-body text-center">
                                            <h5 className="card-title text-primary">Confidence Score</h5>
                                            <p className="display-4">
                                                {predictions?.confidenceScore || 'N/A'}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-5 text-muted">
                            <FaChartLine size={48} className="mb-3" />
                            <h4>Select a product to view predictions</h4>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventoryPredictions; 