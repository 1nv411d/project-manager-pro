class TenantService {
  constructor() {
    this.currentTenant = null;
    this.storagePrefix = 'pmp_';
  }

  initializeTenantData(tenant) {
    console.log('Initializing tenant data for:', tenant.id);

    // Default projects
    const defaultProjects = [
      {
        id: 1,
        name: 'Sample Project 1',
        description: 'This is a sample project',
        status: 'In Progress',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        teamMembers: ['Admin User'],
        priority: 'High'
      },
      {
        id: 2,
        name: 'Sample Project 2',
        description: 'Another sample project',
        status: 'Planning',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        teamMembers: ['Admin User'],
        priority: 'Medium'
      }
    ];

    // Default tasks
    const defaultTasks = [
      {
        id: 1,
        title: 'Sample Task 1',
        description: 'This is a sample task',
        status: 'In Progress',
        priority: 'High',
        projectId: 1,
        projectName: 'Sample Project 1',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        assignedTo: 'Admin User',
        completed: false
      },
      {
        id: 2,
        title: 'Sample Task 2',
        description: 'Another sample task',
        status: 'Planning',
        priority: 'Medium',
        projectId: 2,
        projectName: 'Sample Project 2',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        assignedTo: 'Admin User',
        completed: false
      }
    ];

    // Store the data with tenant-specific keys
    this.setData(`${tenant.id}_projects`, defaultProjects);
    this.setData(`${tenant.id}_tasks`, defaultTasks);

    console.log('Tenant data initialized:', {
      projects: defaultProjects,
      tasks: defaultTasks
    });
  }

  setTenant(tenant) {
    console.log('Setting tenant:', tenant);
    this.currentTenant = tenant;
    localStorage.setItem(`${this.storagePrefix}currentTenant`, JSON.stringify(tenant));

    // Check if tenant data exists
    const existingProjects = this.getData(`${tenant.id}_projects`);
    if (!existingProjects) {
      console.log('No existing data found, initializing...');
      this.initializeTenantData(tenant);
    }
  }

  getCurrentTenant() {
    if (!this.currentTenant) {
      const saved = localStorage.getItem(`${this.storagePrefix}currentTenant`);
      this.currentTenant = saved ? JSON.parse(saved) : null;
    }
    return this.currentTenant;
  }

  getStorageKey(key) {
    const tenant = this.getCurrentTenant();
    return tenant ? `${this.storagePrefix}${tenant.id}_${key}` : key;
  }

  setData(key, data) {
    const storageKey = this.getStorageKey(key);
    console.log('Setting data for key:', storageKey, data);
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  getData(key, defaultValue = null) {
    const storageKey = this.getStorageKey(key);
    const data = localStorage.getItem(storageKey);
    console.log('Getting data for key:', storageKey, data);
    return data ? JSON.parse(data) : defaultValue;
  }

  clearTenantData() {
    const tenant = this.getCurrentTenant();
    if (tenant) {
      const prefix = `${this.storagePrefix}${tenant.id}_`;
      Object.keys(localStorage)
        .filter(key => key.startsWith(prefix))
        .forEach(key => localStorage.removeItem(key));
    }
  }
}

export const tenantService = new TenantService(); 