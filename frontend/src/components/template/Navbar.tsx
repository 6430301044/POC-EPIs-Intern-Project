import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import DarkSwitch from "./DarkSwitch";
import { scrollToSection } from "@/utils/scrollHelper";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const location = useLocation();

  const { theme } = useTheme();

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleMobileMenuClick = () => {
    setIsOpen(!isOpen);
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
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigation = [
    { name: "Data visualization", id: "visualization" },
    { name: "Table", id: "table" },
    { name: "Contact Us", id: "contact" },
  ];

  return (
    <>
      <div className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm">
        <div className="container px-8 py-4 mx-auto xl:px-0">
          <nav className="relative flex flex-wrap items-center justify-between mx-auto lg:justify-between max-w-screen-xl">
            {/* Logo  */}
            <Link to="/">
              <span className="flex items-center space-x-2 text-2xl font-semibold dark:text-white">
                <span>
                  <img
                    src={
                      theme === "light"
                        ? "/images/pttwm.svg"
                        : "/images/pttdm.svg"
                    }
                    alt=""
                    className="w-20"
                  />
                </span>
              </span>
            </Link>

            {/* get started and dark mode */}
            <div className=" lg:hidden flex items-center gap-3 nav__item mr-2 ml-auto lg:ml-0 lg:order-2">
              <DarkSwitch />
            </div>

            {/* Mobile menu button - เพิ่ม ref */}
            <button
              ref={menuButtonRef}
              onClick={handleMobileMenuClick}
              className="px-2 py-1 text-gray-500 dark:text-gray-400 rounded-md lg:hidden hover:text-indigo-500 dark:hover:text-indigo-400 focus:text-indigo-500 focus:bg-indigo-100 dark:focus:bg-gray-800 focus:outline-hidden"
            >
              <svg
                className="w-6 h-6 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
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

            {/* Mobile menu panel */}
            {isOpen && (
              <div
                ref={mobileMenuRef}
                className="flex flex-wrap w-full my-5 lg:hidden"
              >
                {/* Other navigation items */}
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      scrollToSection(item.id);
                      setIsOpen(false);
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

            {/* Desktop menu */}
            <div className="hidden text-center lg:flex lg:items-center">
              <ul className="items-center justify-end flex-1 pt-6 list-none lg:pt-0 lg:flex">
                {/* Other navigation items */}
                {navigation.map((item) => (
                  <li className="mr-3" key={item.name}>
                    <button
                      key={item.id}
                      onClick={() => {
                        scrollToSection(item.id);
                        setIsOpen(false);
                      }}
                      className={`inline-block px-4 py-2 text-lg font-normal rounded-md hover:text-indigo-500 focus:text-indigo-500 focus:bg-indigo-100 focus:outline-hidden
                            ${
                              location.pathname === item.id
                                ? "text-indigo-600"
                                : ""
                            }`}
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
              <DarkSwitch />
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
