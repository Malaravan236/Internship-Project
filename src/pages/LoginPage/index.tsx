import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000/api";

export default function LoginPage() {
  const navigate = useNavigate();

  // user types Django username here
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

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
      const msg = data?.detail || data?.message || "Invalid credentials";
      throw new Error(msg);
    }
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ SimpleJWT token
      const tokenData = await postJson(`${API_BASE}/token/`, {
        username,
        password,
      });

      // ✅ Store tokens + user
      saveAuthAndGo(
        { username }, // show this in navbar
        { access: tokenData.access, refresh: tokenData.refresh }
      );
    } catch (err: any) {
      setError(err?.message || "Invalid credentials");
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Welcome Back</h2>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username (Django)
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: malaravan"
                autoComplete="username"
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
                autoComplete="current-password"
                required
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
              type="submit"
            >
              {loading ? "Please wait..." : "Log In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}