import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LockResetIcon from '@mui/icons-material/LockReset';
import { tenantService } from '../services/TenantService';
import { authService } from '../services/AuthService';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const currentUser = authService.getCurrentUser();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active'
  });
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const tenant = tenantService.getCurrentTenant();
    const tenantUsers = tenantService.getData(`users_${tenant.id}`) || [];
    setUsers(tenantUsers);
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        status: user.status
      });
      setSelectedUser(user);
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        status: 'active'
      });
      setSelectedUser(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
  };

  const handleSave = () => {
    try {
      const tenant = tenantService.getCurrentTenant();
      const tenantUsers = [...users];

      if (selectedUser) {
        // Update existing user
        const index = tenantUsers.findIndex(u => u.id === selectedUser.id);
        tenantUsers[index] = {
          ...selectedUser,
          ...formData,
          password: formData.password || selectedUser.password
        };
      } else {
        // Create new user
        const newUser = {
          id: Date.now(),
          ...formData,
          tenantId: tenant.id
        };
        tenantUsers.push(newUser);
      }

      tenantService.setData(`users_${tenant.id}`, tenantUsers);
      setUsers(tenantUsers);
      handleCloseDialog();
    } catch (err) {
      setError('Failed to save user. Please try again.');
    }
  };

  const handleDelete = (userId) => {
    if (userId === currentUser.id) {
      setError("You cannot delete your own account");
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      const tenant = tenantService.getCurrentTenant();
      const updatedUsers = users.filter(u => u.id !== userId);
      tenantService.setData(`users_${tenant.id}`, updatedUsers);
      setUsers(updatedUsers);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'user': return 'primary';
      default: return 'default';
    }
  };

  const handleResetPassword = (user) => {
    setResetPasswordUser(user);
    setNewPassword('');
    setResetSuccess('');
    setResetPasswordDialog(true);
  };

  const handleResetPasswordSubmit = () => {
    try {
      const tenant = tenantService.getCurrentTenant();
      const tenantUsers = [...users];
      const userIndex = tenantUsers.findIndex(u => u.id === resetPasswordUser.id);
      
      if (userIndex !== -1) {
        tenantUsers[userIndex] = {
          ...tenantUsers[userIndex],
          password: newPassword,
          passwordResetRequired: true
        };
        
        tenantService.setData(`users_${tenant.id}`, tenantUsers);
        setUsers(tenantUsers);
        setResetSuccess(`Password reset successful for ${resetPasswordUser.name}`);
        
        // Clear form after short delay
        setTimeout(() => {
          setResetPasswordDialog(false);
          setResetPasswordUser(null);
          setNewPassword('');
          setResetSuccess('');
        }, 2000);
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">User Management</Typography>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add User
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.status} 
                      color={user.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      onClick={() => handleOpenDialog(user)}
                      disabled={!currentUser.can('update', 'users')}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleResetPassword(user)}
                      disabled={!currentUser.can('update', 'users')}
                      color="primary"
                    >
                      <LockResetIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(user.id)}
                      disabled={!currentUser.can('delete', 'users') || user.id === currentUser.id}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              margin="dense"
              label={selectedUser ? "New Password (leave blank to keep current)" : "Password"}
              type="password"
              fullWidth
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSave} variant="contained">
              {selectedUser ? 'Save Changes' : 'Add User'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={resetPasswordDialog} 
          onClose={() => setResetPasswordDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Reset Password for {resetPasswordUser?.name}
          </DialogTitle>
          <DialogContent>
            {resetSuccess ? (
              <Alert severity="success" sx={{ mt: 2 }}>
                {resetSuccess}
              </Alert>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
                  Set a new password for this user. They will be required to change it on their next login.
                </Typography>
                <TextField
                  autoFocus
                  margin="dense"
                  label="New Password"
                  type="password"
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setResetPasswordDialog(false)}
              disabled={!!resetSuccess}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleResetPasswordSubmit}
              variant="contained"
              disabled={!newPassword || !!resetSuccess}
            >
              Reset Password
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
}

export default UserManagement; 