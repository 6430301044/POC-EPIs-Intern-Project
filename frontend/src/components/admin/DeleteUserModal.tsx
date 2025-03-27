import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Box
} from '@mui/material';
import { deleteUser } from '@/services/userService';

interface User {
  User_id: string;
  User_name: string;
}

interface DeleteUserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ open, user, onClose, onSuccess }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await deleteUser(user.User_id);
      
      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to delete user');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete User</DialogTitle>
      <DialogContent>
        {error && (
          <Box sx={{ color: 'error.main', mb: 2 }}>
            {error}
          </Box>
        )}
        <DialogContentText>
          คุณแน่ใจนะว่าต้องการลบผู้ใช้ชื่อ {user?.User_name}? การกระทำนี้เมื่อยืนยัน ไม่สามารถย้อยกลับได้
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleDelete} 
          color="error" 
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteUserModal;