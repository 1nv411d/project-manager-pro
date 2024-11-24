import { useState } from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Paper,
  Typography,
  Chip,
  Box,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import { useNavigate } from 'react-router-dom';

function ProjectTimeline() {
  const navigate = useNavigate();
  const [timelineView, setTimelineView] = useState('all'); // 'all', 'active', 'upcoming'

  // Get projects from localStorage and sort by date
  const projects = JSON.parse(localStorage.getItem('projects') || '[]')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircleIcon color="success" />;
      case 'In Progress':
        return <PlayCircleIcon color="primary" />;
      case 'On Hold':
        return <PauseCircleIcon color="warning" />;
      default:
        return <FlagIcon color="info" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const filteredProjects = projects.filter(project => {
    const today = new Date();
    const projectDate = new Date(project.dueDate);
    
    switch (timelineView) {
      case 'active':
        return project.status === 'In Progress';
      case 'upcoming':
        return projectDate > today;
      default:
        return true;
    }
  });

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Project Timeline</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>View</InputLabel>
          <Select
            value={timelineView}
            label="View"
            onChange={(e) => setTimelineView(e.target.value)}
          >
            <MenuItem value="all">All Projects</MenuItem>
            <MenuItem value="active">Active Only</MenuItem>
            <MenuItem value="upcoming">Upcoming</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Timeline position="alternate">
        {filteredProjects.map((project) => (
          <TimelineItem key={project.id}>
            <TimelineOppositeContent>
              <Typography variant="body2" color="textSecondary">
                Due: {new Date(project.dueDate).toLocaleDateString()}
              </Typography>
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color={project.status === 'Completed' ? 'success' : 'primary'}>
                {getStatusIcon(project.status)}
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Paper 
                elevation={3} 
                sx={{ p: 2, cursor: 'pointer' }}
                onClick={() => navigate('/projects')}
              >
                <Typography variant="h6" component="h1">
                  {project.name}
                </Typography>
                <Box display="flex" gap={1} my={1}>
                  <Chip 
                    label={project.status} 
                    size="small" 
                    color="primary"
                  />
                  <Chip 
                    label={project.priority} 
                    size="small" 
                    color={getPriorityColor(project.priority)}
                  />
                </Box>
                <Typography variant="body2">
                  {project.description}
                </Typography>
                {project.teamMembers && project.teamMembers.length > 0 && (
                  <Typography variant="body2" color="textSecondary" mt={1}>
                    Team: {project.teamMembers.join(', ')}
                  </Typography>
                )}
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Paper>
  );
}

export default ProjectTimeline; 