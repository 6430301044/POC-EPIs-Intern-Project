import { Container } from "@/components/template/Container"
import DarkSwitch from "@/components/template/DarkSwitch"
import { SectionTitle } from "@/components/template/SectionTitle"
import { useEffect, useState, useCallback } from "react"
import { Link, useNavigate } from "react-router"
import API_BASE_URL from '@/config/apiConfig';
import { Eye, EyeOff, CheckCircle, XCircle, Circle } from "lucide-react";
import { AxiosError } from 'axios';
import { FetchError } from 'node-fetch';

export default function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Register | WindReact"
  }, [])
  
  // State
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [companies, setCompanies] = useState<Array<{company_id: number, companyName: string}>>([]);
  const [jobPosition, setJobPosition] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  // สร้าง union type สำหรับข้อผิดพลาดจาก API
  type ApiError = AxiosError | FetchError;
  
  // สร้าง type guard function เพื่อตรวจสอบว่า error เป็น ApiError หรือไม่
  function isApiError(error: unknown): error is ApiError {
    return (
      error instanceof Error && 
      ('isAxiosError' in error || 'type' in error)
    );
  }
  
  // Fetch companies for dropdown
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/companies`);
        if (!response.ok) {
          throw new Error("Failed to fetch companies");
        }
        const data = await response.json();
        if (data.success && data.data) {
          setCompanies(data.data);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    
    fetchCompanies();
  }, []);

  const [passwordValidations, setPasswordValidations] = useState({
    lowercase: false,
    uppercase: false,
    number: false,
    length: false,
    typed: false,
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
      User_phone: phone,
      Company_id: companyId,
      User_Job_Position: jobPosition,
      User_password: password,
    };

    try {
      // สมัครสมาชิก
      const response = await fetch(`${API_BASE_URL}/user/register`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
  
      // ตรวจสอบ response
      if (!response.ok) {
        throw new Error("Failed to register.");
      }
  
      alert("Registration successful!");
      navigate("/login"); // ไปหน้า Login หลังสมัครเสร็จ
  
    } catch (error: unknown) {
      if (isApiError(error)) {
        console.error("Error:", error.message);
        alert("Something went wrong: " + error.message);
      } else {
        console.error("Unknown error:", error);
        alert("Something went wrong. Please try again.");
      }
    }
  };

  const validateForm = useCallback(() => {
    const isValid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    email.trim() !== "" &&
    phone.trim() !== "" &&
    companyId !== null &&
    jobPosition.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    password === confirmPassword &&
    !passwordError &&
    termsAccepted;
    setIsFormValid(isValid);
    }, [firstName, lastName, email, phone, companyId, jobPosition, password, confirmPassword, passwordError, termsAccepted]);
    
    useEffect(() => {
    validateForm();
    }, [validateForm]);

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
                preTitle="Create account"
                title="Sign Up"
                align="center"
              >
              </SectionTitle>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4 rounded-md">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your last name"
                    />
                  </div>
                
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

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company
                  </label>
                  <select
                    id="companyId"
                    name="companyId"
                    value={companyId || ""}
                    onChange={(e) => setCompanyId(e.target.value ? parseInt(e.target.value) : null)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a company</option>
                    {companies.map((company) => (
                      <option key={company.company_id} value={company.company_id}>
                        {company.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="jobPosition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Position
                  </label>
                  <input
                    id="jobPosition"
                    name="jobPosition"
                    type="text"
                    value={jobPosition}
                    onChange={(e) => setJobPosition(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your job position"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative w-full">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
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

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${
                      passwordError ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-indigo-500"
                    }`}
                    placeholder="Confirm Your Password"
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
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  I agree to the <Link to="/terms" className="text-indigo-600 hover:text-indigo-500">Terms</Link> and <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</Link>
                </label>
              </div>

              <div>
                <button
                  disabled={!isFormValid} 
                  type="submit"
                  className={`group relative flex w-full justify-center rounded-lg ${isFormValid ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 cursor-not-allowed"} px-4 py-2 text-sm font-medium text-white  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
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