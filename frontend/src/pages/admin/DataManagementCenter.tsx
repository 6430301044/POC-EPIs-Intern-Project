import { useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/template/Container";
import { SectionTitle } from "@/components/template/SectionTitle";
import DataManagement from "@/pages/admin/DataManagement";
// import BulkDataDeletion from "@/pages/admin/BulkDataDeletion";
import BulkDataDeletion2 from '@/pages/admin/BulkDataDeletion2';

export default function DataManagementCenter() {
  const [activeTab, setActiveTab] = useState<"data-management" | "bulk-deletion">("data-management");

  return (
    <Container>
      <SectionTitle
        title="ศูนย์รวมการจัดการข้อมูล"
        preTitle="จัดการและลบข้อมูลทั้งหมดในที่เดียว"
        align="center"
      />

      {/* Tab Navigation */}
      <div className="flex justify-center flex-wrap gap-3 mb-8">
        <button
          onClick={() => setActiveTab("data-management")}
          className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
            activeTab === "data-management"
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
          <span>จัดการข้อมูล</span>
        </button>

        <button
          onClick={() => setActiveTab("bulk-deletion")}
          className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
            activeTab === "bulk-deletion"
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
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>ลบข้อมูลจำนวนมาก</span>
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
          {activeTab === "data-management" ? <DataManagement /> : <BulkDataDeletion2 />}
        </motion.div>
      </div>
    </Container>
  );
}
