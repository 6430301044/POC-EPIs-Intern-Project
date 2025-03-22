import { useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/template/Container";
import { SectionTitle } from "@/components/template/SectionTitle";
import ApproveUser from "./ApproveUser";
import Approval from "./Approval";

export default function ApprovalCenter() {
  const [activeTab, setActiveTab] = useState<"user" | "file">("user");

  return (
    <Container>
      <SectionTitle
        title="Approval Center"
        subtitle="Manage user and file approvals in one place"
        align="center"
      />

      {/* Tab Navigation */}
      <div className="flex justify-center space-x-6 mb-8">
        <button
          onClick={() => setActiveTab("user")}
          className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
            activeTab === "user"
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
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
          <span>User Approvals</span>
        </button>

        <button
          onClick={() => setActiveTab("file")}
          className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
            activeTab === "file"
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
          <span>File Approvals</span>
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
          {activeTab === "user" ? <ApproveUser /> : <Approval />}
        </motion.div>
      </div>
    </Container>
  );
}