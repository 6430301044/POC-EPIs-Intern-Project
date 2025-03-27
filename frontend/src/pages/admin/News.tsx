import { Container } from '@/components/template/Container'
import { SectionTitle } from '@/components/template/SectionTitle'
import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { jwtDecode } from 'jwt-decode'
import API_BASE_URL from '@/config/apiConfig'
import { hasApprovePermission } from '@/utils/authUtils'
import { Box, Typography } from '@mui/material'
import { useTheme } from '@/contexts/ThemeContext'


export default function NewsUpload() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const { theme } = useTheme();

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
  
  useEffect(() => {
    const checkPermission = async () => {
      const hasPermission = await hasApprovePermission();
      setCanEdit(hasPermission);
    };
    
    checkPermission();
  }, []);

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
  
      images.forEach((image: File) => formData.append("file", image));
  
      const response = await fetch(`${API_BASE_URL}/upload/news`, {
        method: "POST",
        body: formData,
        credentials: 'include' // ส่ง cookies ไปด้วย
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
      <SectionTitle 
      title="News" 
      align="center" />
      {!canEdit && (
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          bgcolor: theme === 'dark' ? 'gray.700' : '#fff9c4', 
          borderRadius: 1, 
          textAlign: 'center',
          maxWidth: '2xl',
          mx: 'auto',
          mb: 2
        }}>
          <Typography variant="body2" color={theme === 'dark' ? 'warning.light' : 'warning.dark'}>
            คุณกำลังดูข้อมูลในโหมดอ่านอย่างเดียว เนื่องจากคุณไม่มีสิทธิ์ในการอัปโหลดข่าวสาร
          </Typography>
        </Box>
      )}
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-700 shadow-md rounded-md text-black dark:text-white">
        <h2 className="text-2xl font-bold mb-4">📰 อัปโหลดข่าวสาร</h2>
        {!canEdit && (
          <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md mb-4">
            <p className="text-center">คุณไม่มีสิทธิ์ในการอัปโหลดข่าวสาร กรุณาติดต่อผู้ดูแลระบบ</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4" style={{ opacity: canEdit ? 1 : 0.6, pointerEvents: canEdit ? 'auto' : 'none' }}>
          <div>
            <label className="block font-semibold">หมวดหมู่</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700">
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
            <button type="submit" className="w-1/2 p-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600" disabled={loading || !canEdit}>
              {loading ? "กำลังอัปโหลด..." : "📤 อัปโหลดข่าว"}
            </button>
          </div>
        </form>
        {message && <p className="mt-4 text-center font-bold">{message}</p>}

        {showPreview && (
          <div className="mt-6 p-4 border rounded-lg shadow-md bg-gray-100 dark:bg-gray-300">
            <h3 className="text-lg font-bold dark:text-black">🔍 Preview</h3>
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
