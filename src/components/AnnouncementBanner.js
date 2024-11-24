import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  IconButton,
  TextField,
  Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { logActivity } from '../services/activityLogger';

function AnnouncementBanner({ 
  announcement, 
  isEditing, 
  onEdit, 
  onSave, 
  onClose, 
  onChange 
}) {
  const handleSave = () => {
    onSave();
    logActivity(
      `Announcement was ${announcement ? 'updated' : 'created'}`,
      'announcement',
      { message: announcement }
    );
  };

  const handleClose = () => {
    onClose();
    logActivity(
      'Announcement was removed',
      'announcement',
      { message: announcement }
    );
  };

  if (!announcement && !isEditing) {
    return (
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="text"
          size="small"
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
        bgcolor: 'primary.main', 
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
            }}
          />
          <Button 
            variant="contained" 
            color="secondary"
            onClick={handleSave}
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
              onClick={handleClose}
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