import React, { useState } from "react";
import { apiFetch } from "../../services/api";

type Props = { applicationId: number };

type FeedbackRes = {
  message: string;
  certificate?: {
    certificate_no: string;
    issued_at: string;
    verify_token: string;
    pdf: string;      // "/media/....pdf"
    pdf_url?: string; // may be ""
  };
};

const API_ORIGIN =
  (import.meta as any).env?.VITE_API_ORIGIN?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000"; // for media absolute url

export default function FeedbackAndCertificate({ applicationId }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FeedbackRes | null>(null);
  const [error, setError] = useState("");

  const submitFeedback = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch<FeedbackRes>("/feedback/", {
        method: "POST",
        body: JSON.stringify({
          application_id: applicationId,
          rating,
          comment,
        }),
      });
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const pdfPath = result?.certificate?.pdf || "";
  const pdfUrl = pdfPath ? `${API_ORIGIN}${pdfPath}` : "";

  return (
    <div className="max-w-xl mx-auto p-6 mt-10 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold text-emerald-800 mb-4">
        Submit Feedback & Get Certificate
      </h2>

      {error && (
        <div className="p-3 mb-4 bg-red-50 text-red-600 rounded">{error}</div>
      )}

      <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
      <select
        className="border rounded p-2 w-full mb-4"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      >
        {[1, 2, 3, 4, 5].map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <label className="block text-sm font-medium mb-1">Comment</label>
      <textarea
        className="border rounded p-2 w-full mb-4"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your feedback..."
      />

      <button
        onClick={submitFeedback}
        disabled={loading}
        className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>

      {result?.certificate && (
        <div className="mt-6 p-4 border rounded bg-emerald-50">
          <p className="font-semibold text-emerald-800">
            ✅ {result.message}
          </p>
          <p className="mt-2">
            <b>Certificate No:</b> {result.certificate.certificate_no}
          </p>

          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-3 text-emerald-700 underline"
            >
              Download / View Certificate PDF
            </a>
          )}
        </div>
      )}
    </div>
  );
}