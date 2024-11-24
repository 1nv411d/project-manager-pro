const fieldLabels = {
  // Project and Task common fields
  name: 'Name',
  title: 'Title',
  description: 'Description',
  status: 'Status',
  priority: 'Priority',
  dueDate: 'Due Date',
  
  // Task specific fields
  completed: 'Completion Status',
  assignedTo: 'Assigned To',
  projectName: 'Project',
  
  // Project specific fields
  teamMembers: 'Team Members',
  startDate: 'Start Date',
  
  // Announcement fields
  message: 'Message'
};

const formatValue = (key, value) => {
  switch (key) {
    case 'dueDate':
    case 'startDate':
      return new Date(value).toLocaleDateString();
    case 'completed':
      return value ? 'Completed' : 'In Progress';
    case 'teamMembers':
      return Array.isArray(value) ? value.join(', ') : value;
    default:
      return value;
  }
};

export const formatChanges = (oldData, newData) => {
  const changes = {};
  Object.keys(newData).forEach(key => {
    if (oldData[key] !== newData[key] && 
        key !== 'id' && 
        key !== 'timestamp' &&
        newData[key] !== undefined &&
        fieldLabels[key]) { // Only include fields that have labels
      changes[fieldLabels[key]] = {
        from: formatValue(key, oldData[key]),
        to: formatValue(key, newData[key])
      };
    }
  });
  return changes;
};

export const logActivity = (description, type = 'general', details = null) => {
  const tenant = JSON.parse(localStorage.getItem('pmp_currentTenant'));
  if (!tenant) {
    console.warn('No tenant found when trying to log activity');
    return;
  }

  // Format details if they exist
  let formattedDetails = details;
  if (details?.message) {
    formattedDetails = {
      ...details,
      [fieldLabels.message]: details.message
    };
  }

  const storageKey = `pmp_${tenant.id}_activities`;
  const existingActivities = localStorage.getItem(storageKey);
  const activities = existingActivities ? JSON.parse(existingActivities) : [];
  
  const newActivity = {
    id: Date.now(),
    description,
    type,
    details: formattedDetails,
    timestamp: new Date().toISOString()
  };

  const updatedActivities = [newActivity, ...activities].slice(0, 50);
  localStorage.setItem(storageKey, JSON.stringify(updatedActivities));
}; 