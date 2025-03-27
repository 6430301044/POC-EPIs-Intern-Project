import { Container } from "@/components/template/Container"
import DarkSwitch from "@/components/template/DarkSwitch"
import { SectionTitle } from "@/components/template/SectionTitle"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import API_BASE_URL from '@/config/apiConfig';

export default function Forgotpassword() {
  // const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    document.title = "Forgot Password | WindReact"
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType("success");
        setMessage("Password reset link has been sent to your email.");
        // อาจจะเพิ่มการ redirect หลังจากส่งอีเมลสำเร็จ
        // setTimeout(() => navigate("/login"), 3000);
      } else {
        setMessageType("error");
        setMessage(data.message || "Failed to send reset link. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessageType("error");
      setMessage("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Container>
        {/* Back to Home Button */}
        <div className="py-4 flex justify-center">
          <Link 
            to="/" 
            className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="flex min-h-[80vh] items-center justify-center flex-col space-y-4">
          <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
            <div>
              <SectionTitle
                preTitle="Reset password"
                title="Forgot Password"
                align="center"
              >
                Enter your email address and we'll send you a link to reset your password.
              </SectionTitle>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4 rounded-md">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-md ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {message}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </div>

              <div className="text-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Remember your password? </span>
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  Back to login
                </Link>
              </div>
            </form>
          </div>
          
          {/* Dark Mode Switch */}
          <div className="flex justify-center">
            <DarkSwitch />
          </div>
        </div>
      </Container>
    </div>
  )
}
