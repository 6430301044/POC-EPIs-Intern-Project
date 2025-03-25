import { Container } from "@/components/template/Container";
import { SectionTitle } from "@/components/template/SectionTitle";
import React, { useState, useEffect, useRef } from "react";
import { fetchMainCategories, fetchSubCategories } from "@/services/environmentService";
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
}

// Define interface for field structure
interface FieldStructure {
  name: string;
  type: string;
  description: string;
  required?: boolean;
}

// Define mapping of subcategories to their expected field structures
const subcategoryFieldStructures: { [key: string]: FieldStructure[] } = {
  "ผลการตรวจวัดทิศทางและความเร็วลมเฉลี่ยรายชั่วโมง": [
    { name: "windDirection", type: "string", description: "ทิศทางลม", required: true },
    { name: "ws_05_1", type: "decimal", description: "ความเร็วลม 0.5-1 m/s" },
    { name: "ws_1_2", type: "decimal", description: "ความเร็วลม 1-2 m/s" },
    { name: "ws_2_3", type: "decimal", description: "ความเร็วลม 2-3 m/s" },
    { name: "ws_3_4", type: "decimal", description: "ความเร็วลม 3-4 m/s" },
    { name: "ws_4_6", type: "decimal", description: "ความเร็วลม 4-6 m/s" },
    { name: "ws_more_that_6", type: "decimal", description: "ความเร็วลมมากกว่า 6 m/s" },
    { name: "station_id", type: "int", description: "รหัสสถานี", required: true },
    { name: "company_id", type: "int", description: "รหัสสถานีตรวจวัด", required: true},
    { name: "reportBy", type: "int", description: "รหัสบริษัททำรายงาน", required: true}
  ],
  "ผลการตรวจวัดคุณภาพอากาศในบรรยากาศ": [
    { name: "station_id", type: "int", description: "รหัสสถานี", required: true },
    { name: "parameter", type: "string", description: "พารามิเตอร์", required: true },
    { name: "unit", type: "string", description: "หน่วย" },
    { name: "day1st_result", type: "decimal", description: "ผลวันที่ 1" },
    { name: "day2nd_result", type: "decimal", description: "ผลวันที่ 2" },
    { name: "day3rd_result", type: "decimal", description: "ผลวันที่ 3" },
    { name: "std", type: "decimal", description: "ค่ามาตรฐาน" },
    { name: "company_id", type: "int", description: "รหัสสถานีตรวจวัด", required: true},
    { name: "reportBy", type: "int", description: "รหัสบริษัททำรายงาน", required: true}
  ],
  "ผลการตรวจวัดค่าความเข้มข้นของก๊าซซัลเฟอร์ไดออกไซด์ในบรรยากาศ": [
    { name: "station_id", type: "int", description: "รหัสสถานี", required: true },
    { name: "timePeriod", type: "string", description: "ช่วงเวลา" },
    { name: "day1st_result_ppm", type: "decimal", description: "ผลวันที่ 1 (ppm)" },
    { name: "day2nd_result_ppm", type: "decimal", description: "ผลวันที่ 2 (ppm)" },
    { name: "day3rd_result_ppm", type: "decimal", description: "ผลวันที่ 3 (ppm)" },
    { name: "certifiedDate", type: "date", description: "วันที่รับรอง" },
    { name: "expireDate", type: "date", description: "วันที่หมดอายุ" },
    { name: "concentrationPPB", type: "string", description: "ความเข้มข้นที่ทำการสอบเทียบ"},
    { name: "gasCylinder", type: "int", description: "รหัสอุปกรณ์ gasCylinder", required: true},
    { name: "toolAnalyst", type: "int", description: "รหัสรุ่นของเครื่องมือตรวจวิเคราะห์", required: true},
    { name: "toolCalibration", type: "int", description: "รหัสของรุ่นอุปกรณ์สอบเทียบ", required: true},
    { name: "company_id", type: "int", description: "รหัสสถานีตรวจวัด", required: true},
    { name: "reportBy", type: "int", description: "รหัสบริษัททำรายงาน", required: true}
  ],
  "ผลการตรวจวัดสารอินทรีย์ระเหยง่ายในบรรยากาศ": [
    { name: "station_id", type: "int", description: "รหัสสถานี", required: true },
    { name: "index_name", type: "string", description: "ชื่อดัชนี", required: true },
    { name: "day1st_result_ug_per_m3", type: "float", description: "ผลวันที่ 1 (µg/m³)" },
    { name: "day2nd_result_ug_per_m3", type: "float", description: "ผลวันที่ 2 (µg/m³)" },
    { name: "day3rd_result_ug_per_m3", type: "float", description: "ผลวันที่ 3 (µg/m³)" },
    { name: "std_lower", type: "float", description: "ค่ามาตรฐานต่ำสุด" },
    { name: "std_higher", type: "float", description: "ค่ามาตรฐานสูงสุด" },
    { name: "company_id", type: "int", description: "รหัสสถานีตรวจวัด", required: true},
    { name: "reportBy", type: "int", description: "รหัสบริษัททำรายงาน", required: true}
  ],
  "ผลการตรวจวัดคุณภาพอากาศภายในสถานประกอบการ": [
    { name: "station_id", type: "int", description: "รหัสสถานี", required: true },
    { name: "index_name", type: "string", description: "ชื่อดัชนี", required: true },
    { name: "unit", type: "string", description: "หน่วย" },
    { name: "result", type: "decimal", description: "ผลการตรวจวัด" },
    { name: "std", type: "decimal", description: "ค่ามาตรฐาน" },
    { name: "company_id", type: "int", description: "รหัสสถานีตรวจวัด", required: true},
    { name: "reportBy", type: "int", description: "รหัสบริษัททำรายงาน", required: true}
  ],
  "ผลการตรวจวัดระดับเสียงโดยทั่วไป": [
    { name: "station_id", type: "int", description: "รหัสสถานี", required: true },
    { name: "timePeriod", type: "string", description: "ช่วงเวลา" },
    { name: "day1st_result", type: "decimal", description: "ผลวันที่ 1" },
    { name: "day2nd_result", type: "decimal", description: "ผลวันที่ 2" },
    { name: "day3rd_result", type: "decimal", description: "ผลวันที่ 3" },
    { name: "certifiedDate", type: "date", description: "วันที่รับรอง" },
    { name: "calibrationRefdB", type: "decimal", description: "ค่าอ้างอิงการสอบเทียบ (dB)" },
    { name: "slmRead", type: "decimal", description: "ค่าที่อ่านได้จาก Sound Level Master Reading (dB)"},
    { name: "slmAdjust", type: "decimal", description: "ค่าปรับแต่ง Sound Level Master Adjust (dB)"},
    { name: "calSheetNo", type: "string", description: "เลขที่เอกสารการสอบเทียบ"},
    { name: "toolAnalyst", type: "int", description: "รหัสรุ่นของเครื่องมือตรวจวิเคราะห์", required: true},
    { name: "toolCalibration", type: "int", description: "รหัสของรุ่นอุปกรณ์สอบเทียบ", required: true},
    { name: "company_id", type: "int", description: "รหัสสถานีตรวจวัด", required: true},
    { name: "reportBy", type: "int", description: "รหัสบริษัททำรายงาน", required: true}
  ],
  "ผลการตรวจวัดคุณภาพเสียง 90": [
    { name: "station_id", type: "int", description: "รหัสสถานี", required: true },
    { name: "timePeriod", type: "string", description: "ช่วงเวลา" },
    { name: "day1st_result", type: "decimal", description: "ผลวันที่ 1" },
    { name: "day2nd_result", type: "decimal", description: "ผลวันที่ 2" },
    { name: "day3rd_result", type: "decimal", description: "ผลวันที่ 3" },
    { name: "certifiedDate", type: "date", description: "วันที่รับรอง" },
    { name: "calibrationRefdB", type: "decimal", description: "ค่าอ้างอิงการสอบเทียบ (dB)" },
    { name: "slmRead", type: "decimal", description: "ค่าที่อ่านได้จาก Sound Level Master Reading (dB)"},
    { name: "slmAdjust", type: "decimal", description: "ค่าปรับแต่ง Sound Level Master Adjust (dB)"},
    { name: "calSheetNo", type: "string", description: "เลขที่เอกสารการสอบเทียบ"},
    { name: "toolAnalyst", type: "int", description: "รหัสรุ่นของเครื่องมือตรวจวิเคราะห์", required: true},
    { name: "toolCalibration", type: "int", description: "รหัสของรุ่นอุปกรณ์สอบเทียบ", required: true},
    { name: "company_id", type: "int", description: "รหัสสถานีตรวจวัด", required: true},
    { name: "reportBy", type: "int", description: "รหัสบริษัททำรายงาน", required: true}
  ],
  "ผลการติดตามตรวจสอบ": [
    { name: "station_id", type: "int", description: "รหัสสถานี", required: true },
    { name: "timePeriod", type: "string", description: "ช่วงเวลา" },
    { name: "day1st_Leq", type: "decimal", description: "ค่า Leq วันที่ 1" },
    { name: "day1st_L90", type: "decimal", description: "ค่า L90 วันที่ 1" },
    { name: "day2nd_Leq", type: "decimal", description: "ค่า Leq วันที่ 2" },
    { name: "day2nd_L90", type: "decimal", description: "ค่า L90 วันที่ 2" },
    { name: "day3rd_Leq", type: "decimal", description: "ค่า Leq วันที่ 3" },
    { name: "day3rd_L90", type: "decimal", description: "ค่า L90 วันที่ 3" },
    { name: "calibrationRefdB", type: "decimal", description: "ค่าอ้างอิงการสอบเทียบ (dB)" },
    { name: "slmRead", type: "decimal", description: "ค่าที่อ่านได้จาก Sound Level Master Reading (dB)"},
    { name: "slmAdjust", type: "decimal", description: "ค่าปรับแต่ง Sound Level Master Adjust (dB)"},
    { name: "certifiedDate", type: "date", description: "วันที่รับรอง" },
    { name: "calSheetNo", type: "string", description: "เลขที่เอกสารการสอบเทียบ"},
    { name: "toolAnalyst", type: "int", description: "รหัสรุ่นของเครื่องมือตรวจวิเคราะห์", required: true},
    { name: "toolCalibration", type: "int", description: "รหัสของรุ่นอุปกรณ์สอบเทียบ", required: true},
    { name: "company_id", type: "int", description: "รหัสสถานีตรวจวัด", required: true},
    { name: "reportBy", type: "int", description: "รหัสบริษัททำรายงาน", required: true}
  ],
  "ผลการตรวจวัดคุณภาพน้ำทิ้ง": [
    { name: "station_id", type: "int", description: "รหัสสถานี", required: true },
    { name: "index_name", type: "string", description: "ชื่อดัชนี" },
    { name: "result", type: "decimal", description: "ผลการตรวจวัด" },
    { name: "unit", type: "string", description: "หน่วย" },
    { name: "std_lower", type: "decimal", description: "ค่ามาตรฐานต่ำสุด" },
    { name: "std_higher", type: "decimal", description: "ค่ามาตรฐานสูงสุด" },
    { name: "company_id", type: "int", description: "รหัสสถานีตรวจวัด", required: true},
    { name: "reportBy", type: "int", description: "รหัสบริษัททำรายงาน", required: true}
  ],
  "ผลการตรวจวัดคุณภาพน้ำทะเล": [
    { name: "station_id", type: "int", description: "รหัสสถานี", required: true },
    { name: "parameter", type: "string", description: "พารามิเตอร์" },
    { name: "result", type: "decimal", description: "ผลการตรวจวัด" },
    { name: "unit", type: "string", description: "หน่วย" },
    { name: "std_lower", type: "decimal", description: "ค่ามาตรฐานต่ำสุด" },
    { name: "std_higher", type: "decimal", description: "ค่ามาตรฐานสูงสุด" },
    { name: "company_id", type: "int", description: "รหัสสถานีตรวจวัด", required: true},
    { name: "reportBy", type: "int", description: "รหัสบริษัททำรายงาน", required: true}
  ],
  "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของแพลงก์ตอนพืช": [
    { name: "station_id", type: "int", description: "รหัสสถานี", required: true },
    { name: "division", type: "string", description: "ดิวิชัน" },
    { name: "class", type: "string", description: "คลาส" },
    { name: "order", type: "string", description: "อันดับ" },
    { name: "family", type: "string", description: "วงศ์" },
    { name: "genu", type: "string", description: "สกุล" },
    { name: "quantity_per_m3", type: "float", description: "ปริมาณต่อลูกบาศก์เมตร" },
    { name: "company_id", type: "int", description: "รหัสสถานีตรวจวัด", required: true},
    { name: "reportBy", type: "int", description: "รหัสบริษัททำรายงาน", required: true}
  ],
  "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของแพลงก์ตอนสัตว์": [
    { name: "station_id", type: "int", description: "รหัสสถานี", required: true },
    { name: "phylum", type: "string", description: "ไฟลัม" },
    { name: "class", type: "string", description: "คลาส" },
    { name: "order", type: "string", description: "อันดับ" },
    { name: "family", type: "string", description: "วงศ์" },
    { name: "genu", type: "string", description: "สกุล" },
    { name: "quantity_per_m3", type: "float", description: "ปริมาณต่อลูกบาศก์เมตร" },
    { name: "company_id", type: "int", description: "รหัสสถานีตรวจวัด", required: true},
    { name: "reportBy", type: "int", description: "รหัสบริษัททำรายงาน", required: true}
  ],
  "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของสัตว์หน้าดิน": [
    { name: "station_id", type: "int", description: "รหัสสถานี", required: true },
    { name: "phylum", type: "string", description: "ไฟลัม" },
    { name: "class", type: "string", description: "คลาส" },
    { name: "order", type: "string", description: "อันดับ" },
    { name: "family", type: "string", description: "วงศ์" },
    { name: "genu", type: "string", description: "สกุล" },
    { name: "quantity_per_m2", type: "float", description: "ปริมาณต่อตารางเมตร" },
    { name: "company_id", type: "int", description: "รหัสสถานีตรวจวัด", required: true},
    { name: "reportBy", type: "int", description: "รหัสบริษัททำรายงาน", required: true}
  ],
  "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของลูกปลาและไข่ปลา": [
    { name: "station_id", type: "int", description: "รหัสสถานี", required: true },
    { name: "phylum", type: "string", description: "ไฟลัม" },
    { name: "class", type: "string", description: "คลาส" },
    { name: "order", type: "string", description: "อันดับ" },
    { name: "family", type: "string", description: "วงศ์" },
    { name: "genu", type: "string", description: "สกุล" },
    { name: "quantity_per_1000m3", type: "float", description: "ปริมาณต่อ 1000 ลูกบาศก์เมตร" },
    { name: "company_id", type: "int", description: "รหัสสถานีตรวจวัด", required: true},
    { name: "reportBy", type: "int", description: "รหัสบริษัททำรายงาน", required: true}
  ],
  "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของสัตว์น้ำวัยอ่อน": [
    { name: "station_id", type: "int", description: "รหัสสถานี", required: true },
    { name: "phylum", type: "string", description: "ไฟลัม" },
    { name: "group_name", type: "string", description: "ชื่อกลุ่ม" },
    { name: "quantity_per_1000m3", type: "float", description: "ปริมาณต่อ 1000 ลูกบาศก์เมตร" },
    { name: "company_id", type: "int", description: "รหัสสถานีตรวจวัด", required: true},
    { name: "reportBy", type: "int", description: "รหัสบริษัททำรายงาน", required: true}
  ]
};

// Add more subcategories as needed

export default function Upload() {
  // State สำหรับเก็บข้อมูลไฟล์และตัวเลือกต่างๆ
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // เก็บไฟล์ที่ผู้ใช้เลือก
  const [periodId, setPeriodId] = useState(""); // เก็บ period_id ที่ผู้ใช้เลือก
  const [selectedPeriodInfo, setSelectedPeriodInfo] = useState<{year: string, periodName: string} | null>(null); // เก็บข้อมูลปีและช่วงเวลาที่เลือก
  const [mainCategory, setMainCategory] = useState(""); // เก็บหมวดหมู่หลักที่ผู้ใช้เลือก
  const [subCategory, setSubCategory] = useState(""); // เก็บหมวดหมู่รองที่ผู้ใช้เลือก
  const [isUploading, setIsUploading] = useState(false); // สถานะการอัปโหลด
  const [periods, setPeriods] = useState<Period[]>([]); // เก็บข้อมูลช่วงเวลาทั้งหมด
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(false); // สถานะการโหลดข้อมูลช่วงเวลา
  const [mainCategories, setMainCategories] = useState<Array<{id: string, name: string}>>([]);
  const [subCategories, setSubCategories] = useState<Array<{id: string, name: string}>>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
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
      
      const response = await fetch(`${API_BASE_URL}/upload/periods`, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // ส่ง cookies ไปด้วย
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
      }
    } else {
      setSelectedPeriodInfo(null);
    }
  };
  
  // ดึงข้อมูลหมวดหมู่หลักจาก API
  const getMainCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const data = await fetchMainCategories();
      
      // Transform the response to match the expected format
      const formattedCategories = data.map((item: any) => ({
        id: item.mainName,
        name: item.mainName
      }));
      setMainCategories(formattedCategories || []);
    } catch (error) {
      showToast(
        "Error",
        "Failed to load main categories",
        "error"
      );
      console.error("Error fetching main categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // ดึงข้อมูลหมวดหมู่รองจาก API ตามหมวดหมู่หลักที่เลือก
  const getSubCategories = async (selectedMainCategory: string) => {
    if (!selectedMainCategory) {
      setSubCategories([]);
      return;
    }
    
    try {
      setIsLoadingCategories(true);
      const data = await fetchSubCategories(selectedMainCategory);
      
      // Transform the response to match the expected format
      const formattedCategories = data.map((item: any) => ({
        id: item.subName,
        name: item.subName
      }));
      setSubCategories(formattedCategories || []);
    } catch (error) {
      showToast(
        "Error",
        "Failed to load sub categories",
        "error"
      );
      console.error("Error fetching sub categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };
  
  // โหลดข้อมูลหมวดหมู่หลักและช่วงเวลาเมื่อคอมโพเนนต์ถูกโหลด
  useEffect(() => {
    getMainCategories();
    fetchPeriods();
  }, []);
  
  // โหลดข้อมูลหมวดหมู่รองเมื่อมีการเลือกหมวดหมู่หลัก
  useEffect(() => {
    setSubCategory(""); // รีเซ็ตค่าหมวดหมู่รองเมื่อมีการเปลี่ยนหมวดหมู่หลัก
    getSubCategories(mainCategory);
  }, [mainCategory]);

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

  /**
   * Validate data against expected structure
   */
  const validateData = (data: any[], subCategoryName: string): { isValid: boolean; message?: string } => {
    if (!data || data.length === 0) {
      return { isValid: false, message: "ไม่พบข้อมูลในไฟล์" };
    }

    // Get expected fields for this subcategory
    const expectedFields = subcategoryFieldStructures[subCategoryName];
    if (!expectedFields) {
      return { isValid: true }; // No validation defined for this subcategory
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

  /**
   * Process the selected file and generate preview
   */
  const processFile = async (file: File, subCategoryName: string) => {
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
      const validation = validateData(data, subCategoryName);
      
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
        
        // If subcategory is already selected, process the file
        if (subCategory) {
          processFile(file, subCategory);
        }
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
   * จัดการเมื่อผู้ใช้เปลี่ยนหมวดหมู่รอง
   */
  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSubCategory = e.target.value;
    setSubCategory(newSubCategory);
    
    // If file is already selected, process it with the new subcategory
    if (selectedFile && newSubCategory) {
      processFile(selectedFile, newSubCategory);
    } else {
      // Clear preview if subcategory is cleared
      setPreviewData(null);
    }
  };

  /**
   * จัดการเมื่อผู้ใช้กดปุ่มอัปโหลด
   * ตรวจสอบข้อมูลครบถ้วน และส่งข้อมูลไปยัง API
   */
  const handleUpload = async () => {
    // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
    if (!selectedFile || !periodId || !mainCategory || !subCategory) {
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
    formData.append("mainCategory", mainCategory);
    formData.append("subCategory", subCategory);

    try {
      // ใช้ API_BASE_URL เพื่อให้ตรงกับ endpoint จริง
      // ตรวจสอบประเภทไฟล์และเลือก endpoint ที่เหมาะสม
      const endpoint = selectedFile.type === "text/csv" ? "upload-csv" : "upload-excel";
      const response = await fetch(`${API_BASE_URL}/upload/${endpoint}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // ส่ง cookies ไปด้วย
        body: formData,
      });

      if (response.ok) {
        showToast("Success", "File uploaded successfully", "success");
        // รีเซ็ตฟอร์มหลังจากอัปโหลดสำเร็จ
        setSelectedFile(null);
        setPeriodId("");
        setSelectedPeriodInfo(null);
        setMainCategory("");
        setSubCategory("");
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
        <SectionTitle title="Upload Core Data" align="center" />
        <div className="p-8">
          <div className="flex flex-col space-y-6">
            <h2 className="text-2xl font-bold">Upload Data</h2>

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

            {/* ส่วนเลือกช่วงเวลา (รวมปีและช่วงเวลาเป็นตัวเลือกเดียว) */}
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

            {/* ส่วนเลือกหมวดหมู่หลัก */}
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Main Category</label>
              <select
                className="w-full border p-2 rounded text-current bg-white dark:bg-gray-700"
                value={mainCategory}
                onChange={(e) => setMainCategory(e.target.value)}
                disabled={isLoadingCategories || isUploading}
              >
                <option value="">
                  {isLoadingCategories ? "Loading..." : "Select main category"}
                </option>
                {mainCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ส่วนเลือกหมวดหมู่รอง */}
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Sub Category</label>
              <select
                className="w-full border p-2 rounded text-current bg-white dark:bg-gray-700"
                value={subCategory}
                onChange={handleSubCategoryChange}
                disabled={isLoadingCategories || !mainCategory || isUploading}
              >
                <option value="">
                  {isLoadingCategories 
                    ? "Loading..." 
                    : !mainCategory 
                      ? "Select main category first" 
                      : "Select sub category"}
                </option>
                {subCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
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
              title={!hasAddPermission() ? "คุณไม่มีสิทธิ์ในการอัปโหลดข้อมูล" : ""}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>

        {/* Custom Toast Notification */}
        {toast.show && (
          <div
            className={`fixed bottom-4 right-4 p-4 rounded shadow-lg ${
              toast.type === "success"
                ? "bg-green-500"
                : toast.type === "error"
                  ? "bg-red-500"
                  : "bg-yellow-500"
            } text-white`}
          >
            <h3 className="font-bold">{toast.title}</h3>
            <p>{toast.message}</p>
          </div>
        )}
      </Container>
    </>
  );
}
