export default function SecondSection() {
  return (
    <>
     <section id="about" className="relative w-full min-h-[710px] overflow-x-auto bg-gradient-to-tr from-[#0066a1] via-[#0066a1] to-[#0066a1] flex flex-col md:flex-row items-center justify-start px-4 md:px-[192px]  mt-[100px]">
        {/* PTT Group */}
        <div className="flex-shrink-0 justify-center items-center mt-[100px] min-w-[300px]">
          <ul className="text-left">
            <li className="text-[22px] font-bold text-white mb-[16px]">PTT Group</li>
          </ul>
          <ul className="text-left">
            {/* รู้จักกับสถานประกอบการของเรา */}
            <li className="text-[50px] font-bold text-white mb-[10px]">
              รู้จักกับสถาน<br />ประกอบการ<br />ของเรา
            </li>
          </ul>
        </div>
        

        {/* ส่วนที่สอง */}
        <div className="flex-shrink-0 justify-center items-center bg-gray-200 shadow-lg w-[460px] h-[385px] mt-4 md:mt-0 ml-4 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:cursor-pointer relative">
          <a href="/path-to-other-page">
            <img 
              src="/images/DJI_0138.JPG" 
              alt="คลังก๊าซเขาบ่อยา" 
              className="w-full h-full object-cover rounded-lg" 
            />
            <p className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent text-white text-xl font-bold p-3 text-start">
              คลังก๊าซเขาบ่อยา
            </p>
          </a>
        </div>

        <div className="flex-shrink-0 justify-center items-center bg-gray-300 shadow-lg w-[460px] h-[385px] mt-4 md:mt-0 ml-4 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:cursor-pointer relative">
          <a href="/path-to-other-page">
            <img 
              src="/images/DJI_0050.JPG" 
              alt="คลังน้ำมันศรีราชา" 
              className="w-full h-full object-cover rounded-lg" 
            />
            <p className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent text-white text-xl font-bold p-3 text-start">
              คลังน้ำมันศรีราชา
            </p>
          </a>
        </div>
      </section>
    </>
  )
}
