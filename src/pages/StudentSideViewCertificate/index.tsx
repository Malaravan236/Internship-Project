import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000/api";

// ✅ Backend root for serving media (remove trailing /api)
const BACKEND_ROOT =
  API_BASE.endsWith("/api") ? API_BASE.slice(0, -4) : API_BASE;

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function StudentSideViewCertificate() {
  const q = useQuery();
  const applicationId = Number(q.get("applicationId") || 0);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [cert, setCert] = useState<any>(null);

  const load = async () => {
    if (!applicationId) {
      setMsg("❌ applicationId missing. Example: /certificate?applicationId=12");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setMsg("❌ Please login first (JWT token missing).");
      return;
    }

    setLoading(true);
    setMsg("");
    setCert(null);

    try {
      const res = await fetch(`${API_BASE}/certificates/my/${applicationId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Certificate not available");
      setCert(data);
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const pdfUrl =
    cert?.pdf
      ? cert.pdf.startsWith("http")
        ? cert.pdf
        : `${BACKEND_ROOT}${cert.pdf}`
      : null;

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h2>My Certificate</h2>

      <button
        onClick={load}
        disabled={loading}
        style={{ width: "100%", padding: 12, marginTop: 12 }}
      >
        {loading ? "Loading..." : "Load Certificate"}
      </button>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}

      {cert && (
        <div style={{ marginTop: 16, border: "1px solid #ddd", padding: 12 }}>
          <p>
            <b>Certificate No:</b> {cert.certificate_no}
          </p>
          <p>
            <b>Issued At:</b> {cert.issued_at}
          </p>
          <p>
            <b>Verify Token:</b> {cert.verify_token}
          </p>

          {pdfUrl ? (
            <a href={pdfUrl} target="_blank" rel="noreferrer">
              ✅ Download PDF
            </a>
          ) : cert.pdf_url ? (
            <a href={cert.pdf_url} target="_blank" rel="noreferrer">
              ✅ Open Certificate Link
            </a>
          ) : (
            <p>PDF not generated (reportlab install check).</p>
          )}

          {cert?.verify_token && (
  <a
    href={`/verify-certificate`}
    style={{ display: "inline-block", marginLeft: 12 }}
  >
    🔍 Verify
  </a>
)}

        </div>
      )}
    </div>
  );
}
