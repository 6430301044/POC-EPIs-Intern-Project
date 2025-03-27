import { useState } from "react";

export default function SrirachaOil() {
  const images: string[] = [
  "/images/Sriracha_Image/DJI_0001.JPG",
  "/images/Sriracha_Image/DJI_0002.JPG",
  "/images/Sriracha_Image/DJI_0003.JPG",
  "/images/Sriracha_Image/DJI_0004.JPG",
  "/images/Sriracha_Image/DJI_0005.JPG",
  "/images/Sriracha_Image/DJI_0006.JPG",
  "/images/Sriracha_Image/DJI_0007.JPG",
  "/images/Sriracha_Image/DJI_0008.JPG",
];

const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
      <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-4 pt-40">
        <h1 className="text-2xl font-bold mb-10 text-black">คลังน้ำมันศรีราชา</h1>

        {/* ภาพใหญ่ */}
        <div className="w-full max-w-[740px] max-h-[520px] mb-2">
          <img
            src={images[currentImageIndex]}
            alt={`Slide ${currentImageIndex + 1}`}
            className="w-full h-full object-contain rounded-lg"
          />
        </div>

        {/* ภาพเล็ก (Thumbnails) */}
        <div className="w-full max-w-[740px] mt-10">
          <div className="flex space-x-2 overflow-x-auto">
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Thumbnail ${index + 1}`}
                className={`w-[115px] h-[80px] rounded-lg cursor-pointer transform transition-all duration-300 ${
                  index === currentImageIndex
                    ? "border-2 border-blue-500"
                    : "hover:scale-100 hover:border-2 hover:border-blue-500"
                }`}
                onClick={() => handleThumbnailClick(index)}
              />
            ))}
          </div>
        </div>
        

        {/* ข้อความใต้ภาพ */}
        <div className="text-left mt-6 max-w-[740px] w-full">
          <h3 className="text-lg font-semibold">คลังน้ำมันศรีราชา</h3>
          <p className="text-gray-600 text-lg leading-relaxed">
          คลังน้ำมันศรีราชา บริษัท ปตท. จำกัด (มหาชน) ตั้งอยู่บนพื้นที่ยุทธศาสตร์สำคัญ ณ ถนนสุขุมวิท ตำบลทุ่งสุขลา อำเภอศรีราชา จังหวัดชลบุรี ภายในเขตพัฒนาพิเศษภาคตะวันออก (EEC) 
          ซึ่งเป็นพื้นที่เศรษฐกิจสำคัญของประเทศไทย ทำหน้าที่เป็นศูนย์กลางในการจัดเก็บ สำรอง และกระจายน้ำมันเชื้อเพลิง 
          รองรับความต้องการพลังงานของภาคอุตสาหกรรม ภาคขนส่ง และธุรกิจต่างๆ ในพื้นที่ภาคตะวันออกและทั่วประเทศ 
            <br /><br />
            คลังน้ำมันศรีราชา ให้ความสำคัญสูงสุดในการบริหารจัดการด้านความปลอดภัย โดยมีมาตรการป้องกันอุบัติภัยที่เข้มงวด ออกแบบระบบและอุปกรณ์ตามมาตรฐานสากล 
            มีการติดตั้งระบบตรวจจับและดับเพลิงอัตโนมัติที่ทันสมัย เช่น ระบบฉีดโฟมดับเพลิง ระบบน้ำหล่อเย็นอัตโนมัติ และระบบตรวจสอบการรั่วไหลที่มีประสิทธิภาพสูง 
            พร้อมทั้งมีเจ้าหน้าที่ที่ผ่านการฝึกอบรมด้านความปลอดภัยเฉพาะทางอย่างสม่ำเสมอ รวมถึงมีการฝึกซ้อมแผนฉุกเฉินร่วมกับหน่วยงานภายนอกทุกปี 
            <br /><br />
            ในด้านสิ่งแวดล้อม คลังน้ำมันศรีราชามีการดำเนินการตามมาตรฐานที่เป็นมิตรต่อสิ่งแวดล้อมอย่างเคร่งครัด เช่น การควบคุมการปล่อยสารอินทรีย์ระเหยง่าย (VOCs) 
            การบำบัดน้ำเสีย การจัดการขยะด้วยหลักการ 3R (Reduce, Reuse, Recycle) และการใช้พลังงานหมุนเวียนเพื่อลดการปล่อยก๊าซเรือนกระจก 
            นอกจากนี้ยังมีการติดตามตรวจสอบผลกระทบทางสิ่งแวดล้อมเป็นประจำ พร้อมทั้งมีช่องทางสื่อสารที่เปิดกว้างเพื่อรับฟังข้อคิดเห็นจากชุมชนและประชาชนโดยรอบอย่างสม่ำเสมอ 
            <br /><br />
            คลังน้ำมันศรีราชามุ่งมั่นที่จะเป็นศูนย์กลางด้านพลังงานที่มีความมั่นคง ปลอดภัย และยั่งยืน เพื่อเสริมสร้างความมั่นคงด้านพลังงานให้แก่ประเทศ 
            พร้อมรับมือกับทุกสถานการณ์เพื่อความปลอดภัยและสุขภาพที่ดีของชุมชนโดยรอบ และเพื่อสิ่งแวดล้อมที่ดีในระยะยาว 
          </p>
        </div>
      </div>
  );
}
