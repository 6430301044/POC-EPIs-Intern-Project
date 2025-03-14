import Sidebar from "@/components/template/admin/Sidebar";
import TopBar from "@/components/template/admin/TopBar";
import { Outlet, Navigate } from "react-router";
import { useEffect, useState } from "react";

export default function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // ตรวจสอบ Token เมื่อโหลด component
    const token = localStorage.getItem("token");

    if (token) {
      // ถ้ามี token ให้กำหนดสถานะเป็น authenticated
      setIsAuthenticated(true);
    } else {
      // ถ้าไม่มี token ให้กำหนดสถานะเป็น unauthenticated
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) {
    // กำลังโหลดข้อมูล ไม่แสดงอะไร
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // ถ้าไม่ได้ล็อกอิน ให้ redirect ไปหน้า Login
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Bar */}
        <TopBar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
