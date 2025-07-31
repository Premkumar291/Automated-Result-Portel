import ProtectedRoute from './ProtectedRoute';
import SignupPage from './signup-page';

const AdminProtectedSignup = () => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <SignupPage />
    </ProtectedRoute>
  );
};

export default AdminProtectedSignup;
