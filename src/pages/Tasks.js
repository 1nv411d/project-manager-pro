import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
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
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem as MenuItemSort,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  Divider,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import LabelIcon from '@mui/icons-material/Label';
import SortIcon from '@mui/icons-material/Sort';
import { useNavigate } from 'react-router-dom';
import { logActivity, formatChanges } from '../services/activityLogger';
import { tenantService } from '../services/TenantService';

function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [categories, setCategories] = useState(['Bug', 'Feature', 'Documentation', 'Design']);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentTask, setCurrentTask] = useState({
    title: '',
    description: '',
    status: 'New',
    priority: 'Medium',
    projectId: '',
    projectName: '',
    dueDate: new Date().toISOString().split('T')[0],
    assignedTo: '',
    completed: false,
    categories: []
  });
  const [sortAnchor, setSortAnchor] = useState(null);
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    // Load tasks when component mounts
    const tenant = tenantService.getCurrentTenant();
    console.log('Current tenant:', tenant); // Debug log

    if (tenant) {
      const savedTasks = tenantService.getData(`${tenant.id}_tasks`);
      console.log('Loaded tasks:', savedTasks); // Debug log
      
      if (!savedTasks) {
        // If no tasks exist, initialize with default data
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
        tenantService.setData(`${tenant.id}_tasks`, defaultTasks);
        setTasks(defaultTasks);
      } else {
        setTasks(savedTasks);
      }

      // Load projects for task management
      const savedProjects = tenantService.getData(`${tenant.id}_projects`);
      if (savedProjects) {
        setProjects(savedProjects);
      }
    }
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    const tenant = tenantService.getCurrentTenant();
    if (tenant && tasks.length > 0) {
      console.log('Saving tasks:', tasks); // Debug log
      tenantService.setData(`${tenant.id}_tasks`, tasks);
    }
  }, [tasks]);

  useEffect(() => {
    // Log the current data to debug
    console.log('Current tenant:', tenantService.getCurrentTenant());
    console.log('Current tasks:', tasks);
  }, [tasks]);

  const handleClickOpen = () => {
    setEditMode(false);
    setCurrentTask({
      title: '',
      description: '',
      status: 'New',
      priority: 'Medium',
      projectId: '',
      projectName: '',
      dueDate: new Date().toISOString().split('T')[0],
      assignedTo: '',
      completed: false,
      categories: []
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEditClick = (task) => {
    setEditMode(true);
    setCurrentTask(task);
    setOpen(true);
  };

  const handleSaveTask = () => {
    if (currentTask.title.trim() === '') return;

    if (editMode) {
      const oldTask = tasks.find(t => t.id === currentTask.id);
      const changes = formatChanges(oldTask, currentTask);
      
      setTasks(tasks.map(task => 
        task.id === currentTask.id ? currentTask : task
      ));

      const changeDescription = Object.entries(changes)
        .map(([key, value]) => `${key}: ${value.from} → ${value.to}`)
        .join(', ');

      logActivity(
        `Task "${currentTask.title}" was updated`,
        'task',
        { changes, taskId: currentTask.id }
      );
    } else {
      const newTask = {
        ...currentTask,
        id: Date.now(),
      };
      setTasks([...tasks, newTask]);
      logActivity(
        `Task "${newTask.title}" was created`,
        'task',
        { taskId: newTask.id }
      );
    }
    
    handleClose();
  };

  const handleDeleteTask = (taskId) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
      logActivity(`Task "${taskToDelete.title}" was deleted`);
    }
  };

  const handleToggleComplete = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const updatedTask = { ...task, completed: !task.completed };
    setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    
    logActivity(
      `Task "${task.title}" was marked as ${updatedTask.completed ? 'completed' : 'incomplete'}`,
      'task',
      { taskId, completed: updatedTask.completed }
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesProject = filterProject === 'all' || task.projectId === filterProject;
    const matchesCategories = selectedCategories.length === 0 || 
                            selectedCategories.some(cat => task.categories?.includes(cat));

    return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesCategories;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
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
            Tasks
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleClickOpen}
          >
            New Task
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search tasks..."
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
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="On Hold">On Hold</MenuItem>
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

              <FormControl size="small" style={{ minWidth: 120 }}>
                <InputLabel>Project</InputLabel>
                <Select
                  value={filterProject}
                  label="Project"
                  onChange={(e) => setFilterProject(e.target.value)}
                >
                  <MenuItem value="all">All Projects</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
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
                <MenuItemSort 
                  onClick={() => handleSortSelect('dueDate')}
                  selected={sortBy === 'dueDate'}
                >
                  Sort by Due Date {sortBy === 'dueDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </MenuItemSort>
                <MenuItemSort 
                  onClick={() => handleSortSelect('priority')}
                  selected={sortBy === 'priority'}
                >
                  Sort by Priority {sortBy === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
                </MenuItemSort>
                <MenuItemSort 
                  onClick={() => handleSortSelect('status')}
                  selected={sortBy === 'status'}
                >
                  Sort by Status {sortBy === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </MenuItemSort>
              </Menu>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Categories
              </Typography>
              <ToggleButtonGroup
                value={selectedCategories}
                onChange={(e, newCategories) => setSelectedCategories(newCategories)}
                aria-label="task categories"
                size="small"
                multiple
              >
                {categories.map((category) => (
                  <ToggleButton key={category} value={category}>
                    <LabelIcon sx={{ mr: 1 }} />
                    {category}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Paper>
            <List>
              {sortedTasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    sx={{
                      opacity: task.completed ? 0.7 : 1,
                      textDecoration: task.completed ? 'line-through' : 'none',
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        checked={task.completed}
                        onChange={() => handleToggleComplete(task.id)}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          {task.title}
                          <Chip 
                            label={task.status} 
                            color="primary" 
                            size="small"
                          />
                          <Chip 
                            label={task.priority} 
                            color={getPriorityColor(task.priority)} 
                            size="small"
                          />
                          <Chip 
                            label={task.projectName}
                            variant="outlined"
                            size="small"
                            onClick={() => navigate('/projects')}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {task.description}
                          </Typography>
                          <Box display="flex" gap={2} mt={1}>
                            <Typography variant="body2" color="text.secondary">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Assigned to: {task.assignedTo}
                            </Typography>
                          </Box>
                          {task.categories && task.categories.length > 0 && (
                            <Box display="flex" gap={1} mt={1}>
                              {task.categories.map((category, idx) => (
                                <Chip
                                  key={idx}
                                  label={category}
                                  size="small"
                                  icon={<LabelIcon />}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditClick(task)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
              {sortedTasks.length === 0 && (
                <ListItem>
                  <ListItemText 
                    primary="No tasks found"
                    secondary="Try adjusting your filters or create a new task"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            type="text"
            fullWidth
            value={currentTask.title}
            onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={currentTask.description}
            onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Status</InputLabel>
                <Select
                  value={currentTask.status}
                  label="Status"
                  onChange={(e) => setCurrentTask({ ...currentTask, status: e.target.value })}
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
                  value={currentTask.priority}
                  label="Priority"
                  onChange={(e) => setCurrentTask({ ...currentTask, priority: e.target.value })}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <FormControl fullWidth margin="dense">
            <InputLabel>Project</InputLabel>
            <Select
              value={currentTask.projectId}
              label="Project"
              onChange={(e) => setCurrentTask({ 
                ...currentTask, 
                projectId: e.target.value,
                projectName: projects.find(p => p.id === e.target.value)?.name || ''
              })}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            value={currentTask.dueDate}
            onChange={(e) => setCurrentTask({ ...currentTask, dueDate: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            label="Assigned To"
            type="text"
            fullWidth
            value={currentTask.assignedTo}
            onChange={(e) => setCurrentTask({ ...currentTask, assignedTo: e.target.value })}
          />
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Categories
            </Typography>
            <ToggleButtonGroup
              value={currentTask.categories}
              onChange={(e, newCategories) => setCurrentTask({
                ...currentTask,
                categories: newCategories
              })}
              aria-label="task categories"
              size="small"
              multiple
            >
              {categories.map((category) => (
                <ToggleButton key={category} value={category}>
                  <LabelIcon sx={{ mr: 1 }} />
                  {category}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveTask} color="primary" variant="contained">
            {editMode ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Tasks; 