import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Typography,
  Alert,
  Snackbar,
  IconButton,
  Tooltip
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Info as InfoIcon } from '@mui/icons-material';
import API_BASE_URL from '@/config/apiConfig';

// Define types
interface ReferenceTable {
  id: string;
  name: string;
}

interface UploadResult {
  success: boolean;
  insertedCount: number;
  skippedCount: number;
  errorCount: number;
  errors?: Array<{
    row: any;
    error: string;
  }>;
}

export default function ReferenceDataUpload() {
  // State for file and options
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tableName, setTableName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [referenceTables, setReferenceTables] = useState<ReferenceTable[]>([]);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning";
  }>({
    show: false,
    title: "",
    message: "",
    type: "success",
  });

  // Show toast function
  const showToast = (
    title: string,
    message: string,
    type: "success" | "error" | "warning"
  ) => {
    setToast({
      show: true,
      title,
      message,
      type,
    });

    // Hide toast after 3 seconds
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // Initialize reference tables
  useEffect(() => {
    // Available reference tables
    const tables = [
      { id: 'Years', name: 'ปี' },
      { id: 'Daysperiod', name: 'ช่วงวันที่' },
      { id: 'Semiannual', name: 'รอบการเก็บข้อมูล' },
      { id: 'Mcategories', name: 'หมวดหมู่หลัก' },
      { id: 'SbCategories', name: 'หมวดหมู่ย่อย' },
      { id: 'Companies', name: 'บริษัท' },
      { id: 'Monitoring_Station', name: 'สถานีตรวจวัด' },
      { id: 'Tool', name: 'เครื่องมือ' }
    ];
    setReferenceTables(tables);
  }, []);

  // Handle table selection change
  const handleTableChange = (event: SelectChangeEvent) => {
    setTableName(event.target.value);
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile || !tableName) {
      showToast(
        "ข้อมูลไม่ครบถ้วน",
        "กรุณาเลือกไฟล์และตารางข้อมูลอ้างอิง",
        "warning"
      );
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("tableName", tableName);

      const token = localStorage.getItem('token');
      
      // Determine endpoint based on file type
      const fileType = selectedFile.name.toLowerCase().endsWith('.csv') ? 'csv' : 'excel';
      const endpoint = `${API_BASE_URL}/upload/upload-reference-${fileType}`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok) {
        showToast(
          "อัปโหลดสำเร็จ",
          `อัปโหลดข้อมูลสำเร็จ: เพิ่ม ${result.data.insertedCount} รายการ`,
          "success"
        );
        setUploadResult(result.data);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setSelectedFile(null);
      } else {
        showToast(
          "เกิดข้อผิดพลาด",
          result.message || "ไม่สามารถอัปโหลดไฟล์ได้",
          "error"
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToast(
        "เกิดข้อผิดพลาด",
        "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์",
        "error"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography component="h1" variant="h5" gutterBottom>
          อัปโหลดข้อมูลตารางอ้างอิง
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" color="text.secondary" paragraph>
            อัปโหลดข้อมูลจำนวนมากเข้าสู่ตารางอ้างอิงในระบบ โดยใช้ไฟล์ CSV หรือ Excel
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="table-select-label">เลือกตารางข้อมูลอ้างอิง</InputLabel>
              <Select
                labelId="table-select-label"
                value={tableName}
                label="เลือกตารางข้อมูลอ้างอิง"
                onChange={handleTableChange}
              >
                {referenceTables.map(table => (
                  <MenuItem key={table.id} value={table.id}>{table.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mb: 2 }}>
              <input
                accept=".csv,.xlsx,.xls"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mr: 1 }}
                >
                  เลือกไฟล์
                </Button>
                {selectedFile && (
                  <Typography variant="body2" component="span">
                    {selectedFile.name}
                  </Typography>
                )}
              </label>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={!selectedFile || !tableName || isUploading}
                startIcon={isUploading ? <CircularProgress size={24} color="inherit" /> : null}
              >
                {isUploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" component="div">
                    คำแนะนำการอัปโหลด
                  </Typography>
                  <Tooltip title="ข้อมูลเพิ่มเติมเกี่ยวกับการอัปโหลด">
                    <IconButton size="small" color="primary">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  1. รองรับไฟล์ CSV และ Excel (.xlsx, .xls)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  2. ตรวจสอบให้แน่ใจว่าชื่อคอลัมน์ในไฟล์ตรงกับชื่อคอลัมน์ในฐานข้อมูล
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  3. ระบบจะข้ามแถวที่มีข้อมูลไม่ถูกต้องหรือไม่ครบถ้วน
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  4. ไม่ต้องระบุคอลัมน์ ID เนื่องจากระบบจะสร้างให้อัตโนมัติ
                </Typography>
              </CardContent>
            </Card>
            
            {uploadResult && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    ผลการอัปโหลด
                  </Typography>
                  <Typography variant="body2">
                    เพิ่มข้อมูลสำเร็จ: {uploadResult.insertedCount} รายการ
                  </Typography>
                  <Typography variant="body2">
                    ข้ามข้อมูล: {uploadResult.skippedCount} รายการ
                  </Typography>
                  <Typography variant="body2">
                    ข้อผิดพลาด: {uploadResult.errorCount} รายการ
                  </Typography>
                  
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="error">
                        รายละเอียดข้อผิดพลาด:
                      </Typography>
                      {uploadResult.errors.slice(0, 5).map((error, index) => (
                        <Typography key={index} variant="body2" color="error" sx={{ fontSize: '0.8rem' }}>
                          - แถวที่ {index + 1}: {error.error}
                        </Typography>
                      ))}
                      {uploadResult.errors.length > 5 && (
                        <Typography variant="body2" color="error" sx={{ fontSize: '0.8rem' }}>
                          ... และอีก {uploadResult.errors.length - 5} ข้อผิดพลาด
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Toast notification */}
      <Snackbar
        open={toast.show}
        autoHideDuration={3000}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setToast(prev => ({ ...prev, show: false }))} 
          severity={toast.type} 
          sx={{ width: '100%' }}
        >
          <Typography variant="subtitle2">{toast.title}</Typography>
          <Typography variant="body2">{toast.message}</Typography>
        </Alert>
      </Snackbar>
    </Container>
  );
}