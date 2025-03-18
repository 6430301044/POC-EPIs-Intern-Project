import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { fetchNews, NewsItem } from "@/services/newsService";
import { Link } from "react-router";

interface NewsItem {
  id: number;
  title: string;
  image: string;
  content: string;
}

export default function FourSection() {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [step, setStep] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch news data from API
  useEffect(() => {
    const getNewsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchNews();
        setNewsData(data);
        setFilteredNews(data);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลข่าวสารได้");
        console.error("Error fetching news:", err);
      } finally {
        setLoading(false);
      }
    };

    getNewsData();
  }, []);
  
  // Filter news when category changes
  useEffect(() => {
    if (selectedCategory) {
      const filtered = newsData.filter(news => news.News_category === selectedCategory);
      setFilteredNews(filtered);
      setStartIndex(0); // Reset pagination when category changes
    } else {
      setFilteredNews(newsData);
    }
  }, [selectedCategory, newsData]);

  useEffect(() => {
    const updateStep = () => {
      setStep(window.innerWidth < 640 ? 1 : 3); // ถ้าหน้าจอเล็กให้เลื่อนทีละ 1, ถ้าหน้าจอใหญ่ให้เลื่อนทีละ 3
    };
    updateStep(); // อัปเดตค่า step เมื่อโหลดหน้าเว็บ
    window.addEventListener("resize", updateStep);
    return () => {
      window.removeEventListener("resize", updateStep);
    };
  }, []);

  // เลื่อนข่าวไปทางซ้าย
  const handlePrev = () => {
    if (startIndex > 0) setStartIndex(startIndex - step);
  };

  // เลื่อนข่าวไปทางขวา
  const handleNext = () => {
    if (startIndex + step < filteredNews.length) setStartIndex(startIndex + step);
  };
  
  // ฟังก์ชันจัดการการคลิกที่หมวดหมู่
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const visibleNews = filteredNews.slice(startIndex, startIndex + step);

  return (
    <>
      {/*  News */}
      <section className="relative w-full h-screen flex items-center bg-gradient-to-tr from-[#0a3d91] to-[#9d1b31] justify-center ">
        <div className="flex flex-col sm:flex-row max-w-6xl mx-auto p-4">
          {/* เมนูนำทาง */}
          <div className="w-full sm:w-1/3 bg-blue-900 text-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">สื่อประชาสัมพันธ์</h2>
            <ul className="space-y-2">
              <li 
                className={`cursor-pointer ${selectedCategory === 'Activity' ? 'text-yellow-300' : 'hover:text-yellow-300'}`}
                onClick={() => handleCategoryClick('Activity')}
              >
                Highlight / กิจกรรม
              </li>
              <li 
                className={`cursor-pointer ${selectedCategory === 'AnnualReport' ? 'text-yellow-300' : 'hover:text-yellow-300'}`}
                onClick={() => handleCategoryClick('AnnualReport')}
              >
                รายงานประจำปี
              </li>
              <li 
                className={`cursor-pointer ${selectedCategory === 'Publication' ? 'text-yellow-300' : 'hover:text-yellow-300'}`}
                onClick={() => handleCategoryClick('Publication')}
              >
                ข้อมูลเผยแพร่
              </li>
            </ul>
          </div>
          
          {/* section ข่าวสาร */}
          <div className="w-full sm:w-2/3 sm:pl-6 relative mt-4 sm:mt-0">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{error}</p>
              </div>
            ) : newsData.length === 0 ? (
              <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded">
                <p>ไม่พบข้อมูลข่าวสาร</p>
              </div>
            ) : (
              <>
                {/* แสดงข่าวแค่ 1 ข่าวในมือถือ */}
                <div className="grid grid-cols-1 sm:hidden gap-4">
                  {visibleNews.map((news) => (
                    <Link key={news.id} to={`/news/${news.id}`} className="border rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-2xl transition-shadow duration-300">
                      <img src={news.thumbnail || "https://via.placeholder.com/300"} alt={news.News_title} className="w-full h-40 object-cover" />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold">{news.News_title}</h3>
                        <p className="text-gray-600 text-sm">{news.News_content.substring(0, 100)}...</p>
                        <p className="text-xs text-gray-500 mt-2">{new Date(news.Create_at).toLocaleDateString('th-TH')}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* แสดงข่าว 3 ข่าวในหน้าจอใหญ่ */}
                <div className="hidden sm:grid sm:grid-cols-3 gap-4">
                  {visibleNews.map((news) => (
                    <Link key={news.id} to={`/news/${news.id}`} className="border rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-2xl transition-shadow duration-300">
                      <img src={news.thumbnail || "https://via.placeholder.com/300"} alt={news.News_title} className="w-full h-40 object-cover" />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold">{news.News_title}</h3>
                        <p className="text-gray-600 text-sm">{news.News_content.substring(0, 100)}...</p>
                        <p className="text-xs text-gray-500 mt-2">{new Date(news.Create_at).toLocaleDateString('th-TH')}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* ปุ่มเลื่อนซ้าย-ขวา */}
                {filteredNews.length > step && (
                  <>
                    <button
                      onClick={handlePrev}
                      disabled={startIndex === 0}
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700 disabled:opacity-50"
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={startIndex + step >= filteredNews.length}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700 disabled:opacity-50"
                    >
                      <FaChevronRight />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
