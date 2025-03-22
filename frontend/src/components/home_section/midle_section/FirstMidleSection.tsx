export default function FirstMidleSection() {
  return (
    <>
      <section className="relative w-full bg-[#1B5172] h-[42px]">
        {/* SVG แรกที่มีเงา */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute top-0 left-0 w-full h-auto z-20 drop-shadow-xl transform ">
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" style={{ stopColor: "#0066a1", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#0066a1", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path fill="#0099ff" fill-opacity="1" d="M0,96L1440,192L1440,0L0,0Z"></path>
        </svg>

        {/* SVG ที่สอง */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute left-0 w-full h-auto z-10 ">
          <defs>
            <linearGradient id="gradient2" x1="0%" y1="100%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#1B5172", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#1B5172", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path fill="#1B5172" fill-opacity="1" d="M0,192L1440,96L1440,0L0,0Z"></path>
        </svg>
      </section>
    </>
  )
}
