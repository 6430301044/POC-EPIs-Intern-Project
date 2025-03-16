import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface NewsItem {
  id: number;
  title: string;
  image: string;
  content: string;
}

const newsData: NewsItem[] = [
  {
    id: 1,
    image: "https://via.placeholder.com/300",
    title: "กิจกรรมที่ 1",
    content: "รายละเอียดกิจกรรมที่ 1 โดยย่อ...",
  },
  {
    id: 2,
    image: "https://via.placeholder.com/300",
    title: "กิจกรรมที่ 2",
    content: "รายละเอียดกิจกรรมที่ 2 โดยย่อ...",
  },
  {
    id: 3,
    image: "https://via.placeholder.com/300",
    title: "กิจกรรมที่ 3",
    content: "รายละเอียดกิจกรรมที่ 3 โดยย่อ...",
  },
  {
    id: 4,
    image: "https://via.placeholder.com/300",
    title: "กิจกรรมที่ 4",
    content: "รายละเอียดกิจกรรมที่ 4 โดยย่อ...",
  },
  {
    id: 5,
    image: "https://via.placeholder.com/300",
    title: "กิจกรรมที่ 4",
    content: "รายละเอียดกิจกรรมที่ 5 โดยย่อ...",
  },
  {
    id: 6,
    image: "https://via.placeholder.com/300",
    title: "กิจกรรมที่ 4",
    content: "รายละเอียดกิจกรรมที่ 6 โดยย่อ...",
  },
];

export default function FourSection() {
  const [startIndex, setStartIndex] = useState(0);
  const [step, setStep] = useState(3)

  useEffect(() => {
    const interval = setInterval(() => {});

    const updateStep = () => {
      setStep(window.innerWidth < 640 ? 1 : 3); // ถ้าหน้าจอเล็กให้เลื่อนทีละ 1, ถ้าหน้าจอใหญ่ให้เลื่อนทีละ 3
    };
    updateStep(); // อัปเดตค่า step เมื่อโหลดหน้าเว็บ
    window.addEventListener("resize", updateStep);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", updateStep);
    };
  }, []);

  // เลื่อนข่าวไปทางซ้าย
  const handlePrev = () => {
    if (startIndex > 0) setStartIndex(startIndex - step);
  };

  // เลื่อนข่าวไปทางขวา
  const handleNext = () => {
    if (startIndex + step < newsData.length) setStartIndex(startIndex + step);
  };

  const visibleNews = newsData.slice(startIndex, startIndex + step);

  return (
    <>
      {/*  News */}
      <section className="relative w-full h-screen flex items-center bg-gradient-to-tr from-[#0a3d91] to-[#9d1b31] justify-center ">
        <div className="flex flex-col sm:flex-row max-w-6xl mx-auto p-4">
          {/* เมนูนำทาง */}
          <div className="w-full sm:w-1/3 bg-blue-900 text-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">สื่อประชาสัมพันธ์</h2>
            <ul className="space-y-2">
              <li className="hover:text-yellow-300">Highlight / กิจกรรม</li>
              <li className="hover:text-yellow-300">รายงานประจำปี</li>
              <li className="hover:text-yellow-300">ข้อมูลเผยแพร่</li>
              <li className="hover:text-yellow-300">เยี่ยมชม ปตท.</li>
            </ul>
          </div>
          
          {/* section ข่าวสาร */}
          <div className="w-full sm:w-2/3 sm:pl-6 relative mt-4 sm:mt-0">
            {/* แสดงข่าวแค่ 1 ข่าวในมือถือ */}
            <div className="grid grid-cols-1 sm:hidden gap-4">
              {visibleNews.map((news) => (
                <div key={news.id} className="border rounded-lg overflow-hidden shadow-lg">
                  <img src={news.image} alt={news.title} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{news.title}</h3>
                    <p className="text-gray-600 text-sm">{news.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* แสดงข่าว 3 ข่าวในหน้าจอใหญ่ */}
            <div className="hidden sm:grid sm:grid-cols-3 gap-4">
              {visibleNews.map((news) => (
                <div key={news.id} className="border rounded-lg overflow-hidden shadow-lg">
                  <img src={news.image} alt={news.title} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{news.title}</h3>
                    <p className="text-gray-600 text-sm">{news.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ปุ่มเลื่อนซ้าย-ขวา */}
            {newsData.length > step && (
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
                  disabled={startIndex + step >= newsData.length}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700 disabled:opacity-50"
                >
                  <FaChevronRight />
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
