import React, { useEffect, useMemo, useState } from "react";

type Props = {
  applicationId: number;
};

const API_BASE = "http://127.0.0.1:8000/api";
const FILE_BASE = "http://127.0.0.1:8000"; // for /media/...

export default function FeedbackAndCertificate({ applicationId }: Props) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>("");
  const [err, setErr] = useState<string>("");

  const [pdfPath, setPdfPath] = useState<string | null>(null); // "/media/certificates/....pdf"
  const [verifyToken, setVerifyToken] = useState<string | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState<boolean>(false);

  const accessToken = useMemo(() => localStorage.getItem("access_token"), []);

  // ✅ 1) Page load -> already certificate iruka check pannuvom
  useEffect(() => {
    const fetchCertificateIfExists = async () => {
      setErr("");
      setMsg("");

      const token = localStorage.getItem("access_token");
      if (!token) {
        setErr("Please login again.");
        return;
      }

      try {
        const res = await fetch(
          `${API_BASE}/certificates/my/${applicationId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // If certificate not ready -> 404 is ok
        if (res.status === 404) return;

        if (res.status === 401) {
          setErr("Session expired. Please login again.");
          return;
        }

        const data = await res.json();
        if (res.ok && data?.pdf) {
          setPdfPath(data.pdf);
          setVerifyToken(data.verify_token ?? null);
          setAlreadySubmitted(true); // already created => feedback submitted earlier
          setMsg("Certificate is already available.");
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchCertificateIfExists();
  }, [applicationId]);

  // ✅ 2) Submit feedback -> backend response la pdf varum -> button show pannuvom
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    const token = localStorage.getItem("access_token");
    if (!token) {
      setErr("Please login again.");
      return;
    }

    setLoading(true);
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

      const data = await res.json();

      if (!res.ok) {
        // Backend returns: {detail: "..."} sometimes
        const message =
          data?.detail ||
          data?.internship ||
          "Failed to submit feedback. Please try again.";
        setErr(typeof message === "string" ? message : JSON.stringify(message));

        // If already submitted -> still try fetch certificate
        if (
          typeof data?.detail === "string" &&
          data.detail.toLowerCase().includes("already")
        ) {
          setAlreadySubmitted(true);
        }
        return;
      }

      // Success
      setMsg(data?.message || "Feedback submitted!");
      setAlreadySubmitted(true);

      const cert = data?.certificate;
      if (cert?.pdf) setPdfPath(cert.pdf);
      if (cert?.verify_token) setVerifyToken(cert.verify_token);
    } catch (e) {
      console.error(e);
      setErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadUrl = pdfPath ? `${FILE_BASE}${pdfPath}` : null;
  const verifyUrl = verifyToken
    ? `${FILE_BASE}/api/certificates/verify/${verifyToken}/`
    : null;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10 }}>
        Submit Feedback & Get Certificate
      </h1>

      {alreadySubmitted && (
        <div
          style={{
            background: "#fdecec",
            color: "#b42318",
            padding: 14,
            borderRadius: 10,
            marginBottom: 16,
          }}
        >
          Feedback already submitted.
        </div>
      )}

      {msg && (
        <div
          style={{
            background: "#eaffea",
            color: "#1a7f37",
            padding: 14,
            borderRadius: 10,
            marginBottom: 16,
          }}
        >
          {msg}
        </div>
      )}

      {err && (
        <div
          style={{
            background: "#fdecec",
            color: "#b42318",
            padding: 14,
            borderRadius: 10,
            marginBottom: 16,
          }}
        >
          {err}
        </div>
      )}

      {/* ✅ Certificate area */}
      {downloadUrl && (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
            marginBottom: 18,
          }}
        >
          <h3 style={{ margin: 0, marginBottom: 10, fontWeight: 800 }}>
            🎉 Your certificate is ready
          </h3>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "#059669",
                color: "white",
                padding: "10px 14px",
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Download / View PDF
            </a>

            {verifyUrl && (
              <a
                href={verifyUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: "#0ea5e9",
                  color: "white",
                  padding: "10px 14px",
                  borderRadius: 10,
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Verify Certificate
              </a>
            )}
          </div>

          <p style={{ marginTop: 10, color: "#6b7280" }}>
            Note: If the PDF doesn’t open, ensure Django is serving media in
            DEBUG mode (config/urls.py static(media)).
          </p>
        </div>
      )}

      {/* ✅ Feedback form */}
      <form onSubmit={handleSubmit}>
        <label style={{ fontWeight: 700 }}>Rating (1-5)</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          style={{
            width: "100%",
            padding: 12,
            marginTop: 6,
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            marginBottom: 16,
          }}
          disabled={loading || !!pdfPath} // certificate ready -> optional disable
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <label style={{ fontWeight: 700 }}>Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your feedback..."
          style={{
            width: "100%",
            minHeight: 110,
            padding: 12,
            marginTop: 6,
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            marginBottom: 16,
          }}
          disabled={loading || !!pdfPath}
        />

        <button
          type="submit"
          disabled={loading || !!pdfPath}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "none",
            background: loading || pdfPath ? "#9ca3af" : "#059669",
            color: "white",
            fontWeight: 800,
            fontSize: 18,
            cursor: loading || pdfPath ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>

      {/* Small debug info */}
      <div style={{ marginTop: 14, color: "#6b7280", fontSize: 13 }}>
        Application ID: {applicationId}{" "}
        {accessToken ? "✅ token found" : "❌ token missing"}
      </div>
    </div>
  );
}