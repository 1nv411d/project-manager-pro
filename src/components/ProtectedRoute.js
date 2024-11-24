import { Navigate } from 'react-router-dom';
import { authService } from '../services/AuthService';
import { tenantService } from '../services/TenantService';

function ProtectedRoute({ children }) {
  const isAuthenticated = authService.isAuthenticated();
  const currentTenant = tenantService.getCurrentTenant();

  if (!isAuthenticated || !currentTenant) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute; 