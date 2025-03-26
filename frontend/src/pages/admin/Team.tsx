import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Container } from '@/components/template/Container';
import { SectionTitle } from '@/components/template/SectionTitle';
import { getAllUsers } from '@/services/userService';
import { hasEditPermission } from '@/utils/authUtils';
import { UploadFile } from '@mui/icons-material';
import EditUserModal from '@/components/admin/EditUserModal';
import DeleteUserModal from '@/components/admin/DeleteUserModal';
import { useTheme } from '@/contexts/ThemeContext'

interface User {
  User_id: string;
  User_name: string;
  User_email: string;
  User_phone: string;
  User_Job_Position: string;
  User_role: string;
  User_image: string;
  companyName: string;
}

export default function Team() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const canEdit = hasEditPermission();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getAllUsers();
        if (response.success) {
          setUsers(response.data);
          // ถ้าไม่มีข้อมูลผู้ใช้ ให้แสดงข้อความที่เป็นมิตรกับผู้ใช้
          if (response.data.length === 0) {
            setError('ไม่พบข้อมูลผู้ใช้ในระบบ');
          } else {
            setError(null);
          }
        } else {
          setError('ไม่สามารถดึงข้อมูลผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองใหม่ภายหลัง');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleEditSuccess = () => {
    // Refresh the user list after successful edit
    getAllUsers()
      .then(response => {
        if (response.success) {
          setUsers(response.data);
        }
      })
      .catch(err => console.error('Error refreshing users:', err));
  };

  const handleDeleteSuccess = () => {
    // Refresh the user list after successful delete
    getAllUsers()
      .then(response => {
        if (response.success) {
          setUsers(response.data);
        }
      })
      .catch(err => console.error('Error refreshing users:', err));
  };

  // Define columns for the DataGrid
  const columns: GridColDef[] = [
    { field: 'User_id', headerName: 'ID', width: 90 },
    {
      field: 'User_name',
      headerName: 'Name',
      flex: 1,
      cellClassName: 'name-column--cell',
    },
    {
      field: 'User_Job_Position',
      headerName: 'Job Position',
      flex: 1,
    },
    {
      field: 'User_phone',
      headerName: 'Phone Number',
      flex: 1,
    },
    {
      field: 'User_email',
      headerName: 'Email',
      flex: 1,
    },
    {
      field: 'companyName',
      headerName: 'Company',
      flex: 1,
    },
    {
      field: 'User_role',
      headerName: 'Access Level',
      flex: 1,
      renderCell: ({ row }) => {
        const role = row.User_role;
        return (
          <Box
            width="60%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={
              role === 'admin'
                ? theme === 'dark' ? '#1e5245' : '#3da58a'
                : role === 'approver'
                ? theme === 'dark' ? '#2e7c67' : '#4cceac'
                : role === 'uploader'
                ? theme === 'dark' ? '#3da58a' : '#4cceac'
                : theme === 'dark' ? '#4cceac' : '#4cceac'
            }
            borderRadius="4px"
          >
            {role === 'dev' && <AdminPanelSettingsOutlinedIcon />}
            {role === 'approver' && <SecurityOutlinedIcon />}
            {role === 'uploader' && <UploadFile />}
            {(role !== 'dev' && role !== 'approver' && role !== 'uploader')&& <LockOpenOutlinedIcon />}
            <Typography color="#fff" sx={{ ml: '5px' }}>
              {role}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: ({ row }) => {
        if (canEdit) {
          return (
            <Box display="flex" justifyContent="center" gap={1}>
              <Tooltip title="Edit User">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(row);
                  }}
                  color="primary"
                  size="small"
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete User">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(row);
                  }}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          );
        } else {
          return (
            <Tooltip title="คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลผู้ใช้">
              <Box sx={{ color: 'text.disabled', fontSize: '0.75rem', textAlign: 'center' }}>
                ไม่มีสิทธิ์แก้ไข
              </Box>
            </Tooltip>
          );
        }
      },
    },
  ];

  return (
    <Container>
      <SectionTitle
        title='Team Management'
        align='center'
      />
      {!canEdit && (
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          bgcolor: theme === 'dark' ? 'gray.700' : '#fff9c4', 
          borderRadius: 1, 
          textAlign: 'center' 
        }}>
          <Typography variant="body2" color={theme === 'dark' ? 'warning.light' : 'warning.dark'}>
            คุณกำลังดูข้อมูลในโหมดอ่านอย่างเดียว เนื่องจากคุณไม่มีสิทธิ์ในการแก้ไขข้อมูลผู้ใช้
          </Typography>
        </Box>
      )}
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: 'none',
            color: theme === 'dark'? '#ffffff' : '#2e7c67',
          },
          '& .name-column--cell': {
            color: theme === 'dark' ? '#4cceac' : '#2e7c67',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme === 'dark' ? '#1e5245' : '#3da58a',
            borderBottom: 'none',
            color:'#000000',
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: theme === 'dark' ? '#1f2a40' : '#f2f0f0',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: 'none',
            backgroundColor: theme === 'dark' ? '#1e5245' : '#3da58a',
            color: '#ffffff',
          },
          '& .MuiCheckbox-root': {
            color: theme === 'dark' ? '#4cceac' : '#1e5245',
          },
          '& .MuiDataGrid-toolbarContainer .MuiButton-text': {
            color: theme === 'dark' ? '#4cceac' : '#1e5245',
          },
        }}
      >
        {error ? (
          <Typography color="error" variant="h5" align="center">
            {error}
          </Typography>
        ) : (
          <DataGrid
            rows={users}
            columns={columns}
            getRowId={(row) => row.User_id}
            loading={loading}
            checkboxSelection={canEdit}
            disableRowSelectionOnClick
            autoHeight
            density="standard"
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            sx={{
              '& .MuiDataGrid-row': {
                cursor: canEdit ? 'pointer' : 'default',
              },color: theme === 'dark' ? '#fff' : 'inherit',
              '.MuiTablePagination-selectLabel, .MuiTablePagination-select, .MuiTablePagination-selectIcon, .MuiTablePagination-input': {
                color: theme === 'dark' ? '#fff' : 'inherit'
              },
              '.MuiTablePagination-actions': {
                color: theme === 'dark' ? '#fff' : 'inherit',
                '& .MuiIconButton-root': {
                  color: theme === 'dark' ? '#fff' : 'inherit'
                }
              }
            }}
          />
        )}
      </Box>

      {/* Edit User Modal */}
      <EditUserModal
        open={editModalOpen}
        user={selectedUser}
        onClose={() => setEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        open={deleteModalOpen}
        user={selectedUser}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
      />
    </Container>
  );
}
