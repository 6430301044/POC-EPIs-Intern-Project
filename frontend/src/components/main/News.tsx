import { Container } from "@/components/template/Container"; // Component สำหรับ Layout
import { SectionTitle } from "@/components/template/SectionTitle"; // Title Section
import { useState, useEffect } from "react";
import { fetchNews, NewsItem } from "@/services/newsService";
import { Link } from "react-router";

export default function NewsPage() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadNews();
  }, [selectedCategory]);

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const news = await fetchNews('desc', selectedCategory || undefined);
      setNewsList(news);
    } catch (err) {
      console.error("Error loading news:", err);
      setError("ไม่สามารถโหลดข้อมูลข่าวได้");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Container>
        <SectionTitle 
          title="ข่าวสารและกิจกรรม"
          preTitle="ข่าวล่าสุด"
          align="center" 
        />
        
        {/* ตัวกรองหมวดหมู่ */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => handleCategoryChange(null)}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              ทั้งหมด
            </button>
            <button
              type="button"
              onClick={() => handleCategoryChange('Activity')}
              className={`px-4 py-2 text-sm font-medium ${selectedCategory === 'Activity' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              กิจกรรม
            </button>
            <button
              type="button"
              onClick={() => handleCategoryChange('AnnualReport')}
              className={`px-4 py-2 text-sm font-medium ${selectedCategory === 'AnnualReport' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              รายงานประจำปี
            </button>
            <button
              type="button"
              onClick={() => handleCategoryChange('Publication')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${selectedCategory === 'Publication' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              ข้อมูลเผยแพร่
            </button>
          </div>
        </div>

        {/* แสดงสถานะการโหลด */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* แสดงข้อความเมื่อเกิดข้อผิดพลาด */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {/* แสดงข้อความเมื่อไม่มีข่าว */}
        {!loading && !error && newsList.length === 0 && (
          <div className="bg-gray-100 p-8 rounded text-center">
            <p className="text-gray-500 dark:text-gray-300">ไม่พบข่าวในหมวดหมู่ที่เลือก</p>
          </div>
        )}

        {/* แสดงรายการข่าว */}
        {!loading && !error && newsList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {newsList.map((news) => (
              <div key={news.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
                {news.thumbnail && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={news.thumbnail} 
                      alt={news.News_title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full mb-2">
                    {news.News_category}
                  </span>
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2 text-black">{news.News_title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{formatDate(news.Create_at)}</p>
                  <Link 
                    to={`/news/${news.id}`} 
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    อ่านเพิ่มเติม
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ปุ่มโหลดข่าวเพิ่มเติม */}
        {!loading && !error && newsList.length > 0 && (
          <div className="flex justify-center mt-4 mb-8">
            <button 
              onClick={loadNews}
              className="px-6 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors text-black"
            >
              รีเฟรชข่าว
            </button>
          </div>
        )}
      </Container>
    </>
  );
}
