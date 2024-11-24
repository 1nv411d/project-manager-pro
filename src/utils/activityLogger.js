export const logActivity = (activity) => {
  const savedActivities = JSON.parse(localStorage.getItem('activities') || '[]');
  const newActivity = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...activity
  };
  
  const updatedActivities = [newActivity, ...savedActivities].slice(0, 50);
  localStorage.setItem('activities', JSON.stringify(updatedActivities));
};

const getFieldLabel = (key) => {
  const labels = {
    status: 'Status',
    priority: 'Priority',
    dueDate: 'Due Date',
    assignedTo: 'Assigned To',
    completed: 'Status',
    teamMembers: 'Team Members',
    name: 'Name',
    title: 'Title',
    description: 'Description'
  };
  return labels[key] || key;
};

const formatValue = (key, value) => {
  if (key === 'dueDate') {
    return new Date(value).toLocaleDateString();
  }
  if (key === 'completed') {
    return value ? 'Completed' : 'Reopened';
  }
  return value;
};

export const createActivityDescription = (type, action, item, changes = null) => {
  const itemName = type === 'project' ? item.name : item.title;
  
  switch (action) {
    case 'create':
      return {
        type,
        itemId: item.id,
        description: `${type === 'project' ? 'Project' : 'Task'} "${itemName}" was created`,
        timestamp: new Date().toISOString(),
      };
    case 'update':
      let changeDescription = '';
      if (changes) {
        const changesList = Object.entries(changes)
          .map(([key, value]) => {
            if (key === 'completed') {
              return formatValue(key, value);
            }
            return `${getFieldLabel(key)} changed to ${formatValue(key, value)}`;
          })
          .join(', ');
        changeDescription = ` (${changesList})`;
      }
      
      return {
        type,
        itemId: item.id,
        description: `${type === 'project' ? 'Project' : 'Task'} "${itemName}" was updated${changeDescription}`,
        timestamp: new Date().toISOString(),
      };
    case 'delete':
      return {
        type,
        itemId: item.id,
        description: `${type === 'project' ? 'Project' : 'Task'} "${itemName}" was deleted`,
        timestamp: new Date().toISOString(),
      };
    default:
      return null;
  }
}; 