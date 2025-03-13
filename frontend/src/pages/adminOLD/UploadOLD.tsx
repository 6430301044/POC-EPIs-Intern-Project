import { Container } from "@/components/template/Container";
import { SectionTitle } from "@/components/template/SectionTitle";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";

/**
 * Upload Component - สำหรับอัปโหลดไฟล์ข้อมูลเข้าสู่ระบบ
 * รองรับไฟล์ CSV และ Excel พร้อมข้อมูลประกอบเช่น ปี, ช่วงเวลา, และหมวดหมู่
 */
const Upload = () => {
  // State สำหรับเก็บข้อมูลไฟล์และตัวเลือกต่างๆ
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // เก็บไฟล์ที่ผู้ใช้เลือก
  const [year, setYear] = useState(""); // เก็บปีที่ผู้ใช้เลือก
  const [period, setPeriod] = useState(""); // เก็บช่วงเวลาที่ผู้ใช้เลือก
  const [category, setCategory] = useState(""); // เก็บหมวดหมู่ที่ผู้ใช้เลือก
  const [isUploading, setIsUploading] = useState(false); // สถานะการอัปโหลด
  const toast = useToast(); // สำหรับแสดงข้อความแจ้งเตือน

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
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload only CSV or Excel files",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  /**
   * จัดการเมื่อผู้ใช้กดปุ่มอัปโหลด
   * ตรวจสอบข้อมูลครบถ้วน และส่งข้อมูลไปยัง API
   */
  const handleUpload = async () => {
    // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
    if (!selectedFile || !year || !period || !category) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and select a file",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);
    // สร้าง FormData สำหรับส่งข้อมูลแบบ multipart/form-data
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("year", year);
    formData.append("period", period);
    formData.append("category", category);

    try {
      // TODO: แก้ไข URL ให้ตรงกับ API endpoint จริง
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "File uploaded successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        // รีเซ็ตฟอร์มหลังจากอัปโหลดสำเร็จ
        setSelectedFile(null);
        setYear("");
        setPeriod("");
        setCategory("");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Container>
        <section id="UploadData">
        <SectionTitle
          title="Upload Data"
          align="center"
        />
        <Box p={8}>
          <VStack spacing={6} align="stretch">
            <Text fontSize="2xl" fontWeight="bold">
              Upload Data
            </Text>

            {/* ส่วนเลือกไฟล์ */}
            <FormControl>
              <FormLabel>File (CSV or Excel)</FormLabel>
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                style={{ width: "100%" }}
              />
            </FormControl>

            {/* ส่วนเลือกปี */}
            <FormControl>
              <FormLabel>Year</FormLabel>
              <Select
                placeholder="Select year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {/* สร้างตัวเลือกปีย้อนหลัง 10 ปี */}
                {Array.from(
                  { length: 10 },
                  (_, i) => new Date().getFullYear() - i
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* ส่วนเลือกช่วงเวลา - ควรปรับให้เป็นช่วงเดือนตามที่อาจารย์แนะนำ */}
            <FormControl>
              <FormLabel>Period</FormLabel>
              <Select
                placeholder="Select period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {/* TODO: ปรับเปลี่ยนจาก Q1-Q4 เป็นช่วงเดือน ม.ค.-มิ.ย. และ ก.ค.-ธ.ค. */}
                <option value="1">ม.ค. - มิ.ย.</option>
                <option value="2">ก.ค. - ธ.ค.</option>
              </Select>
            </FormControl>

            {/* ส่วนเลือกหมวดหมู่ */}
            <FormControl>
              <FormLabel>Category</FormLabel>
              <Select
                placeholder="Select category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="environmental">Environmental</option>
                <option value="social">Social</option>
                <option value="governanace">Governance</option>
              </Select>
            </FormControl>

            {/* ปุ่มอัปโหลด */}
            <Button
              colorScheme="blue"
              onClick={handleUpload}
              isLoading={isUploading}
              loadingText="Uploading..."
            >
              Upload
            </Button>
          </VStack>
        </Box>
        </section>
      </Container>
    </>
  );
};

export default Upload;