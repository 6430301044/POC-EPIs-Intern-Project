import React, { useState, useEffect } from "react";
import { Container } from "@/components/template/Container"; // Component สำหรับ Layout
import { SectionTitle } from "@/components/template/SectionTitle"; // Title Section

interface News {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

export default function NewsPage() {
  const [newsList, setNewsList] = useState<News[]>([]); // กำหนด state เป็น array ของ News
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchNews(); // ดึงข้อมูลข่าวสารเมื่อ component โหลด
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/news"); // URL ของ API ที่ใช้ดึงข้อมูลข่าวสาร
      const data = await response.json();

      // ตรวจสอบว่า data เป็นอาเรย์
      if (Array.isArray(data)) {
        setNewsList(data); // กำหนดค่า state สำหรับข่าวสาร
      } else {
        console.error("❌ Data is not an array:", data);
        setNewsList([]); // กำหนดค่าให้เป็นอาเรย์ว่างถ้าข้อมูลไม่ถูกต้อง
      }
    } catch (error) {
      console.error("❌ Failed to fetch news:", error);
      setNewsList([]); // กำหนดค่าให้เป็นอาเรย์ว่างเมื่อเกิดข้อผิดพลาด
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <SectionTitle title="Latest News" align="center" />
      <div className="p-8">
        {/* ปุ่มรีเฟรชข้อมูล */}
        <button
          onClick={fetchNews}
          className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh News"}
        </button>

        {/* แสดงข่าวสาร */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : newsList.length === 0 ? (
          <div className="bg-gray-100 p-8 rounded text-center">
            <p className="text-gray-500">No news found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsList.map((news) => (
              <div key={news.id} className="border rounded-lg shadow-lg overflow-hidden">
                <img src={news.imageUrl} alt={news.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-xl font-semibold">{news.title}</h3>
                  <p className="text-sm text-gray-600">{new Date(news.createdAt).toLocaleDateString()}</p>
                  <p className="mt-2 text-gray-800">{news.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
