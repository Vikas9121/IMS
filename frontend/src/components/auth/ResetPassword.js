import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';
import api from '../../services/api';

/**
 * Reset Password Component
 * 
 * Handles the password reset confirmation process:
 * - Validates reset token
 * - Allows new password entry
 * - Confirms password match
 * - Handles password requirements
 * - Provides feedback
 * 
 * Features:
 * - Token validation
 * - Password strength requirements
 * - Confirmation matching
 * - Error handling
 * - Success feedback
 * - Redirect after reset
 * 
 * Flow:
 * 1. Validate token from URL
 * 2. Show password reset form
 * 3. Submit new password
 * 4. Handle success/error
 * 5. Redirect to login
 */
const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await api.post('/api/auth/password-reset-confirm/', {
                token,
                new_password: password
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-4">
                        <div className="card shadow-lg border-0">
                            <div className="card-body p-5">
                                {success ? (
                                    <div className="text-center">
                                        <h4 className="text-success mb-4">Password Reset Successful!</h4>
                                        <p className="text-muted">Redirecting to login page...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-center mb-4">
                                            <h2 className="fw-bold">Reset Password</h2>
                                            <p className="text-muted">Enter your new password</p>
                                        </div>

                                        {error && (
                                            <div className="alert alert-danger" role="alert">
                                                {error}
                                            </div>
                                        )}

                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light">
                                                        <FaLock className="text-primary" />
                                                    </span>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        placeholder="New Password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                        disabled={loading}
                                                        minLength="8"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light">
                                                        <FaLock className="text-primary" />
                                                    </span>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        placeholder="Confirm Password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        required
                                                        disabled={loading}
                                                        minLength="8"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn btn-primary w-100"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Resetting Password...
                                                    </>
                                                ) : (
                                                    'Reset Password'
                                                )}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
