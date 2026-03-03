import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// If you want Google login, keep it. Otherwise remove it.
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

type Mode = "login" | "signup";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");

  // This field will be sent as "username" to Django
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // signup extra (frontend only UI)
  const [username, setUsername] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const title = useMemo(
    () => (mode === "login" ? "Welcome Back" : "Create Account"),
    [mode]
  );

  const saveAuthAndGo = (user: any, tokens?: { access?: string; refresh?: string }) => {
    if (tokens?.access) localStorage.setItem("access_token", tokens.access);
    if (tokens?.refresh) localStorage.setItem("refresh_token", tokens.refresh);

    localStorage.setItem("user", JSON.stringify(user));
    window.dispatchEvent(new Event("authStateChanged"));
    navigate("/");
  };

  const postJson = async (url: string, body: any) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.detail || data?.message || "Something went wrong";
      throw new Error(msg);
    }
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        // ✅ SimpleJWT token
        const tokenData = await postJson(`${API_BASE}/token/`, {
          username: email, // user types Django username here
          password,
        });

        // ✅ Store tokens + user
        saveAuthAndGo(
          { username: email }, // show this in navbar
          { access: tokenData.access, refresh: tokenData.refresh }
        );
      } else {
        /**
         * IMPORTANT:
         * Your backend currently DOES NOT have /register/ endpoint (most projects only have /token/).
         * So signup will fail unless you implement register in Django.
         *
         * Quick workaround:
         * - Create user in Django admin / createsuperuser and add users
         * - Then login works
         */
        throw new Error(
          "Signup API not available in backend. Create user in Django admin first."
        );

        // If you later create register endpoint, use:
        // const data = await postJson(`${API_BASE}/register/`, { username, email, password });
        // saveAuthAndGo(data, { access: data.access, refresh: data.refresh });
      }
    } catch (err: any) {
      setError(err?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // Google login (needs correct clientId setup + backend verify endpoint)
  const handleGoogleSuccess = async (cred: CredentialResponse) => {
    setError("");
    setLoading(true);

    try {
      const idToken = cred.credential;
      if (!idToken) throw new Error("Google token missing");

      // You need backend endpoint to verify Google token and return JWT
      const data = await postJson(`${API_BASE}/google-login/`, { token: idToken });

      saveAuthAndGo(
        { username: data?.username || "Google User", email: data?.email },
        { access: data?.access, refresh: data?.refresh }
      );
    } catch (err: any) {
      setError(err?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* LEFT */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-10 text-white flex flex-col justify-center">
          <h1 className="text-5xl font-bold mb-4">Intern Connect</h1>
          <p className="text-emerald-50 text-lg mb-8">
            Transform your workflow with our powerful platform.
          </p>
        </div>

        {/* RIGHT */}
        <div className="p-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  mode === "login" ? "bg-white shadow text-gray-900" : "text-gray-600"
                }`}
                onClick={() => setMode("login")}
                type="button"
              >
                Login
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  mode === "signup" ? "bg-white shadow text-gray-900" : "text-gray-600"
                }`}
                onClick={() => setMode("signup")}
                type="button"
              >
                Sign up
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Google */}
          <div className="mb-6">
            <div className="w-full flex justify-center md:justify-start">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google login failed")}
                useOneTap={false}
              />
            </div>
            <div className="flex items-center gap-3 my-5">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-xs text-gray-500">OR</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username (Django)
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: malaravan"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
              type="submit"
            >
              {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
            </button>
          </form>

          {mode === "signup" && (
            <p className="text-xs text-gray-500 mt-3">
              * Signup work aaganu na backend-la /register/ endpoint irukkanum.
              Ippo quick fix: Django admin-la user create pannitu login pannunga.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
