import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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
    title: "กิจกรรมที่ 4",
    content: "รายละเอียดกิจกรรมที่ 5 โดยย่อ..."
  },
  {
    id: 6,
    image: "https://via.placeholder.com/300",
    title: "กิจกรรมที่ 4",
    content: "รายละเอียดกิจกรรมที่ 6 โดยย่อ..."
  },
];


export default function HeroSection() {
  const [index, setIndex] = useState(0);
  // const [scrolling, setScrolling] = useState(false);
  const [selectedOption, setSelectedOption] = useState("sriracha");
  const [showAll, setShowAll] = useState(false);
  const displayedNews = showAll ? newsData : newsData.slice(0, 3);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 7500);

    // const handleScroll = () => {
    //   if (window.scrollY >= window.innerHeight) {
    //     setScrolling(true);
    //   } else {
    //     setScrolling(false);
    //   }
    // };

    // window.addEventListener("scroll", handleScroll);

    return () => {
      clearInterval(interval);
      // window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
  };

  const { title, cards } = environmentInfo[selectedOption];
  

  return (
    <div>
      {/* Hero Section */}
      <section className="relative w-full h-screen overflow-hidden">
        {/* Background Image */}
        <motion.div
          key={index}
          className="absolute inset-0 bg-no-repeat bg-center bg-cover"
          style={{ backgroundImage: `url(${images[index]})` }}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1.1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 7, ease: "easeInOut" }}
        />
      </section>

      <section className="relative w-full min-h-[874px] overflow-x-auto bg-white flex flex-col md:flex-row items-center justify-start px-4 md:px-[192px]">
        {/* PTT Group */}
        <div className="flex-shrink-0 justify-center items-center mt-[100px] min-w-[300px]">
          <ul className="text-left">
            <li className="text-[22px] font-bold text-black mb-[16px]">PTT Group</li>
          </ul>
          <ul className="text-left">
            {/* รู้จักกับสถานประกอบการของเรา */}
            <li className="text-[50px] font-bold text-black mb-[10px]">
              รู้จักกับสถาน<br />ประกอบการ<br />ของเรา
            </li>
          </ul>
        </div>

        {/* ส่วนที่สอง */}
        <div className="flex-shrink-0 justify-center items-center bg-gray-200 p-10 rounded-lg shadow-lg min-w-[285px] max-w-[460px] min-h-[260px] max-h-[385px] mt-4 md:mt-0 ml-4 overflow-x-auto">
          <p className="text-lg text-gray-700">คลังก๊าซเขาบ่อยา</p>
        </div>

        <div className="flex-shrink-0 justify-center items-center bg-gray-300 p-10 rounded-lg shadow-lg min-w-[285px] max-w-[460px] min-h-[260px] max-h-[385px] mt-4 md:mt-0 ml-4 overflow-x-auto">
          <p className="text-lg text-gray-700">คลังน้ำมันศรีราชา</p>
        </div>
      </section>





      {/* Dropdown และ Cards */}
      <section className="relative w-full h-auto bg-black bg-cover bg-center" 
        style={{ backgroundImage: "url('/images/DJI_0050.JPG')" }}>
        
        {/* Overlay */}
        <div className="relative w-full h-full bg-black/70 flex flex-col items-center justify-center px-4 py-8">
          
         <h1 className="text-3xl font-bold text-white text-center mt-6">{title}</h1>

          {/* Dropdown Selection */}
          <div className="absolute left-10 top-10">
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
      </section>

      <section>
        <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">ข้อมูลข่าวสารและกิจกรรม</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayedNews.map((news) => (
            <div key={news.id} className="border rounded-lg overflow-hidden shadow-lg">
              <img src={news.image} alt={news.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{news.title}</h3>
                <p className="text-gray-600 text-sm">{news.content}</p>
              </div>
            </div>
          ))}
        </div>
        {newsData.length > 3 && (
          <div className="text-center mt-4">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {showAll ? "แสดงน้อยลง" : "แสดงเพิ่มเติม"}
            </button>
          </div>
          )}
        </div>
      </section>
    </div>
  );
}
