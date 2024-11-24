export class Tenant {
  constructor(id, name, settings = {}) {
    this.id = id;
    this.name = name;
    this.settings = {
      theme: settings.theme || 'default',
      logo: settings.logo || null,
      companyName: settings.companyName || name,
      features: settings.features || {
        tasks: true,
        projects: true,
        timeline: true,
        announcements: true
      }
    };
    this.createdAt = settings.createdAt || new Date().toISOString();
  }
} 