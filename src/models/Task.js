export class Task {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.status = data.status;
    this.priority = data.priority;
    this.projectId = data.projectId;
    this.projectName = data.projectName;
    this.dueDate = data.dueDate;
    this.assignedTo = data.assignedTo;
    this.completed = data.completed || false;
    this.categories = data.categories || [];
    this.dependencies = data.dependencies || []; // Array of task IDs that this task depends on
    this.startDate = data.startDate || new Date().toISOString();
    this.estimatedDuration = data.estimatedDuration || 1; // in days
  }

  canStart(allTasks) {
    if (this.dependencies.length === 0) return true;
    return this.dependencies.every(depId => {
      const depTask = allTasks.find(t => t.id === depId);
      return depTask && depTask.completed;
    });
  }

  getEarliestStartDate(allTasks) {
    if (this.dependencies.length === 0) return new Date(this.startDate);
    
    const dependencyEndDates = this.dependencies.map(depId => {
      const depTask = allTasks.find(t => t.id === depId);
      return depTask ? new Date(depTask.dueDate) : new Date(this.startDate);
    });

    return new Date(Math.max(...dependencyEndDates));
  }
} 