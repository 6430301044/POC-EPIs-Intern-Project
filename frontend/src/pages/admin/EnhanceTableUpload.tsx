import { Container } from "@/components/template/Container";
import { SectionTitle } from "@/components/template/SectionTitle";
import React, { useState, useEffect, useRef } from "react";
import API_BASE_URL from "@/config/apiConfig";
import BUDDHA_YRARS from "@/utils/buddhaYears";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { formatDayMonth } from "@/utils/dateUtils";
import { hasAddPermission } from '@/utils/authUtils';

// Define the Period interface based on the backend response
interface Period {
  period_id: string;
  startDate: string;
  endDate: string;
  semiannual_id: string;
  year: string;
  semiannual: number;
  periodName: string;
}

// Define interface for preview data
interface PreviewData {
  headers: string[];
  rows: any[];
  isValid: boolean;
  validationMessage?: string;
  fieldComparison?: {
    requiredFields: string[];
    missingFields: string[];
    extraFields: string[];
  };
  showPreview: boolean;
}

// Define interface for EnhanceTable data
interface EnhanceTable {
  enhance_id: number;
  enhanceName: string;
  valueName: string;
  sub_id: number;
}

// Define interface for EnhanceTable field structure
interface EnhanceTableField {
  name: string;
  type: string;
  required: boolean;
}

export default function EnhanceTableUpload() {
  // State สำหรับเก็บข้อมูลไฟล์และตัวเลือกต่างๆ
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // เก็บไฟล์ที่ผู้ใช้เลือก
  const [periodId, setPeriodId] = useState(""); // เก็บ period_id ที่ผู้ใช้เลือก
  const [selectedPeriodInfo, setSelectedPeriodInfo] = useState<{year: string, periodName: string} | null>(null); // เก็บข้อมูลปีและช่วงเวลาที่เลือก
  const [startDate, setStartDate] = useState(""); // เก็บวันที่เริ่มต้น
  const [endDate, setEndDate] = useState(""); // เก็บวันที่สิ้นสุด
  const [enhanceTable, setEnhanceTable] = useState(""); // เก็บตารางที่ผู้ใช้เลือก
  const [isUploading, setIsUploading] = useState(false); // สถานะการอัปโหลด
  const [periods, setPeriods] = useState<Period[]>([]); // เก็บข้อมูลช่วงเวลาทั้งหมด
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(false); // สถานะการโหลดข้อมูลช่วงเวลา
  const [enhanceTables, setEnhanceTables] = useState<EnhanceTable[]>([]); // เก็บข้อมูลตาราง EnhanceTable ทั้งหมด
  const [isLoadingEnhanceTables, setIsLoadingEnhanceTables] = useState(false); // สถานะการโหลดข้อมูลตาราง EnhanceTable
  const [previewData, setPreviewData] = useState<PreviewData | null>(null); // เก็บข้อมูลตัวอย่างจากไฟล์
  const [isProcessingFile, setIsProcessingFile] = useState(false); // สถานะการประมวลผลไฟล์
  const [isDataComplete, setIsDataComplete] = useState(false); // สถานะความครบถ้วนของข้อมูล
  const fileInputRef = useRef<HTMLInputElement>(null); // อ้างอิงถึง input element
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

  // ฟังก์ชันสำหรับแสดง toast
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

    // ซ่อน toast หลังจาก 3 วินาที
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };
  
  // ดึงข้อมูลช่วงเวลาจาก API
  const fetchPeriods = async () => {
    try {
      setIsLoadingPeriods(true);
      
      const response = await fetch(`${API_BASE_URL}/upload/periods`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // ส่ง cookies ไปด้วย
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch periods: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      // Extract the data array from the response object
      if (responseData && Array.isArray(responseData.data)) {
        setPeriods(responseData.data);
      } else {
        console.warn("Unexpected response format for periods:", responseData);
        setPeriods([]);
      }
    } catch (error) {
      showToast(
        "Error",
        `Failed to load periods: ${error instanceof Error ? error.message : 'Unknown error'}`,
        "error"
      );
      console.error("Error fetching periods:", error);
      setPeriods([]);
    } finally {
      setIsLoadingPeriods(false);
    }
  };

  // ดึงข้อมูลตาราง EnhanceTable จาก API
  const fetchEnhanceTables = async () => {
    try {
      setIsLoadingEnhanceTables(true);
      
      const response = await fetch(`${API_BASE_URL}/enhance-table/structure`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // ส่ง cookies ไปด้วย
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch enhance tables: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      if (responseData && Array.isArray(responseData.data)) {
        setEnhanceTables(responseData.data);
      } else {
        console.warn("Unexpected response format for enhance tables:", responseData);
        setEnhanceTables([]);
      }
    } catch (error) {
      showToast(
        "Error",
        `Failed to load enhance tables: ${error instanceof Error ? error.message : 'Unknown error'}`,
        "error"
      );
      console.error("Error fetching enhance tables:", error);
      setEnhanceTables([]);
    } finally {
      setIsLoadingEnhanceTables(false);
    }
  };
  
  // จัดการเมื่อผู้ใช้เลือกช่วงเวลา
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setPeriodId(selectedId);
    
    // หาข้อมูลช่วงเวลาที่เลือกและอัปเดตข้อมูลปีและช่วงเวลา
    if (selectedId) {
      const selectedPeriod = periods.find(p => p.period_id === selectedId);
      if (selectedPeriod) {
        setSelectedPeriodInfo({
          year: selectedPeriod.year,
          periodName: selectedPeriod.periodName
        });
        setStartDate(selectedPeriod.startDate);
        setEndDate(selectedPeriod.endDate);
      }
    } else {
      setSelectedPeriodInfo(null);
      setStartDate("");
      setEndDate("");
    }
  };

  // โหลดข้อมูลช่วงเวลาและตาราง EnhanceTable เมื่อคอมโพเนนต์ถูกโหลด
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchPeriods();
        await fetchEnhanceTables();
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };
    
    loadData();
  }, []);

  /**
   * Parse CSV file and return data
   */
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

  /**
   * Parse Excel file and return data
   */
  const parseExcel = async (file: File): Promise<any[]> => {
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

  /**
   * ฟังก์ชันสำหรับดึงโครงสร้างฟิลด์ของ EnhanceTable
   */
  const getEnhanceTableFields = (enhanceTableId: string): EnhanceTableField[] => {
    // ฟิลด์ที่จำเป็นสำหรับ EnhanceTable
    // หมายเหตุ: ในระบบจริงควรดึงข้อมูลนี้จาก API
    return [
      { name: 'station_id', type: 'int', required: true },
      { name: 'indexName', type: 'string', required: true },
      { name: 'value', type: 'decimal', required: true },
      { name: 'date', type: 'date', required: true },
      { name: 'remark', type: 'string', required: false }
    ];
  };

  /**
   * Validate data against expected structure for EnhanceTable
   */
  const validateData = (data: any[], enhanceTableId: string = ''): { 
    isValid: boolean; 
    message?: string; 
    fieldComparison?: {
      requiredFields: string[];
      missingFields: string[];
      extraFields: string[];
    };
  } => {
    if (!data || data.length === 0) {
      return { isValid: false, message: "ไม่พบข้อมูลในไฟล์" };
    }

    // ดึงโครงสร้างฟิลด์ของ EnhanceTable
    const expectedFields = getEnhanceTableFields(enhanceTableId);
    
    // ตรวจสอบว่ามีฟิลด์ที่จำเป็นหรือไม่
    const requiredFields = expectedFields.filter(field => field.required).map(field => field.name);
    const firstRow = data[0];
    const fileFields = Object.keys(firstRow).map(key => key.toLowerCase());
    
    const missingRequiredFields = requiredFields.filter(field => 
      !fileFields.some(key => key.toLowerCase() === field.toLowerCase())
    );

    // ตรวจสอบฟิลด์เพิ่มเติมที่มีในไฟล์แต่ไม่มีในโครงสร้าง
    const expectedFieldNames = expectedFields.map(field => field.name.toLowerCase());
    const extraFields = fileFields.filter(field => 
      !expectedFieldNames.some(name => name === field.toLowerCase())
    );

    // สร้างข้อมูลเปรียบเทียบฟิลด์
    const fieldComparison = {
      requiredFields: requiredFields,
      missingFields: missingRequiredFields,
      extraFields: extraFields
    };

    if (missingRequiredFields.length > 0) {
      return { 
        isValid: false, 
        message: `ไฟล์ไม่มีฟิลด์ที่จำเป็น: ${missingRequiredFields.join(', ')}`,
        fieldComparison
      };
    }

    // ตรวจสอบประเภทข้อมูล
    const typeErrors: string[] = [];
    const numericTypes = ['decimal', 'float', 'int'];

    for (let i = 0; i < Math.min(data.length, 5); i++) { // ตรวจสอบ 5 แถวแรก
      const row = data[i];
      
      // ตรวจสอบประเภทข้อมูลของฟิลด์ที่จำเป็น
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
    }

    if (typeErrors.length > 0) {
      return { 
        isValid: false, 
        message: `พบข้อผิดพลาดในการตรวจสอบประเภทข้อมูล:\n${typeErrors.slice(0, 5).join('\n')}${typeErrors.length > 5 ? '\n...และอื่นๆ อีก ' + (typeErrors.length - 5) + ' ข้อผิดพลาด' : ''}`,
        fieldComparison
      };
    }

    return { isValid: true, fieldComparison };
  };

  /**
   * Process the selected file and generate preview
   */
  const processFile = async (file: File) => {
    setIsProcessingFile(true);
    setPreviewData(null);
    
    try {
      let data: any[];
      
      // Parse file based on type
      if (file.type === "text/csv") {
        data = await parseCSV(file);
      } else {
        data = await parseExcel(file);
      }
      
      // Validate data
      const validation = validateData(data, enhanceTable);
      
      // Create preview data
      const headers = data.length > 0 ? Object.keys(data[0]) : [];
      const previewRows = data.slice(0, 5); // Show first 5 rows
      
      // ตรวจสอบความครบถ้วนของข้อมูลที่จำเป็นก่อนแสดง preview
      const isDataComplete = enhanceTable !== "" && periodId !== "";
      setIsDataComplete(isDataComplete);
      
      setPreviewData({
        headers,
        rows: previewRows,
        isValid: validation.isValid,
        validationMessage: validation.message,
        fieldComparison: validation.fieldComparison,
        showPreview: isDataComplete
      });
      
    } catch (error) {
      console.error("Error processing file:", error);
      showToast(
        "Error",
        "Failed to process file: " + (error instanceof Error ? error.message : String(error)),
        "error"
      );
    } finally {
      setIsProcessingFile(false);
    }
  };

  /**
   * จัดการเมื่อผู้ใช้เลือกไฟล์
   * ตรวจสอบประเภทไฟล์ให้เป็น CSV หรือ Excel เท่านั้น
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        file.type === "text/csv" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        setSelectedFile(file);
        
        // Process the file to generate preview
        processFile(file);
      } else {
        showToast(
          "Invalid file type",
          "Please upload only CSV or Excel files",
          "error"
        );
      }
    }
  };
  
  /**
   * จัดการเมื่อผู้ใช้เลือกตาราง EnhanceTable หรือ Period
   * ตรวจสอบความครบถ้วนของข้อมูลและอัปเดต preview ถ้าจำเป็น
   */
  useEffect(() => {
    // ตรวจสอบว่ามีการเลือกไฟล์แล้วหรือไม่
    if (selectedFile) {
      // ตรวจสอบความครบถ้วนของข้อมูล
      const isComplete = enhanceTable !== "" && periodId !== "";
      setIsDataComplete(isComplete);
      
      // อัปเดต preview data ถ้ามีข้อมูลอยู่แล้ว
      if (previewData) {
        setPreviewData({
          ...previewData,
          showPreview: isComplete
        });
        
        // ถ้าข้อมูลครบถ้วนและมีการเลือกตาราง EnhanceTable ใหม่ ให้ตรวจสอบข้อมูลใหม่
        if (isComplete) {
          processFile(selectedFile);
        }
      }
    }
  }, [enhanceTable, periodId]);

  /**
   * จัดการเมื่อผู้ใช้กดปุ่มอัปโหลด
   * ตรวจสอบข้อมูลครบถ้วน และส่งข้อมูลไปยัง API
   */
  const handleUpload = async () => {
    // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
    if (!selectedFile || !periodId || !enhanceTable) {
      showToast(
        "ข้อมูลไม่ครบถ้วน",
        "กรุณากรอกข้อมูลให้ครบถ้วนและเลือกไฟล์",
        "warning"
      );
      return;
    }

    // ตรวจสอบว่าข้อมูลผ่านการตรวจสอบหรือไม่
    if (previewData && !previewData.isValid) {
      showToast(
        "ข้อมูลไม่ถูกต้อง",
        "กรุณาแก้ไขปัญหาข้อมูลก่อนอัปโหลด",
        "warning"
      );
      return;
    }

    // ตรวจสอบว่ามี token หรือไม่
    const token = localStorage.getItem('token');
    if (!token) {
      showToast(
        "ไม่พบข้อมูลการเข้าสู่ระบบ",
        "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
        "error"
      );
      return;
    }

    setIsUploading(true);
    // สร้าง FormData สำหรับส่งข้อมูลแบบ multipart/form-data
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("periodId", periodId);
    formData.append("enhanceTableId", enhanceTable);

    try {
      // ใช้ API_BASE_URL เพื่อให้ตรงกับ endpoint จริง
      // ตรวจสอบประเภทไฟล์และเลือก endpoint ที่เหมาะสม
      const endpoint = selectedFile.type === "text/csv" ? "upload-enhance-csv" : "upload-enhance-excel";
      console.log(`Uploading to endpoint: ${API_BASE_URL}/upload/${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}/upload/${endpoint}`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include', // ส่ง cookies ไปด้วย
        body: formData,
      });

      if (response.ok) {
        showToast("สำเร็จ", "อัปโหลดไฟล์เรียบร้อยแล้ว", "success");
        // รีเซ็ตฟอร์มหลังจากอัปโหลดสำเร็จ
        setSelectedFile(null);
        setPeriodId("");
        setSelectedPeriodInfo(null);
        setStartDate("");
        setEndDate("");
        setEnhanceTable("");
        setPreviewData(null);
        // รีเซ็ต file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: `เกิดข้อผิดพลาด: ${response.status} ${response.statusText}` }));
        throw new Error(errorData.message || "การอัปโหลดล้มเหลว");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      showToast("ข้อผิดพลาด", `การอัปโหลดไฟล์ล้มเหลว: ${error instanceof Error ? error.message : 'ข้อผิดพลาดที่ไม่ทราบสาเหตุ'}`, "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Container>
        <SectionTitle title="Upload EnhanceTable Data" align="center" />
        <div className="p-8">
          <div className="flex flex-col space-y-6">
            <h2 className="text-2xl font-bold">Upload EnhanceTable Data</h2>

            {/* ส่วนเลือกไฟล์ */}
            <div className="flex flex-col">
              <label className="mb-2 font-medium">File (CSV or Excel)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="w-full border p-2 rounded"
                disabled={isUploading}
              />
            </div>

            {/* ส่วนเลือกช่วงเวลา */}
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Period</label>
              <select
                className="w-full border p-2 rounded text-current bg-white dark:bg-gray-700"
                value={periodId}
                onChange={handlePeriodChange}
                disabled={isLoadingPeriods || isUploading}
              >
                <option value="">
                  {isLoadingPeriods ? "Loading..." : "Select period"}
                </option>
                {periods.map((period) => (
                  <option key={period.period_id} value={period.period_id}>
                    {formatDayMonth(period.startDate)} ถึง {formatDayMonth(period.endDate)} ปี พ.ศ. {period.year + BUDDHA_YRARS}  |  รอบการเก็บข้อมูลครั้งที่: {period.semiannual}  |  ระหว่างเดือน {period.periodName}
                  </option>
                ))}
              </select>
              {selectedPeriodInfo && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Selected: {selectedPeriodInfo.year} {selectedPeriodInfo.periodName}
                </div>
              )}
            </div>

            {/* แสดงวันที่เริ่มต้นและสิ้นสุด */}
            {startDate && endDate && (
              <div className="flex flex-col">
                <label className="mb-2 font-medium">Date Range</label>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {startDate} - {endDate}
                </div>
              </div>
            )}

            {/* ส่วนเลือกตาราง EnhanceTable */}
            <div className="flex flex-col">
              <label className="mb-2 font-medium">EnhanceTable</label>
              <select
                className="w-full border p-2 rounded text-current bg-white dark:bg-gray-700"
                value={enhanceTable}
                onChange={(e) => setEnhanceTable(e.target.value)}
                disabled={isLoadingEnhanceTables || isUploading}
              >
                <option value="">
                  {isLoadingEnhanceTables ? "Loading..." : "Select EnhanceTable"}
                </option>
                {enhanceTables.map((table) => (
                  <option key={table.enhance_id} value={table.enhance_id.toString()}>
                    {table.enhanceName} - {table.valueName}
                  </option>
                ))}
              </select>
            </div>

            {/* แสดงตัวอย่างข้อมูล */}
            {isProcessingFile && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">Processing file...</span>
              </div>
            )}

            {previewData && (
              <div className="border rounded p-4 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-lg font-semibold mb-2">File Validation</h3>
                
                {/* แสดงสถานะการตรวจสอบ */}
                <div className={`mb-4 p-2 rounded ${previewData.isValid ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                  <div className="flex items-center">
                    <span className={`mr-2 text-lg ${previewData.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {previewData.isValid ? '✓' : '✗'}
                    </span>
                    <span>
                      {previewData.isValid 
                        ? 'File structure is valid' 
                        : 'File structure has issues'}
                    </span>
                  </div>
                  {!previewData.isValid && previewData.validationMessage && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400 whitespace-pre-line">
                      {previewData.validationMessage}
                    </div>
                  )}
                </div>
                
                {/* แสดงการเปรียบเทียบฟิลด์ */}
                {previewData.fieldComparison && (
                  <div className="mb-4 p-3 border rounded bg-white dark:bg-gray-700">
                    <h4 className="font-semibold mb-2">Field Comparison</h4>
                    
                    {/* ฟิลด์ที่จำเป็น */}
                    <div className="mb-2">
                      <span className="font-medium">Required Fields: </span>
                      {previewData.fieldComparison.requiredFields.map((field, index) => (
                        <span key={index} className="inline-block px-2 py-1 m-1 text-xs rounded bg-blue-100 dark:bg-blue-800">
                          {field}
                        </span>
                      ))}
                    </div>
                    
                    {/* ฟิลด์ที่ขาดหายไป */}
                    {previewData.fieldComparison.missingFields.length > 0 && (
                      <div className="mb-2">
                        <span className="font-medium text-red-600 dark:text-red-400">Missing Fields: </span>
                        {previewData.fieldComparison.missingFields.map((field, index) => (
                          <span key={index} className="inline-block px-2 py-1 m-1 text-xs rounded bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200">
                            {field}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* ฟิลด์เพิ่มเติม */}
                    {previewData.fieldComparison.extraFields.length > 0 && (
                      <div className="mb-2">
                        <span className="font-medium text-yellow-600 dark:text-yellow-400">Extra Fields: </span>
                        {previewData.fieldComparison.extraFields.map((field, index) => (
                          <span key={index} className="inline-block px-2 py-1 m-1 text-xs rounded bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
                            {field}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* ข้อความแจ้งเตือนให้เลือกข้อมูลให้ครบถ้วน */}
                {!previewData.showPreview && (
                  <div className="mb-4 p-3 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                    <div className="flex items-center">
                      <span className="mr-2 text-lg">⚠️</span>
                      <span>กรุณาเลือกช่วงเวลาและตาราง EnhanceTable ให้ครบถ้วนก่อนดูตัวอย่างข้อมูล</span>
                    </div>
                  </div>
                )}
                
                {/* แสดงตารางตัวอย่างข้อมูล เฉพาะเมื่อข้อมูลครบถ้วน */}
                {previewData.showPreview && (
                  <>
                    <h3 className="text-lg font-semibold mb-2">Data Preview</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white dark:bg-gray-700 border">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-600">
                            {previewData.headers.map((header, index) => (
                              <th key={index} className="px-4 py-2 border text-left">{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b">
                              {previewData.headers.map((header, colIndex) => (
                                <td key={colIndex} className="px-4 py-2 border">{row[header]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ปุ่มอัปโหลด */}
            <button
              className={`px-4 py-2 rounded text-white ${isUploading ? "bg-blue-400" : previewData && !previewData.isValid ? "bg-gray-400 cursor-not-allowed" : hasAddPermission() ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
              onClick={handleUpload}
              disabled={isUploading || (previewData && !previewData.isValid) || !hasAddPermission()}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>

            {/* แสดง Toast */}
            {toast.show && (
              <div className={`fixed bottom-4 right-4 p-4 rounded shadow-lg ${toast.type === "success" ? "bg-green-500" : toast.type === "error" ? "bg-red-500" : "bg-yellow-500"} text-white`}>
                <div className="font-bold">{toast.title}</div>
                <div>{toast.message}</div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}