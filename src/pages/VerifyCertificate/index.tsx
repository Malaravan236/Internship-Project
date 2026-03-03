import React, { useState } from "react";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000/api";

export default function VerifyCertificate() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [msg, setMsg] = useState("");

  const verify = async () => {
    if (!token.trim()) {
      setMsg("❌ Enter verify token");
      return;
    }

    setLoading(true);
    setMsg("");
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/certificates/verify/${token.trim()}/`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.detail || "Invalid token");
      setResult(data);
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h2>Verify Certificate</h2>
      <p>Paste verify token and check validity.</p>

      <input
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Enter verify token..."
        style={{ width: "100%", padding: 12, marginTop: 10 }}
      />

      <button
        onClick={verify}
        disabled={loading}
        style={{ width: "100%", padding: 12, marginTop: 12 }}
      >
        {loading ? "Verifying..." : "Verify"}
      </button>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}

      {result && (
        <div style={{ marginTop: 16, border: "1px solid #ddd", padding: 12 }}>
          <p>
            <b>Valid:</b> ✅ {String(result.valid)}
          </p>
          <p>
            <b>Certificate No:</b> {result.certificate_no}
          </p>
          <p>
            <b>Issued At:</b> {result.issued_at}
          </p>
          <p>
            <b>Student:</b> {result.student_name}
          </p>
          <p>
            <b>Internship:</b> {result.internship_title}
          </p>
        </div>
      )}
    </div>
  );
}
