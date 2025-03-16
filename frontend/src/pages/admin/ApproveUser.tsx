import { Container } from "@/components/template/Container";
import { SectionTitle } from "@/components/template/SectionTitle";
import { useState, useEffect } from "react";
import API_BASE_URL from '@/config/apiConfig';
import { hasEditPermission } from '@/utils/authUtils';

interface PendingApproval {
  Register_id: number;  
  User_name: string;
  User_email: string;
  User_phone: string;
  User_Job_Position: string;
  Company_id: string | null;
}

export default function ApproveUser() {
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ show: boolean; title: string; message: string; type: 'success' | 'error' | 'warning' }>({
    show: false,
    title: '',
    message: '',
    type: 'success'
});

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ show: true, title, message, type });

    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/user/register/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      console.log("API Response:", data);

      setPendingApprovals(data.data || []);
    } catch (error) {
      showToast("Error", "Failed to load pending approvals", "error");
      console.error("Error fetching pending approvals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (Register_id: number | undefined) => {
    if (Register_id === undefined || Register_id === null) {
      showToast("Error", "User ID is missing", "error");
      return;
    }

    setProcessingId(Register_id);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/user/register/approve/${Register_id}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to approve user");

      showToast("Success", "User approved successfully", "success");
      fetchPendingApprovals();
    } catch (error) {
      showToast("Error", "Failed to approve user", "error");
      console.error("Error approving user:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (Register_id: number | undefined) => {
    if (Register_id === undefined || Register_id === null) {
      showToast("Error", "User ID is missing", "error");
      return;
    }

    setProcessingId(Register_id);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/user/register/reject/${Register_id}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to reject user");

      showToast("Success", "User rejected successfully", "success");
      fetchPendingApprovals();
    } catch (error) {
      showToast("Error", "Failed to reject user", "error");
      console.error("Error rejecting user:", error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Container>
      <SectionTitle title="User Approval" align="center" />
      <div className="p-8">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Pending User Approvals</h2>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">รายการผู้ใช้ที่รอการอนุมัติ</h2>
              {hasEditPermission() && (
                <button onClick={fetchPendingApprovals} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังโหลด...
                    </span>
                  ) : 'รีเฟรช'}
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : pendingApprovals.length === 0 ? (
            <div className="bg-gray-100 p-8 rounded text-center">
              <p className="text-gray-500">No pending approvals found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 border-b text-left">User Name</th>
                    <th className="py-3 px-4 border-b text-left">Email</th>
                    <th className="py-3 px-4 border-b text-left">Phone</th>
                    <th className="py-3 px-4 border-b text-left">Job Position</th>
                    <th className="py-3 px-4 border-b text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApprovals.map((approval) => (
                    <tr key={approval.Register_id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">{approval.User_name}</td>
                      <td className="py-3 px-4 border-b">{approval.User_email}</td>
                      <td className="py-3 px-4 border-b">{approval.User_phone}</td>
                      <td className="py-3 px-4 border-b">{approval.User_Job_Position}</td>
                      <td className="py-3 px-4 border-b text-center">
                        {hasEditPermission() && (
                          <div className="flex justify-center space-x-2">
                            <button onClick={() => handleApprove(approval.Register_id)} disabled={processingId === approval.Register_id} className={`px-3 py-1 rounded text-white ${processingId === approval.Register_id ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}>
                              {processingId === approval.Register_id ? 'Processing...' : 'Approve'}
                            </button>
                            <button onClick={() => handleReject(approval.Register_id)} disabled={processingId === approval.Register_id} className={`px-3 py-1 rounded text-white ${processingId === approval.Register_id ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'}`}>
                              {processingId === approval.Register_id ? 'Processing...' : 'Reject'}
                            </button>
                          </div>
                        )}
                        {!hasEditPermission() && (
                          <span className="text-gray-500">ไม่มีสิทธิ์ดำเนินการ</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {toast.show && (
        <div className={`fixed bottom-4 right-4 p-4 rounded shadow-lg ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'} text-white`}>
          <h3 className="font-bold">{toast.title}</h3>
          <p>{toast.message}</p>
        </div>
      )}
    </Container>
  );
}