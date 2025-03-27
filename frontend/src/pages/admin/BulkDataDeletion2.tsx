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

interface UploadedFile {
  upload_id: number;
  filename: string;
  upload_date: string;
  uploaded_by: number;
  status: string;
  record_count: number;
  target_table: string;
}

interface ReferenceData {
  upload_id: number;
  filename: string;
  target_table: string;
  upload_date: string;
  uploaded_by: number;
  status: string;
  record_count: number;
}

export default function BulkDataDeletion2() {
  // State for form data and UI
  const [dataType, setDataType] = useState<'news' | 'uploads' | 'reference'>('news');
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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [referenceData, setReferenceData] = useState<ReferenceData[]>([]);
  const [showDataList, setShowDataList] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  // Status options
  const newsStatusOptions = [
    { value: '', label: '-- เลือกสถานะ --' },
    { value: 'published', label: 'เผยแพร่แล้ว' },
    { value: 'draft', label: 'ฉบับร่าง' },
    { value: 'archived', label: 'จัดเก็บ' }
  ];

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
    setShowDataList(false);
  };
  
  // Fetch news data
  const fetchNewsData = async () => {
    try {
      setLoading(true);
      const data = await fetchNews();
      setNewsItems(data);
      setShowDataList(true);
      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลข่าว');
      setLoading(false);
    }
  };

  // Fetch uploaded files data
  const fetchUploadedFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/upload-table/files`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch uploaded files');
      }

      const data = await response.json();
      setUploadedFiles(data.data || []);
      setShowDataList(true);
      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลไฟล์ที่อัปโหลด');
      setLoading(false);
    }
  };

  // Fetch reference data
  const fetchReferenceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/ref-table/pending-approvals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reference data');
      }

      const data = await response.json();
      setReferenceData(data.data || []);
      setShowDataList(true);
      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลอ้างอิงรอการอนุมัติ');
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

  // Handle delete uploaded file by ID
  const handleDeleteUploadedFileById = async (id: number) => {
    try {
      setDeleteLoading(id);
      const response = await fetch(`${API_BASE_URL}/upload/uploaded-file/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        // Remove deleted file from the list
        setUploadedFiles(prev => prev.filter(item => item.upload_id !== id));
        setResult({
          success: true,
          message: `ลบไฟล์รหัส ${id} เรียบร้อยแล้ว`
        });
      } else {
        throw new Error(result.message || 'Failed to delete file');
      }
    } catch (error: any) {
      setError(error.message || `เกิดข้อผิดพลาดในการลบไฟล์รหัส ${id}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Handle delete reference data by ID
  const handleDeleteReferenceDataById = async (id: number) => {
    try {
      setDeleteLoading(id);
      const response = await fetch(`${API_BASE_URL}/upload/reference-data/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        // Remove deleted reference data from the list
        setReferenceData(prev => prev.filter(item => item.upload_id !== id));
        setResult({
          success: true,
          message: `ลบข้อมูลอ้างอิงรหัส ${id} เรียบร้อยแล้ว`
        });
      } else {
        throw new Error(result.message || 'Failed to delete reference data');
      }
    } catch (error: any) {
      setError(error.message || `เกิดข้อผิดพลาดในการลบข้อมูลอ้างอิงรหัส ${id}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Handle fetch data based on data type
  const handleFetchData = () => {
    if (dataType === 'news') {
      fetchNewsData();
    } else if (dataType === 'uploads') {
      fetchUploadedFiles();
    } else if (dataType === 'reference') {
      fetchReferenceData();
    }
  };

  return (
    <>
      <Container>
        <SectionTitle title="ลบข้อมูลจำนวนมาก" align="center" />
        
        <div className="p-8">
          {/* Form Section */}
          <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md mb-6 text-black dark:text-white">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold">เลือกประเภทข้อมูลที่ต้องการลบ</h2>
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
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="dataType"
                    value="reference"
                    checked={dataType === 'reference'}
                    onChange={() => setDataType('reference')}
                  />
                  <span className="ml-2">ข้อมูลอ้างอิงรอการอนุมัติ</span>
                </label>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-6">
              {hasApprovePermission() && (
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
                  onClick={handleFetchData}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faSearch} className="mr-2" />
                  {dataType === 'news' ? 'แสดงรายการข่าวทั้งหมด' : 
                   dataType === 'uploads' ? 'แสดงรายการไฟล์ที่อัปโหลดทั้งหมด' : 
                   'แสดงรายการข้อมูลอ้างอิงรอการอนุมัติทั้งหมด'}
                </button>
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
          {showDataList && dataType === 'news' && (
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md mb-6 text-black dark:text-white">
              <h2 className="text-xl font-semibold mb-4">รายการข่าวทั้งหมด</h2>
              
              {newsItems.length === 0 ? (
                <p className="text-gray-500">ไม่พบข้อมูลข่าว</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border dark:bg-gray-700 border-gray-200">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">ID</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">หัวข้อข่าว</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">หมวดหมู่</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">วันที่สร้าง</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newsItems.map((news) => (
                        <tr key={news.id} className="hover:bg-gray-50 dark:hover:bg-gray-400">
                          <td className="py-2 px-4 border-b border-gray-200">{news.id}</td>
                          <td className="py-2 px-4 border-b border-gray-200">{news.News_title}</td>
                          <td className="py-2 px-4 border-b border-gray-200">{news.News_category}</td>
                          <td className="py-2 px-4 border-b border-gray-200">{new Date(news.Create_at).toLocaleDateString('th-TH')}</td>
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

          {/* Uploaded Files List Table */}
          {showDataList && dataType === 'uploads' && (
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md mb-6 text-black dark:text-white">
              <h2 className="text-xl font-semibold mb-4">รายการไฟล์ที่อัปโหลดทั้งหมด</h2>
              
              {uploadedFiles.length === 0 ? (
                <p className="text-gray-500">ไม่พบข้อมูลไฟล์ที่อัปโหลด</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border dark:bg-gray-700 border-gray-200">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">ID</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">ชื่อไฟล์</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">วันที่อัปโหลด</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">สถานะ</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">จำนวนรายการ</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadedFiles.map((file) => (
                        <tr key={file.upload_id} className="hover:bg-gray-50 dark:hover:bg-gray-400">
                          <td className="py-2 px-4 border-b border-gray-200">{file.upload_id}</td>
                          <td className="py-2 px-4 border-b border-gray-200">{file.filename}</td>
                          <td className="py-2 px-4 border-b border-gray-200">{new Date(file.upload_date).toLocaleDateString('th-TH')}</td>
                          <td className="py-2 px-4 border-b border-gray-200">{file.status}</td>
                          <td className="py-2 px-4 border-b border-gray-200">{file.record_count}</td>
                          <td className="py-2 px-4 border-b border-gray-200">
                            {hasApprovePermission() && (
                              <button
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 flex items-center text-sm"
                                onClick={() => handleDeleteUploadedFileById(file.upload_id)}
                                disabled={deleteLoading === file.upload_id}
                              >
                                <FontAwesomeIcon icon={faTrash} className="mr-1" />
                                {deleteLoading === file.upload_id ? 'กำลังลบ...' : 'ลบ'}
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

          {/* Reference Data List Table */}
          {showDataList && dataType === 'reference' && (
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md mb-6 text-black dark:text-white">
              <h2 className="text-xl font-semibold mb-4">รายการข้อมูลอ้างอิงรอการอนุมัติทั้งหมด</h2>
              
              {referenceData.length === 0 ? (
                <p className="text-gray-500">ไม่พบข้อมูลอ้างอิงรอการอนุมัติ</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border dark:bg-gray-700 border-gray-200">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">ID</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">ชื่อไฟล์</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">ตารางเป้าหมาย</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">วันที่อัปโหลด</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">สถานะ</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">จำนวนรายการ</th>
                        <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referenceData.map((data) => (
                        <tr key={data.upload_id} className="hover:bg-gray-50 dark:hover:bg-gray-400">
                          <td className="py-2 px-4 border-b border-gray-200">{data.upload_id}</td>
                          <td className="py-2 px-4 border-b border-gray-200">{data.filename}</td>
                          <td className="py-2 px-4 border-b border-gray-200">{data.target_table}</td>
                          <td className="py-2 px-4 border-b border-gray-200">{new Date(data.upload_date).toLocaleDateString('th-TH')}</td>
                          <td className="py-2 px-4 border-b border-gray-200">{data.status}</td>
                          <td className="py-2 px-4 border-b border-gray-200">{data.record_count}</td>
                          <td className="py-2 px-4 border-b border-gray-200">
                            {hasApprovePermission() && (
                              <button
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 flex items-center text-sm"
                                onClick={() => handleDeleteReferenceDataById(data.upload_id)}
                                disabled={deleteLoading === data.upload_id}
                              >
                                <FontAwesomeIcon icon={faTrash} className="mr-1" />
                                {deleteLoading === data.upload_id ? 'กำลังลบ...' : 'ลบ'}
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
      </Container>
    </>
  );
}
