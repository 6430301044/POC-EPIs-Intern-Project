import { useState } from "react";
import { motion } from "framer-motion";
import ApproveUser from "./ApproveUser";
import Approval from "./Approval";

export default function ApprovalMain() {
    const [activeTab, setActiveTab] = useState<"user" | "file">("user");
  
    return (
      <div className="p-8">
        {/* เมนูเลือก Approve User หรือ Approve File */}
        <div className="flex space-x-4 mb-6">
            <button
                onClick={() => setActiveTab("user")}
                className={`px-4 py-2 rounded-lg transition-all duration-300 shadow-md ${
                activeTab === "user"
                    ? "bg-blue-600 text-white scale-110 shadow-lg"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
            >
                Approve User
            </button>
            <button
                onClick={() => setActiveTab("file")}
                className={`px-4 py-2 rounded-lg transition-all duration-300 shadow-md ${
                activeTab === "file"
                    ? "bg-blue-600 text-white scale-110 shadow-lg"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
            >
                Approve File
            </button>
        </div>
  
        {/* แสดง Approve User หรือ Approve File พร้อมแอนิเมชัน */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "user" ? <ApproveUser /> : <Approval />}
        </motion.div>
      </div>
    );
  }
