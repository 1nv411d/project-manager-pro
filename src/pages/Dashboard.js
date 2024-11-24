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
  LinearProgress,
  Divider,
  Chip,
  FormControl,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProjectTimeline from '../components/ProjectTimeline';
import AnnouncementBanner from '../components/AnnouncementBanner';
import { logActivity, createActivityDescription } from '../utils/activityLogger';
import CloseIcon from '@mui/icons-material/Close';

function Dashboard() {
  const navigate = useNavigate();
  const [projectStats, setProjectStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    planning: 0,
    onHold: 0,
    highPriority: 0
  });

  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    overdue: 0,
    highPriority: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [deadlineRange, setDeadlineRange] = useState('week'); // 'week', 'month', 'quarter'

  const [announcement, setAnnouncement] = useState(localStorage.getItem('announcement') || '');
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [announcementColor, setAnnouncementColor] = useState(
    localStorage.getItem('announcementColor') || 'primary'
  );

  useEffect(() => {
    // Load all data from localStorage
    const savedActivities = JSON.parse(localStorage.getItem('activities') || '[]');
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Project stats - updated to show specific statuses
    const stats = {
      new: savedProjects.filter(p => p.status === 'New').length,
      planning: savedProjects.filter(p => p.status === 'Planning').length,
      inProgress: savedProjects.filter(p => p.status === 'In Progress').length,
      onHold: savedProjects.filter(p => p.status === 'On Hold').length,
      highPriority: savedProjects.filter(p => p.priority === 'High').length,
      total: savedProjects.length
    };
    setProjectStats(stats);

    // Task stats
    const today = new Date();
    const taskStats = {
      total: savedTasks.length,
      completed: savedTasks.filter(t => t.completed).length,
      overdue: savedTasks.filter(t => !t.completed && new Date(t.dueDate) < today).length,
      highPriority: savedTasks.filter(t => t.priority === 'High' && !t.completed).length
    };
    setTaskStats(taskStats);

    // Get upcoming deadlines with timeline filter
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

    const upcomingProjects = savedProjects
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

    const upcomingTaskDeadlines = savedTasks
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
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    setUpcomingDeadlines(allDeadlines);

    // Sort activities by timestamp, most recent first
    const sortedActivities = savedActivities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5); // Show only the 5 most recent activities

    setRecentActivities(sortedActivities);

  }, [deadlineRange]);

  const [completionPercentage, setCompletionPercentage] = useState(0);

  const handleActivityClick = (activity) => {
    if (activity.type === 'project') {
      navigate('/projects', { state: { highlightId: activity.itemId } });
    } else {
      navigate('/tasks', { state: { highlightId: activity.itemId } });
    }
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleSaveAnnouncement = () => {
    const isNewAnnouncement = !localStorage.getItem('announcement');
    
    if (announcement.trim()) {
      localStorage.setItem('announcement', announcement);
      localStorage.setItem('announcementColor', announcementColor);
      
      // Log activity with the announcement message
      logActivity({
        type: 'announcement',
        description: isNewAnnouncement 
          ? `New announcement: "${announcement}"`
          : `Announcement updated to: "${announcement}"`,
        timestamp: new Date().toISOString(),
      });
    } else {
      localStorage.removeItem('announcement');
      localStorage.removeItem('announcementColor');
    }
    setIsEditingAnnouncement(false);
  };

  const handleCloseAnnouncement = () => {
    // Log the removed announcement message
    if (announcement) {
      logActivity({
        type: 'announcement',
        description: `Announcement removed: "${announcement}"`,
        timestamp: new Date().toISOString(),
      });
    }
    
    setAnnouncement('');
    localStorage.removeItem('announcement');
    localStorage.removeItem('announcementColor');
  };

  const handleRemoveActivity = (activityId) => {
    const savedActivities = JSON.parse(localStorage.getItem('activities') || '[]');
    const updatedActivities = savedActivities.filter(activity => activity.id !== activityId);
    localStorage.setItem('activities', JSON.stringify(updatedActivities));
    setRecentActivities(updatedActivities.slice(0, 5));
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
        color={announcementColor}
        onColorChange={setAnnouncementColor}
      />
      
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={2}>
        {/* Project Overview Section */}
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: '1rem' }}>
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
        </Grid>

        {/* Recent Activities and Deadlines */}
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: '1rem' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity) => (
                <ListItem 
                  key={activity.id} 
                  divider 
                  button
                  onClick={() => handleActivityClick(activity)}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the ListItem click
                        handleRemoveActivity(activity.id);
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={
                      <Box>
                        <Typography component="span">
                          {activity.description}
                        </Typography>
                        {activity.changes && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ mt: 0.5 }}
                          >
                            Changes: {activity.changes}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={formatTimestamp(activity.timestamp)}
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
            
            <Divider style={{ margin: '1rem 0' }} />
            
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Upcoming Deadlines
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={deadlineRange}
                    onChange={(e) => setDeadlineRange(e.target.value)}
                    variant="outlined"
                    size="small"
                  >
                    <MenuItem value="week">Next 7 Days</MenuItem>
                    <MenuItem value="month">Next 30 Days</MenuItem>
                    <MenuItem value="quarter">Next 90 Days</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Projects Section */}
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Projects
              </Typography>
              <List>
                {upcomingDeadlines.filter(d => d.type === 'project').length > 0 ? (
                  upcomingDeadlines
                    .filter(d => d.type === 'project')
                    .map((deadline) => (
                      <ListItem 
                        key={deadline.id} 
                        divider 
                        button
                        onClick={() => navigate('/projects')}
                      >
                        <ListItemText
                          primary={deadline.name}
                          secondary={`Due: ${deadline.dueDate}`}
                        />
                      </ListItem>
                    ))
                ) : (
                  <ListItem>
                    <ListItemText 
                      secondary="No upcoming project deadlines"
                    />
                  </ListItem>
                )}
              </List>

              {/* Tasks Section */}
              <Box mt={2}>
                <Typography variant="subtitle1" color="secondary" gutterBottom>
                  Tasks
                </Typography>
                <List>
                  {upcomingDeadlines.filter(d => d.type === 'task').length > 0 ? (
                    upcomingDeadlines
                      .filter(d => d.type === 'task')
                      .map((deadline) => (
                        <ListItem 
                          key={deadline.id} 
                          divider 
                          button
                          onClick={() => navigate('/tasks')}
                        >
                          <ListItemText
                            primary={deadline.name}
                            secondary={`Due: ${deadline.dueDate}`}
                          />
                        </ListItem>
                      ))
                  ) : (
                    <ListItem>
                      <ListItemText 
                        secondary="No upcoming task deadlines"
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Timeline section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <ProjectTimeline />
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard; 