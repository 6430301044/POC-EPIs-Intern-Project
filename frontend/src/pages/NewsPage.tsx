import React, { useState, useEffect } from "react";
import { Container } from "@/components/template/Container"; // Component สำหรับ Layout
import { SectionTitle } from "@/components/template/SectionTitle"; // Title Section
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

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
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  return (
    <>
    {/* Breadcrumb Section */}
    <section className="relative w-full min-h-[760px] overflow-x-auto flex flex-col md:flex-row items-center justify-center px-4 md:px-[192px]"style={{
        backgroundImage: 'url("/images/PTT_Terminal.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
      >
        <div className="absolute inset-0 bg-[#0066a1]/53 z-0"></div>
        
        <div className="text-center text-white z-10">
          <div className="mb-4">
            <span className="text-4xl">{'📰'}</span>
            <h2 className="text-3xl font-semibold">{'News'}</h2>
          </div>
  
          <div className="text-lg mt-2 flex items-center space-x-2">
            <a
              href="/"
              className="text-white hover:text-blue-500 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <FontAwesomeIcon icon={faHome} className="mr-1" />
              หน้าหลัก
            </a>
            {pathnames.length > 0 && (
              <>
                <span className="text-white-500">/</span>
                {pathnames.map((name, index) => (
                  <React.Fragment key={index}>
                    {index !== pathnames.length - 1 ? (
                      <>
                        <span className="text-white">{name}</span>
                        <span className="text-gray-500">/</span>
                      </>
                    ) : (
                      <span className="text-white font-semibold">{name}</span>
                    )}
                  </React.Fragment>
                ))}
              </>
            )}
          </div>
        </div>
        {/* SVG Background Blue*/}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="absolute bottom-0 left-0 w-full z-20 pointer-events-none"
        >
          <path fill="#0099ff" fillOpacity="1" d="M0,700L1440,180L1440,320L0,320Z"></path>
        </svg>

        {/* SVG Background DarkBlue */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="absolute bottom-0 left-0 w-full z-20 pointer-events-none"
        >
          <path fill="#0066a1" fillOpacity="1" d="M0,500L1440,220L1440,320L0,320Z"></path>
        </svg>

        {/* SVG Background White */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="absolute bottom-0 left-0 w-full z-20 pointer-events-none"
        >
          <path fill="#ffffff" fillOpacity="1" d="M0,200L1440,320L1440,320L0,320Z"></path>
        </svg>
      </section>
      

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
  </>
  );
}
