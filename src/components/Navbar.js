import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { authService } from '../services/AuthService';
import { useTenant } from '../contexts/TenantContext';
import { useEffect, useState } from 'react';

function Navbar() {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const [companyName, setCompanyName] = useState('Project Manager Pro');

  useEffect(() => {
    if (currentTenant?.settings?.companyName) {
      setCompanyName(currentTenant.settings.companyName);
    }
  }, [currentTenant]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const user = authService.getCurrentUser();

  return (
    <AppBar position="static">
      <Toolbar>
        <DashboardIcon sx={{ mr: 1 }} />
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          {companyName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" component={Link} to="/">
            Dashboard
          </Button>
          <Button color="inherit" component={Link} to="/projects">
            Projects
          </Button>
          <Button color="inherit" component={Link} to="/tasks">
            Tasks
          </Button>
          {user?.can('read', 'users') && (
            <Button color="inherit" component={Link} to="/users">
              Users
            </Button>
          )}
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 