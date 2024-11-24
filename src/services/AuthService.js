import { User } from '../models/User';
import { tenantService } from './TenantService';

class AuthService {
  constructor() {
    this.storagePrefix = 'pmp_auth_';
  }

  async login(email, password, tenantId) {
    // Get tenant users
    const users = tenantService.getData(`users_${tenantId}`, []);
    
    // Find user with matching email
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Validate password
    if (user.password !== password) { // In a real app, use proper password hashing
      throw new Error('Invalid password');
    }

    if (user.status !== 'active') {
      throw new Error('User account is not active');
    }

    // Create user instance
    const userInstance = new User({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      status: user.status
    });
    
    // Store current user
    localStorage.setItem(`${this.storagePrefix}user`, JSON.stringify(userInstance));
    return userInstance;
  }

  logout() {
    localStorage.removeItem(`${this.storagePrefix}user`);
  }

  getCurrentUser() {
    const userData = localStorage.getItem(`${this.storagePrefix}user`);
    return userData ? new User(JSON.parse(userData)) : null;
  }

  isAuthenticated() {
    const user = this.getCurrentUser();
    return user && user.status === 'active';
  }

  hasPermission(action, resource) {
    const user = this.getCurrentUser();
    return user ? user.can(action, resource) : false;
  }

  // Add user management functions
  createUser(userData, tenantId) {
    const users = tenantService.getData(`users_${tenantId}`, []);
    
    // Check if email already exists
    if (users.some(u => u.email === userData.email)) {
      throw new Error('Email already exists');
    }

    const newUser = {
      id: Date.now(),
      ...userData,
      tenantId,
      status: 'active'
    };

    users.push(newUser);
    tenantService.setData(`users_${tenantId}`, users);
    return newUser;
  }

  updateUser(userId, updates, tenantId) {
    const users = tenantService.getData(`users_${tenantId}`, []);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // If updating email, check if new email already exists
    if (updates.email && updates.email !== users[userIndex].email) {
      if (users.some(u => u.email === updates.email)) {
        throw new Error('Email already exists');
      }
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    tenantService.setData(`users_${tenantId}`, users);
    return users[userIndex];
  }

  deleteUser(userId, tenantId) {
    const users = tenantService.getData(`users_${tenantId}`, []);
    const updatedUsers = users.filter(u => u.id !== userId);
    tenantService.setData(`users_${tenantId}`, updatedUsers);
  }

  changePassword(userId, currentPassword, newPassword, tenantId) {
    const users = tenantService.getData(`users_${tenantId}`, []);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    if (user.password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    tenantService.setData(`users_${tenantId}`, users);
  }

  resetPassword(userId, tenantId) {
    // In a real app, this would generate a reset token and send an email
    const tempPassword = Math.random().toString(36).slice(-8);
    const users = tenantService.getData(`users_${tenantId}`, []);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    user.password = tempPassword;
    user.requirePasswordChange = true;
    tenantService.setData(`users_${tenantId}`, users);
    
    return tempPassword; // In a real app, this would be sent via email
  }
}

export const authService = new AuthService(); 