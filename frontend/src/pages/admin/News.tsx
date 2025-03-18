import { Container } from "@/components/template/Container";
import { SectionTitle } from "@/components/template/SectionTitle";
import API_BASE_URL from "@/config/apiConfig";
import React, { useState } from "react";

export default function NewsUpload() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [images, setImages] = useState<File[]>([]); // ใช้ array สำหรับหลายไฟล์
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // ฟังก์ชันจัดการการอัปโหลดไฟล์
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setImages([...images, ...files]); // เก็บไฟล์ทั้งหมดที่เลือก
    }
  };

  // ฟังก์ชันเพิ่มข้อความใหม่ลงใน layout
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  // ฟังก์ชันส่งข่าวไปยัง Backend
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("❌ กรุณาเข้าสู่ระบบก่อนอัปโหลดข่าว");
        setLoading(false);
        return;
      }

      // ดึงข้อมูลผู้ใช้จาก token
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const userId = decoded.userId;

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category", category);
      formData.append("Create_by", userId.toString());

      // ส่งไฟล์ภาพหลายไฟล์
      images.forEach((image) => {
        formData.append("file", image);
      });

      const response = await fetch(`${API_BASE_URL}/news/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload news");
      }

      const data = await response.json();
      setMessage("✅ ข่าวถูกอัปโหลดเรียบร้อย!");
      setTitle("");
      setContent("");
      setCategory("General");
      setImages([]); // Clear images after upload
      setShowPreview(false);
    } catch (error) {
      setMessage("❌ อัปโหลดข่าวไม่สำเร็จ!");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <SectionTitle title="News" align="center" />

      <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md text-black">
        <h2 className="text-2xl font-bold mb-4">📰 อัปโหลดข่าวสาร</h2>

        {/* ฟอร์มอัปโหลดข่าว */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* หมวดหมู่ข่าว */}
          <div>
            <label className="block font-semibold">หมวดหมู่</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="Activity">Highlight / กิจกรรม</option>
              <option value="AnnualReport">รายงานประจำปี</option>
              <option value="Publication">ข้อมูลเผยแพร่</option>
            </select>
          </div>

          {/* หัวข้อข่าว */}
          <div>
            <label className="block font-semibold">หัวข้อข่าว</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* เนื้อหาข่าว */}
          <div>
            <label className="block font-semibold">เนื้อหาข่าว</label>
            <textarea
              value={content}
              onChange={handleTextChange}
              className="w-full p-2 border rounded h-32"
            />
          </div>

          {/* อัปโหลดรูปภาพ */}
          <div>
            <label className="block font-semibold">อัปโหลดรูปภาพ</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>

          {/* ปุ่มสำหรับ Preview และ Upload */}
          <div className="flex space-x-4">
            <button
              type="button"
              className="w-1/2 p-2 bg-gray-500 text-white font-bold rounded hover:bg-gray-600"
              onClick={() => setShowPreview(!showPreview)} // สลับการแสดงผลของ Preview
            >
              {showPreview ? "❌ ซ่อนตัวอย่าง" : "👀 Preview"}
            </button>

            <button
              type="submit"
              className="w-1/2 p-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "กำลังอัปโหลด..." : "📤 อัปโหลดข่าว"}
            </button>
          </div>
        </form>

        {/* แสดงข้อความแจ้งเตือน */}
        {message && <p className="mt-4 text-center font-bold">{message}</p>}

        {/* 🔥 ส่วนแสดงตัวอย่าง Preview */}
        {showPreview && (
          <div className="mt-6 p-4 border rounded-lg shadow-md bg-gray-100">
            <h3 className="text-lg font-bold">🔍 Preview</h3>
            <p className="text-sm text-gray-600">📂 หมวดหมู่: {category}</p>
            <h2 className="text-xl font-bold mt-2">{title}</h2>
            <p>{content}</p>
            <div className="mt-4">
              {images.map((image, index) => (
                <div key={index} className="mt-4">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Image-${index}`}
                    className="w-full max-h-60 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
