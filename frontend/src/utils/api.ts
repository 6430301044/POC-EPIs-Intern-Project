import axios from "axios";
import { useNavigate } from "react-router";
import API_BASE_URL from '@/config/apiConfig';

// สร้าง instance ของ axios
const api = axios.create({
  baseURL: `${API_BASE_URL}`, // เปลี่ยนเป็น URL จริงตอน deploy
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // เพิ่ม option นี้เพื่อส่ง cookies ไปกับ request
});

// เพิ่ม interceptor สำหรับตรวจสอบ response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // ตรวจสอบว่าเป็น error 401 (Unauthorized) หรือไม่
    if (error.response && (error.response.status === 401 || error.response.data?.expired)) {
      console.log("⏳ Token expired, redirecting to login...");
      // ไม่ต้องลบ token จาก localStorage เพราะเราใช้ HttpOnly Cookie แล้ว
      // แต่ยังคงลบข้อมูล user ที่อาจเก็บไว้
      localStorage.removeItem("user");
      // Redirect ไปยังหน้า login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// เพิ่ม interceptor สำหรับ request
// ไม่ต้องเพิ่ม token ใน header เพราะ cookie จะถูกส่งไปโดยอัตโนมัติเมื่อใช้ withCredentials: true
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;