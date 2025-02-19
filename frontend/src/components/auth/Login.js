/**
 * Login Component
 * 
 * A comprehensive login form component that provides:
 * - Username/password authentication
 * - Form validation
 * - Error handling
 * - Loading states
 * - Remember me functionality
 * - Password visibility toggle
 * - Forgot password link
 * - Registration link
 * 
 * The component uses Redux for state management and React Router
 * for navigation.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setToken, setLoading, setError } from '../../store/slices/authSlice';
import { FaEye, FaEyeSlash, FaLock, FaUser, FaBoxes, FaExclamationCircle } from 'react-icons/fa';
import api from '../../services/api';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector(state => state.auth);

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        // Check for remembered credentials
        const remembered = localStorage.getItem('rememberedUser');
        if (remembered) {
            const { username } = JSON.parse(remembered);
            setFormData(prev => ({ ...prev, username }));
            setRememberMe(true);
        }
    }, []); // Empty dependency array - only runs once when component mounts

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                dispatch(setError(null));
            }, 5000); // Error will disappear after 5 seconds

            return () => clearTimeout(timer);
        }
    }, [error, dispatch]);

    const validateForm = () => {
        const errors = {};
        if (!formData.username.trim()) {
            errors.username = 'Username is required';
        }
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear validation error when user types
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const response = await api.post('/api/auth/token/', formData);
            dispatch(setToken(response.data.access));
            
            if (rememberMe) {
                localStorage.setItem('rememberedUser', JSON.stringify({
                    username: formData.username
                }));
            } else {
                localStorage.removeItem('rememberedUser');
            }

            navigate('/');
        } catch (err) {
            console.log('Login Error:', {
                status: err.response?.status,
                data: err.response?.data,
                detail: err.response?.data?.detail
            });

            // Only clear password field, keep username
            setFormData(prev => ({
                ...prev,  // Keep existing values (including username)
                password: ''  // Only clear password
            }));

            // Set error message
            const errorMessage = err.response?.data?.detail || 'Failed to login. Please try again.';
            dispatch(setError(errorMessage));
        }

        dispatch(setLoading(false));
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-4">
                        <div className="card shadow-lg border-0">
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    <FaBoxes className="text-primary" style={{ fontSize: '3rem' }} />
                                    <h2 className="fw-bold mt-3">Welcome Back</h2>
                                    <p className="text-muted">Please sign in to continue</p>
                                </div>

                                {error && (
                                    <div 
                                        className="alert alert-danger" 
                                        role="alert"
                                        style={{
                                            marginBottom: '20px',
                                            fontSize: '1rem',
                                            padding: '1rem',
                                            backgroundColor: '#fff1f0',
                                            borderColor: '#ff4d4f',
                                            color: '#cf1322',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <FaExclamationCircle />
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <div className="input-group">
                                            <span className="input-group-text bg-light">
                                                <FaUser className="text-primary" />
                                            </span>
                                            <input
                                                type="text"
                                                className={`form-control ${validationErrors.username ? 'is-invalid' : ''}`}
                                                placeholder="Username"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                        </div>
                                        {validationErrors.username && (
                                            <div className="invalid-feedback d-block">
                                                {validationErrors.username}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <div className="input-group">
                                            <span className="input-group-text bg-light">
                                                <FaLock className="text-primary" />
                                            </span>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
                                                placeholder="Password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-light border"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {validationErrors.password && (
                                            <div className="invalid-feedback d-block">
                                                {validationErrors.password}
                                            </div>
                                        )}
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="rememberMe"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                            />
                                            <label className="form-check-label" htmlFor="rememberMe">
                                                Remember me
                                            </label>
                                        </div>
                                        <Link to="/forgot-password" className="text-primary text-decoration-none">
                                            Forgot password?
                                        </Link>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 mb-3"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Signing in...
                                            </>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </button>

                                    <div className="text-center">
                                        <span className="text-muted">Don't have an account? </span>
                                        <Link to="/register" className="text-primary text-decoration-none">
                                            Sign up
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login; 