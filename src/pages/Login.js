import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  useTheme
} from '@mui/material';
import { useNavigate, Link, Link as RouterLink } from 'react-router-dom';
import { authService } from '../services/AuthService';
import { tenantService } from '../services/TenantService';

function Login() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmNewPassword) {
      setError("New passwords don't match");
      return;
    }

    try {
      const tenant = tenantService.getCurrentTenant();
      const users = tenantService.getData(`users_${tenant.id}`);
      const userIndex = users.findIndex(u => u.email === email);
      
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          password: newPassword,
          passwordResetRequired: false
        };
        
        tenantService.setData(`users_${tenant.id}`, users);
        navigate('/');
      }
    } catch (err) {
      setError('Failed to update password. Please try again.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const domain = email.split('@')[1];
      const tenantId = domain.replace(/\./g, '_');
      
      const tenant = tenantService.getData(`tenant_${tenantId}`);
      if (!tenant) {
        setError('No account found for this domain. Please sign up first.');
        return;
      }

      const users = tenantService.getData(`users_${tenantId}`) || [];
      const user = users.find(u => u.email === email);

      if (!user) {
        setError('User not found. Please contact your administrator.');
        return;
      }

      if (user.password !== password) {
        setError('Invalid password.');
        return;
      }

      if (user.passwordResetRequired) {
        setShowPasswordChange(true);
        return;
      }

      await authService.login(email, password, tenantId);
      tenantService.setTenant(tenant);
      
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    setError('Storage cleared. Please sign up as a new tenant.');
  };

  if (showPasswordChange) {
    return (
      <Container component="main" maxWidth="xs">
        <Box sx={{ mt: 8 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" align="center" gutterBottom>
              Change Password Required
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Your password has been reset. Please create a new password to continue.
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handlePasswordChange}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Confirm New Password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3 }}
              >
                Change Password
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Project Manager Pro
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link 
                  component={RouterLink}
                  to="/signup" 
                  style={{ 
                    color: theme.palette.primary.main,
                    textDecoration: 'none'
                  }}
                >
                  Sign up here
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none'
                  }}
                >
                  Forgot Password?
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login; 