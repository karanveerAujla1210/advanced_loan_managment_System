import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/auth.store';

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <div className="p-6 text-red-600">Access Denied - Insufficient Permissions</div>;
  }

  return children;
}
