export class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.role = data.role; // 'admin', 'manager', 'user'
    this.tenantId = data.tenantId;
    this.permissions = data.permissions || this.getDefaultPermissions(data.role);
    this.createdAt = data.createdAt || new Date().toISOString();
    this.status = data.status || 'active'; // 'active', 'inactive', 'pending'
  }

  getDefaultPermissions(role) {
    switch (role) {
      case 'admin':
        return {
          users: ['create', 'read', 'update', 'delete'],
          projects: ['create', 'read', 'update', 'delete'],
          tasks: ['create', 'read', 'update', 'delete'],
          settings: ['read', 'update']
        };
      case 'manager':
        return {
          users: ['read'],
          projects: ['create', 'read', 'update'],
          tasks: ['create', 'read', 'update', 'delete'],
          settings: ['read']
        };
      case 'user':
        return {
          users: ['read'],
          projects: ['read'],
          tasks: ['create', 'read', 'update'],
          settings: ['read']
        };
      default:
        return {
          users: ['read'],
          projects: ['read'],
          tasks: ['read'],
          settings: ['read']
        };
    }
  }

  can(action, resource) {
    return this.permissions[resource]?.includes(action) || false;
  }
} 