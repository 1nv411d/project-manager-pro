import React from 'react';
import {
  Paper,
  Typography,
  TextField,
  Box,
  Switch,
  FormControlLabel,
  Button
} from '@mui/material';
import { useTenant } from '../contexts/TenantContext';

function TenantConfig() {
  const { currentTenant, setCurrentTenant } = useTenant();

  const handleSettingChange = (key, value) => {
    const updatedTenant = {
      ...currentTenant,
      settings: {
        ...currentTenant.settings,
        [key]: value
      }
    };
    setCurrentTenant(updatedTenant);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Company Settings
      </Typography>
      <Box component="form" sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Company Name"
          value={currentTenant.settings.companyName}
          onChange={(e) => handleSettingChange('companyName', e.target.value)}
          margin="normal"
        />
        
        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
          Features
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={currentTenant.settings.features.tasks}
              onChange={(e) => handleSettingChange('features', {
                ...currentTenant.settings.features,
                tasks: e.target.checked
              })}
            />
          }
          label="Tasks Module"
        />
        {/* Add more feature toggles */}
      </Box>
    </Paper>
  );
}

export default TenantConfig; 