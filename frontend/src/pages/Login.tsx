import { Container } from "@/components/template/Container"
import DarkSwitch from "@/components/template/DarkSwitch"
import { SectionTitle } from "@/components/template/SectionTitle"
import { Link, useNavigate } from "react-router"
import { useState, useEffect } from "react";


export default function Login() {
  const navigate = useNavigate();
  

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  useEffect(() => {
    document.title = "Login | WindReact";
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token); // เก็บ Token
        alert("Login successful!");
        navigate("/dashboard"); // ไปหน้า Dashboard
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
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your password"
                  />
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
            <DarkSwitch />
          </div>
        </div>
      </Container>
    </div>
  );
}