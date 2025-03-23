import React, { useState, useEffect } from 'react';
import { Container } from "@/components/template/Container";
import { SectionTitle } from "@/components/template/SectionTitle";
import API_BASE_URL from "@/config/apiConfig";
import { hasApprovePermission } from '@/utils/authUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faExclamationTriangle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { fetchNews, deleteNewsById, NewsItem } from '@/services/newsService';

interface DeleteConditions {
  startDate: string;
  endDate: string;
  status: string;
  category: string;
  uploadedBy: string;
  periodId: string;
}

export default function BulkDataDeletion() {
  // State for form data and UI
  const [dataType, setDataType] = useState<'news' | 'uploads'>('news');
  const [conditions, setConditions] = useState<DeleteConditions>({
    startDate: '',
    endDate: '',
    status: '',
    category: '',
    uploadedBy: '',
    periodId: ''
  });
  const [loading, setLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [result, setResult] = useState<{success: boolean; message: string; data?: any} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [showNewsList, setShowNewsList] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  // News status options
  const newsStatusOptions = [
    { value: '', label: '-- เลือกสถานะ --' },
    { value: 'published', label: 'เผยแพร่แล้ว' },
    { value: 'draft', label: 'ฉบับร่าง' },
    { value: 'archived', label: 'จัดเก็บ' }
  ];

  // News category options
  const newsCategoryOptions = [
    { value: '', label: '-- เลือกหมวดหมู่ --' },
    { value: 'Activity', label: 'Highlight / กิจกรรม' },
    { value: 'AnnualReport', label: 'รายงานประจำปี' },
    { value: 'Publication', label: 'ข้อมูลเผยแพร่' }
  ];

  // Upload status options
  const uploadStatusOptions = [
    { value: '', label: '-- เลือกสถานะ --' },
    { value: 'approved', label: 'อนุมัติแล้ว' },
    { value: 'pending', label: 'รอการอนุมัติ' },
    { value: 'rejected', label: 'ปฏิเสธ' }
  ];

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConditions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setConditions({
      startDate: '',
      endDate: '',
      status: '',
      category: '',
      uploadedBy: '',
      periodId: ''
    });
    setResult(null);
    setError(null);
    setShowNewsList(false);
  };
  
  // Fetch news data
  const fetchNewsData = async () => {
    try {
      setLoading(true);
      const data = await fetchNews();
      setNewsItems(data);
      setShowNewsList(true);
      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลข่าว');
      setLoading(false);
    }
  };
  
  // Handle delete news by ID
  const handleDeleteNewsById = async (id: number) => {
    try {
      setDeleteLoading(id);
      const result = await deleteNewsById(id);
      
      if (result.success) {
        // Remove deleted news from the list
        setNewsItems(prev => prev.filter(item => item.id !== id));
        setResult({
          success: true,
          message: `ลบข่าวรหัส ${id} เรียบร้อยแล้ว`
        });
      }
    } catch (error: any) {
      setError(error.message || `เกิดข้อผิดพลาดในการลบข่าวรหัส ${id}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Check if at least one condition is provided
  const hasCondition = () => {
    if (dataType === 'news') {
      return conditions.startDate || conditions.endDate || conditions.status || conditions.category;
    } else {
      return conditions.startDate || conditions.endDate || conditions.status || conditions.uploadedBy || conditions.periodId;
    }
  };

  // Handle delete operation
  const handleDelete = async () => {
    if (!hasCondition()) {
      setError('กรุณาระบุเงื่อนไขในการลบข้อมูลอย่างน้อย 1 เงื่อนไข');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = dataType === 'news' ? '/news-management/delete-news' : '/news-management/delete-uploads';
      
      // Prepare request body based on data type
      const requestBody = dataType === 'news' 
        ? {
            startDate: conditions.startDate || undefined,
            endDate: conditions.endDate || undefined,
            status: conditions.status || undefined,
            category: conditions.category || undefined
          }
        : {
            startDate: conditions.startDate || undefined,
            endDate: conditions.endDate || undefined,
            status: conditions.status || undefined,
            uploadedBy: conditions.uploadedBy || undefined,
            periodId: conditions.periodId || undefined
          };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // ส่ง cookies ไปด้วย
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete data');
      }

      setResult(data);
      resetForm();
    } catch (error: any) {
      setError(error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
      console.error('Error deleting data:', error);
    } finally {
      setLoading(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <Container>
      <SectionTitle title="ลบข้อมูลจำนวนมาก" align="center" />
      
      <div className="p-8">
        {/* Form Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-black">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-semibold">เลือกประเภทข้อมูลที่ต้องการลบ</h2>
            <FontAwesomeIcon icon={faExclamationTriangle} className="ml-2 text-yellow-500" />
            <span className="ml-2 text-sm text-yellow-600">คำเตือน: การลบข้อมูลไม่สามารถย้อนกลับได้</span>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              <button 
                className="float-right font-bold"
                onClick={() => setError(null)}
              >
                &times;
              </button>
            </div>
          )}
          
          {result && result.success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {result.message}
              <button 
                className="float-right font-bold"
                onClick={() => setResult(null)}
              >
                &times;
              </button>
            </div>
          )}
          
          {/* Data Type Selection */}
          <div className="mb-4">
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="dataType"
                  value="news"
                  checked={dataType === 'news'}
                  onChange={() => setDataType('news')}
                />
                <span className="ml-2">ข้อมูลข่าว</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="dataType"
                  value="uploads"
                  checked={dataType === 'uploads'}
                  onChange={() => setDataType('uploads')}
                />
                <span className="ml-2">ไฟล์ที่อัปโหลด</span>
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Date Range */}
            <div>
              <label className="block text-gray-700 mb-2">วันที่เริ่มต้น</label>
              <input
                type="date"
                name="startDate"
                className="w-full p-2 border rounded"
                value={conditions.startDate}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">วันที่สิ้นสุด</label>
              <input
                type="date"
                name="endDate"
                className="w-full p-2 border rounded"
                value={conditions.endDate}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Status Selection */}
            <div>
              <label className="block text-gray-700 mb-2">สถานะ</label>
              <select
                name="status"
                className="w-full p-2 border rounded"
                value={conditions.status}
                onChange={handleInputChange}
              >
                {dataType === 'news' 
                  ? newsStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))
                  : uploadStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))
                }
              </select>
            </div>
            
            {/* Category or Uploaded By */}
            {dataType === 'news' ? (
              <div>
                <label className="block text-gray-700 mb-2">หมวดหมู่</label>
                <select
                  name="category"
                  className="w-full p-2 border rounded"
                  value={conditions.category}
                  onChange={handleInputChange}
                >
                  {newsCategoryOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-gray-700 mb-2">ผู้อัปโหลด</label>
                  <input
                    type="text"
                    name="uploadedBy"
                    className="w-full p-2 border rounded"
                    placeholder="ชื่อผู้ใช้หรือ ID ผู้อัปโหลด"
                    value={conditions.uploadedBy}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">รหัสช่วงเวลา (Period ID)</label>
                  <input
                    type="text"
                    name="periodId"
                    className="w-full p-2 border rounded"
                    placeholder="รหัสช่วงเวลา (Period ID)"
                    value={conditions.periodId}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-6">
            {hasApprovePermission() && (
              <>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 flex items-center"
                  onClick={() => setShowConfirmDelete(true)}
                  disabled={!hasCondition() || loading}
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  ลบข้อมูลตามเงื่อนไข
                </button>
                
                {dataType === 'news' && (
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
                    onClick={fetchNewsData}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faSearch} className="mr-2" />
                    แสดงรายการข่าวทั้งหมด
                  </button>
                )}
              </>
            )}
            
            <button
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 ml-auto"
              onClick={resetForm}
              disabled={loading}
            >
              รีเซ็ต
            </button>
          </div>
        </div>
        
        {/* News List Table */}
        {showNewsList && dataType === 'news' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-black">
            <h2 className="text-xl font-semibold mb-4">รายการข่าวทั้งหมด</h2>
            
            {newsItems.length === 0 ? (
              <p className="text-gray-500">ไม่พบข้อมูลข่าว</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หัวข้อข่าว</th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หมวดหมู่</th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่สร้าง</th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newsItems.map((news) => (
                      <tr key={news.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b border-gray-200">{news.id}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{news.News_title}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{news.News_category}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{new Date(news.Create_at).toLocaleDateString('th-TH')}</td>
                        <td className="py-2 px-4 border-b border-gray-200">{news.News_status || 'N/A'}</td>
                        <td className="py-2 px-4 border-b border-gray-200">
                          {hasApprovePermission() && (
                            <button
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 flex items-center text-sm"
                              onClick={() => handleDeleteNewsById(news.id)}
                              disabled={deleteLoading === news.id}
                            >
                              <FontAwesomeIcon icon={faTrash} className="mr-1" />
                              {deleteLoading === news.id ? 'กำลังลบ...' : 'ลบ'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 mr-2" />
              ยืนยันการลบข้อมูล
            </h3>
            <p className="mb-6">
              คุณต้องการลบข้อมูล{dataType === 'news' ? 'ข่าว' : 'ไฟล์ที่อัปโหลด'}ตามเงื่อนไขที่ระบุใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>
            <p className="mb-6 text-sm text-gray-600">
              หมายเหตุ: สำหรับการลบข้อมูลตามช่วงเวลาเฉพาะ คุณสามารถใช้หน้า "จัดการข้อมูล" เพื่อลบข้อมูลตาม Period ID ได้เช่นกัน
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowConfirmDelete(false)}
                disabled={loading}
              >
                ยกเลิก
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
                onClick={handleDelete}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                {loading ? 'กำลังดำเนินการ...' : 'ยืนยันการลบ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}