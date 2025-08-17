import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../styles/GlobalStyles';
import { styled } from 'styled-components';
import { authService } from '../../services/authService';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: ${props => props.theme.colors.background};
`;

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isLoading, user, error } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner size="48px" />
      </LoadingContainer>
    );
  }

  // Если есть ошибка аутентификации, перенаправляем на страницу входа
  if (error) {
    console.error('Authentication error in ProtectedRoute:', error);
    authService.clearToken();
    return <Navigate to="/login" state={{ from: location, error: 'Сессия истекла. Пожалуйста, войдите снова.' }} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
