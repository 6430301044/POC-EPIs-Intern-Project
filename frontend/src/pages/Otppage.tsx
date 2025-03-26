import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import API_BASE_URL from "@/config/apiConfig";
import { Container } from "../components/template/Container";
import { SectionTitle } from "../components/template/SectionTitle";

export default function OtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/user/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Send cookies with the request
        body: JSON.stringify({ User_email: email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("OTP verified successfully!");
        navigate("/admin"); // Redirect to the admin page or dashboard
      } else {
        setError(data.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong during OTP verification.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Container>
        <div className="flex min-h-[80vh] items-center justify-center flex-col space-y-4">
          <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
            <div>
              <SectionTitle preTitle="Enter OTP" title="OTP Verification" align="center"></SectionTitle>
            </div>
            {/* OTP Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your OTP"
                />
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <div>
                <button
                  type="submit"
                  className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Verify OTP
                </button>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}
