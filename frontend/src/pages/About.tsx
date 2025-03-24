import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router";
import { XCircleIcon } from "@heroicons/react/solid";

export default function About() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(Boolean);

    const [showImage, setShowImage] = useState(false);

   return (
      <>
        <div className="bg-white min-h-screen">
          {/* Breadcrumb Section with Background */}
           <section
        className="relative w-full min-h-[670px] overflow-x-auto flex flex-col md:flex-row items-center justify-center px-4 md:px-[192px]"
        style={{
          backgroundImage: 'url("/images/PTT_Terminal.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-[#0066a1]/53 z-0"></div>

        <div className="text-center text-white z-10">
          <div className="mb-4">
            <span className="text-4xl">{"🏡"}</span>
            <h2 className="text-3xl font-semibold">{"เกี่ยวกับเรา"}</h2>
          </div>

          <div className="text-lg mt-2 flex items-center justify-center space-x-2 relative z-30">
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
                  <span key={index} className={index !== pathnames.length - 1 ? "text-white" : "text-white font-semibold"}>
                    {name}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>

        {/* SVG Background Blue */}
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
      </section>

        {/* First Section */}
        <section className="relative w-full -mt-[200px] h-[730px] z-20 pointer-events-none">
            <div
                className="absolute bottom-0 left-0 w-full h-full bg-cover bg-center"
                style={{
                backgroundImage: "url('/images/Khaoboya_map.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                clipPath: "polygon(0% 5%, 100% 27%, 100% 100%, 0% 100%)",
                }}
            ></div>
          <div className="absolute bottom-0 sm:bottom-0 md:bottom-10 left-0 md:left-10 lg:left-80 flex items-center justify-center w-full md:w-96 h-full z-30 pointer-events-auto">
            <div className="bg-white shadow-lg rounded-2xl p-6 w-full relative">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <img
                        src="/images/LPG_Terminal_icon.png"
                        alt="สถานประกอบการ"
                        className="w-8 h-8 mr-3"
                    />
                    คลังก๊าซเขาบ่อยา
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                    50 หมู่ 3 Thung Sukhla, Si Racha District, Chon Buri 20230
                </p>
                <p className="text-sm text-gray-600 mt-1">โทรศัพท์ : 0-3849-3720</p>
                <p className="text-sm text-gray-600 mt-1">โทรสาร : 0-3849-3721</p>

                <div className="mt-4 flex justify-between">
                    {/* ปุ่มเส้นทาง */}
                    <button
                        onClick={() => setShowImage(true)}
                        className="bg-green-500 text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                        เส้นทาง
                    </button>

                    {/* ปุ่มเปิดแผนที่ */}
                    <a
                        href="https://maps.app.goo.gl/6cUA7Vbtwots3Jnn7"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500 text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                        เปิดแผนที่
                    </a>
                </div>
            </div>

            {/* Popup แสดงรูปเส้นทาง */}
            {showImage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="relative bg-white p-4 rounded-lg shadow-lg">
                        {/* ปุ่มปิด */}
                        <button
                            onClick={() => setShowImage(false)}
                            className="absolute top-2 right-2 text-red-500 hover:rotate-90 transition-transform duration-300"
                        >
                            <XCircleIcon className="w-8 h-8" />
                        </button>
                        
                        {/* รูปภาพเส้นทาง */}
                        <img
                            src="/images/map_route.png"
                            alt="เส้นทาง"
                            className="max-w-full h-auto rounded-lg"
                        />
                    </div>
                </div>
            )}
        </div>
        </section>


        {/* Second Section */}
          <section 
            className="relative w-full min-h-[650px] overflow-x-auto flex items-center justify-center px-4 md:px-[192px]"
            style={{
                backgroundImage: 'url("/images/DJI_0024.JPG")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
            }}
            >   
                <div className="absolute inset-y-0 left-1/2 w-1/2 bg-[#000000]/50 z-0"></div>

                <div className="absolute top-[30%] flex flex-col items-center justify-center gap-4">
                    <p className="text-white text-lg md:text-2xl font-bold">Your Text Here</p>
                    <p className="text-white text-lg md:text-2xl font-bold">Additional Text</p>
                </div>

                <div className="absolute top-[50%] flex flex-col items-center gap-4 mt-4">
                    <p className="text-white text-lg md:text-2xl font-bold">Another Text</p>
                    <p className="text-white text-lg md:text-2xl font-bold">More Content Here</p>
                </div>
            </section>
            
            {/* Third Section */}
            <section 
                className="relative w-full min-h-[650px] overflow-x-auto flex items-center justify-center px-4 md:px-[192px]"
                style={{
                    backgroundImage: 'url("/images/SrirachaTerminal_map.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
                >
                <div className="absolute bottom-0 sm:bottom-0 md:bottom-10 right-0 md:right-10 lg:right-80 flex items-center justify-center w-full md:w-96 h-full z-30 pointer-events-auto">
                    <div className="bg-white shadow-lg rounded-2xl p-6 w-full">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <img
                            src="/images/Oil_Terminal_icon.png" 
                            alt="สถานประกอบการ"
                            className="w-8 h-8 mr-3"
                        />
                        คลังน้ำมันศรีราชา
                        </h2>
                        <p className="text-sm text-gray-600 mt-2">
                        123 หมู่2 ถนน สุขุมวิท Thung Sukhla, Si Racha District, Chon Buri 20230
                        </p>
                        <p className="text-sm text-gray-600 mt-1">โทรศัพท์ : 0-3835-4226</p>
                        <p className="text-sm text-gray-600 mt-1">โทรสาร : 0-3824-1047</p>
                        <a
                        href="https://maps.app.goo.gl/nEfR9ztM5sQ1vqi27"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block bg-blue-500 text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-blue-600"
                        >
                        เปิดแผนที่
                        </a>
                    </div>
                </div>
            </section>

            {/* Four Section */}
            <section 
            className="relative w-full min-h-[650px] overflow-x-auto flex items-center justify-center px-4 md:px-[192px]"
            style={{
                backgroundImage: 'url("/images/DJI_0050.JPG")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
            }}
            >
                <div className="absolute inset-0 w-1/2 bg-[#000000]/50 z-0"></div>

                <div className="absolute top-[30%] flex flex-col items-center justify-center gap-4">
                    <p className="text-white text-lg md:text-2xl font-bold">Your Text Here</p>
                    <p className="text-white text-lg md:text-2xl font-bold">Additional Text</p>
                </div>

                <div className="absolute top-[50%] flex flex-col items-center gap-4 mt-4">
                    <p className="text-white text-lg md:text-2xl font-bold">Another Text</p>
                    <p className="text-white text-lg md:text-2xl font-bold">More Content Here</p>
                </div>
            </section>

        </div>
      </>
    );
  }
