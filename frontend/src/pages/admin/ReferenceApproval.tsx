import { Container } from "@/components/template/Container";
import { SectionTitle } from "@/components/template/SectionTitle";
import { useState, useEffect } from "react";
import API_BASE_URL from "@/config/apiConfig";
import DataPreviewReference from "@/components/admin/DataPreviewReference";

interface PendingReferenceApproval {
  id: string;
  file_name: string;
  upload_date: string;
  table_name: string;
  uploaded_by: string;
  uploaded_by_name: string;
}

export default function ReferenceApproval() {
  // State สำหรับเก็บข้อมูลคำขออนุมัติและสถานะต่างๆ
  const [pendingApprovals, setPendingApprovals] = useState<PendingReferenceApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null);
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

  // ดึงข้อมูลคำขออนุมัติที่รอดำเนินการ
  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/upload/pending-reference-approvals`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include' // ส่ง cookies ไปด้วย
      });
      
      if (response.status === 401) {
        // Token หมดอายุ ให้ Redirect ไปหน้า Login หรือแจ้งเตือน
        showToast("Session Expired", "Please log in again.", "error");
        window.location.href = "/login"; // Redirect ไปหน้า Login
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch pending reference approvals");
      }
      
      const data = await response.json();
      setPendingApprovals(data.data || []);
    } catch (error) {
      // แสดง toast เมื่อเกิดข้อผิดพลาดในการดึงข้อมูล
      console.error("Error fetching pending reference approvals:", error);
      showToast(
        "Error",
        "ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูลเมื่อโหลดคอมโพเนนต์
  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  // ฟังก์ชันสำหรับอนุมัติคำขอ
  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
  
      const response = await fetch(`${API_BASE_URL}/upload/approve-reference/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include', // ส่ง cookies ไปด้วย
        body: JSON.stringify({
          userId: "admin" // ควรใช้ ID ของผู้ใช้ที่ login อยู่
        })
      });
  
      if (response.status === 401) {
        showToast("Session Expired", "Please log in again.", "error");
        window.location.href = "/login";
        return;
      }
  
      if (!response.ok) {
        throw new Error("Failed to approve reference upload");
      }
  
      showToast(
        "Success",
        "Reference data approved successfully",
        "success"
      );
      
      // รีเฟรชข้อมูลหลังจากอนุมัติ
      fetchPendingApprovals();
    } catch (error) {
      showToast(
        "Error",
        "Failed to approve reference upload",
        "error"
      );
      console.error("Error approving reference upload:", error);
    } finally {
      setProcessingId(null);
    }
  };

  // ฟังก์ชันสำหรับปฏิเสธคำขอ
  const handleReject = async (id: string, reason: string = "") => {
    try {
      setProcessingId(id);
  
      const response = await fetch(`${API_BASE_URL}/upload/reject-reference/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include', // ส่ง cookies ไปด้วย
        body: JSON.stringify({
          userId: "admin", // ควรใช้ ID ของผู้ใช้ที่ login อยู่
          rejectionReason: reason
        })
      });
  
      if (response.status === 401) {
        showToast("Session Expired", "Please log in again.", "error");
        window.location.href = "/login";
        return;
      }
  
      if (!response.ok) {
        throw new Error("Failed to reject reference upload");
      }
  
      showToast(
        "Success",
        "Reference upload rejected successfully",
        "success"
      );
      
      // รีเฟรชข้อมูลหลังจากปฏิเสธ
      fetchPendingApprovals();
    } catch (error) {
      showToast(
        "Error",
        "Failed to reject reference upload",
        "error"
      );
      console.error("Error rejecting reference upload:", error);
    } finally {
      setProcessingId(null);
    }
  };

  // ฟังก์ชันสำหรับแปลงวันที่ให้อยู่ในรูปแบบที่อ่านง่าย
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ` น.`;
  };
  
  // ฟังก์ชันสำหรับเปิด modal แสดงตัวอย่างข้อมูล
  const handlePreviewData = (id: string) => {
    setSelectedUploadId(id);
    setPreviewModalOpen(true);
  };
  
  // ฟังก์ชันสำหรับปิด modal
  const handleClosePreviewModal = () => {
    setPreviewModalOpen(false);
    setSelectedUploadId(null);
  };

  return (
    <>
      <Container>
        <SectionTitle title="Reference Data Approval" align="center" />
        <div className="p-8">
          <div className="flex flex-col space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                Pending Reference Data Approvals
              </h2>
              <button 
                onClick={() => fetchPendingApprovals()}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                disabled={loading}
              >
                <span className="flex items-center dark:text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </span>
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : pendingApprovals.length === 0 ? (
              <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded text-center">
                <p className="text-gray-800 dark:text-gray-300">ไม่พบรายการข้อมูลอ้างอิงที่รอการอนุมัติในขณะนี้</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">หากคุณเพิ่งอัปโหลดไฟล์ กรุณาลองรีเฟรชหน้านี้</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 dark:bg-gray-700">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 text-black dark:text-gray-300">
                      <th className="py-3 px-4 border-b text-left">File Name</th>
                      <th className="py-3 px-4 border-b text-left">Upload Date</th>
                      <th className="py-3 px-4 border-b text-left">Target Table</th>
                      <th className="py-3 px-4 border-b text-left">Uploaded By</th>
                      <th className="py-3 px-4 border-b text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingApprovals.map((approval) => (
                      <tr key={approval.id} className="hover:bg-gray-50 text-black dark:text-gray-300 dark:hover:bg-gray-800">
                        <td className="py-3 px-4 border-b">{approval.file_name}</td>
                        <td className="py-3 px-4 border-b">{formatDate(approval.upload_date)}</td>
                        <td className="py-3 px-4 border-b">{approval.table_name}</td>
                        <td className="py-3 px-4 border-b">{approval.uploaded_by_name || approval.uploaded_by}</td>
                        <td className="py-3 px-4 border-b text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handlePreviewData(approval.id)}
                              disabled={processingId === approval.id}
                              className="px-3 py-1 rounded text-white bg-blue-600 hover:bg-blue-700"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => handleApprove(approval.id)}
                              disabled={processingId === approval.id}
                              className={`px-3 py-1 rounded text-white ${processingId === approval.id ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                              {processingId === approval.id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(approval.id)}
                              disabled={processingId === approval.id}
                              className={`px-3 py-1 rounded text-white ${processingId === approval.id ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'}`}
                            >
                              {processingId === approval.id ? 'Processing...' : 'Reject'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Custom Toast Notification */}
        {toast.show && (
          <div className={`fixed bottom-4 right-4 p-4 rounded shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 
            toast.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          } text-white`}>
            <div className="flex items-center">
              <div className="mr-3">
                {toast.type === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : toast.type === 'error' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="font-bold">{toast.title}</h3>
                <p className="text-sm">{toast.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Data Preview Modal */}
        <DataPreviewReference
          uploadId={selectedUploadId}
          isOpen={previewModalOpen}
          onClose={handleClosePreviewModal}
        />
      </Container>
    </>
  );
}