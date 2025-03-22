import axios from "axios";
// import { useNavigate } from "react-router";
import API_BASE_URL from '@/config/apiConfig';

// สร้าง instance ของ axios
const api = axios.create({
  baseURL: `${API_BASE_URL}`, // เปลี่ยนเป็น URL จริงตอน deploy
  headers: {
    "Content-Type": "application/json",
  },
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
      // ลบ token ออกจาก localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect ไปยังหน้า login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// เพิ่ม interceptor สำหรับเพิ่ม token ใน request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;