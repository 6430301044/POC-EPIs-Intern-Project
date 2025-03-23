import Sidebar from "@/components/template/admin/Sidebar";
import TopBar from "@/components/template/admin/TopBar";
import { Outlet, Navigate, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { isAuthenticated, isTokenExpired } from "@/utils/authUtils";
import { getUserRole } from "@/utils/authUtils";
import API_BASE_URL from "@/config/apiConfig";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [authStatus, setAuthStatus] = useState<{ isAuth: boolean; isLoading: boolean }>({ 
    isAuth: false, 
    isLoading: true 
  });

  useEffect(() => {
    // ตรวจสอบ Token เมื่อโหลด component
    const checkAuth = async () => {
      // ตรวจสอบว่า token หมดอายุหรือไม่
      const expired = await isTokenExpired();
      if (expired) {
        console.log("⏳ Token expired, clearing credentials...");
        localStorage.removeItem("token");
        setAuthStatus({ isAuth: false, isLoading: false });
      } else {
        const auth = await isAuthenticated();
        setAuthStatus({ isAuth: auth, isLoading: false });
      }
    };

    checkAuth();

    // ตรวจสอบ token ทุกๆ 10 วินาที เพื่อตรวจสอบการหมดอายุได้เร็วขึ้น
    const intervalId = setInterval(checkAuth, 10 * 1000);

    // กำหนด listener สำหรับการเปลี่ยนแปลงใน localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  
  // ฟังก์ชันสำหรับตรวจสอบการหมดอายุของ Token
  const checkTokenExpiration = async () => {
    try {
      const expired = await isTokenExpired();
      if (expired) {
        // ไม่ต้องลบ token จาก localStorage เพราะใช้ HttpOnly Cookie แล้ว
        navigate("/login"); // Redirect ไปหน้า Login
      }
    } catch (error) {
      console.error("Error checking token expiration:", error);
      navigate("/login"); // Redirect ไปหน้า Login ในกรณีที่มี error
    }
  };

  // แสดง loading ระหว่างตรวจสอบ token
  if (authStatus.isLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;
  }

  // ถ้าไม่ได้ล็อกอินหรือ token หมดอายุ ให้ redirect ไปหน้า Login
  if (!authStatus.isAuth) {
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
  )
}
