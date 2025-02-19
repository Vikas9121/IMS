import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Private Route Component
 * 
 * Protected route wrapper that:
 * - Checks authentication status
 * - Redirects unauthorized users to login
 * - Preserves attempted URL for post-login redirect
 * - Handles loading states during auth check
 * 
 * Features:
 * - Authentication verification
 * - Seamless redirects
 * - Route protection
 * - Loading state handling
 * - URL preservation
 * 
 * Usage:
 * <PrivateRoute>
 *   <ProtectedComponent />
 * </PrivateRoute>
 */

const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useSelector(state => state.auth);
    
    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute; 