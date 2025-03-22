import Visualization from "@/components/main/Visualization";
import Table from "@/components/main/TableNC";
import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation } from "react-router";

export default function Data() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb Section with Background */}
      <section className="relative w-full min-h-[760px] overflow-x-auto flex flex-col md:flex-row items-center justify-center px-4 md:px-[192px]" style={{
        backgroundImage: 'url("/images/PTT_Terminal_2.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
        <div className="absolute inset-0 bg-[#0066a1]/53 z-0"></div>
        
        <div className="text-center text-white z-10">
          <div className="mb-4">
            <span className="text-4xl">{'📊'}</span>
            <h2 className="text-3xl font-semibold">{'ข้อมูลสิ่งแวดล้อม'}</h2>
          </div>
  
          <div className="text-lg mt-2 flex items-center space-x-2 relative z-30">
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
                <React.Fragment key={index}>
                  {index !== pathnames.length - 1 ? (
                    <>
                      <span className="text-white">{name}</span>
                      <span className="text-gray-500">/</span>
                    </>
                  ) : (
                    <span className="text-white font-semibold">{name}</span>
                  )}
                </React.Fragment>
              ))}
            </>
          )}
        </div>
      </div>
        
        {/* SVG Background Blue*/}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="absolute bottom-0 left-0 w-full z-20"
        >
          <path fill="#0099ff" fillOpacity="1" d="M0,700L1440,180L1440,320L0,320Z"></path>
        </svg>
        
        {/* SVG Background DarkBlue*/}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="absolute bottom-0 left-0 w-full z-20"
        >
          <path fill="#0066a1" fillOpacity="1" d="M0,500L1440,220L1440,320L0,320Z"></path>
        </svg>

        {/* SVG Background White*/}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="absolute bottom-0 left-0 w-full z-20"
        >
          <path fill="#ffffff" fillOpacity="1" d="M0,200L1440,320L1440,320L0,320Z"></path>
        </svg>
      </section>
      
      <div id="visualization" className="py-25">
        <Visualization />
      </div>
      <div id="table">
        <Table />
      </div>
    </div>
  );
}
