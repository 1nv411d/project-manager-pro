class TenantService {
  constructor() {
    this.currentTenant = null;
    this.storagePrefix = 'pmp_'; // Project Manager Pro prefix
  }

  // Initialize tenant with default data
  initializeTenantData(tenant) {
    const defaultProjects = [
      { 
        id: 1, 
        name: 'Website Redesign', 
        description: 'Redesign company website', 
        status: 'In Progress',
        dueDate: '2024-06-01',
        teamMembers: ['John Doe', 'Jane Smith'],
        priority: 'High'
      },
      { 
        id: 2, 
        name: 'Mobile App', 
        description: 'Develop mobile application', 
        status: 'Planning',
        dueDate: '2024-07-15',
        teamMembers: ['Mike Johnson'],
        priority: 'Medium'
      }
    ];

    const defaultTasks = [
      {
        id: 1,
        title: 'Design Homepage',
        description: 'Create wireframes for homepage',
        status: 'In Progress',
        priority: 'High',
        projectId: 1,
        projectName: 'Website Redesign',
        dueDate: '2024-05-15',
        assignedTo: 'John Doe',
        completed: false
      },
      {
        id: 2,
        title: 'Database Schema',
        description: 'Design database structure for the app',
        status: 'Planning',
        priority: 'Medium',
        projectId: 2,
        projectName: 'Mobile App',
        dueDate: '2024-06-01',
        assignedTo: 'Jane Smith',
        completed: false
      }
    ];

    // Store data with tenant-specific keys
    this.setData(`${tenant.id}_projects`, defaultProjects);
    this.setData(`${tenant.id}_tasks`, defaultTasks);

    console.log('Tenant data initialized:', {
      projects: defaultProjects,
      tasks: defaultTasks
    });
  }

  // Initialize tenant
  setTenant(tenant) {
    console.log('Setting tenant:', tenant); // Debug log
    this.currentTenant = tenant;
    localStorage.setItem(`${this.storagePrefix}currentTenant`, JSON.stringify(tenant));
    
    // Check if this is a new tenant and initialize data if needed
    const projects = this.getData(`${tenant.id}_projects`);
    console.log('Existing projects:', projects); // Debug log
    
    if (!projects) {
      console.log('Initializing tenant data...'); // Debug log
      this.initializeTenantData(tenant);
    }
  }

  // Get current tenant
  getCurrentTenant() {
    if (!this.currentTenant) {
      const saved = localStorage.getItem(`${this.storagePrefix}currentTenant`);
      this.currentTenant = saved ? JSON.parse(saved) : null;
    }
    return this.currentTenant;
  }

  // Get tenant-specific storage key
  getStorageKey(key) {
    const tenant = this.getCurrentTenant();
    return tenant ? `${this.storagePrefix}${tenant.id}_${key}` : key;
  }

  // Store tenant-specific data
  setData(key, data) {
    const storageKey = this.getStorageKey(key);
    console.log('Setting data for key:', storageKey, 'Value:', data); // Debug log
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  // Get tenant-specific data
  getData(key, defaultValue = null) {
    const storageKey = this.getStorageKey(key);
    const data = localStorage.getItem(storageKey);
    console.log('Getting data for key:', storageKey, 'Value:', data); // Debug log
    return data ? JSON.parse(data) : defaultValue;
  }

  // Clear tenant-specific data
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