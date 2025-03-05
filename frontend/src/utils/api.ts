import axios from "axios";

// สร้าง instance ของ axios
const api = axios.create({
  baseURL: "http://localhost:5000/api", // เปลี่ยนเป็น URL จริงตอน deploy
  headers: {
    "Content-Type": "application/json",
  },
});

// ฟังก์ชันดึงข้อมูล Wind Data
export const getWindData = async (filters = {}) => {
  try {
    const response = await api.get("/wind-data/WDWS", { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching wind data:", error);
    return [];
  }
};

export default api;