import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000/api";

type RegisterResponse = {
  access?: string;
  refresh?: string;
  user?: { id: string | number; username?: string; email?: string };
  detail?: string;
  message?: string;
};

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timer: any;
    if (showSuccessPopup) {
      timer = setTimeout(() => {
        setShowSuccessPopup(false);
        navigate("/login");
      }, 1500);
    }
    return () => timer && clearTimeout(timer);
  }, [showSuccessPopup, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!username.trim()) return setError("Username is required");
    if (!email.trim()) return setError("Email is required");
    if (!/\S+@\S+\.\S+/.test(email)) return setError("Please enter a valid email");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirmPassword) return setError("Passwords do not match");

    setIsLoading(true);

    try {
      // ✅ Change endpoint if your backend uses a different path
      const res = await fetch(`${API_BASE}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      let data: RegisterResponse | any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        // Handle DRF validation errors {field:["msg"]}
        if (data && typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          const firstVal = (data as any)[firstKey];
          const msg =
            Array.isArray(firstVal) ? firstVal[0] : data.detail || data.message || "Signup failed";
          setError(`${firstKey}: ${msg}`);
        } else {
          setError("Signup failed. Please try again.");
        }
        return;
      }

      // ✅ Store token + user (if backend sends it)
      if (data?.access) localStorage.setItem("access_token", data.access);
      if (data?.refresh) localStorage.setItem("refresh_token", data.refresh);

      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        // fallback
        localStorage.setItem("user", JSON.stringify({ username, email }));
      }

      setSuccessMessage(`Account created successfully! Welcome, ${username}!`);
      setShowSuccessPopup(true);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Firebase இல்லாம google login வேண்டும்னா backend OAuth வேண்டும்.
    // இப்போதைக்கு disable.
    setError("Google signup is not enabled (Firebase removed).");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6 pt-20">
      {showSuccessPopup && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg max-w-md">
          <div className="flex items-center p-4 border-l-4 border-emerald-500">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">{successMessage}</p>
            </div>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="ml-auto pl-3 text-gray-400 hover:text-gray-600"
              aria-label="close"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left Panel */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-10 flex flex-col justify-center items-center md:w-1/2">
          <h1 className="text-4xl font-bold mb-4">Intern Connect</h1>
          <p className="text-lg text-center mb-8">
            Join our community and unlock your career potential.
          </p>
          <div className="bg-white bg-opacity-10 p-6 rounded-lg">
            <p className="italic mb-4">
              "Signing up was the best career decision I made this year."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full mr-4" />
              <div>
                <p className="font-semibold">Michael Chen</p>
                <p className="text-sm">Software Developer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="p-10 flex flex-col justify-center md:w-1/2">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
            <p className="text-gray-600">Join Intern Connect today</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex items-center">
                  <AlertTriangle className="text-red-500 mr-3" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full flex justify-center items-center bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 transition ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-300" />
              <span className="mx-4 text-gray-500">or</span>
              <div className="flex-grow border-t border-gray-300" />
            </div>

            <button
              type="button"
              className={`w-full flex items-center justify-center bg-white border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 transition ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
              onClick={handleGoogleSignup}
              disabled={isLoading}
            >
              Continue with Google (Disabled)
            </button>

            <div className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{" "}
              <a href="/login" className="text-teal-500 hover:text-teal-600">
                Log in
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
