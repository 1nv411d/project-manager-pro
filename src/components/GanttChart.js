import { useState, useMemo } from 'react';
import {
  Paper,
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  ComposedChart,
  Line
} from 'recharts';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useNavigate } from 'react-router-dom';

function GanttChart() {
  const navigate = useNavigate();
  const [timeScale, setTimeScale] = useState('month');
  const [viewType, setViewType] = useState('gantt'); // 'gantt' or 'timeline'
  
  // Get projects from localStorage
  const projects = JSON.parse(localStorage.getItem('projects') || '[]');

  // Process data for the chart
  const chartData = useMemo(() => {
    const today = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    
    // First pass: calculate base data
    const baseData = projects.map(project => {
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
        .filter(t => t.projectId === project.id);
      
      const projectTasks = tasks.map(task => ({
        id: task.id,
        name: task.title,
        start: new Date(task.startDate),
        end: new Date(task.dueDate),
        dependencies: task.dependencies,
        completed: task.completed,
        type: 'task'
      }));

      return {
        id: project.id,
        name: project.name,
        tasks: projectTasks,
        start: new Date(Math.min(...projectTasks.map(t => t.start))),
        end: new Date(project.dueDate),
        type: 'project',
        status: project.status,
        progress: project.status === 'Completed' ? 100 :
                 project.status === 'In Progress' ? 50 :
                 project.status === 'Planning' ? 25 : 0
      };
    });

    // Second pass: calculate positions and dependencies
    return baseData.flatMap(project => {
      const projectBar = {
        ...project,
        y: project.name,
        duration: Math.ceil((project.end - project.start) / msPerDay),
        level: 0
      };

      const taskBars = project.tasks.map((task, index) => ({
        ...task,
        y: `${project.name} - ${task.name}`,
        duration: Math.ceil((task.end - task.start) / msPerDay),
        level: 1,
        parentId: project.id
      }));

      return [projectBar, ...taskBars];
    });
  }, [projects]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const dueDate = new Date(data.dueDate).toLocaleDateString();
      const daysText = data.isOverdue ? 'days overdue' : 'days remaining';
      
      return (
        <Paper 
          style={{ 
            padding: '10px', 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            cursor: 'pointer' 
          }}
          onClick={() => navigate('/projects')}
        >
          <Typography variant="subtitle2" color="primary">{data.name}</Typography>
          <Typography variant="body2">Status: {data.status}</Typography>
          <Typography variant="body2">Priority: {data.priority}</Typography>
          <Typography variant="body2">Due: {dueDate}</Typography>
          <Typography 
            variant="body2" 
            color={data.isOverdue ? 'error' : 'success.main'}
          >
            {data.duration} {daysText}
          </Typography>
          <Typography variant="body2">
            Progress: {data.progress}%
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const getBarColor = (entry) => {
    if (entry.isOverdue) return '#f44336';
    
    switch (entry.status.toLowerCase()) {
      case 'completed': return '#4caf50';
      case 'in progress': return '#2196f3';
      case 'on hold': return '#ff9800';
      case 'planning': return '#9c27b0';
      default: return '#9e9e9e';
    }
  };

  const CustomYAxisTick = (props) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={-3}
          y={0}
          dy={4}
          textAnchor="end"
          fill="#666"
          fontSize={12}
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/projects')}
        >
          {payload.value.length > 20 
            ? `${payload.value.substring(0, 20)}...` 
            : payload.value}
        </text>
      </g>
    );
  };

  const CustomLegend = () => (
    <Box display="flex" justifyContent="center" gap={2} mt={1}>
      {['Completed', 'In Progress', 'On Hold', 'Planning', 'Overdue'].map((status) => (
        <Box key={status} display="flex" alignItems="center" gap={0.5}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: getBarColor({ status, isOverdue: status === 'Overdue' })
            }}
          />
          <Typography variant="caption">{status}</Typography>
        </Box>
      ))}
    </Box>
  );

  const renderDependencies = () => {
    const dependencies = [];
    chartData.forEach(item => {
      if (item.dependencies) {
        item.dependencies.forEach(depId => {
          const source = chartData.find(d => d.id === depId);
          if (source) {
            dependencies.push(
              <Line
                key={`${source.id}-${item.id}`}
                type="monotone"
                data={[
                  { x: source.end, y: source.y },
                  { x: item.start, y: item.y }
                ]}
                stroke="#999"
                strokeDasharray="3 3"
                connectNulls
              />
            );
          }
        });
      }
    });
    return dependencies;
  };

  const renderChart = () => {
    return (
      <ComposedChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
        height={chartData.length * 40 + 100}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <YAxis dataKey="y" type="category" />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="duration" name="Duration">
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getBarColor(entry)}
              fillOpacity={entry.level === 1 ? 0.8 : 1}
            />
          ))}
        </Bar>
        {renderDependencies()}
      </ComposedChart>
    );
  };

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Project Timeline</Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Scale</InputLabel>
            <Select
              value={timeScale}
              label="Time Scale"
              onChange={(e) => setTimeScale(e.target.value)}
            >
              <MenuItem value="week">Weekly</MenuItem>
              <MenuItem value="month">Monthly</MenuItem>
              <MenuItem value="quarter">Quarterly</MenuItem>
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={viewType}
            exclusive
            onChange={(e, newValue) => {
              if (newValue !== null) {
                setViewType(newValue);
              }
            }}
            size="small"
          >
            <ToggleButton value="gantt">
              <MuiTooltip title="Gantt View">
                <BarChartIcon />
              </MuiTooltip>
            </ToggleButton>
            <ToggleButton value="timeline">
              <MuiTooltip title="Timeline View">
                <TimelineIcon />
              </MuiTooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={400}>
            {renderChart()}
          </ResponsiveContainer>
          <CustomLegend />
        </>
      ) : (
        <Box p={3} textAlign="center">
          <Typography color="textSecondary">
            No projects to display
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export default GanttChart; 