import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
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
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { tenantService } from '../services/TenantService';
import { authService } from '../services/AuthService';
import { User } from '../models/User';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    // In a real app, this would be an API call
    const tenantUsers = JSON.parse(localStorage.getItem(`pmp_users_${currentUser.tenantId}`) || '[]');
    setUsers(tenantUsers.map(userData => new User(userData)));
  }, [currentUser.tenantId]);

  const handleSave = (userData) => {
    const updatedUsers = editUser
      ? users.map(u => u.id === editUser.id ? new User(userData) : u)
      : [...users, new User({ ...userData, id: Date.now() })];
    
    setUsers(updatedUsers);
    localStorage.setItem(`pmp_users_${currentUser.tenantId}`, JSON.stringify(updatedUsers));
    setOpen(false);
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem(`pmp_users_${currentUser.tenantId}`, JSON.stringify(updatedUsers));
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">User Management</Typography>
        {currentUser.can('create', 'users') && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setEditUser(null);
              setOpen(true);
            }}
          >
            Add User
          </Button>
        )}
      </Box>

      <List>
        {users.map((user) => (
          <ListItem key={user.id}>
            <ListItemText
              primary={user.name}
              secondary={
                <Box>
                  <Typography variant="body2">{user.email}</Typography>
                  <Box display="flex" gap={1} mt={1}>
                    <Chip label={user.role} color="primary" size="small" />
                    <Chip label={user.status} color={user.status === 'active' ? 'success' : 'error'} size="small" />
                  </Box>
                </Box>
              }
            />
            {currentUser.can('update', 'users') && (
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => {
                    setEditUser(user);
                    setOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
                {currentUser.can('delete', 'users') && (
                  <IconButton
                    edge="end"
                    onClick={() => handleDelete(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            )}
          </ListItem>
        ))}
      </List>

      <UserDialog
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        user={editUser}
      />
    </Paper>
  );
}

function UserDialog({ open, onClose, onSave, user }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'user',
        status: 'active'
      });
    }
  }, [user]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{user ? 'Edit User' : 'Add User'}</DialogTitle>
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
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(formData)} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserManagement; 