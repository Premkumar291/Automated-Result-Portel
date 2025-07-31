import { Navigate, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkAuth } from '../../api/auth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const userData = await checkAuth();
        setUser(userData);
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsLoading(false);
        navigate('/login', { 
          replace: true,
          state: { from: location.pathname }
        });
      }
    };

    verifyAuth();
  }, [navigate, location]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check if user is verified
  if (!user.isVerified) {
    sessionStorage.setItem('pendingVerificationEmail', user.email);
    return <Navigate to="/verify-email" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'faculty') {
      return <Navigate to="/faculty-dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
