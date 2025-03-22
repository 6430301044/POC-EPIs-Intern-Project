import { useState } from "react";

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
  
export default function ThirdSection() {
    const [selectedOption, setSelectedOption] = useState("sriracha");
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
    <>
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
    </>
  )
}
