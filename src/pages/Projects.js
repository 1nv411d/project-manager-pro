import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Divider,
  Avatar,
  Stack,
  InputAdornment,
  Menu,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import { useNavigate } from 'react-router-dom';
import { logActivity, createActivityDescription } from '../utils/activityLogger';
import { tenantService } from '../services/TenantService';

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProject, setCurrentProject] = useState({
    name: '',
    description: '',
    status: 'New',
    dueDate: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
    teamMembers: [],
    priority: 'Medium'
  });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortAnchor, setSortAnchor] = useState(null);
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    // Load projects when component mounts
    const tenant = tenantService.getCurrentTenant();
    console.log('Current tenant:', tenant); // Debug log

    if (tenant) {
      const savedProjects = tenantService.getData(`${tenant.id}_projects`);
      console.log('Loaded projects:', savedProjects); // Debug log
      
      if (!savedProjects) {
        // If no projects exist, initialize with default data
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
        tenantService.setData(`${tenant.id}_projects`, defaultProjects);
        setProjects(defaultProjects);
      } else {
        setProjects(savedProjects);
      }
    }
  }, []);

  // Save projects whenever they change
  useEffect(() => {
    const tenant = tenantService.getCurrentTenant();
    if (tenant && projects.length > 0) {
      console.log('Saving projects:', projects); // Debug log
      tenantService.setData(`${tenant.id}_projects`, projects);
    }
  }, [projects]);

  const handleClickOpen = () => {
    setEditMode(false);
    setCurrentProject({
      name: '',
      description: '',
      status: 'New',
      dueDate: new Date().toISOString().split('T')[0],
      teamMembers: [],
      priority: 'Medium'
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDetailsOpen(false);
  };

  const handleEditClick = (project) => {
    setEditMode(true);
    setCurrentProject(project);
    setOpen(true);
  };

  const handleViewDetails = (project) => {
    setCurrentProject(project);
    setDetailsOpen(true);
  };

  const handleSaveProject = () => {
    if (currentProject.name.trim() === '') return;
    
    if (editMode) {
      const oldProject = projects.find(p => p.id === currentProject.id);
      const changes = {};
      
      if (oldProject.status !== currentProject.status) {
        changes.status = currentProject.status;
      }
      if (oldProject.priority !== currentProject.priority) {
        changes.priority = currentProject.priority;
      }
      if (oldProject.dueDate !== currentProject.dueDate) {
        changes.dueDate = currentProject.dueDate;
      }
      
      setProjects(projects.map(project => 
        project.id === currentProject.id ? currentProject : project
      ));

      if (Object.keys(changes).length > 0) {
        logActivity(createActivityDescription('project', 'update', currentProject, changes));
      }
    } else {
      const newProject = {
        ...currentProject,
        id: Date.now(),
      };
      setProjects([...projects, newProject]);

      logActivity(createActivityDescription('project', 'create', newProject));
    }
    
    handleClose();
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const projectToDelete = projects.find(p => p.id === projectId);
      setProjects(projects.filter(project => project.id !== projectId));
      logActivity(createActivityDescription('project', 'delete', projectToDelete));
    }
  };

  const handleAddTeamMember = (memberName) => {
    if (memberName && !currentProject.teamMembers.includes(memberName)) {
      setCurrentProject({
        ...currentProject,
        teamMembers: [...currentProject.teamMembers, memberName]
      });
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
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'dueDate':
        return (new Date(a.dueDate) - new Date(b.dueDate)) * direction;
      case 'priority': {
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return (priorityOrder[a.priority] - priorityOrder[b.priority]) * direction;
      }
      case 'status': {
        const statusOrder = { 'New': 1, 'Planning': 2, 'In Progress': 3, 'On Hold': 4, 'Completed': 5 };
        return (statusOrder[a.status] - statusOrder[b.status]) * direction;
      }
      default:
        return 0;
    }
  });

  const handleSortClick = (event) => {
    setSortAnchor(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchor(null);
  };

  const handleSortSelect = (type) => {
    if (sortBy === type) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortDirection('asc');
    }
    handleSortClose();
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" gutterBottom>
            Projects
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleClickOpen}
          >
            New Project
          </Button>
        </Grid>
        
        <Grid item xs={12}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <Box display="flex" gap={2} alignItems="center">
              <FormControl size="small" style={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="Planning">Planning</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="On Hold">On Hold</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" style={{ minWidth: 120 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filterPriority}
                  label="Priority"
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>

              <IconButton 
                onClick={handleSortClick}
                color={sortAnchor ? 'primary' : 'default'}
                size="small"
              >
                <SortIcon />
              </IconButton>
              <Menu
                anchorEl={sortAnchor}
                open={Boolean(sortAnchor)}
                onClose={handleSortClose}
              >
                <MenuItem 
                  onClick={() => handleSortSelect('dueDate')}
                  selected={sortBy === 'dueDate'}
                >
                  Sort by Due Date {sortBy === 'dueDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </MenuItem>
                <MenuItem 
                  onClick={() => handleSortSelect('priority')}
                  selected={sortBy === 'priority'}
                >
                  Sort by Priority {sortBy === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
                </MenuItem>
                <MenuItem 
                  onClick={() => handleSortSelect('status')}
                  selected={sortBy === 'status'}
                >
                  Sort by Status {sortBy === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </MenuItem>
              </Menu>
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Paper>
            <List>
              {sortedProjects.map((project, index) => (
                <React.Fragment key={project.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          {project.name}
                          <Chip 
                            label={project.status} 
                            color="primary" 
                            size="small"
                          />
                          <Chip 
                            label={project.priority} 
                            color={getPriorityColor(project.priority)} 
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {project.description}
                          </Typography>
                          <Box display="flex" gap={2} mt={1}>
                            <Typography variant="body2" color="text.secondary">
                              Due: {new Date(project.dueDate).toLocaleDateString()}
                            </Typography>
                            <Box display="flex" gap={1} alignItems="center">
                              <Typography variant="body2" color="text.secondary">
                                Team:
                              </Typography>
                              {project.teamMembers.map((member, idx) => (
                                <Chip
                                  key={idx}
                                  avatar={<Avatar>{member[0]}</Avatar>}
                                  label={member}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleViewDetails(project)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditClick(project)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
              {sortedProjects.length === 0 && (
                <ListItem>
                  <ListItemText 
                    primary="No projects found"
                    secondary="Try adjusting your filters or create a new project"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit/Create Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Project' : 'Create New Project'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            type="text"
            fullWidth
            value={currentProject.name}
            onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={currentProject.description}
            onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Status</InputLabel>
                <Select
                  value={currentProject.status}
                  label="Status"
                  onChange={(e) => setCurrentProject({ ...currentProject, status: e.target.value })}
                >
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="Planning">Planning</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="On Hold">On Hold</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={currentProject.priority}
                  label="Priority"
                  onChange={(e) => setCurrentProject({ ...currentProject, priority: e.target.value })}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            value={currentProject.dueDate}
            onChange={(e) => setCurrentProject({ ...currentProject, dueDate: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            label="Add Team Member"
            type="text"
            fullWidth
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddTeamMember(e.target.value);
                e.target.value = '';
              }
            }}
          />
          <Box display="flex" gap={1} mt={1}>
            {currentProject.teamMembers.map((member, index) => (
              <Chip
                key={index}
                label={member}
                onDelete={() => {
                  setCurrentProject({
                    ...currentProject,
                    teamMembers: currentProject.teamMembers.filter((_, i) => i !== index)
                  });
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveProject} color="primary" variant="contained">
            {editMode ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{currentProject.name}</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>Details</Typography>
          <Typography><strong>Status:</strong> {currentProject.status}</Typography>
          <Typography><strong>Priority:</strong> {currentProject.priority}</Typography>
          <Typography><strong>Due Date:</strong> {new Date(currentProject.dueDate).toLocaleDateString()}</Typography>
          <Typography><strong>Description:</strong></Typography>
          <Typography paragraph>{currentProject.description}</Typography>
          <Typography><strong>Team Members:</strong></Typography>
          <Box display="flex" gap={1} mt={1}>
            {currentProject.teamMembers.map((member, index) => (
              <Chip
                key={index}
                avatar={<Avatar>{member[0]}</Avatar>}
                label={member}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Projects; 