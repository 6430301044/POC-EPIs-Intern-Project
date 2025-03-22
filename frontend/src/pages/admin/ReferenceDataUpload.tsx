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
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Info as InfoIcon } from '@mui/icons-material';
import API_BASE_URL from '@/config/apiConfig';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// Define types
interface ReferenceTable {
  id: string;
  name: string;
}

// Define interface for field structure
interface FieldStructure {
  name: string;
  type: string;
  description: string;
  required?: boolean;
}

interface UploadResult {
  success: boolean;
  uploadId?: string;
  pendingCount?: number;
  insertedCount?: number;
  skippedCount: number;
  errorCount: number;
  errors?: Array<{
    row: any;
    error: string;
  }>;
}

// Define interface for preview data
interface PreviewData {
  headers: string[];
  rows: any[];
  isValid: boolean;
  validationMessage?: string;
}

export default function ReferenceDataUpload() {
  // State for file and options
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tableName, setTableName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [referenceTables, setReferenceTables] = useState<ReferenceTable[]>([]);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null); // เก็บข้อมูลตัวอย่างจากไฟล์
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

    // Define mapping of subcategories to their expected field structures
const ReferenceDataFieldStructures: { [key: string]: FieldStructure[] } = {
  "ปี": [
    { name: "year", type: "int", description: "ปี", required: true }
  ],
  "ช่วงวันที่": [
    { name: "startDate", type: "date", description: "วันเริ่มต้นมาเก็บข้อมูล", required: true },
    { name: "endDate", type: "date", description: "วันสิ้นสุดที่มาเก็บข้อมูล", required: true },
    { name: "semiannual_id", type: "int", description: "รหัสรอบการเก็บข้อมูล", required: true },
    { name: "year_id", type: "int", description: "รหัสปี", required: true }
  ],
  "รอบการเก็บข้อมูล": [
    { name: "semiannual", type: "string", description: "รอบการเก็บข้อมูลแบบเป็นจำนวนครั้งตัวเลข", required: true },
    { name: "semiannualName", type: "string", description: "รอบการเก็บข้อมูลแบบเป็นรายชื่อ", required: true }
  ],
  "หมวดหมู่หลัก": [
    { name: "mainName", type: "string", description: "ชื่อหมวดหมู่หลัก", required: true }
  ],
  "หมวดหมู่ย่อย": [
    { name: "subName", type: "int", description: "ชื่อหมวดหมู่ย่อย", required: true },
    { name: "main_id", type: "string", description: "รหัสหมวดหมู่หลัก", required: true }
  ],
  "บริษัท": [
    { name: "companyName", type: "string", description: "ชื่อบริษัท", required: true },
    { name: "companyPhone", type: "string", description: "เบอร์โทรบริษัท" }
  ],
  "สถานีตรวจวัด": [
    { name: "stationName", type: "int", description: "ชื่อสถานีตรวจวัด", required: true },
    { name: "lat", type: "decimal", description: "ละติจูด" },
    { name: "long", type: "decimal", description: "ลองจิจูด" }
  ],
  "เครื่องมือ": [
    { name: "toolName", type: "string", description: "ชื่อเครื่องมือ", required: true },
    { name: "toolSerial", type: "string", description: "รหัสเครื่องมือ" },
    { name: "toolRole", type: "string", description: "บทบาทของเครื่องมือ" }
  ]
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
    const newTableName = event.target.value;
    setTableName(newTableName);
    
    // If file is already selected, process it with the new table
    if (selectedFile && newTableName) {
      processFile(selectedFile, newTableName);
    } else {
      // Clear preview if table is cleared
      setPreviewData(null);
    }
  };

  // Parse CSV file and return data
  const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  // Parse Excel file and return data
  const parseExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(json);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  // Validate data against expected structure
  const validateData = (data: any[], tableName: string): { isValid: boolean; message?: string } => {
    if (!data || data.length === 0) {
      return { isValid: false, message: "ไม่พบข้อมูลในไฟล์" };
    }

    // Get table name in Thai
    const tableNameThai = referenceTables.find(table => table.id === tableName)?.name || tableName;
    
    // Get expected fields for this table
    const expectedFields = ReferenceDataFieldStructures[tableNameThai];
    if (!expectedFields) {
      return { isValid: true }; // No validation defined for this table
    }

    // Check if all required fields are present
    const firstRow = data[0];
    const missingRequiredFields = expectedFields
      .filter(field => field.required)
      .filter(field => !Object.keys(firstRow).some(key => 
        key.toLowerCase() === field.name.toLowerCase()));

    if (missingRequiredFields.length > 0) {
      return { 
        isValid: false, 
        message: `ไฟล์ไม่มีฟิลด์ที่จำเป็น: ${missingRequiredFields.map(f => f.name).join(', ')}` 
      };
    }

    // Basic type validation for numeric fields
    const typeErrors: string[] = [];
    const numericTypes = ['decimal', 'float', 'int'];

    for (let i = 0; i < Math.min(data.length, 5); i++) { // Check first 5 rows
      const row = data[i];
      
      expectedFields.forEach(field => {
        if (numericTypes.includes(field.type)) {
          const value = row[field.name];
          if (value !== undefined && value !== null && value !== '') {
            if (isNaN(Number(value))) {
              typeErrors.push(`แถวที่ ${i+1}, ฟิลด์ ${field.name} ควรเป็นตัวเลข แต่พบค่า "${value}"`);
            }
          }
        }
      });

      if (typeErrors.length > 5) break; // Limit number of errors
    }

    if (typeErrors.length > 0) {
      return { 
        isValid: false, 
        message: `พบข้อผิดพลาดในการตรวจสอบประเภทข้อมูล:\n${typeErrors.slice(0, 5).join('\n')}${typeErrors.length > 5 ? '\n...และอื่นๆ อีก ' + (typeErrors.length - 5) + ' ข้อผิดพลาด' : ''}` 
      };
    }

    return { isValid: true };
  };

  // Process the selected file and generate preview
  const processFile = async (file: File, tableName: string) => {
    if (!file || !tableName) return;
    
    try {
      let data: any[];
      
      // Parse file based on type
      if (file.name.toLowerCase().endsWith('.csv')) {
        data = await parseCSV(file);
      } else {
        data = await parseExcel(file);
      }
      
      // Validate data
      const validation = validateData(data, tableName);
      
      // Create preview data
      const headers = data.length > 0 ? Object.keys(data[0]) : [];
      const previewRows = data.slice(0, 5); // Show first 5 rows
      
      setPreviewData({
        headers,
        rows: previewRows,
        isValid: validation.isValid,
        validationMessage: validation.message
      });
      
    } catch (error) {
      console.error("Error processing file:", error);
      showToast(
        "Error",
        "Failed to process file: " + (error instanceof Error ? error.message : String(error)),
        "error"
      );
      setPreviewData(null);
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // If table is already selected, process the file
      if (tableName) {
        processFile(file, tableName);
      }
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

    // ตรวจสอบว่าข้อมูลผ่านการตรวจสอบหรือไม่
    if (previewData && !previewData.isValid) {
      showToast(
        "Invalid data",
        "Please fix the data issues before uploading",
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
          `อัปโหลดข้อมูลสำเร็จ: รอการอนุมัติ ${result.data.pendingCount || 0} รายการ`,
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
                disabled={!selectedFile || !tableName || isUploading || (previewData && !previewData.isValid)}
                startIcon={isUploading ? <CircularProgress size={24} color="inherit" /> : null}
              >
                {isUploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
              </Button>
            </Box>
            
            {/* แสดงตัวอย่างข้อมูล */}
            {previewData && (
              <Box sx={{ mt: 4, mb: 2 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      ตัวอย่างข้อมูล
                    </Typography>
                    
                    {/* แสดงสถานะการตรวจสอบ */}
                    <Box sx={{ 
                      mb: 2, 
                      p: 2, 
                      borderRadius: 1,
                      bgcolor: previewData.isValid ? 'success.light' : 'error.light'
                    }}>
                      <Typography variant="body2" color={previewData.isValid ? 'success.dark' : 'error.dark'}>
                        {previewData.isValid 
                          ? '✓ โครงสร้างข้อมูลถูกต้อง' 
                          : '✗ พบปัญหาในโครงสร้างข้อมูล'}
                      </Typography>
                      {!previewData.isValid && previewData.validationMessage && (
                        <Typography variant="body2" color="error.dark" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                          {previewData.validationMessage}
                        </Typography>
                      )}
                    </Box>
                    
                    {/* แสดงตารางตัวอย่างข้อมูล */}
                    <TableContainer sx={{ maxHeight: 300 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            {previewData.headers.map((header, index) => (
                              <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                                {header}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {previewData.rows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {previewData.headers.map((header, colIndex) => (
                                <TableCell key={colIndex}>
                                  {row[header]?.toString() || ''}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      แสดง {previewData.rows.length} จาก {previewData.rows.length >= 5 ? '5+ แถว' : `${previewData.rows.length} แถว`}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
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
                    รอการอนุมัติ: {uploadResult.pendingCount || 0} รายการ
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