import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000/api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Studentreview() {
  const q = useQuery();
  const navigate = useNavigate();

  // URL: /studentreview?applicationId=12
  const applicationId = Number(q.get("applicationId") || 0);

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async () => {
    if (!applicationId) {
      setMsg("❌ applicationId missing. Example: /studentreview?applicationId=12");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setMsg("❌ Please login first (JWT token missing).");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${API_BASE}/feedback/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          application_id: applicationId,
          rating,
          comment,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Feedback failed");

      setMsg("✅ Feedback submitted! Certificate generated.");
      setTimeout(() => {
        navigate(`/certificate?applicationId=${applicationId}`);
      }, 700);
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "24px auto", padding: 16 }}>
      <h2>Internship Feedback</h2>
      <p>Internship complete ஆன பிறகு மட்டும் feedback submit செய்ய முடியும்.</p>

      <div style={{ marginTop: 12 }}>
        <label>Application ID</label>
        <input
          value={applicationId || ""}
          readOnly
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <label>Rating</label>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              onClick={() => setRating(r)}
              style={{
                padding: 10,
                border: "1px solid #ddd",
                background: rating === r ? "#eee" : "#fff",
                cursor: "pointer",
              }}
              type="button"
            >
              <Star size={18} /> {r}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Your experience..."
          style={{ width: "100%", padding: 10, marginTop: 6, minHeight: 120 }}
        />
      </div>

      <button
        onClick={submit}
        disabled={loading}
        style={{
          marginTop: 14,
          width: "100%",
          padding: 12,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}
