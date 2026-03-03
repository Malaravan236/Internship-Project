import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  X,
  Check,
  Loader2,
  Mail,
  Phone,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000/api";
 

interface Internship {
  id: string;
  internshipTitle: string;
  description: string;
  requiredSkills: string[];
  numberOfPositions: string;
  department: string;
  eligibilityCriteria: string;
  startDate: string;
  endDate: string;
  duration: string;
  workHours: string;
  locationType: "onsite" | "remote" | "hybrid";
  city: string;
  state: string;
  address: string;
  isPaid: boolean;
  stipendAmount: string;
  paymentMode: string;
  applicationStartDate: string;
  applicationDeadline: string;
  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorPhone: string;
  requireResume: boolean;
  internshipImageUrl: string;
  isActive: boolean;
}

interface ApplicationFormData {
  fullName: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  graduationYear: string;
  coverLetter: string;
  resumeDriveLink: string;
  agreeToTerms: boolean;
}

type StudentInfo = {
  id: string;
  name: string;
  email: string;
};

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** ✅ Backend response console screenshot la title / description varuthu
 * so mapInternship MUST pick raw.title too
 */
function mapInternship(raw: any): Internship {
  const rawImage =
    raw?.internshipImageUrl ??
    raw?.internship_image_url ??
    raw?.internship_image ??
    raw?.image_url ??
    raw?.imageUrl ??
    raw?.image ??
    "";

  return {
    id: String(raw?.id ?? raw?._id ?? ""),
    internshipTitle:
      raw?.internshipTitle ??
      raw?.title ?? // ✅ your API shows "title"
      raw?.name ??
      "Untitled Internship",

    description: raw?.description ?? "",

    requiredSkills: Array.isArray(raw?.requiredSkills)
      ? raw.requiredSkills
      : typeof raw?.requiredSkills === "string"
      ? raw.requiredSkills
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : typeof raw?.skills === "string"
      ? raw.skills
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [],

    numberOfPositions: String(raw?.numberOfPositions ?? raw?.positions ?? ""),
    department: raw?.department ?? raw?.dept ?? "",
    eligibilityCriteria: raw?.eligibilityCriteria ?? raw?.eligibility ?? "",
    startDate: raw?.startDate ?? raw?.start_date ?? "",
    endDate: raw?.endDate ?? raw?.end_date ?? "",
    duration: raw?.duration ?? "",
    workHours: raw?.workHours ?? raw?.work_hours ?? "",
    locationType: (raw?.locationType ?? raw?.location_type ?? "remote") as
      | "onsite"
      | "remote"
      | "hybrid",
    city: raw?.city ?? "",
    state: raw?.state ?? "",
    address: raw?.address ?? "",
    isPaid: Boolean(raw?.isPaid ?? raw?.is_paid ?? false),
    stipendAmount: raw?.stipendAmount ?? raw?.stipend_amount ?? "",
    paymentMode: raw?.paymentMode ?? raw?.payment_mode ?? "",
    applicationStartDate:
      raw?.applicationStartDate ?? raw?.application_start_date ?? "",
    applicationDeadline:
      raw?.applicationDeadline ?? raw?.application_deadline ?? "",
    coordinatorName: raw?.coordinatorName ?? raw?.coordinator_name ?? "",
    coordinatorEmail: raw?.coordinatorEmail ?? raw?.coordinator_email ?? "",
    coordinatorPhone: raw?.coordinatorPhone ?? raw?.coordinator_phone ?? "",
    requireResume: Boolean(raw?.requireResume ?? raw?.require_resume ?? true),

    internshipImageUrl: String(rawImage ?? ""),
    isActive: raw?.isActive ?? raw?.is_active ?? true,
  };
}

export default function AvailableInterns() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedInternship, setSelectedInternship] =
    useState<Internship | null>(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [expandedInternshipId, setExpandedInternshipId] = useState<
    string | null
  >(null);

  const [formData, setFormData] = useState<ApplicationFormData>({
    fullName: "",
    email: "",
    phone: "",
    college: "",
    course: "",
    graduationYear: "",
    coverLetter: "",
    resumeDriveLink: "",
    agreeToTerms: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const userData = safeJsonParse<any>(storedUser, null);
    if (!userData) return;

    setStudentInfo({
      id: userData.uid || userData.id || "unknown",
      name: userData.username || userData.displayName || "Anonymous",
      email: userData.email || "",
    });

    setFormData((prev) => ({
      ...prev,
      fullName: userData.username || userData.displayName || "",
      email: userData.email || "",
    }));
  }, []);

  const fetchInternships = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setInternships([]);
        setError("Please login to view internships.");
        return;
      }

      const res = await fetch(`${API_BASE}/internships/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) setError("Session expired. Please login again.");
        else setError("Failed to load internships.");
        setInternships([]);
        return;
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.results ?? [];
      const mapped = list.map(mapInternship);
      const active = mapped.filter((i: Internship) => i.isActive !== false);

      setInternships(active);
    } catch (e) {
      console.error(e);
      setError("Failed to load internships. Please try again later.");
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
    const onAuth = () => fetchInternships();
    window.addEventListener("authStateChanged", onAuth);
    return () => window.removeEventListener("authStateChanged", onAuth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleInternshipDetails = (internshipId: string) => {
    setExpandedInternshipId((prev) =>
      prev === internshipId ? null : internshipId
    );
  };

  const handleApply = (internship: Internship) => {
    if (!localStorage.getItem("access_token")) {
      setShowLoginAlert(true);
      return;
    }

    setSelectedInternship(internship);
    setShowApplyForm(true);
    setFormErrors({});
    setSubmitted(false);

    setFormData({
      fullName: studentInfo?.name ?? "",
      email: studentInfo?.email ?? "",
      phone: "",
      college: "",
      course: "",
      graduationYear: "",
      coverLetter: "",
      resumeDriveLink: "",
      agreeToTerms: false,
    });
  };

  const closeApplyForm = () => {
    setShowApplyForm(false);
    setSelectedInternship(null);
    setFormErrors({});
    setSubmitted(false);
    setSubmitting(false);
  };

  const closeLoginAlert = () => setShowLoginAlert(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.college.trim()) newErrors.college = "College is required";
    if (!formData.course.trim()) newErrors.course = "Course is required";
    if (!formData.graduationYear.trim())
      newErrors.graduationYear = "Graduation year is required";
    if (!formData.coverLetter.trim())
      newErrors.coverLetter = "Cover letter is required";

    if (!formData.resumeDriveLink.trim())
      newErrors.resumeDriveLink = "Drive link is required";
    else if (!formData.resumeDriveLink.includes("drive.google.com"))
      newErrors.resumeDriveLink = "Please provide a valid Google Drive link";

    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = "You must agree to the terms";

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!selectedInternship?.id) {
      setFormErrors((prev) => ({
        ...prev,
        submit: "Internship not selected.",
      }));
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setShowLoginAlert(true);
      return;
    }

    setSubmitting(true);
    setFormErrors((prev) => ({ ...prev, submit: "" }));

    try {
      const applicationData = {
        internship: selectedInternship.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        college: formData.college,
        course: formData.course,
        graduation_year: formData.graduationYear,
        cover_letter: formData.coverLetter,
        resume_link: formData.resumeDriveLink,
      };

      const res = await fetch(`${API_BASE}/applications/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(applicationData),
      });

      if (!res.ok) {
        let msg = "Failed to submit application.";
        try {
          const errorData = await res.json();
          msg =
            typeof errorData === "string" ? errorData : JSON.stringify(errorData);
        } catch {}
        setFormErrors({ submit: msg });
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setFormErrors({ submit: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const activeCount = useMemo(() => internships.length, [internships]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={40} className="animate-spin text-emerald-600" />
        <span className="ml-2 text-gray-600 text-lg">Loading internships...</span>
      </div>
    );
  }

  if (error) {
    const goLogin = error.toLowerCase().includes("login");
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center mt-24 mx-4">
        <p>{error}</p>
        <button
          onClick={() => (goLogin ? navigate("/login") : fetchInternships())}
          className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          {goLogin ? "Go to Login" : "Try Again"}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl text-emerald-800 mb-8 mt-20 text-center font-inter">
        Discover Impactful Internship Roles ({activeCount})
      </h1>

      {internships.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 p-8 rounded-lg text-center">
          <p className="text-gray-600 text-lg">
            No internships available at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => {
            const expanded = expandedInternshipId === internship.id;

            return (
              <div
                key={internship.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex flex-col transition-all duration-200 ${
                  expanded ? "ring-2 ring-emerald-500" : "hover:shadow-lg"
                }`}
              >
                

                {/* Card Content */}
                <div
                  className="p-6 flex-grow cursor-pointer"
                  onClick={() => toggleInternshipDetails(internship.id)}
                >
                  <div className="mb-2 flex items-center">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full mr-2 ${
                        internship.locationType === "remote"
                          ? "bg-blue-100 text-blue-800"
                          : internship.locationType === "onsite"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {internship.locationType.charAt(0).toUpperCase() +
                        internship.locationType.slice(1)}
                    </span>

                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                      {internship.department || "General"}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {internship.internshipTitle}
                  </h2>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {internship.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={16} className="mr-2 text-emerald-600" />
                      <span>Duration: {internship.duration || "-"}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign size={16} className="mr-2 text-emerald-600" />
                      <span>
                        {internship.isPaid
                          ? `Stipend: ${internship.stipendAmount || "-"}`
                          : "Unpaid Internship"}
                      </span>
                      {internship.isPaid && internship.paymentMode && (
                        <span className="ml-1">({internship.paymentMode})</span>
                      )}
                    </div>
                  </div>

                  {/* ✅ Show More button (IMPORTANT stopPropagation) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleInternshipDetails(internship.id);
                    }}
                    className="flex items-center text-emerald-600 text-sm font-medium hover:underline"
                  >
                    {expanded ? "Show Less" : "Show More"}
                  </button>

                  {/* ✅ Expanded content */}
                  {expanded && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      {/* Schedule */}
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">
                          Schedule
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock size={16} className="mr-2 text-emerald-600" />
                            <span>
                              Dates: {formatDate(internship.startDate)} -{" "}
                              {formatDate(internship.endDate)}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock size={16} className="mr-2 text-emerald-600" />
                            <span>Work Hours: {internship.workHours || "-"}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar
                              size={16}
                              className="mr-2 text-emerald-600"
                            />
                            <span>
                              Application:{" "}
                              {formatDate(internship.applicationStartDate)} -{" "}
                              {formatDate(internship.applicationDeadline)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">
                          Location
                        </h3>
                        <div className="flex items-start text-sm text-gray-600">
                          <MapPin
                            size={16}
                            className="mr-2 text-emerald-600 mt-0.5"
                          />
                          <div>
                            <p>
                              {internship.locationType === "remote"
                                ? "Remote"
                                : internship.locationType === "onsite"
                                ? `${internship.city}, ${internship.state}`
                                : `Hybrid (${internship.city}, ${internship.state})`}
                            </p>
                            {internship.address &&
                              internship.locationType !== "remote" && (
                                <p className="mt-1">{internship.address}</p>
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Requirements */}
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">
                          Requirements
                        </h3>

                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">Eligibility:</p>
                            <p>
                              {internship.eligibilityCriteria ||
                                "Not specified"}
                            </p>
                          </div>

                          <div className="text-sm text-gray-600">
                            <p className="font-medium">
                              Positions: {internship.numberOfPositions || "-"}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-800 mb-1">
                              Skills:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {(internship.requiredSkills || []).length === 0 ? (
                                <span className="text-sm text-gray-500">-</span>
                              ) : (
                                internship.requiredSkills.map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Coordinator */}
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">
                          Coordinator
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">Name:</span>
                            <span>{internship.coordinatorName || "-"}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail size={16} className="mr-2 text-emerald-600" />
                            <span>{internship.coordinatorEmail || "-"}</span>
                          </div>
                          {internship.coordinatorPhone && (
                            <div className="flex items-center">
                              <Phone
                                size={16}
                                className="mr-2 text-emerald-600"
                              />
                              <span>{internship.coordinatorPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Application Info */}
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">
                          Application
                        </h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText
                            size={16}
                            className="mr-2 text-emerald-600"
                          />
                          <span>
                            Resume Required:{" "}
                            {internship.requireResume ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Apply Button */}
                <div className="px-6 pb-6" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleApply(internship)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Apply Now
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Deadline: {formatDate(internship.applicationDeadline)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ Apply Modal */}
      {showApplyForm && selectedInternship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-10 relative">
            <button
              onClick={closeApplyForm}
              className="absolute top-4 right-4 text-white/90 hover:text-white z-10"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 py-6 px-8 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white">
                Apply for Internship
              </h2>
              <p className="text-emerald-100 mt-2">
                {selectedInternship.internshipTitle}
              </p>
            </div>

            <div className="p-6">
              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Application Submitted!
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Your application has been successfully submitted.
                  </p>
                  <button
                    onClick={closeApplyForm}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Your full name"
                    />
                    {formErrors.fullName && (
                      <p className="text-sm text-red-600 mt-1">
                        {formErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="example@gmail.com"
                    />
                    {formErrors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="10 digit number"
                    />
                    {formErrors.phone && (
                      <p className="text-sm text-red-600 mt-1">
                        {formErrors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      College / University
                    </label>
                    <input
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Your college name"
                    />
                    {formErrors.college && (
                      <p className="text-sm text-red-600 mt-1">
                        {formErrors.college}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course
                      </label>
                      <input
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="B.E / B.Tech / MCA..."
                      />
                      {formErrors.course && (
                        <p className="text-sm text-red-600 mt-1">
                          {formErrors.course}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Graduation Year
                      </label>
                      <input
                        name="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="2026"
                      />
                      {formErrors.graduationYear && (
                        <p className="text-sm text-red-600 mt-1">
                          {formErrors.graduationYear}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cover Letter
                    </label>
                    <textarea
                      name="coverLetter"
                      value={formData.coverLetter}
                      onChange={handleChange}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Why should we select you?"
                    />
                    {formErrors.coverLetter && (
                      <p className="text-sm text-red-600 mt-1">
                        {formErrors.coverLetter}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resume Google Drive Link
                    </label>
                    <input
                      name="resumeDriveLink"
                      value={formData.resumeDriveLink}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="https://drive.google.com/..."
                    />
                    {formErrors.resumeDriveLink && (
                      <p className="text-sm text-red-600 mt-1">
                        {formErrors.resumeDriveLink}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Drive link should be set to “Anyone with the link can view”.
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm text-gray-700">
                        I confirm the details are true and I agree to the terms.
                      </p>
                      {formErrors.agreeToTerms && (
                        <p className="text-sm text-red-600 mt-1">
                          {formErrors.agreeToTerms}
                        </p>
                      )}
                    </div>
                  </div>

                  {formErrors.submit && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                      {formErrors.submit}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={closeApplyForm}
                      className="px-6 py-3 mr-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-70 flex items-center"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Required Modal */}
      {showLoginAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100 max-w-md w-full">
            <AlertCircle className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to apply for internships.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={closeLoginAlert}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
