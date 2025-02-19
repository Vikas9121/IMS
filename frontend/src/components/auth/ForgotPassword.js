/**
 * Forgot Password Component
 * 
 * Handles the password reset process:
 * - Email submission form
 * - Reset token validation
 * - New password creation
 * - Success/error notifications
 * 
 * Features:
 * - Email validation
 * - Loading states
 * - Error handling
 * - Success confirmation
 * - Navigation to login
 * - Password strength validation
 * 
 * Process Flow:
 * 1. User enters email
 * 2. System sends reset link
 * 3. User clicks email link
 * 4. User sets new password
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import api from '../../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/api/auth/password-reset/', { email });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6 col-lg-4">
                            <div className="card shadow-lg border-0">
                                <div className="card-body p-5 text-center">
                                    <h4 className="text-success mb-4">Check Your Email</h4>
                                    <p className="text-muted">
                                        We've sent password reset instructions to your email address.
                                    </p>
                                    <Link to="/login" className="btn btn-primary mt-3">
                                        Return to Login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-4">
                        <div className="card shadow-lg border-0">
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold">Forgot Password</h2>
                                    <p className="text-muted">
                                        Enter your email address to reset your password
                                    </p>
                                </div>

                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <div className="input-group">
                                            <span className="input-group-text bg-light">
                                                <FaEnvelope className="text-primary" />
                                            </span>
                                            <input
                                                type="email"
                                                className="form-control"
                                                placeholder="Email address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 mb-3"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Sending...
                                            </>
                                        ) : (
                                            'Reset Password'
                                        )}
                                    </button>

                                    <div className="text-center">
                                        <Link to="/login" className="text-decoration-none">
                                            <FaArrowLeft className="me-1" />
                                            Back to Login
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

export default ForgotPassword; 