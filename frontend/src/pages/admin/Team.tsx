import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import { Container } from '@/components/template/Container';
import { SectionTitle } from '@/components/template/SectionTitle';
import { getAllUsers } from '@/services/userService';
import { hasEditPermission } from '@/utils/authUtils';
import { UploadFile } from '@mui/icons-material';

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
  const canEdit = hasEditPermission();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getAllUsers();
        if (response.success) {
          setUsers(response.data);
        } else {
          setError('Failed to fetch users');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Error fetching users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
                ? '#3da58a'
                : role === 'approver'
                ? '#4cceac'
                : '#4cceac'
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
  ];

  return (
    <Container>
      <SectionTitle
        title='Team Management'
        align='center'
      />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: 'none',
          },
          '& .name-column--cell': {
            color: '#2e7c67',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#3da58a',
            borderBottom: 'none',
            color: '#000000',
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: '#f2f0f0',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: 'none',
            backgroundColor: '#3da58a',
            color: '#ffffff',
          },
          '& .MuiCheckbox-root': {
            color: '#1e5245',
          },
          '& .MuiDataGrid-toolbarContainer .MuiButton-text': {
            color: '#1e5245',
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
          />
        )}
      </Box>
    </Container>
  );
}
