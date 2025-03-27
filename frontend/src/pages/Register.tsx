import { Container } from "@/components/template/Container"
import DarkSwitch from "@/components/template/DarkSwitch"
import { SectionTitle } from "@/components/template/SectionTitle"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import { Eye, EyeOff, CheckCircle, XCircle, Circle }  from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Register | WindReact";
  }, []);

  // State
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobPosition, setJobPosition] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // const expreess = require("express") ;
  // const bcrypt = require("bcryptjs") ;
  // const sql = require("mssql");
  // require("dotenv").config() ;
  

  // const router = express.Router();

  // const dbConfig = { 
  //   user: episadmin,
  //   password: 7CzuNu6pVPnq9xu,
  //   server: epis.database.windows.net,
  //   database: POC-EPIs,
  //   option: {
  //     encrypt: true,
  //     enableArithAbort: true,
  //   },
  // };

  const [passwordValidations, setPasswordValidations] = useState({
    lowercase: false,
    uppercase: false,
    number: false,
    length: false,
    typed: false, // เพิ่ม state ตรวจสอบว่ามีการพิมพ์รหัสผ่านหรือยัง
  });

  // เช็คเงื่อนไขการตั้งรหัสผ่าน
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
  
    setPasswordValidations({
      lowercase: /[a-z]/.test(newPassword),
      uppercase: /[A-Z]/.test(newPassword),
      number: /\d/.test(newPassword),
      length: newPassword.length >= 8 && newPassword.length <= 32,
      typed: newPassword.length > 0,
  });
};

  // ฟังก์ชันเลือกสีของข้อความ
  const getTextColor = (isValid: boolean, isTyped: boolean) => {
    if (!isTyped) return "text-gray-700 dark:text-gray-400"; // ยังไม่พิมพ์ -> สีดำ/เทา
    return isValid ? "text-green-500" : "text-red-500"; // ผ่าน -> เขียว / ไม่ผ่าน -> แดง
  };

  // ฟังก์ชันเลือกไอคอน
  const getIcon = (isValid: boolean, isTyped: boolean) => {
    if (!isTyped) return <Circle size={16} className="text-gray-500" />; // ยังไม่พิมพ์ -> วงกลมสีเทา
    return isValid ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />;
  };

  // ตรวจสอบรหัสผ่าน
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
  
    if (!newConfirmPassword) { // ถ้ายังไม่ได้พิมพ์อะไรเลย
      setPasswordError(""); // ไม่แสดง error
    } 
    else if (password && newConfirmPassword !== password) {
      setPasswordError("Passwords do not match!"); // แสดง error
    } 
    else {
      setPasswordError(""); // ล้าง error ถ้าถูกต้อง
    }
  };

  // ฟังก์ชันส่งฟอร์ม
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // เช็คว่ารหัสผ่านไม่ตรงกัน
    if (passwordError || password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // รวมชื่อเป็น User_Name
    const userName = `${firstName} ${lastName}`;
    const userData = {
      User_name: userName,
      User_email: email,
      User_Phone: phone,
      User_Job_Position: jobPosition,
      User_password: password, // **ควรเข้ารหัสฝั่ง Backend**
    };

    try {
      // เช็คอีเมลซ้ำก่อนสมัคร
      const checkResponse = await fetch(`http://localhost:5000/api/check-email?email=${email}`);
      const checkData = await checkResponse.json();

      if (checkResponse.ok && checkData.exists) {
        alert("Email นี้เคยสมัครไว้แล้ว");
        return;
      }

      // สมัครสมาชิก
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful!");
        navigate("/login"); // ไปหน้า Login หลังสมัครเสร็จ
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Container>
        <div className="flex min-h-[80vh] items-center justify-center flex-col space-y-4">
          <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
            <div>
              {/* Back to Home Button */}
              <div className=" flex justify-start">
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
              <SectionTitle
                preTitle="Create account"
                title="Sign Up"
                align="center"
              >
              </SectionTitle>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="ชื่อ"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="นามสกุล"
                    />
                  </div>
                </div>

                {/* Email */}
                 <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="อีเมล"
                  />
                </div>

                 {/* Job Position */}
                 <div>
                  <label htmlFor="jobPosition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Position
                  </label>
                  <input
                    id="jobPosition"
                    type="text"
                    value={jobPosition}
                    onChange={(e) => setJobPosition(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="ตำแหน่งงาน"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="Phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="Phone"
                    type="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="เบอร์โทร"
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
                      onChange={handlePasswordChange}
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
                  <ul className="mt-2 text-sm space-y-1">
                    <li className={`flex items-center gap-2 ${getTextColor(passwordValidations.lowercase, passwordValidations.typed)}`}>
                      {getIcon(passwordValidations.lowercase, passwordValidations.typed)}
                      Must contain at least one lowercase letter
                    </li>
                    <li className={`flex items-center gap-2 ${getTextColor(passwordValidations.uppercase, passwordValidations.typed)}`}>
                      {getIcon(passwordValidations.uppercase, passwordValidations.typed)}
                      Must contain at least one uppercase letter
                    </li>
                    <li className={`flex items-center gap-2 ${getTextColor(passwordValidations.number, passwordValidations.typed)}`}>
                      {getIcon(passwordValidations.number, passwordValidations.typed)}
                      Must contain one number
                    </li>
                    <li className={`flex items-center gap-2 ${getTextColor(passwordValidations.length, passwordValidations.typed)}`}>
                      {getIcon(passwordValidations.length, passwordValidations.typed)}
                      Must be between 8-32 characters
                    </li>
                  </ul>
                </div>


                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange} // เช็คแบบเรียลไทม์
                    required
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${
                      passwordError ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-indigo-500"
                    }`}
                    placeholder="confirm Password"
                  />
                  {/* แสดงข้อความผิดพลาด ถ้ารหัสผ่านไม่ตรงกัน */}
                  {passwordError && <p className="mt-1 text-sm text-red-500">{passwordError}</p>}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  I agree to the <Link to="/terms" className="text-indigo-600 hover:text-indigo-500">Terms</Link> and <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</Link>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Create Account
                </button>
              </div>

              <div className="text-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  Sign in
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