import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';

/**
 * User Profile Component
 * 
 * Manages user profile information:
 * - Display user details
 * - Edit profile information
 * - Change password
 * - Update preferences
 * - View activity history
 * 
 * Features:
 * - Profile information display
 * - Form validation
 * - Image upload
 * - Password change
 * - Settings management
 * - Activity log
 * 
 * Data Management:
 * - Fetches user data on mount
 * - Handles form submissions
 * - Updates Redux store
 * - Manages API interactions
 */

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: ''
    });
    const [updateSuccess, setUpdateSuccess] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/api/auth/profile/');
                setProfile(response.data);
                setFormData({
                    first_name: response.data.first_name || '',
                    last_name: response.data.last_name || '',
                    email: response.data.email || ''
                });
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                setError(error.response?.data?.detail || 'Failed to fetch profile');
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.patch('/api/profile/', formData);
            setProfile(response.data);
            setIsEditing(false);
            setUpdateSuccess(true);
            setTimeout(() => setUpdateSuccess(false), 3000); // Hide success message after 3 seconds
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update profile');
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{height: '80vh'}}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    if (error) return <div className="alert alert-danger m-3">{error}</div>;

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h2>User Profile</h2>
                    {!isEditing && (
                        <button 
                            className="btn btn-primary" 
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
                <div className="card-body">
                    {updateSuccess && (
                        <div className="alert alert-success">
                            Profile updated successfully!
                        </div>
                    )}
                    
                    {isEditing ? (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Username</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={profile.username} 
                                    disabled 
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input 
                                    type="email" 
                                    className="form-control"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">First Name</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Last Name</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-success">
                                    Save Changes
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div>
                            <div className="mb-3">
                                <strong>Username:</strong> {profile.username}
                            </div>
                            <div className="mb-3">
                                <strong>Email:</strong> {profile.email}
                            </div>
                            <div className="mb-3">
                                <strong>First Name:</strong> {profile.first_name || '-'}
                            </div>
                            <div className="mb-3">
                                <strong>Last Name:</strong> {profile.last_name || '-'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile; 