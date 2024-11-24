import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  List,
  ListItem,
  ListItemText,
  Box,
  Chip,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProjectTimeline from '../components/ProjectTimeline';
import AnnouncementBanner from '../components/AnnouncementBanner';
import { tenantService } from '../services/TenantService';

function Dashboard() {
  const navigate = useNavigate();
  const [projectStats, setProjectStats] = useState({
    new: 0,
    planning: 0,
    inProgress: 0,
    onHold: 0,
    highPriority: 0,
    total: 0
  });
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [deadlineRange, setDeadlineRange] = useState('week');
  const [recentActivities, setRecentActivities] = useState([]);
  const [announcement, setAnnouncement] = useState('');
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);

  useEffect(() => {
    const tenant = tenantService.getCurrentTenant();
    if (!tenant) return;

    // Debug logging
    console.log('Current tenant:', tenant);

    // Load activities with proper tenant-specific key
    const activities = localStorage.getItem(`pmp_${tenant.id}_activities`);
    console.log('Raw activities from storage:', activities);

    const parsedActivities = activities ? JSON.parse(activities) : [];
    console.log('Parsed activities:', parsedActivities);

    // Sort activities by timestamp, most recent first
    const sortedActivities = parsedActivities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5); // Show only the 5 most recent

    console.log('Sorted activities to display:', sortedActivities);
    setRecentActivities(sortedActivities);

    // Load announcement
    const savedAnnouncement = tenantService.getData(`${tenant.id}_announcement`);
    if (savedAnnouncement) {
      setAnnouncement(savedAnnouncement);
    }

    // Load projects
    const projects = tenantService.getData(`${tenant.id}_projects`) || [];
    console.log('Loaded projects:', projects);

    // Load tasks
    const tasks = tenantService.getData(`${tenant.id}_tasks`) || [];
    console.log('Loaded tasks:', tasks);

    // Calculate project stats
    const stats = {
      new: projects.filter(p => p.status === 'New').length,
      planning: projects.filter(p => p.status === 'Planning').length,
      inProgress: projects.filter(p => p.status === 'In Progress').length,
      onHold: projects.filter(p => p.status === 'On Hold').length,
      highPriority: projects.filter(p => p.priority === 'High').length,
      total: projects.length
    };
    setProjectStats(stats);

    // Calculate upcoming deadlines
    const today = new Date();
    const rangeEnd = new Date(today);
    
    switch (deadlineRange) {
      case 'week':
        rangeEnd.setDate(today.getDate() + 7);
        break;
      case 'month':
        rangeEnd.setMonth(today.getMonth() + 1);
        break;
      case 'quarter':
        rangeEnd.setMonth(today.getMonth() + 3);
        break;
      default:
        rangeEnd.setDate(today.getDate() + 7);
    }

    const upcomingProjects = projects
      .filter(p => {
        const dueDate = new Date(p.dueDate);
        return dueDate > today && dueDate <= rangeEnd;
      })
      .map(p => ({
        id: p.id,
        name: p.name,
        dueDate: new Date(p.dueDate).toLocaleDateString(),
        type: 'project'
      }));

    const upcomingTaskDeadlines = tasks
      .filter(t => {
        const dueDate = new Date(t.dueDate);
        return !t.completed && dueDate > today && dueDate <= rangeEnd;
      })
      .map(t => ({
        id: t.id,
        name: t.title,
        dueDate: new Date(t.dueDate).toLocaleDateString(),
        type: 'task'
      }));

    const allDeadlines = [...upcomingProjects, ...upcomingTaskDeadlines]
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    console.log('Upcoming deadlines:', allDeadlines);
    setUpcomingDeadlines(allDeadlines);

  }, [deadlineRange]);

  const handleActivityClick = (activity) => {
    console.log('Activity clicked:', activity);
    if (activity.type === 'project') {
      navigate('/projects');
    } else {
      navigate('/tasks');
    }
  };

  const handleSaveAnnouncement = () => {
    const tenant = tenantService.getCurrentTenant();
    tenantService.setData(`${tenant.id}_announcement`, announcement);
    setIsEditingAnnouncement(false);
  };

  const handleCloseAnnouncement = () => {
    setAnnouncement('');
    const tenant = tenantService.getCurrentTenant();
    tenantService.setData(`${tenant.id}_announcement`, '');
  };

  const formatActivityDetails = (activity) => {
    if (activity.details) {
      if (activity.type === 'announcement') {
        return activity.details.Message ? `Message: "${activity.details.Message}"` : '';
      }
      if (activity.details.changes) {
        return Object.entries(activity.details.changes)
          .map(([label, value]) => `${label}: ${value.from} → ${value.to}`)
          .join('\n');
      }
    }
    return '';
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
      <AnnouncementBanner
        announcement={announcement}
        isEditing={isEditingAnnouncement}
        onEdit={() => setIsEditingAnnouncement(true)}
        onSave={handleSaveAnnouncement}
        onClose={handleCloseAnnouncement}
        onChange={setAnnouncement}
      />

      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={2}>
        {/* Left Column */}
        <Grid item xs={12} md={6}>
          {/* Project Overview Section */}
          <Paper style={{ padding: '1rem', marginBottom: '1rem' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Project Overview</Typography>
              <Chip 
                label={`${projectStats.total} Projects`} 
                color="primary" 
                size="small"
              />
            </Box>
            
            <Grid container spacing={1}>
              <Grid item xs={6} md={4}>
                <Paper elevation={0} sx={{ p: 1, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    New
                  </Typography>
                  <Typography variant="h6" color="info.main">
                    {projectStats.new}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={4}>
                <Paper elevation={0} sx={{ p: 1, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Planning
                  </Typography>
                  <Typography variant="h6" color="secondary.main">
                    {projectStats.planning}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={4}>
                <Paper elevation={0} sx={{ p: 1, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    In Progress
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {projectStats.inProgress}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={4}>
                <Paper elevation={0} sx={{ p: 1, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    On Hold
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    {projectStats.onHold}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={4}>
                <Paper elevation={0} sx={{ p: 1, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    High Priority
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {projectStats.highPriority}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* Upcoming Deadlines Section */}
          <Paper style={{ padding: '1rem' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Upcoming Deadlines</Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={deadlineRange}
                  onChange={(e) => setDeadlineRange(e.target.value)}
                >
                  <MenuItem value="week">Next 7 Days</MenuItem>
                  <MenuItem value="month">Next 30 Days</MenuItem>
                  <MenuItem value="quarter">Next 90 Days</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <List>
              {upcomingDeadlines.map((deadline) => (
                <ListItem 
                  key={`${deadline.type}-${deadline.id}`}
                  button
                  onClick={() => handleActivityClick(deadline)}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        {deadline.name}
                        <Chip 
                          label={deadline.type} 
                          size="small"
                          color={deadline.type === 'project' ? 'primary' : 'secondary'}
                        />
                      </Box>
                    }
                    secondary={`Due: ${deadline.dueDate}`}
                  />
                </ListItem>
              ))}
              {upcomingDeadlines.length === 0 && (
                <ListItem>
                  <ListItemText 
                    secondary="No upcoming deadlines for this period"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Right Column - Recent Activities */}
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: '1rem', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity) => (
                <ListItem 
                  key={activity.id}
                  button
                  onClick={() => handleActivityClick(activity)}
                >
                  <ListItemText
                    primary={activity.description}
                    secondary={
                      <Box component="span" sx={{ whiteSpace: 'pre-line' }}>
                        {formatActivityDetails(activity)}
                        {formatActivityDetails(activity) && <br />}
                        {new Date(activity.timestamp).toLocaleString()}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
              {recentActivities.length === 0 && (
                <ListItem>
                  <ListItemText 
                    secondary="No recent activities"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Full Width - Project Timeline */}
        <Grid item xs={12}>
          <ProjectTimeline />
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard; 