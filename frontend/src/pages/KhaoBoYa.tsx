import { useState } from "react";

export default function SrirachaOil() {
  const images: string[] = [
  "/images/Khaoboya_Image/DJI_0001.JPG",
  "/images/Khaoboya_Image/DJI_0002.JPG",
  "/images/Khaoboya_Image/DJI_0003.JPG",
  "/images/Khaoboya_Image/DJI_0004.JPG",
  "/images/Khaoboya_Image/DJI_0005.JPG",
  "/images/Khaoboya_Image/DJI_0006.JPG",
  "/images/Khaoboya_Image/DJI_0007.JPG",
  "/images/Khaoboya_Image/DJI_0008.JPG",
  "/images/Khaoboya_Image/DJI_0009.JPG",
  "/images/Khaoboya_Image/DJI_0010.JPG",
  "/images/Khaoboya_Image/DJI_0011.JPG",
];

const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
      <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-4 pt-40">
        <h1 className="text-2xl font-bold mb-10">คลังก๊าซเขาบ่อยา</h1>

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
          <h3 className="text-lg font-semibold">คลังก๊าซเขาบ่อยา</h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            คลังก๊าซเขาบ่อยา บริษัท ปตท. จำกัด (มหาชน) ตั้งอยู่ที่ตำบลทุ่งสุขลา
            อำเภอศรีราชา จังหวัดชลบุรี เป็นหนึ่งในศูนย์กลางจัดเก็บและกระจายการจัดส่งก๊าซปิโตรเลียมเหลว
            (LPG) ที่สำคัญที่สุดของประเทศ โดยมีบทบาทสำคัญในการสนับสนุนความมั่นคงด้านพลังงานและขับเคลื่อน
            เศรษฐกิจของพื้นที่เขตเศรษฐกิจพิเศษภาคตะวันออก (Eastern Economic Corridor - EEC)
            <br /><br />
            คลังก๊าซเขาบ่อยามีลักษณะทางกายภาพที่โดดเด่น คือ มีถังเก็บก๊าซปิโตรเลียมเหลว
            ขนาดใหญ่ รูปแบบทรงกลมและทรงกระบอก ติดตั้งระบบท่อส่งก๊าซที่ทันสมัยและปลอดภัยสูงสุด
            พร้อมทั้งมีโครงสร้างพื้นฐานครบวงจร รองรับการขนส่งที่เป็นไปตามมาตรฐานความปลอดภัย ทั้งทางเรือ
            ทางท่อ และ ทางบอก ทำให้สามารถกระจายการจัดส่งก๊าซปิโตรเลียมเหลวได้อย่างมีประสิทธิภาพ
            <br /><br />
            ด้านความปลอดภัยและสิ่งแวดล้อม คลังก๊าซเขาบ่อยาดำเนินงานภายใต้ระบบบริหารจัดการสิ่งแวดล้อมตามมาตรฐานสากล
            มีการบริหารจัดการน้ำเสียและของเสียอย่างเคร่งครัด ใช้เทคโนโลยีควบคุมมลพิษทางอากาศและเสียง
            มีการสร้างพื้นที่สีเขียวและแนวกันชนโดยรอบพื้นที่ รวมถึงมีแผนฉุกเฉินเพื่อรับมือเหตุการณ์ไม่คาดฝัน
            อย่างครบถ้วน อีกทั้งมีการฝึกซ้อมแผนเผชิญเหตุฉุกเฉินร่วมกับหน่วยงานที่เกี่ยวข้องเป็นประจำทุกปี
            <br /><br />
            นอกจากนี้ ยังมีการสื่อสารและมีส่วนร่วมกับชุมชนอย่างต่อเนื่อง
            ส่งเสริมกิจกรรมทางสังคมและสิ่งแวดล้อมร่วมกับชุมชนท้องถิ่น เพื่อให้เกิดการพัฒนา
            และสามารถอยู่ร่วมกับชุมชนได้อย่างมั่นคงและยั่งยืน
          </p>
        </div>
      </div>
  );
}
