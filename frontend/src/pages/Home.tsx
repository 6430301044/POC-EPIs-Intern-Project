import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const images = [
  "/images/DJI_0024.JPG",
  "/images/DJI_0052.JPG",
  "/images/DJI_0050.JPG",
  "/images/DJI_0049.JPG",
];

interface CardInfo {
  icon: string;
  title: string;
  value: string;
  unit: string;
}

const environmentInfo: Record<string, { title: string; cards: CardInfo[] }> = {
  sriracha: {
    title: "คลังน้ำมันศรีราชา",
    cards: [
      { icon: "/images/windy.png", title: "ลมภายในสถานประกอบการ", value: "294", unit: "หน่วย" },
      { icon: "/images/water-cycle.png", title: "คุณภาพน้ำทิ้ง", value: "231", unit: "หน่วย" },
      { icon: "/images/sound-waves.png", title: "เสียงภายในสถานประกอบการ", value: "10", unit: "หน่วย" },
    ],
  },
  khaoboya: {
    title: "คลังก๊าซเขาบ่อยา",
    cards: [
      { icon: "/images/windy.png", title: "ลมภายในสถานประกอบการ", value: "150", unit: "หน่วย" },
      { icon: "/images/water-cycle.png", title: "คุณภาพน้ำทิ้ง", value: "15", unit: "หน่วย" },
      { icon: "/images/sound-waves.png", title: "เสียงภายในสถานประกอบการ", value: "5", unit: "หน่วย" },
    ],
  },
  lamlamchabang: {
    title: "ชุมชนบ้านแหลมฉบัง",
    cards: [
      { icon: "/images/windy.png", title: "ลมภายในสถานประกอบการ", value: "100", unit: "หน่วย" },
      { icon: "/images/water-cycle.png", title: "คุณภาพน้ำทิ้ง", value: "10", unit: "หน่วย" },
      { icon: "/images/sound-waves.png", title: "เสียงภายในสถานประกอบการ", value: "3", unit: "หน่วย" },
    ],
  },
};

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
    content: "รายละเอียดกิจกรรมที่ 1 โดยย่อ..."
  },
  {
    id: 2,
    image: "https://via.placeholder.com/300",
    title: "กิจกรรมที่ 2",
    content: "รายละเอียดกิจกรรมที่ 2 โดยย่อ..."
  },
  {
    id: 3,
    image: "https://via.placeholder.com/300",
    title: "กิจกรรมที่ 3",
    content: "รายละเอียดกิจกรรมที่ 3 โดยย่อ..."
  },
  {
    id: 4,
    image: "https://via.placeholder.com/300",
    title: "กิจกรรมที่ 4",
    content: "รายละเอียดกิจกรรมที่ 4 โดยย่อ..."
  },
  {
    id: 5,
    image: "https://via.placeholder.com/300",
    title: "กิจกรรมที่ 5",
    content: "รายละเอียดกิจกรรมที่ 5 โดยย่อ..."
  },
  {
    id: 6,
    image: "https://via.placeholder.com/300",
    title: "กิจกรรมที่ 6",
    content: "รายละเอียดกิจกรรมที่ 6 โดยย่อ..."
  },
];



export default function HeroSection() {
  const [index, setIndex] = useState(0);
  // const [scrolling, setScrolling] = useState(false);
  const [selectedOption, setSelectedOption] = useState("sriracha");
  // const [showAll, setShowAll] = useState(false);
  // const displayedNews = showAll ? newsData : newsData.slice(0, 3);

  const [startIndex, setStartIndex] = useState(0);
  const [step, setStep] = useState(3)



  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 7500);

    const updateStep = () => {
      setStep(window.innerWidth < 640 ? 1 : 3); // ถ้าหน้าจอเล็กให้เลื่อนทีละ 1, ถ้าหน้าจอใหญ่ให้เลื่อนทีละ 3
    };
    // const handleScroll = () => {
    //   if (window.scrollY >= window.innerHeight) {
    //     setScrolling(true);
    //   } else {
    //     setScrolling(false);
    //   }
    // };

    // window.addEventListener("scroll", handleScroll);

    updateStep(); // อัปเดตค่า step เมื่อโหลดหน้าเว็บ
    window.addEventListener("resize", updateStep);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", updateStep);
    };
  }, []);
  // รีเซ็ต startIndex เมื่อ step เปลี่ยน เพื่อให้ตรงกับขนาดจอ
  useEffect(() => {
    setStartIndex((prevIndex) => Math.floor(prevIndex / step) * step);
  }, [step]);

  // เลื่อนข่าวไปทางซ้าย
  const handlePrev = () => {
    if (startIndex > 0) setStartIndex(startIndex - step);
  };

  // เลื่อนข่าวไปทางขวา
  const handleNext = () => {
    if (startIndex + step < newsData.length) setStartIndex(startIndex + step);
  };

  const visibleNews = newsData.slice(startIndex, startIndex + step);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
  };

  const { cards } = environmentInfo[selectedOption];
  
  const backgroundImages: Record<string, string> = {
    sriracha: "/images/DJI_0050.JPG",
    khaoboya: "/images/DJI_0024.JPG",
    lamlamchabang: "/images/LaemChaBang.png",
  };
  
  return (
    <div>
      {/* Hero Section */}
      <section className="relative w-full h-screen overflow-hidden">
        {/* Background Image */}
        <motion.div
          key={index}
          className="absolute inset-0 w-full h-screen bg-no-repeat bg-center bg-cover"
          style={{ backgroundImage: `url(${images[index]})` }}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: window.innerWidth > 640 ? 1.1 : 1 }} // ปรับ scale ตามขนาดจอ
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 7, ease: "easeInOut" }}
        />
      </section>

      {/* Section  */}
      <section className="relative w-full bg-[#1B5172] h-[42px]">
        {/* SVG แรกที่มีเงา */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute top-0 left-0 w-full h-auto z-20 drop-shadow-xl transform ">
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" style={{ stopColor: "#0066a1", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#0066a1", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path fill="#0099ff" fill-opacity="1" d="M0,96L1440,192L1440,0L0,0Z"></path>
        </svg>

        {/* SVG ที่สอง */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute left-0 w-full h-auto z-10 ">
          <defs>
            <linearGradient id="gradient2" x1="0%" y1="100%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#1B5172", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#1B5172", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path fill="#1B5172" fill-opacity="1" d="M0,192L1440,96L1440,0L0,0Z"></path>
        </svg>
      </section>
      {/* #2c9c3f */}
      
      {/* Section  PTT*/}
      <section id="about" className="relative w-full min-h-[710px] overflow-x-auto bg-gradient-to-tr from-[#0066a1] via-[#0066a1] to-[#0066a1] flex flex-col md:flex-row items-center justify-start px-4 md:px-[192px]  mt-[100px]">
        {/* PTT Group */}
        <div className="flex-shrink-0 justify-center items-center mt-[100px] min-w-[300px]">
          <ul className="text-left">
            <li className="text-[22px] font-bold text-white mb-[16px]">PTT Group</li>
          </ul>
          <ul className="text-left">
            {/* รู้จักกับสถานประกอบการของเรา */}
            <li className="text-[50px] font-bold text-white mb-[10px]">
              รู้จักกับสถาน<br />ประกอบการ<br />ของเรา
            </li>
          </ul>
        </div>
        

        {/* ส่วนที่สอง */}
        <div className="flex-shrink-0 justify-center items-center bg-gray-200 shadow-lg w-[460px] h-[385px] mt-4 md:mt-0 ml-4 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:cursor-pointer relative">
          <a href="/path-to-other-page">
            <img 
              src="/images/DJI_0138.JPG" 
              alt="คลังก๊าซเขาบ่อยา" 
              className="w-full h-full object-cover rounded-lg" 
            />
            <p className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent text-white text-xl font-bold p-3 text-start">
              คลังก๊าซเขาบ่อยา
            </p>
          </a>
        </div>

        <div className="flex-shrink-0 justify-center items-center bg-gray-300 shadow-lg w-[460px] h-[385px] mt-4 md:mt-0 ml-4 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:cursor-pointer relative">
          <a href="/path-to-other-page">
            <img 
              src="/images/DJI_0050.JPG" 
              alt="คลังน้ำมันศรีราชา" 
              className="w-full h-full object-cover rounded-lg" 
            />
            <p className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent text-white text-xl font-bold p-3 text-start">
              คลังน้ำมันศรีราชา
            </p>
          </a>
        </div>
      </section>

      <section className="relative w-full h-[760px] z-30 overflow-visible -mt-[100px]">
        {/* SVG สีส้มและสีแดง */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 700"
          className="relative top-0 left-0 drop-shadow-xl z-10"
        >
          <path fill="#F79421" fillOpacity="1" d="M0,32L1440,100L1440,370L0,300Z"></path>
          <path fill="#E30613" fillOpacity="1" d="M0,300 L1440,370 L1440,640 L0,580Z"></path>
        </svg>

        {/* Div สีเขียวที่เอียงและใส่รูป */}
        <div
            className="absolute top-0 left-0 w-full h-[840px] z-20 bg-cover bg-center flex items-center justify-center"
            style={{
              backgroundImage: `url('${backgroundImages[selectedOption]}')`, // เปลี่ยนตามตัวเลือกที่เลือก
              clipPath: 'polygon(0% 15%, 100% 5%, 100% 91%, 0% 100%)',
            }}
          >
          {/* Overlay สำหรับปรับความมืด + ใส่เนื้อหา */}
          <div className="relative w-full h-full bg-black/70 flex flex-col items-center justify-center px-4 py-8">
            {/* Dropdown Selection */}
            <div className="relative w-full flex justify-start px-10 mt-6 z-30">
              <div className="bg-black/50 px-4 py-2 rounded-lg">
                <select
                  className="text-[22px] font-bold text-white bg-transparent border-none outline-none"
                  value={selectedOption}
                  onChange={handleSelectChange}
                >
                  <option className="text-black" value="sriracha">คลังน้ำมันศรีราชา</option>
                  <option className="text-black" value="khaoboya">คลังก๊าซเขาบ่อยา</option>
                  <option className="text-black" value="lamlamchabang">ชุมชนบ้านแหลมฉบัง</option>
                </select>
                <p className="text-white text-sm mt-2">ข้อมูล ณ ไตรมาสที่ 1/2567</p>
              </div>
            </div>

            {/* Business Info Cards */}
            <div className="flex flex-wrap justify-center space-x-0 md:space-x-6 space-y-4 md:space-y-0 mt-8">
              {cards.map((card, index) => (
                <div key={index} className="bg-gray-800 bg-opacity-80 rounded-xl p-6 w-[280px] h-[180px] flex flex-col items-center">
                  <img src={card.icon} alt="icon" className="w-12 h-12 mb-4" />
                  <p className="text-md text-white">{card.title}</p>
                  <h2 className="text-3xl font-bold text-white">{card.value}</h2>
                  <p className="text-sm text-gray-300">{card.unit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


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
    </div>
  );
}
