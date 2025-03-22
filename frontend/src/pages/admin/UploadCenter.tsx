import { useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/template/Container";
import { SectionTitle } from "@/components/template/SectionTitle";
import Upload from "./Upload";
import ReferenceDataUpload from "./ReferenceDataUpload";
import ReferenceDataManagement from "./ReferenceDataManagement";
import EnhanceTableUpload from "./EnhanceTableUpload";

export default function UploadCenter() {
  const [activeTab, setActiveTab] = useState<"upload" | "reference-upload" | "reference-management" | "enhance-table">("upload");

  return (
    <Container>
      <SectionTitle
        title="Upload Center"
        subtitle="จัดการการอัปโหลดข้อมูลทั้งหมดในที่เดียว"
        align="center"
      />

      {/* Tab Navigation */}
      <div className="flex justify-center flex-wrap gap-3 mb-8">
        <button
          onClick={() => setActiveTab("upload")}
          className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
            activeTab === "upload"
              ? "bg-indigo-600 text-white shadow-lg scale-105"
              : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>อัปโหลดข้อมูลทั่วไป</span>
        </button>

        <button
          onClick={() => setActiveTab("reference-upload")}
          className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
            activeTab === "reference-upload"
              ? "bg-indigo-600 text-white shadow-lg scale-105"
              : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
          <span>อัปโหลดข้อมูลอ้างอิง</span>
        </button>

        <button
          onClick={() => setActiveTab("reference-management")}
          className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
            activeTab === "reference-management"
              ? "bg-indigo-600 text-white shadow-lg scale-105"
              : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z"
              clipRule="evenodd"
            />
          </svg>
          <span>จัดการข้อมูลอ้างอิง</span>
        </button>

        <button
          onClick={() => setActiveTab("enhance-table")}
          className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
            activeTab === "enhance-table"
              ? "bg-indigo-600 text-white shadow-lg scale-105"
              : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>อัปโหลดตาราง Enhance</span>
        </button>
      </div>

      {/* Content Area with Animation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[400px]"
        >
          {activeTab === "upload" && <Upload />}
          {activeTab === "reference-upload" && <ReferenceDataUpload />}
          {activeTab === "reference-management" && <ReferenceDataManagement />}
          {activeTab === "enhance-table" && <EnhanceTableUpload />}
        </motion.div>
      </div>
    </Container>
  );
}