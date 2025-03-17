import { Container } from '@/components/template/Container'
import { SectionTitle } from '@/components/template/SectionTitle'
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

export default function NewsUpload() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({
    show: false,
    title: '',
    message: '',
    type: 'success'
  });

  // ฟังก์ชันสำหรับแสดง toast
  const showToast = (title: string, message: string, type: 'success' | 'error' | 'warning') => {
    setToast({
      show: true,
      title,
      message,
      type
    });

    // ซ่อน toast หลังจาก 3 วินาที
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setImages([...images, ...files]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
  
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category", category);
  
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = JSON.parse(atob(token.split(".")[1])); 
        const userId = decodedToken.userId; 
        formData.append("Create_by", userId.toString()); 
      }
  
      images.forEach((image) => formData.append("file", image));
  
      const response = await fetch("http://localhost:5000/upload/news", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to upload news");
      }
  
      showToast("สำเร็จ!", "✅ ข่าวถูกอัปโหลดเรียบร้อย!", 'success');
      setTitle("");
      setContent("");
      setCategory("General");
      setImages([]);
  
      // รีเซ็ต input file ด้วยการเข้าถึง ref
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = ''; // รีเซ็ตไฟล์ที่เลือก
      }
  
    } catch (error) {
      showToast("ล้มเหลว!", "❌ อัปโหลดข่าวไม่สำเร็จ!", 'error');
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <SectionTitle title="News" align="center" />

      <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-bold mb-4">📰 อัปโหลดข่าวสาร</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold">หมวดหมู่</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded">
            <option value="Activity">Highlight / กิจกรรม</option>
            <option value="AnnualReport">รายงานประจำปี</option>
            <option value="Publication">ข้อมูลเผยแพร่</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold">หัวข้อข่าว</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block font-semibold">เนื้อหาข่าว</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-2 border rounded h-32" required />
          </div>
          <div>
            <label className="block font-semibold">อัปโหลดรูปภาพ</label>
            <input type="file" multiple onChange={handleFileChange} accept="image/*" />
            <div className="mt-4">
              {images.map((image, index) => (
                <div key={index} className="inline-flex items-center bg-gray-100 text-gray-700 text-sm py-1 px-3 rounded-full mr-2 mb-2">
                  <span>{image.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="ml-2 text-red-500 hover:text-red-700 text-lg"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex space-x-4">
            <button type="button" onClick={() => setShowPreview(!showPreview)} className="w-1/2 p-2 bg-gray-500 text-white font-bold rounded hover:bg-gray-600">
              {showPreview ? "❌ ซ่อนตัวอย่าง" : "👀 Preview"}
            </button>
            <button type="submit" className="w-1/2 p-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600" disabled={loading}>
              {loading ? "กำลังอัปโหลด..." : "📤 อัปโหลดข่าว"}
            </button>
          </div>
        </form>
        {message && <p className="mt-4 text-center font-bold">{message}</p>}

        {showPreview && (
          <div className="mt-6 p-4 border rounded-lg shadow-md bg-gray-100">
            <h3 className="text-lg font-bold">🔍 Preview</h3>
            <p className="text-sm text-gray-600">📂 หมวดหมู่: {category}</p>
            <h2 className="text-xl font-bold mt-2">{title}</h2>
            <p className="mt-2 break-words">{content}</p> {/* ข้อความจะขึ้นบรรทัดใหม่เมื่อเกินกรอบ */}
            <div className="mt-4">
              {images.map((image, index) => (
                <img key={index} src={URL.createObjectURL(image)} alt={`Preview-${index}`} className="w-full max-h-60 object-cover mt-2" />
              ))}
            </div>
          </div>
        )}
         {/* Custom Toast Notification */}
         {toast.show && (
          <div className={`fixed bottom-4 right-4 p-4 rounded shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 
            toast.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          } text-white`}>
            <h3 className="font-bold">{toast.title}</h3>
            <p>{toast.message}</p>
          </div>
        )}
      </div>
    </Container>
  );
}
