import { Container } from "@/components/template/Container";
import { SectionTitle } from "@/components/template/SectionTitle";
import React, { useState, useEffect, useRef } from "react";
import { fetchMainCategories, fetchSubCategories } from "@/services/environmentService";
import API_BASE_URL from "@/config/apiConfig";
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
}

// Define interface for EnhanceTable data
interface EnhanceTable {
  enhance_id: number;
  enhanceName: string;
  valueName: string;
  sub_id: number;
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
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/upload/periods`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch periods");
      }
      
      const responseData = await response.json();
      // Extract the data array from the response object
      setPeriods(responseData.data || []); // The backend returns {success: true, data: [...]} format
    } catch (error) {
      showToast(
        "Error",
        "Failed to load periods",
        "error"
      );
      console.error("Error fetching periods:", error);
    } finally {
      setIsLoadingPeriods(false);
    }
  };

  // ดึงข้อมูลตาราง EnhanceTable จาก API
  const fetchEnhanceTables = async () => {
    try {
      setIsLoadingEnhanceTables(true);
      const token = localStorage.getItem('token');
      
      // ใช้ข้อมูลจากไฟล์ JSON ที่มีอยู่แล้วในตัวอย่าง
      // ในการใช้งานจริง ควรมีการเรียก API เพื่อดึงข้อมูล
      const mockData: EnhanceTable[] = [
        { enhance_id: 1, enhanceName: "EnhanceWDWS", valueName: "Calm", sub_id: 1 },
        { enhance_id: 2, enhanceName: "EnhanceSO2", valueName: "ค่าเฉลี่ย 24 ชั่วโมง, ค่าเฉลี่ย 1 ชั่วโมงสูงสุด, ค่าเฉลี่ย 1 ชั่วโมงต่ำสุด", sub_id: 3 },
        { enhance_id: 3, enhanceName: "EnhanceNoiseLevelNormal", valueName: "Leq(24), Ldn, Lmax", sub_id: 6 },
        { enhance_id: 4, enhanceName: "EnhanceNoiseLevel90", valueName: "Average", sub_id: 7 },
        { enhance_id: 5, enhanceName: "EnhanceMonitorresult", valueName: "ค่าต่ำสุด, ค่าสูงสุด", sub_id: 8 },
        { enhance_id: 6, enhanceName: "EnhancePlanktonPhytos", valueName: "ชนิดของแพลงก์ตอนพืช, ปริมาณแพลงก์ตอนพืช, ดัชนีความหลากหลายแพลงก์ตอนพืช, ดัชนีความสม่ำเสมอแพลงก์ตอนพืช", sub_id: 11 },
        { enhance_id: 7, enhanceName: "EnhancePlanktonZoo", valueName: "ชนิดของแพลงก์ตอนสัตว์, ปริมาณแพลงก์ตอนสัตว์, ดัชนีความหลากหลายแพลงก์ตอนสัตว์, ดัชนีความสม่ำเสมอแพลงก์ตอนสัตว์", sub_id: 12 },
        { enhance_id: 8, enhanceName: "EnhanceBenthos", valueName: "ชนิดของสัตว์หน้าดิน, ปริมาณสัตว์หน้าดิน, ค่าดัชนีความหลากหลายสัตว์หน้าดิน", sub_id: 13 },
        { enhance_id: 9, enhanceName: "EnhanceFishLarvaeEggs", valueName: "กลุ่มของลูกปลา, ปริมาณของลูกปลา, ค่าดัชนีความหลากหลายของลูกปลา, ปริมาณไข่ปลา", sub_id: 14 },
        { enhance_id: 10, enhanceName: "EnhanceJuvenileAquaticAnimals", valueName: "จำนวนกลุ่มของสัตว์น้ำวัยอ่อนทั้งหมด, ปริมาณของสัตว์น้ำวัยอ่อนทั้งหมด, ค่าดัชนีความหลากหลายของสัตว์น้ำวัยอ่อน", sub_id: 15 }
      ];
      
      setEnhanceTables(mockData);
    } catch (error) {
      showToast(
        "Error",
        "Failed to load enhance tables",
        "error"
      );
      console.error("Error fetching enhance tables:", error);
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
    fetchPeriods();
    fetchEnhanceTables();
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
   * Validate data against expected structure for EnhanceTable
   */
  const validateData = (data: any[]): { isValid: boolean; message?: string } => {
    if (!data || data.length === 0) {
      return { isValid: false, message: "ไม่พบข้อมูลในไฟล์" };
    }

    // ตรวจสอบว่ามีฟิลด์ที่จำเป็นหรือไม่
    const requiredFields = ['station_id', 'indexName'];
    const firstRow = data[0];
    const missingRequiredFields = requiredFields.filter(field => 
      !Object.keys(firstRow).some(key => key.toLowerCase() === field.toLowerCase())
    );

    if (missingRequiredFields.length > 0) {
      return { 
        isValid: false, 
        message: `ไฟล์ไม่มีฟิลด์ที่จำเป็น: ${missingRequiredFields.join(', ')}` 
      };
    }

    // ตรวจสอบประเภทข้อมูล
    const typeErrors: string[] = [];

    for (let i = 0; i < Math.min(data.length, 5); i++) { // ตรวจสอบ 5 แถวแรก
      const row = data[i];
      
      // ตรวจสอบว่า station_id เป็นตัวเลข
      if (row.station_id !== undefined && row.station_id !== null && row.station_id !== '') {
        if (isNaN(Number(row.station_id))) {
          typeErrors.push(`แถวที่ ${i+1}, ฟิลด์ station_id ควรเป็นตัวเลข แต่พบค่า "${row.station_id}"`);
        }
      }
    }

    if (typeErrors.length > 0) {
      return { 
        isValid: false, 
        message: `พบข้อผิดพลาดในการตรวจสอบประเภทข้อมูล:\n${typeErrors.slice(0, 5).join('\n')}${typeErrors.length > 5 ? '\n...และอื่นๆ อีก ' + (typeErrors.length - 5) + ' ข้อผิดพลาด' : ''}` 
      };
    }

    return { isValid: true };
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
      const validation = validateData(data);
      
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
   * จัดการเมื่อผู้ใช้กดปุ่มอัปโหลด
   * ตรวจสอบข้อมูลครบถ้วน และส่งข้อมูลไปยัง API
   */
  const handleUpload = async () => {
    // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
    if (!selectedFile || !periodId || !enhanceTable) {
      showToast(
        "Missing information",
        "Please fill in all fields and select a file",
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
    // สร้าง FormData สำหรับส่งข้อมูลแบบ multipart/form-data
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("periodId", periodId);
    formData.append("enhanceTableId", enhanceTable);

    try {
      // ใช้ API_BASE_URL เพื่อให้ตรงกับ endpoint จริง
      // ตรวจสอบประเภทไฟล์และเลือก endpoint ที่เหมาะสม
      const token = localStorage.getItem('token');
      const endpoint = selectedFile.type === "text/csv" ? "upload-enhance-csv" : "upload-enhance-excel";
      const response = await fetch(`${API_BASE_URL}/upload/${endpoint}`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        showToast("Success", "File uploaded successfully", "success");
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
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }
    } catch (error) {
      showToast("Error", `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`, "error");
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
                    {formatDayMonth(period.startDate)} ถึง {formatDayMonth(period.endDate)} ปี พ.ศ. {period.year}  |  รอบการเก็บข้อมูลครั้งที่: {period.semiannual}  |  ระหว่างเดือน {period.periodName}
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
                <h3 className="text-lg font-semibold mb-2">File Preview</h3>
                
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
                
                {/* แสดงตารางตัวอย่างข้อมูล */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        {previewData.headers.map((header, index) => (
                          <th key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {previewData.rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {previewData.headers.map((header, colIndex) => (
                            <td key={colIndex} className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                              {row[header]?.toString() || ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {previewData.rows.length > 0 && (
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Showing {previewData.rows.length} of {previewData.rows.length >= 5 ? '5+ rows' : `${previewData.rows.length} rows`}
                  </div>
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