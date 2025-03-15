import { Container } from "@/components/template/Container"
import DarkSwitch from "@/components/template/DarkSwitch"
import { SectionTitle } from "@/components/template/SectionTitle"
import { Link } from "react-router"
import { useState, useEffect } from "react";
import { Eye, EyeOff }  from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jwtDecode }  from 'jwt-decode';



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // ✅ **ตรวจสอบ Token ว่าหมดอายุหรือยัง**
  useEffect(() => {
    console.log("Checking token expiration...");
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token);
      if (token) {
        try {
          const decoded: any = jwtDecode(token); // Decode JWT
          const currentTime = Date.now() / 1000; // เวลาปัจจุบัน (วินาที)
          console.log("Current Time:", currentTime);
          console.log("Token Expiry (exp):", decoded.exp);
  
          if (decoded.exp < currentTime) {
            console.log("⏳ Token expired, redirecting to login...");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login"); // พาไปหน้า Login
          }
        } catch (error) {
          console.error("❌ Invalid token:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }
      }
    }
  
    checkTokenExpiration(); // ตรวจสอบตอนเข้าเว็บ
    const interval = setInterval(checkTokenExpiration, 1000); // เช็คทุก 1 นาที
  
    // กำหนด listener สำหรับการเปลี่ยนแปลงใน localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token" || event.key === "user") {
        checkTokenExpiration();
      }
    };
  
    window.addEventListener("storage", handleStorageChange);
  
    return () => {
      clearInterval(interval); // ล้าง interval ตอนออกจากหน้า
      window.removeEventListener("storage", handleStorageChange); // ลบ event listener
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting Login:", { email, password });

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ User_email: email, User_password: password }),
      });

      console.log("Response Status:", response.status);

      let data;
      try {
        data = await response.json(); // อ่าน JSON
      } catch (jsonError) {
        console.error("Failed to parse JSON response");
        const text = await response.text(); // อ่านเป็นข้อความดิบ
        console.error("Response Text:", text);
        throw new Error("Invalid server response");
      }

      console.log("Response Data:", data);

      if (response.ok) {
        alert("Login successful!");

        // Decode token
        const decodedToken = jwtDecode(data.token);

        // บันทึก token และข้อมูลที่เกี่ยวข้องลงใน localStorage
        localStorage.setItem("token", data.token); // ใส่ token ลงใน localStorage
        localStorage.setItem("user", JSON.stringify({
          userId: decodedToken.userId,
          name: decodedToken.name,
          email: decodedToken.email
        }));

        const user = decodedToken;
        console.log("Logged in user:", user);

        navigate("/admin");
      } else {
        alert(data.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Container>
        <div className="flex min-h-[80vh] items-center justify-center flex-col space-y-4">
          <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
            {/* Back to Home Button */}
            <div className="flex justify-start">
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
            <div>
              <SectionTitle preTitle="Welcome back" title="Sign In" align="center" />
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
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative w-full">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"} // Toggle text/password
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white pr-10"
                      placeholder="password"
                    />
                    {/* ปุ่ม Toggle สำหรับแสดง/ซ่อนรหัสผ่าน */}
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

              {/* Remember Me & Forgot Password */}
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

              {/* Sign In Button */}
              <div>
                <button
                  type="submit"
                  className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Sign in
                </button>
              </div>

              {/* Register Link */}
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
            <DarkSwitch />
          </div>
        </div>
      </Container>
    </div>
  );
}
