import React, { useState } from "react";
import emailjs from "emailjs-com";
import { Container } from "../template/Container";
import { SectionTitle } from "../template/SectionTitle";
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

export default function Contact() {
    const [formData, setFormData] = useState({
      email: "",
      name: "",
      subject: "",
      message: "",
    });
  
    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    };
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
  
      const serviceID = "service_8jypqcc";
      const templateID = "template_v22zivj";
      const userID = "QOSPe4TDJ7ehriNw5";
  
      emailjs
        .send(serviceID, templateID, formData, userID)
        .then((response) => {
          console.log("SUCCESS!", response.status, response.text);
          alert("Form submitted!");
        })
        .catch((err) => {
          console.error("FAILED...", err);
          alert("Form submission failed!");
        });
    };

    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(Boolean);
  
    return (
      <div className="bg-white min-h-screen">
    {/* Breadcrumb Section */}
      <section className="relative w-full min-h-[460px] overflow-x-auto flex flex-col md:flex-row items-center justify-center px-4 md:px-[192px]" style={{
        backgroundImage: 'url("/images/PTT_Terminal.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
      >
        <div className="absolute inset-0 bg-[#0066a1]/53 z-0"></div>
        
        <div className="text-center text-white z-10">
          <div className="mb-4">
            <span className="text-4xl">{'📧'}</span>
            <h2 className="text-3xl font-semibold">{'ติดต่อเรา'}</h2>
          </div>
  
          <div className="text-lg mt-2 flex items-center space-x-2">
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
      
      
      <Container>
        <div
          className="flex w-full justify-center items-center h-full py-16 "
          id="contact"
        >
          <div className="flex flex-col justify-center items-center w-150 h-auto bg-amber-300 p-8 rounded">
            <form className="w-full max-w-lg" onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="email"
                >
                  อีเมล์
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="name"
                >
                  ชื่อ
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="subject"
                >
                  หัวข้อ
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="message"
                >
                  เนื้อหา
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  ส่ง
                </button>
              </div>
            </form>
          </div>
        </div>
      </Container>
      </div>

    );
  }
  