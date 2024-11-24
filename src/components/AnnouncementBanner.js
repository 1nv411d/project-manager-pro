import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  IconButton,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

const BANNER_COLORS = {
  primary: 'primary.main',
  info: '#2196f3',
  warning: '#ff9800',
  error: '#f44336',
  success: '#4caf50'
};

function AnnouncementBanner({ 
  announcement, 
  isEditing, 
  onEdit, 
  onSave, 
  onClose, 
  onChange,
  color,
  onColorChange 
}) {
  if (!announcement && !isEditing) {
    return (
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="text"
          size="small"
          startIcon={<AddIcon />}
          onClick={onEdit}
        >
          Add Announcement
        </Button>
      </Box>
    );
  }

  return (
    <Paper 
      sx={{ 
        p: 2, 
        bgcolor: BANNER_COLORS[color] || BANNER_COLORS.primary, 
        color: 'primary.contrastText',
        position: 'relative',
        mb: 2
      }}
    >
      {isEditing ? (
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            fullWidth
            value={announcement}
            onChange={(e) => onChange(e.target.value)}
            variant="outlined"
            size="small"
            placeholder="Enter announcement message"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&:hover fieldset': {
                  borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
              '& .MuiOutlinedInput-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: 'white' }}>Color</InputLabel>
            <Select
              value={color}
              label="Color"
              onChange={(e) => onColorChange(e.target.value)}
              sx={{
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
                '.MuiSvgIcon-root': {
                  color: 'white',
                }
              }}
            >
              <MenuItem value="primary">Default</MenuItem>
              <MenuItem value="info">Info</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="error">Important</MenuItem>
              <MenuItem value="success">Success</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="contained" 
            color="secondary"
            onClick={onSave}
          >
            Save
          </Button>
        </Box>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="body1">
            {announcement}
          </Typography>
          <Box>
            <IconButton 
              size="small" 
              onClick={onEdit}
              sx={{ color: 'inherit' }}
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={onClose}
              sx={{ color: 'inherit' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      )}
    </Paper>
  );
}

export default AnnouncementBanner; 