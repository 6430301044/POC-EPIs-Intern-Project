import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import DarkSwitch from "./DarkSwitch";
import { scrollToSection } from "@/utils/scrollHelper";

export default function Navbar() {
  const [isOpened, setIsOpened] = useState(false);
  
  const [activeMenu, setActiveMenu] = useState(location.pathname);


  const { theme } = useTheme();

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleMobileMenuClick = () => {
    setIsOpened(!isOpened);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      setActiveMenu(location.pathname);

      // ไม่ปิดเมนูถ้าคลิกที่ปุ่ม
      if (menuButtonRef.current?.contains(target)) {
        return;
      }

      // ถ้าคลิกนอกเมนูให้ปิด
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setIsOpened(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [location.pathname]);

  const handleMenuClick = (id: string) => {
    setActiveMenu(id);
  };

  const navigation = [
    { name: "หน้าหลัก", id: "/" },
    { name: "เกี่ยวกับเรา", id: "/about" },  
    { name: "ข้อมูลสิ่งแวดล้อม", id: "/environment-data" },
    { name: "ข่าวสารและกิจกรรม", id: "/news" },
    // { name: "ตารางข้อมูลสิ่งแวดล้อม", id: "/environment-data" },
    { name: "ติดต่อเรา", id: "/contact" },
  ];

  return (
    <>
      <section> {/* Navbar รอง ด้านบน Navbar หลัก */}
        <div className="fixed top-0 left-0 w-full h-[50px] bg-gradient-to-r from-[#0066a1] via-[#0066a1] to-[#2c9c3f] z-50">
          <div className="container max-w-7xl mx-auto flex items-center justify-between px-6 h-full text-white">
            <nav id='subNav' className="relative flex flex-wrap items-center justify-between w-full mx-auto lg:justify-between max-w-screen-xl">
              {/* Left side - Only show menu items on desktop */}
              <div className="flex items-center space-x-2 md:w-1/3">
                {/* Left menu items - show only on desktop */}
                <div className="hidden lg:flex space-x-4">
                  <a href="#" className="hover:underline">
                    {/* ขนาดตัวอักษร */}
                  </a>
                  <a href="#" className="hover:underline">
                    {/* การแสดงผล */}
                  </a>
                </div>
              </div>
              
              {/* Center - Logo - visible on all screens */}
              <div className="flex justify-center md:w-1/3">
                <Link to="/" className="mx-auto lg:hidden">
                  <img
                    src={
                      theme === "light"
                        ? "/images/pttdm.svg"
                        : "/images/pttdm.svg"
                    }
                    alt="Company Logo"
                    className="w-20"
                  />
                </Link>
              </div>
              
              {/* Right side - Theme toggle and hamburger on mobile/tablet, other links on desktop */}
              <div className="flex items-center justify-end space-x-2 md:w-1/3">
                {/* Desktop links - show only on desktop */}
                <div className="hidden lg:flex items-center space-x-4">
                  {/* <a href="#" className="hover:underline">
                    ศูนย์ข้อมูลข่าวสาร
                  </a> */}
                  {/* <a href="#" className="hover:underline">
                    1365 Contact Center
                  </a> */}
                  <a href="/login" className="hover:underline">
                    สำหรับเจ้าหน้าที่
                  </a>
                  {/* ปุ่มเปลี่ยนภาษา */}
                  {/* <button
                    onClick={() => setLanguage(language === "ไทย" ? "En" : "ไทย")}
                    className="hover:underline"
                  > */}
                    {/* {language} */}
                  {/* </button>

                  <Link to="/login">
                    <button className="relative z-0 h-12 rounded-full bg-blue-500 px-6 text-neutral-50 after:absolute after:left-0 after:top-0 after:-z-10 after:h-full after:w-full after:rounded-full after:bg-blue-500 hover:after:scale-x-125 hover:after:scale-y-150 hover:after:opacity-0 hover:after:transition hover:after:duration-500">
                      Login
                    </button>
                  </Link> */}
                </div>
                
                {/* Dark mode switch - show only on mobile/tablet */}
                <div className="flex items-center lg:hidden">
                  <DarkSwitch variant="light" />
                </div>
                
                {/* Mobile menu button - show only on mobile/tablet */}
                <button
                  ref={menuButtonRef}
                  onClick={handleMobileMenuClick}
                  className="px-2 py-1 text-white rounded-md lg:hidden hover:text-gray-200 focus:outline-none"
                >
                  <svg
                    className="w-6 h-6 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    {isOpened ? (
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                      />
                    )}
                  </svg>
                </button>
              </div>

              {/* Mobile menu panel */}
              {isOpened && (
                <div
                  ref={mobileMenuRef}
                  className="absolute top-[50px] left-0 w-full bg-[#0066a1] shadow-lg z-50 lg:hidden"
                >
                  <div className="flex flex-col w-full py-4 px-6">
                    {/* Navigation items */}
                    {navigation.map((item) => (
                      <Link
                        key={item.id}
                        to={item.id}
                        onClick={() => setIsOpened(false)}
                        className={`w-full px-4 py-3 text-lg font-normal text-left text-white hover:bg-[#005a8e] border-b border-[#0077b8] block
                                  ${location.pathname === item.id ? "bg-[#005a8e]" : ""}`}
                      >
                        {item.name}
                      </Link>
                    ))}
                    
                    {/* Login button in mobile menu */}
                    <Link 
                      to="/login" 
                      className="mt-4 block"
                      onClick={() => setIsOpened(false)}
                    >
                      {/* <button className="w-full py-3 text-center font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                        Login
                      </button> */}
                      <a>
                        สำหรับเจ้าหน้าที่
                      </a>
                    </Link>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      </section>
      
      {/* Navbar หลัก - แสดงเฉพาะบนจอขนาดใหญ่ */}
      <section>
        <div className="fixed top-[50px] w-full z-40 bg-[rgba(0,0,0,0.5)] text-white backdrop-blur-md shadow-sm hidden lg:block">
          <div className="container px-8 py-4 mx-auto xl:px-0">
            <nav id='mainNav' className="relative flex flex-wrap items-center justify-between mx-auto lg:justify-between max-w-screen-xl">
              {/* Logo */}
              <Link to="/">
                <span className="flex items-center space-x-2 text-2xl font-semibold dark:text-white">
                  <span>
                    <img
                      src={
                        theme === "light"
                          ? "/images/pttdm.svg"
                          : "/images/pttdm.svg"
                      }
                      alt=""
                      className="w-20"
                    />
                  </span>
                </span>
              </Link>

              {/* Desktop menu */}
              <div className="hidden text-center lg:flex lg:items-center">
                <ul className="flex space-x-6">
                  {navigation.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={item.id}
                        onClick={() => handleMenuClick(item.id)}
                        className={`relative block px-4 py-2 text-lg font-normal rounded-md cursor-pointer 
                                    hover:text-[#00AEEF] transition-all ease-in-out 
                                    before:transition-[width] before:ease-in-out before:duration-700 
                                    before:absolute before:h-[3px] before:w-0 before:bottom-0 before:left-0 
                                    before:bg-[linear-gradient(to_right,#06b6d4,#3b82f6)] hover:before:w-full
                                    ${activeMenu === item.id ? "text-[#00AEEF] before:w-full" : "text-white"}`}
                      >
                        {item.name}
                      </Link> 
                    </li>
                  ))}
                </ul>
                {/* Dark switch in main navbar for desktop view */}
                <div className="ml-4">
                  <DarkSwitch variant="light" />
                </div>
              </div>
            </nav>
          </div>
        </div>
      </section>
    </>
  );
}
