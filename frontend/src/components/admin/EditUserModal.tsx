import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress
} from '@mui/material';
import { updateUser } from '@/services/userService';

interface User {
  User_id: string;
  User_name: string;
  User_email: string;
  User_phone: string;
  User_Job_Position: string;
  User_role: string;
  User_image?: string;
  companyName?: string;
}

interface EditUserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ open, user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        User_name: user.User_name,
        User_email: user.User_email,
        User_phone: user.User_phone,
        User_Job_Position: user.User_Job_Position,
        User_role: user.User_role
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({ ...prev, User_role: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await updateUser(user.User_id, formData);
      
      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to update user');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        {error && (
          <Box sx={{ color: 'error.main', mb: 2, mt: 1 }}>
            {error}
          </Box>
        )}
        <TextField
          margin="dense"
          label="Name"
          name="User_name"
          value={formData.User_name || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          sx={{ mb: 2, mt: 1 }}
        />
        <TextField
          margin="dense"
          label="Email"
          name="User_email"
          value={formData.User_email || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Phone"
          name="User_phone"
          value={formData.User_phone || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Job Position"
          name="User_Job_Position"
          value={formData.User_Job_Position || ''}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="role-select-label">Role</InputLabel>
          <Select
            labelId="role-select-label"
            value={formData.User_role || ''}
            label="Role"
            onChange={handleRoleChange}
          >
            <MenuItem value="approver">Approver</MenuItem>
            <MenuItem value="uploader">Uploader</MenuItem>
            <MenuItem value="dev">Developer</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserModal;