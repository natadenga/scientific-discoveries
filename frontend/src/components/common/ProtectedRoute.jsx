import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Loading from './Loading';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <Loading text="Перевірка авторизації..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
