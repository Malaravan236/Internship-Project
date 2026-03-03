import React, { useEffect, useRef, useState } from "react";
import { Upload, User, Check, X, Search, Download, Trash2, ChevronDown, Link as LinkIcon } from "lucide-react";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000/api";

interface Certificate {
  id: string | number;
  studentId: string | number;
  studentName: string;
  certificateUrl: string;
  certificateName: string;
  issuedAt: string; // ISO
  description: string;
  type: "upload" | "drive";
}

interface Student {
  id: string | number;
  name: string;
  email: string;
}

const CertificateManager: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [driveLink, setDriveLink] = useState("");
  const [description, setDescription] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"upload" | "drive">("upload");

  const dropdownRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("access_token");

  const loadStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/students/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("students fetch failed");
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setStudents([]);
    }
  };

  const loadCertificates = async () => {
    try {
      const res = await fetch(`${API_BASE}/certificates/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("cert fetch failed");
      const data = await res.json();
      setCertificates(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setCertificates([]);
    }
  };

  useEffect(() => {
    loadStudents();
    loadCertificates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStudents = students.filter((s) => {
    const t = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(t) || s.email.toLowerCase().includes(t);
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setCertificateFile(e.target.files[0]);
  };

  const isValidDriveLink = (link: string) => link.includes("drive.google.com") || link.includes("docs.google.com");

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const handleSubmit = async () => {
    if (!selectedStudent) return alert("Please select a student");

    if (uploadMethod === "upload" && !certificateFile) return alert("Please select a certificate file");
    if (uploadMethod === "drive" && (!driveLink || !isValidDriveLink(driveLink)))
      return alert("Please enter a valid Google Drive link");

    try {
      if (!token) return alert("Login required (token missing).");

      if (uploadMethod === "upload" && certificateFile) {
        const form = new FormData();
        form.append("student", String(selectedStudent.id));
        form.append("description", description);
        form.append("type", "upload");
        form.append("file", certificateFile); // backend should accept 'file'
        // optional name
        form.append("certificate_name", certificateFile.name);

        const res = await fetch(`${API_BASE}/certificates/`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }, // do NOT set content-type for FormData
          body: form,
        });

        if (!res.ok) {
          let msg = "Failed to upload certificate";
          try {
            const err = await res.json();
            msg = typeof err === "string" ? err : JSON.stringify(err);
          } catch {}
          return alert(msg);
        }
      } else {
        const res = await fetch(`${API_BASE}/certificates/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            student: selectedStudent.id,
            description,
            type: "drive",
            certificate_url: driveLink,
            certificate_name: `Certificate_${selectedStudent.name}`,
          }),
        });

        if (!res.ok) {
          let msg = "Failed to add drive certificate";
          try {
            const err = await res.json();
            msg = typeof err === "string" ? err : JSON.stringify(err);
          } catch {}
          return alert(msg);
        }
      }

      setCertificateFile(null);
      setDriveLink("");
      setDescription("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await loadCertificates();
    } catch (e) {
      console.error(e);
      alert("Network error");
    }
  };

  return (
    <div className="max-w-8xl mx-auto p-4 pt-20">
      {showSuccess && (
        <div className="fixed top-6 right-6 bg-white text-emerald-800 px-6 py-3 rounded-lg shadow-lg z-50 border-t-2 border-emerald-500 flex items-center gap-2 animate-slide-in">
          <Check className="h-5 w-5 text-emerald-600" />
          <span className="font-medium">Certificate added successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left */}
        <div className="bg-white rounded-xl shadow-md border border-emerald-100 p-6">
          <div className="bg-emerald-600 rounded-lg p-4 mb-6 text-white">
            <h3 className="text-xl font-bold">Add Certificate</h3>
            <p className="text-emerald-100 opacity-90">Issue certificates via upload or Drive link</p>
          </div>

          <div className="space-y-4">
            {/* Student */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-gray-700 font-medium mb-1">Select Student</label>
              <div
                className="border border-gray-300 rounded-lg p-3 cursor-pointer flex justify-between items-center"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {selectedStudent ? (
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-emerald-600" />
                    <span>{selectedStudent.name}</span>
                    <span className="text-gray-500 text-sm">({selectedStudent.email})</span>
                  </div>
                ) : (
                  <span className="text-gray-400">Search for a student...</span>
                )}
                <ChevronDown size={18} className={`text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
              </div>

              {showDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                    <div className="relative">
                      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search students..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => (
                      <div
                        key={String(s.id)}
                        className={`p-3 cursor-pointer hover:bg-gray-50 ${selectedStudent?.id === s.id ? "bg-emerald-50" : ""}`}
                        onClick={() => {
                          setSelectedStudent(s);
                          setShowDropdown(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-emerald-100 p-2 rounded-full">
                            <User size={16} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium">{s.name}</p>
                            <p className="text-sm text-gray-500">{s.email}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">No students found</div>
                  )}
                </div>
              )}
            </div>

            {/* Method */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Certificate Source</label>
              <div className="flex gap-4 mb-3">
                <button
                  type="button"
                  onClick={() => setUploadMethod("upload")}
                  className={`flex items-center px-4 py-2 rounded-lg border ${
                    uploadMethod === "upload" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-300 text-gray-700"
                  }`}
                >
                  <Upload size={16} className="mr-2" /> File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod("drive")}
                  className={`flex items-center px-4 py-2 rounded-lg border ${
                    uploadMethod === "drive" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-300 text-gray-700"
                  }`}
                >
                  <LinkIcon size={16} className="mr-2" /> Google Drive
                </button>
              </div>
            </div>

            {/* Upload / Drive */}
            {uploadMethod === "upload" ? (
              <div>
                <label className="block text-gray-700 font-medium mb-1">Certificate File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {certificateFile ? (
                    <div className="flex flex-col items-center">
                      <div className="bg-emerald-100 p-3 rounded-full mb-3">
                        <Check size={24} className="text-emerald-600" />
                      </div>
                      <p className="font-medium text-gray-800">{certificateFile.name}</p>
                      <p className="text-sm text-gray-500 mb-3">{(certificateFile.size / 1024).toFixed(2)} KB</p>
                      <button type="button" onClick={() => setCertificateFile(null)} className="text-red-500 text-sm flex items-center gap-1">
                        <X size={14} /> Remove file
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-100 p-3 rounded-full mb-3">
                          <Upload size={24} className="text-gray-500" />
                        </div>
                        <p className="font-medium text-gray-800">Click to upload certificate</p>
                        <p className="text-sm text-gray-500">PDF, JPG, PNG</p>
                      </div>
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                    </label>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-gray-700 font-medium mb-1">Google Drive Link</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                  />
                </div>
                {driveLink && !isValidDriveLink(driveLink) && <p className="mt-1 text-sm text-red-500">Please enter a valid Google Drive link</p>}
              </div>
            )}

            {/* Desc */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Description (Optional)</label>
              <textarea
                placeholder="Certificate description..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-h-24"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
              />
              <div className="text-right text-sm text-gray-500 mt-1">{description.length}/200</div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  !selectedStudent ||
                  (uploadMethod === "upload" && !certificateFile) ||
                  (uploadMethod === "drive" && (!driveLink || !isValidDriveLink(driveLink)))
                }
                className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                  !selectedStudent ||
                  (uploadMethod === "upload" && !certificateFile) ||
                  (uploadMethod === "drive" && (!driveLink || !isValidDriveLink(driveLink)))
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {uploadMethod === "upload" ? <Upload size={18} /> : <LinkIcon size={18} />}
                Add Certificate
              </button>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="bg-white rounded-xl shadow-md border border-emerald-100 p-6">
          <div className="bg-emerald-600 rounded-lg p-4 mb-6 text-white">
            <h3 className="text-xl font-bold">Issued Certificates</h3>
            <p className="text-emerald-100 opacity-90">View all certificates issued</p>
          </div>

          {certificates.length > 0 ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {certificates.map((cert) => (
                <div key={String(cert.id)} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-emerald-800">{cert.certificateName}</h3>
                      <p className="text-gray-600 text-sm mt-1">Issued to: {cert.studentName}</p>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            cert.type === "upload" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {cert.type === "upload" ? "File Upload" : "Google Drive"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={cert.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-800 p-1"
                        title={cert.type === "upload" ? "Download" : "View"}
                      >
                        {cert.type === "upload" ? <Download size={18} /> : <LinkIcon size={18} />}
                      </a>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete"
                        onClick={() => alert("Delete API not connected yet")}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {cert.description && <p className="mt-2 text-gray-700 line-clamp-2">{cert.description}</p>}

                  <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                    Issued on: {formatDate(cert.issuedAt)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="max-w-xs mx-auto">
                <div className="bg-gray-100 p-4 rounded-full inline-block mb-3">
                  <Upload size={36} className="text-gray-400 mx-auto" />
                </div>
                <h4 className="font-medium text-lg mb-1">No certificates yet</h4>
                <p className="text-sm">Add certificates using the form on the left</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          0% { opacity: 0; transform: translateX(20px); }
          20% { opacity: 1; transform: translateX(0); }
          80% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(20px); }
        }
        .animate-slide-in {
          animation: slide-in 3s ease-in-out forwards;
          box-shadow: 0 4px 6px rgba(5, 150, 105, 0.2);
        }
      `}</style>
    </div>
  );
};

export default CertificateManager;
