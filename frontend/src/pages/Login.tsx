import { Container } from "@/components/template/Container"
import DarkSwitch from "@/components/template/DarkSwitch"
import { SectionTitle } from "@/components/template/SectionTitle"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import API_BASE_URL from '@/config/apiConfig';
import { Eye, EyeOff } from "lucide-react";
import { isAuthenticated, isTokenExpired, getDecodedToken } from "@/utils/authUtils";

export default function Login() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.title = "Login | WindReact"

    // ตรวจสอบ Token ว่าหมดอายุหรือยัง
    const checkTokenExpiration = () => {
      if (isTokenExpired()) {
        console.log("⏳ Token expired, clearing credentials...");
        localStorage.removeItem("token");
        // ไม่ต้อง redirect เพราะอยู่ในหน้า Login อยู่แล้ว
      } else if (isAuthenticated()) {
        // ถ้า token ยังไม่หมดอายุและยังใช้งานได้ ให้ redirect ไปหน้า admin
        navigate("/admin");
      }
    }

    checkTokenExpiration(); // ตรวจสอบตอนเข้าเว็บ
    const interval = setInterval(checkTokenExpiration, 10 * 1000); // เช็คทุก 10 วินาที

    // กำหนด listener สำหรับการเปลี่ยนแปลงใน localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token") {
        checkTokenExpiration();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval); // ล้าง interval ตอนออกจากหน้า
      window.removeEventListener("storage", handleStorageChange); // ลบ event listener
    };
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Form submitted")
    // to login
    try {
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ User_email: email, User_password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token); // เก็บ Token เพียงอย่างเดียว โดยข้อมูล role จะอยู่ใน token
        alert("Login successful!");
        navigate("/admin"); // ไปหน้า Dashboard
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
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
                preTitle="Welcome back"
                title="Sign In"
                align="center"
              >
              </SectionTitle>
            </div>
            {/* Form Login */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4 rounded-md">
                {/* Email */}
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
                {/* Password */}
                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white pr-10"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={0}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgotpassword" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Sign in
                </button>
              </div>

              <div className="text-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
                <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  Sign up
                </Link>
              </div>
            </form>
          </div>
          
          {/* Dark Mode Switch */}
          <div className="flex justify-center mt-4">
            <DarkSwitch variant="default" />
          </div>
        </div>
      </Container>
    </div>
  )
}
