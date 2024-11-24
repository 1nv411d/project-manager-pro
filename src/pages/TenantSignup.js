import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { tenantService } from '../services/TenantService';
import { authService } from '../services/AuthService';
import { Tenant } from '../models/Tenant';

const steps = ['Company Information', 'Admin Account', 'Review & Confirm'];

function TenantSignup() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [tenantData, setTenantData] = useState({
    companyName: '',
    domain: '',
    industry: '',
    size: ''
  });

  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double submission
    
    try {
      setIsSubmitting(true);
      setError('');

      // Create tenant
      const tenantId = tenantData.domain.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const tenant = new Tenant(
        tenantId,
        tenantData.companyName,
        {
          companyName: tenantData.companyName,
          industry: tenantData.industry,
          size: tenantData.size,
          domain: tenantData.domain,
          features: {
            tasks: true,
            projects: true,
            timeline: true,
            announcements: true
          }
        }
      );

      // Create admin user
      const adminUser = {
        id: Date.now(),
        name: adminData.name,
        email: adminData.email,
        password: adminData.password,
        role: 'admin',
        tenantId: tenantId,
        status: 'active'
      };

      // Save tenant and admin data
      tenantService.setData(`tenant_${tenantId}`, tenant);
      tenantService.setData(`users_${tenantId}`, [adminUser]);
      
      // Initialize tenant with default data
      tenantService.setTenant(tenant);
      tenantService.initializeTenantData(tenant);

      // Log in the admin
      await authService.login(adminData.email, adminData.password, tenantId);
      
      navigate('/');
    } catch (err) {
      setError('Failed to create tenant. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Company Name"
              value={tenantData.companyName}
              onChange={(e) => setTenantData({ ...tenantData, companyName: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Domain"
              helperText="e.g., company.com"
              value={tenantData.domain}
              onChange={(e) => setTenantData({ ...tenantData, domain: e.target.value })}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Industry"
              value={tenantData.industry}
              onChange={(e) => setTenantData({ ...tenantData, industry: e.target.value })}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Company Size"
              value={tenantData.size}
              onChange={(e) => setTenantData({ ...tenantData, size: e.target.value })}
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Admin Name"
              value={adminData.name}
              onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Admin Email"
              type="email"
              value={adminData.email}
              onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              value={adminData.password}
              onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirm Password"
              type="password"
              value={adminData.confirmPassword}
              onChange={(e) => setAdminData({ ...adminData, confirmPassword: e.target.value })}
              error={adminData.password !== adminData.confirmPassword}
              helperText={adminData.password !== adminData.confirmPassword ? "Passwords don't match" : ""}
            />
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Company Information</Typography>
            <Typography>Company Name: {tenantData.companyName}</Typography>
            <Typography>Domain: {tenantData.domain}</Typography>
            <Typography>Industry: {tenantData.industry}</Typography>
            <Typography>Size: {tenantData.size}</Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Admin Account</Typography>
            <Typography>Name: {adminData.name}</Typography>
            <Typography>Email: {adminData.email}</Typography>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Create Your Account
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

          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting || !tenantData.companyName || !tenantData.domain || 
                          !adminData.name || !adminData.email || 
                          !adminData.password || adminData.password !== adminData.confirmPassword}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            ) : (
              <Button 
                variant="contained" 
                onClick={handleNext}
                disabled={activeStep === 0 ? !tenantData.companyName || !tenantData.domain :
                         activeStep === 1 ? !adminData.name || !adminData.email || 
                                          !adminData.password || adminData.password !== adminData.confirmPassword :
                         false}
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default TenantSignup; 