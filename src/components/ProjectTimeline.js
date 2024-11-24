import React, { useEffect, useState } from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { Paper, Typography, Box } from '@mui/material';
import { tenantService } from '../services/TenantService';

function ProjectTimeline() {
  const [timelineItems, setTimelineItems] = useState([]);

  useEffect(() => {
    const tenant = tenantService.getCurrentTenant();
    if (!tenant) return;

    // Load projects
    const projects = tenantService.getData(`${tenant.id}_projects`) || [];
    console.log('Timeline - Loaded projects:', projects);

    // Sort projects by due date
    const sortedProjects = [...projects].sort((a, b) => 
      new Date(a.dueDate) - new Date(b.dueDate)
    );

    setTimelineItems(sortedProjects);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'On Hold': return 'warning';
      case 'Planning': return 'info';
      default: return 'grey';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Project Timeline
      </Typography>
      
      <Timeline position="alternate">
        {timelineItems.map((project) => (
          <TimelineItem key={project.id}>
            <TimelineSeparator>
              <TimelineDot color={getStatusColor(project.status)} />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
                <Typography variant="h6" component="h3">
                  {project.name}
                </Typography>
                <Typography color="textSecondary">
                  Due: {new Date(project.dueDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  Status: {project.status}
                </Typography>
                <Typography variant="body2">
                  Priority: {project.priority}
                </Typography>
              </Box>
            </TimelineContent>
          </TimelineItem>
        ))}
        {timelineItems.length === 0 && (
          <Typography color="textSecondary" align="center">
            No projects to display
          </Typography>
        )}
      </Timeline>
    </Paper>
  );
}

export default ProjectTimeline; 