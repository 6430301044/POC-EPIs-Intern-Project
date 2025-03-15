import { Container } from "@/components/template/Container";
import { SectionTitle } from "@/components/template/SectionTitle";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";  // ✅ ต้องใช้ Named Import
import { useNavigate } from "react-router-dom"; // สำหรับเปลี่ยนหน้

interface PendingApproval {
  Register_id: number;  
  User_name: string;
  User_email: string;
  User_phone: string;
  User_Job_Position: string;
  Company_id: string | null;
  Created_at: string;
}

export default function Approval() {
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const navigate = useNavigate(); //

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
    checkTokenExpiration();
    fetchPendingApprovals();
  }, []);

  const checkTokenExpiration = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("🚨 No token found! Redirecting to login...");
      navigate("/login"); // ✅ ถ้าไม่มี Token ให้ไปหน้า Login
      return false;
    }

    try {
      const decoded: any = jwtDecode(token); // ✅ ถอดรหัส JWT
      const currentTime = Date.now() / 1000; // แปลงเป็นวินาที
      console.log("⏳ Token Expires At:", decoded.exp);
      console.log("🕒 Current Time:", currentTime);

      if (decoded.exp < currentTime) {
        console.warn("🚨 Token expired! Redirecting to login...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login"); // ✅ ไปหน้า Login ถ้า Token หมดอายุ
        return false;
      }
      return true;
    } catch (error) {
      console.error("❌ Invalid token:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login"); // ✅ ไปหน้า Login ถ้า Token ไม่ถูกต้อง
      return false;
    }
  };


   const fetchPendingApprovals = async () => {
    if (!checkTokenExpiration()) return; // ❌ หยุดถ้า Token หมดอายุ

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/register/pending", {
        headers: {
          "Authorization": `Bearer ${token}`, // ✅ ส่ง Token ไปกับ API
          "Content-Type": "application/json"
        }
      });

      if (response.status === 401 || response.status === 403) {
        console.warn("🚨 Unauthorized! Redirecting to login...");
        navigate("/login");
        return;
      }

      const data = await response.json();
      setPendingApprovals(data || []);
    } catch (error) {
      console.error("❌ Failed to fetch pending approvals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (Register_id: number | undefined) => {
    if (!Register_id) return;
    if (!checkTokenExpiration()) return;

    setProcessingId(Register_id);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/register/approve/${Register_id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error("Failed to approve user");

      showToast("Success", "User approved successfully!", "success"); // ✅ แสดง Toast
      fetchPendingApprovals();
    } catch (error) {
      console.error("❌ Failed to approve user:", error);
      showToast("Error", "Failed to approve user!", "error");// ❌ แสดง Toast เมื่อผิดพลาด
    } finally {
      setProcessingId(null);
    }
  };
  
  // ✅ ฟังก์ชัน Reject (เช็ค Token ก่อน)
  const handleReject = async (Register_id: number | undefined) => {
    if (!Register_id) return;
    if (!checkTokenExpiration()) return; // ❌ หยุดถ้า Token หมดอายุ

    setProcessingId(Register_id);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/register/reject/${Register_id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error("Failed to reject user");

      showToast("Success", "User rejected successfully!", "warning"); // ✅ แสดง Toast
      fetchPendingApprovals();
    } catch (error) {
      console.error("❌ Failed to reject user:", error);
      showToast("Error", "Failed to reject user!", "error"); // ❌ แสดง Toast เมื่อผิดพลาด
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Container>
      <SectionTitle title="Approve User" align="center" />
      <div className="p-8">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Pending Approve</h2>
            <button onClick={fetchPendingApprovals} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" disabled={loading}>
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
            <div className="bg-gray-100 p-8 rounded text-center">
              <p className="text-gray-500">No pending approvals found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 border-b text-left">User Name</th>       
                    <th className="py-3 px-4 border-b text-left">Job Position</th>
                    <th className="py-3 px-4 border-b text-left">Company</th>
                    <th className="py-3 px-4 border-b text-left">Email</th>
                    <th className="py-3 px-4 border-b text-left">Phone</th>
                    <th className="py-3 px-4 border-b text-left">Date</th>
                    <th className="py-3 px-4 border-b text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApprovals.map((approval) => (
                    <tr key={approval.Register_id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">{approval.User_name}</td>
                      <td className="py-3 px-4 border-b">{approval.User_Job_Position}</td>
                      <td className="py-3 px-4 border-b">{approval.Company_id}</td>
                      <td className="py-3 px-4 border-b">{approval.User_email}</td>
                      <td className="py-3 px-4 border-b">{approval.User_phone}</td>
                      <td className="py-3 px-4 border-b">
                          {new Date(approval.Created_at).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })}
                        </td>
                      <td className="py-3 px-4 border-b text-center">
                        <div className="flex justify-center space-x-2">
                          <button onClick={() => handleApprove(approval.Register_id)} disabled={processingId === approval.Register_id} className={`px-3 py-1 rounded text-white ${processingId === approval.Register_id ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}>
                            {processingId === approval.Register_id ? 'Processing...' : 'Approve'}
                          </button>
                          <button onClick={() => handleReject(approval.Register_id)} disabled={processingId === approval.Register_id} className={`px-3 py-1 rounded text-white ${processingId === approval.Register_id ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'}`}>
                            {processingId === approval.Register_id ? 'Processing...' : 'Reject'}
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

      {toast.show && (
        <div className={`fixed bottom-4 right-4 p-4 rounded shadow-lg ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'} text-white`}>
          <h3 className="font-bold">{toast.title}</h3>
          <p>{toast.message}</p>
        </div>
      )}
    </Container>
  );
}
