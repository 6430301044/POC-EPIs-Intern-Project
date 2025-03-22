import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import DarkSwitch from "./DarkSwitch";
import { scrollToSection } from "@/utils/scrollHelper";

export default function Navbar() {
  const [isOpened, setIsOpened] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [language, setLanguage] = useState("ไทย");

  const location = useLocation();
  const { theme } = useTheme();
  

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleMobileMenuClick = () => {
    setIsOpened(!isOpened);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
  
      // ไม่ปิดเมนูถ้าคลิกที่ปุ่ม
      if (menuButtonRef.current?.contains(target)) {
        return;
      }
  
      // ถ้าคลิกนอกเมนูให้ปิด
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setIsOpened(false);
      }
    }
  
    function handleScroll() {
      setIsScrolled(window.scrollY > 50);
    }
  
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
  
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const navigation = [
    { name: "หน้าแรก", id: "" },
    { name: "เกี่ยวกับเรา", id: "/terminalInfo" },
    { name: "ข้อมูลสิ่งแวดล้อม", id: "/environment" },
    { name: "ข่าวสารและกิจกรรม", id: "/news"},
    { name: "ติดต่อเรา", id: "/contact"},
  ];

  return (
    <>
      {/* Navbar ด้านบน */}
      <div className="fixed top-0 left-0 w-full h-[50px] bg-gradient-to-r from-[#0066a1] via-[#0066a1] to-[#2c9c3f] z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-full text-white">
          {/* แสดง Logo ตรงกลางในมือถือ */}
          <Link to="/" className="lg:hidden mx-auto">
            <img
              src={theme === "light" ? "/images/pttdm.svg" : "/images/pttdm.svg"}
              alt="Company Logo"
              className="w-20"
            />
          </Link>

          {/* เมนูด้านซ้าย (ซ่อนไปในจอเล็ก) */}
          {/* <div className="hidden lg:flex space-x-4">
            <a href="#" className="hover:underline">ขนาดตัวอักษร</a>
            <a href="#" className="hover:underline">การแสดงผล</a>
          </div> */}

          {/* เมนูด้านขวา (ซ่อนไปในจอเล็ก) */}
          <div className="hidden lg:flex items-center space-x-4 justify-end w-full">
            {/* <a href="#" className="hover:underline">ศูนย์ข้อมูลข่าวสาร</a>
            <a href="#" className="hover:underline">1365 Contact Center</a> */}

            {/* ปุ่มเปลี่ยนภาษา */}
            {/* <button
              onClick={() => setLanguage(language === "ไทย" ? "En" : "ไทย")}
              className="hover:underline"
            >
              {language}
            </button> */}

            <a href="/login" className="hover:underline">
              สำหรับเจ้าหน้าที่
            </a>

          </div>

          {/* Dark Mode Toggle (แสดงในทั้งมือถือและเดสก์ท็อป) */}
          <div className="lg:hidden flex items-center gap-3 lg:order-2">
            <DarkSwitch />
          </div>

          {/* Mobile Menu Button (แสดงในมือถือเท่านั้น) */}
          <button
            ref={menuButtonRef}
            onClick={handleMobileMenuClick}
            className="lg:hidden px-2 py-1 text-gray-500 dark:text-gray-400 rounded-md hover:text-indigo-500 dark:hover:text-indigo-400 focus:text-indigo-500 focus:bg-indigo-100 dark:focus:bg-gray-800 focus:outline-none"
          >
            <svg className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              {isOpened ? (
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                />
              ) : (
                <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Navbar หลัก (แสดงในจอใหญ่) */}
      <div className="hidden lg:block fixed top-[50px] w-full z-40 bg-[rgba(0,0,0,0.5)] text-white shadow-sm border-b-[0.5px] border-white">
        <div className="container px-8 py-4 mx-auto xl:px-0">
          <nav className="relative flex flex-wrap items-center justify-between mx-auto lg:justify-between max-w-screen-xl">
            {/* Logo (ไม่แสดงในมือถือ) */}
            <Link to="/">
              <img
                src={theme === "light" ? "/images/pttdm.svg" : "/images/pttdm.svg"}
                alt="Company Logo"
                className="w-20"
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden text-center lg:flex lg:items-center">
              <ul className="flex space-x-6">
                {navigation.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.id}
                      className={`relative block px-4 py-2 text-lg font-normal rounded-md cursor-pointer 
                                  hover:text-[#00AEEF] transition-all ease-in-out 
                                  before:transition-[width] before:ease-in-out before:duration-700 
                                  before:absolute before:h-[3px] before:w-0 before:bottom-0 before:left-0 
                                  before:bg-[linear-gradient(to_right,#06b6d4,#3b82f6)] hover:before:w-full
                                  ${
                                    location.pathname === item.id ? "text-[#00AEEF] before:w-full" : "text-white"
                                  }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isOpened && (
        <div ref={mobileMenuRef} className="flex flex-wrap w-full my-5 lg:hidden">
          {/* Other navigation items */}
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                scrollToSection(item.id);
                setIsOpened(false);
              }}
              className={`w-full px-4 py-2 text-lg font-normal text-left hover:text-indigo-500 dark:text-gray-300 dark:hover:text-indigo-400
                        ${
                          location.pathname === item.id
                            ? "text-indigo-600 dark:text-indigo-400"
                            : ""
                        }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </>

  );
}