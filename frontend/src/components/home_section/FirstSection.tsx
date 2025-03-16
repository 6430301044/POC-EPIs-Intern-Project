import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const images = [
    "/images/DJI_0024.JPG",
    "/images/DJI_0052.JPG",
    "/images/DJI_0050.JPG",
    "/images/DJI_0049.JPG",
  ];

export default function FirstSection() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
          setIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 7500);    
        return () => {
          clearInterval(interval);
        };
      }, []);

  return (
    <>
        <section className="relative w-full h-screen overflow-hidden">
        {/* Background Image */}
        <motion.div
          key={index}
          className="absolute inset-0 w-full h-screen bg-no-repeat bg-center bg-cover"
          style={{ backgroundImage: `url(${images[index]})` }}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: window.innerWidth > 640 ? 1.1 : 1 }} // ปรับ scale ตามขนาดจอ
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 7, ease: "easeInOut" }}
        />
      </section>
    </>
  )
}
