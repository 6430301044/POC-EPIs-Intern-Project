import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { fetchNewsById, NewsItem } from '@/services/newsService';
import MainLayout from '@/layouts/MainLayout';

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getNewsDetail = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      try {
        const newsData = await fetchNewsById(parseInt(id));
        setNews(newsData);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลข่าวสารได้");
        console.error("Error fetching news details:", err);
      } finally {
        setLoading(false);
      }
    };

    getNewsDetail();
  }, [id]);

  return (
    <div className="bg-gradient-to-tr from-[#0a3d91] to-[#9d1b31] min-h-screen py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
            <Link to="/" className="text-blue-600 hover:underline">
              กลับไปยังหน้าหลัก
            </Link>
          </div>
        ) : !news ? (
          <div className="p-6 text-center">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <p>ไม่พบข้อมูลข่าวสาร</p>
            </div>
            <Link to="/" className="text-blue-600 hover:underline">
              กลับไปยังหน้าหลัก
            </Link>
          </div>
        ) : (
          <>
            {/* ส่วนหัวข่าว */}
            <div className="relative">
              {news.thumbnail && (
                <div className="w-full h-64 sm:h-80 overflow-hidden">
                  <img 
                    src={news.thumbnail} 
                    alt={news.News_title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                <div className="text-white">
                  <span className="bg-blue-600 text-xs font-semibold px-2 py-1 rounded-full">
                    {news.News_category}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold mt-2">{news.News_title}</h1>
                  <p className="text-sm opacity-75 mt-1">
                    {new Date(news.Create_at).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            {/* เนื้อหาข่าว */}
            <div className="p-6">
              <div className="prose max-w-none">
                {news.News_content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
              
              {/* รูปภาพเพิ่มเติม */}
              {news.images && news.images.length > 1 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">รูปภาพเพิ่มเติม</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {news.images.map((image, index) => (
                      <div key={index} className="rounded overflow-hidden">
                        <img 
                          src={image.image_url} 
                          alt={`${news.News_title} - รูปที่ ${index + 1}`} 
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* ปุ่มกลับ */}
              <div className="mt-8 border-t pt-4">
                <Link 
                  to="/" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  กลับไปยังหน้าหลัก
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}