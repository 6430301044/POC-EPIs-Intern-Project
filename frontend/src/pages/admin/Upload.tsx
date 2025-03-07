import { Container } from "@/components/template/Container";
import { SectionTitle } from "@/components/template/SectionTitle";
import React, { useState } from "react";

export default function Upload() {
  // State สำหรับเก็บข้อมูลไฟล์และตัวเลือกต่างๆ
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // เก็บไฟล์ที่ผู้ใช้เลือก
  const [year, setYear] = useState(""); // เก็บปีที่ผู้ใช้เลือก
  const [period, setPeriod] = useState(""); // เก็บช่วงเวลาที่ผู้ใช้เลือก
  const [mainCategory, setMainCategory] = useState(""); // เก็บหมวดหมู่หลักที่ผู้ใช้เลือก
  const [subCategory, setSubCategory] = useState(""); // เก็บหมวดหมู่รองที่ผู้ใช้เลือก
  const [isUploading, setIsUploading] = useState(false); // สถานะการอัปโหลด
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
    if (!selectedFile || !year || !period || !mainCategory || !subCategory) {
      showToast(
        "Missing information",
        "Please fill in all fields and select a file",
        "warning"
      );
      return;
    }

    setIsUploading(true);
    // สร้าง FormData สำหรับส่งข้อมูลแบบ multipart/form-data
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("year", year);
    formData.append("period", period);
    formData.append("mainCategory", mainCategory);
    formData.append("subCategory", subCategory);

    try {
      // TODO: แก้ไข URL ให้ตรงกับ API endpoint จริง
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        showToast("Success", "File uploaded successfully", "success");
        // รีเซ็ตฟอร์มหลังจากอัปโหลดสำเร็จ
        setSelectedFile(null);
        setYear("");
        setPeriod("");
        setMainCategory("");
        setSubCategory("");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      showToast("Error", "Failed to upload file", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Container>
        <SectionTitle title="Upload" align="center" />
        <div className="p-8">
          <div className="flex flex-col space-y-6">
            <h2 className="text-2xl font-bold">Upload Data</h2>

            {/* ส่วนเลือกไฟล์ */}
            <div className="flex flex-col">
              <label className="mb-2 font-medium">File (CSV or Excel)</label>
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="w-full border p-2 rounded"
              />
            </div>

            {/* ส่วนเลือกปี */}
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Year</label>
              <select
                className="w-full border p-2 rounded text-current bg-white dark:bg-gray-700"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="">
                  Select year
                </option>
                {Array.from(
                  { length: 10 },
                  (_, i) => new Date().getFullYear() - i
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* ส่วนเลือกช่วงเวลา */}
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Period</label>
              <select
                className="w-full border p-2 rounded text-current bg-white dark:bg-gray-700"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="">
                  Select period
                </option>
                <option value="1">
                  ม.ค. - มิ.ย.
                </option>
                <option value="2">
                  ก.ค. - ธ.ค.
                </option>
              </select>
            </div>

            {/* ส่วนเลือกหมวดหมู่หลัก */}
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Main Category</label>
              <select
                className="w-full border p-2 rounded text-current bg-white dark:bg-gray-700"
                value={mainCategory}
                onChange={(e) => setMainCategory(e.target.value)}
              >
                <option value="">
                  Select main category
                </option>
                <option value="environmental">
                  Environmental
                </option>
                <option value="social">
                  Social
                </option>
                <option value="governance">
                  Governance
                </option>
              </select>
            </div>

            {/* ส่วนเลือกหมวดหมู่รอง */}
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Sub Category</label>
              <select
                className="w-full border p-2 rounded text-current bg-white dark:bg-gray-700"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
              >
                <option value="">
                  Select sub category
                </option>
                <option value="environmental">
                  Environmental
                </option>
                <option value="social">
                  Social
                </option>
                <option value="governance">
                  Governance
                </option>
              </select>
            </div>

            {/* ปุ่มอัปโหลด */}
            <button
              className={`px-4 py-2 rounded text-white ${isUploading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
              onClick={handleUpload}
              disabled={isUploading}
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
