import { useState } from "react";
import emailjs from "emailjs-com";
import { Container } from "../template/Container";
import { SectionTitle } from "../template/SectionTitle";

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
  
    return (
      <Container>
        <SectionTitle
          textPicture="📧"
          title="ติดต่อเรา"
          align="center"
        ></SectionTitle>
        <div
          className="flex w-full justify-center items-center h-full py-16"
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
    );
  }
  