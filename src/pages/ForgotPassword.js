import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { tenantService } from '../services/TenantService';

const steps = ['Verify Email', 'Security Questions', 'Reset Password'];

function ForgotPassword() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [securityAnswers, setSecurityAnswers] = useState({
    companyName: '',
    domain: ''
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);

  const handleVerifyEmail = () => {
    try {
      const domain = email.split('@')[1];
      const tenantId = domain.replace(/\./g, '_');
      const foundTenant = tenantService.getData(`tenant_${tenantId}`);
      
      if (!foundTenant) {
        setError('No account found for this email domain.');
        return;
      }

      const users = tenantService.getData(`users_${tenantId}`) || [];
      const foundUser = users.find(u => u.email === email && u.role === 'admin');
      
      if (!foundUser) {
        setError('This email is not registered as an admin.');
        return;
      }

      const tenantWithDomain = {
        ...foundTenant,
        domain: domain
      };

      setTenant(tenantWithDomain);
      setUser(foundUser);
      setActiveStep(1);
      setError('');

      console.log('Found Tenant:', tenantWithDomain);
    } catch (err) {
      setError('Failed to verify email. Please try again.');
    }
  };

  const handleVerifySecurity = () => {
    console.log('Tenant:', tenant);
    console.log('Security Answers:', securityAnswers);
    console.log('Expected Company Name:', tenant.settings.companyName);
    console.log('Expected Domain:', tenant.settings.domain);

    const companyNameMatches = securityAnswers.companyName.trim().toLowerCase() === 
      tenant.settings.companyName.trim().toLowerCase();
    
    const domainMatches = securityAnswers.domain.trim().toLowerCase() === 
      tenant.domain.trim().toLowerCase();

    if (companyNameMatches && domainMatches) {
      setActiveStep(2);
      setError('');
    } else {
      setError('Security answers do not match our records.');
    }
  };

  const handleResetPassword = () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const users = tenantService.getData(`users_${tenant.id}`) || [];
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, password: newPassword } : u
      );
      
      tenantService.setData(`users_${tenant.id}`, updatedUsers);
      navigate('/login', { 
        state: { message: 'Password has been reset successfully. Please login with your new password.' }
      });
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please enter your admin email address to begin the password reset process.
            </Typography>
            <TextField
              fullWidth
              label="Admin Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleVerifyEmail}
              sx={{ mt: 2 }}
              disabled={!email}
            >
              Verify Email
            </Button>
          </>
        );
      
      case 1:
        return (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please enter your company name exactly as it appears in your account settings,
              and your company domain (e.g., "company.com").
            </Typography>
            <TextField
              fullWidth
              label="Company Name"
              value={securityAnswers.companyName}
              onChange={(e) => setSecurityAnswers({
                ...securityAnswers,
                companyName: e.target.value
              })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Company Domain"
              value={securityAnswers.domain}
              onChange={(e) => setSecurityAnswers({
                ...securityAnswers,
                domain: e.target.value
              })}
              margin="normal"
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleVerifySecurity}
              sx={{ mt: 2 }}
              disabled={!securityAnswers.companyName || !securityAnswers.domain}
            >
              Verify Answers
            </Button>
          </>
        );
      
      case 2:
        return (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please enter your new password.
            </Typography>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleResetPassword}
              sx={{ mt: 2 }}
              disabled={!newPassword || !confirmPassword}
            >
              Reset Password
            </Button>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Reset Admin Password
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {activeStep === 1 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Please enter your company name exactly as it appears in your account settings,
              and your company domain (e.g., "company.com").
            </Alert>
          )}

          {renderStepContent()}

          {activeStep > 0 && (
            <Button
              onClick={() => {
                setActiveStep((prev) => prev - 1);
                setError('');
              }}
              sx={{ mt: 2 }}
            >
              Back
            </Button>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default ForgotPassword; 