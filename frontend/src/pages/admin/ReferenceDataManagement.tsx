import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import API_BASE_URL from '@/config/apiConfig';
import { hasEditPermission, hasAddPermission } from '@/utils/authUtils';

// Define types for reference data
interface ReferenceData {
  [key: string]: any;
}

interface TableSchema {
  COLUMN_NAME: string;
  DATA_TYPE: string;
}

interface ReferenceDataResponse {
  success: boolean;
  data: ReferenceData[];
  totalCount: number;
  schema: TableSchema[];
}

const ReferenceDataManagement: React.FC = () => {
  // State for table selection and data
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<ReferenceData[]>([]);
  const [tableSchema, setTableSchema] = useState<TableSchema[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // No longer need to store user role in state as we'll get it from JWT token
  
  // State for pagination
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  
  // State for form dialogs
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [formData, setFormData] = useState<ReferenceData>({});
  const [selectedId, setSelectedId] = useState<string>('');
  
  // State for notifications
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // No longer need to get user role from localStorage as we'll use the authUtils functions

  // Available reference tables
  const referenceTables = [
    { id: 'Years', name: 'ปี' },
    { id: 'Daysperiod', name: 'ช่วงวันที่' },
    { id: 'Semiannual', name: 'รอบการเก็บข้อมูล' },
    { id: 'Mcategories', name: 'หมวดหมู่หลัก' },
    { id: 'SbCategories', name: 'หมวดหมู่ย่อย' },
    { id: 'Companies', name: 'บริษัท' },
    { id: 'Monitoring_Station', name: 'สถานีตรวจวัด' },
    { id: 'Tool', name: 'เครื่องมือ' }
  ];

  // Load data when table or pagination changes
  useEffect(() => {
    if (selectedTable) {
      fetchTableData();
    }
  }, [selectedTable, page, rowsPerPage]);

  // Handle table selection change
  const handleTableChange = (event: SelectChangeEvent) => {
    setSelectedTable(event.target.value);
    setPage(0);
  };

  // Handle pagination changes
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Fetch data for the selected table
  const fetchTableData = async () => {
    if (!selectedTable) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${API_BASE_URL}/upload/reference/${selectedTable}?offset=${page * rowsPerPage}&pageSize=${rowsPerPage}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch data');
      }
      
      const result: ReferenceDataResponse = await response.json();
      
      if (result.success) {
        setTableData(result.data);
        setTableSchema(result.schema);
        setTotalCount(result.totalCount);
      } else {
        showNotification(result.message || 'ไม่สามารถโหลดข้อมูลได้', 'error');
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
      showNotification('เกิดข้อผิดพลาดในการโหลดข้อมูล: เซิร์ฟเวอร์อาจมีปัญหาการเชื่อมต่อฐานข้อมูล', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Show notification
  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle date input changes (special case for date fields)
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({});
  };

  // Open add dialog
  const handleOpenAddDialog = () => {
    resetFormData();
    setOpenAddDialog(true);
  };

  // Open edit dialog
  const handleOpenEditDialog = (row: ReferenceData) => {
    // Find the ID field (assuming it ends with _id)
    const idField = Object.keys(row).find(key => key.endsWith('_id'));
    if (idField) {
      setSelectedId(row[idField]);
    }
    
    // Create a copy of the row data for editing
    const formData = { ...row };
    
    // Format date fields (if any)
    Object.keys(formData).forEach(key => {
      const column = tableSchema.find(col => col.COLUMN_NAME === key);
      if (column && column.DATA_TYPE === 'date' && formData[key]) {
        const date = new Date(formData[key]);
        formData[key] = date.toISOString().split('T')[0];
      }
    });
    
    setFormData(formData);
    setOpenEditDialog(true);
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (row: ReferenceData) => {
    // Find the ID field (assuming it ends with _id)
    const idField = Object.keys(row).find(key => key.endsWith('_id'));
    if (idField) {
      setSelectedId(row[idField]);
      setOpenDeleteDialog(true);
    }
  };

  // Close all dialogs
  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
  };

  // Add new record
  const handleAddRecord = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/upload/reference/${selectedTable}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        showNotification('เพิ่มข้อมูลสำเร็จ', 'success');
        fetchTableData();
        handleCloseDialogs();
      } else {
        showNotification(result.message || 'ไม่สามารถเพิ่มข้อมูลได้', 'error');
      }
    } catch (error) {
      console.error('Error adding record:', error);
      showNotification('เกิดข้อผิดพลาดในการเพิ่มข้อมูล', 'error');
    }
  };

  // Update record
  const handleUpdateRecord = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/upload/reference/${selectedTable}/${selectedId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        showNotification('อัปเดตข้อมูลสำเร็จ', 'success');
        fetchTableData();
        handleCloseDialogs();
      } else {
        showNotification(result.message || 'ไม่สามารถอัปเดตข้อมูลได้', 'error');
      }
    } catch (error) {
      console.error('Error updating record:', error);
      showNotification('เกิดข้อผิดพลาดในการอัปเดตข้อมูล', 'error');
    }
  };

  // Delete record
  const handleDeleteRecord = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/upload/reference/${selectedTable}/${selectedId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        showNotification('ลบข้อมูลสำเร็จ', 'success');
        fetchTableData();
        handleCloseDialogs();
      } else {
        showNotification(result.message || 'ไม่สามารถลบข้อมูลได้', 'error');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      showNotification('เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
    }
  };

  // Render form fields based on table schema
  const renderFormFields = () => {
    if (!tableSchema.length) return null;
    
    return tableSchema.map(column => {
      // Skip ID fields for add/edit forms
      if (column.COLUMN_NAME.endsWith('_id')) return null;
      
      // Determine input type based on data type
      let inputType = 'text';
      if (column.DATA_TYPE === 'int' || column.DATA_TYPE === 'decimal') {
        inputType = 'number';
      } else if (column.DATA_TYPE === 'date') {
        inputType = 'date';
      }
      
      return (
        <Grid item xs={12} sm={6} key={column.COLUMN_NAME}>
          <TextField
            fullWidth
            label={column.COLUMN_NAME}
            name={column.COLUMN_NAME}
            value={formData[column.COLUMN_NAME] || ''}
            onChange={column.DATA_TYPE === 'date' ? handleDateChange : handleFormChange}
            type={inputType}
            margin="normal"
            required={column.COLUMN_NAME !== 'year_id' && column.COLUMN_NAME !== 'semiannual_id'} // Make year_id and semiannual_id optional
          />
        </Grid>
      );
    });
  };

  // Render table columns based on schema
  const renderTableColumns = () => {
    if (!tableSchema.length) return null;
    
    return tableSchema.map(column => (
      <TableCell key={column.COLUMN_NAME}>{column.COLUMN_NAME}</TableCell>
    ));
  };

  // Render table rows
  const renderTableRows = () => {
    if (!tableData.length) {
      return (
        <TableRow>
          <TableCell colSpan={tableSchema.length + 1} align="center">
            ไม่พบข้อมูล
          </TableCell>
        </TableRow>
      );
    }
    
    return tableData.map((row, index) => (
      <TableRow key={index}>
        {tableSchema.map(column => (
          <TableCell key={column.COLUMN_NAME}>
            {column.DATA_TYPE === 'date' && row[column.COLUMN_NAME]
              ? new Date(row[column.COLUMN_NAME]).toLocaleDateString('th-TH')
              : row[column.COLUMN_NAME]}
          </TableCell>
        ))}
        <TableCell>
          {hasEditPermission() && ( //ลบและแก้ไขข้อมูล
            <>
              <IconButton color="primary" onClick={() => handleOpenEditDialog(row)}>
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={() => handleOpenDeleteDialog(row)}>
                <DeleteIcon />
              </IconButton>
            </>
          )}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Typography component="h1" variant="h5" gutterBottom>
            จัดการข้อมูลอ้างอิง
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="table-select-label">เลือกตารางข้อมูลอ้างอิง</InputLabel>
              <Select
                labelId="table-select-label"
                value={selectedTable}
                label="เลือกตารางข้อมูลอ้างอิง"
                onChange={handleTableChange}
              >
                {referenceTables.map(table => (
                  <MenuItem key={table.id} value={table.id}>{table.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          {selectedTable && hasAddPermission() && ( //เพิ่มข้อมูลใหม่
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
              >
                เพิ่มข้อมูลใหม่
              </Button>
            </Box>
          )}
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : selectedTable ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {renderTableColumns()}
                      <TableCell>จัดการ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {renderTableRows()}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="แถวต่อหน้า"
              />
            </>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                กรุณาเลือกตารางข้อมูลอ้างอิงที่ต้องการจัดการ
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
      
      {/* Add Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>เพิ่มข้อมูลใหม่</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {renderFormFields()}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>ยกเลิก</Button>
          <Button onClick={handleAddRecord} variant="contained" color="primary">บันทึก</Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>แก้ไขข้อมูล</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {renderFormFields()}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>ยกเลิก</Button>
          <Button onClick={handleUpdateRecord} variant="contained" color="primary">บันทึก</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>ยืนยันการลบข้อมูล</DialogTitle>
        <DialogContent>
          <DialogContentText>
            คุณต้องการลบข้อมูลนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>ยกเลิก</Button>
          <Button onClick={handleDeleteRecord} variant="contained" color="error">ลบข้อมูล</Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification */}
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleNotificationClose}>
        <Alert onClose={handleNotificationClose} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ReferenceDataManagement;