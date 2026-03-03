import React, { useEffect, useState } from "react";
import { X, Paperclip, CheckCircle } from "lucide-react";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000/api";

interface ApplicationFormData {
  fullName: string;
  email: string;
  phone: string;
  university: string;
  major: string;
  graduationYear: string;
  skills: string;
  experience: string;
  coverLetter: string;
  resumeDriveLink: string;
  agreeToTerms: boolean;
}

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  internshipId: string;
};

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

const ApplicationModal: React.FC<Props> = ({
  isModalOpen,
  setIsModalOpen,
  internshipId,
}) => {
  const [formData, setFormData] = useState<ApplicationFormData>({
    fullName: "",
    email: "",
    phone: "",
    university: "",
    major: "",
    graduationYear: "",
    skills: "",
    experience: "",
    coverLetter: "",
    resumeDriveLink: "",
    agreeToTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ auto-fill from localStorage user
  useEffect(() => {
    const user = safeJsonParse<any>(localStorage.getItem("user"), null);
    if (!user) return;

    setFormData((prev) => ({
      ...prev,
      fullName: user.username || user.name || user.displayName || prev.fullName,
      email: user.email || prev.email,
    }));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : false;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!internshipId) newErrors.submit = "Internship not selected.";

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.university.trim()) newErrors.university = "University is required";
    if (!formData.major.trim()) newErrors.major = "Major is required";
    if (!formData.graduationYear.trim())
      newErrors.graduationYear = "Graduation year is required";

    if (!formData.skills.trim()) newErrors.skills = "Skills are required";
    if (!formData.coverLetter.trim()) newErrors.coverLetter = "Cover letter is required";

    if (!formData.resumeDriveLink.trim())
      newErrors.resumeDriveLink = "Resume Google Drive link is required";
    else if (!formData.resumeDriveLink.includes("drive.google.com"))
      newErrors.resumeDriveLink = "Please provide a valid Google Drive link";

    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    const user = safeJsonParse<any>(localStorage.getItem("user"), {});
    setFormData({
      fullName: user.username || user.name || user.displayName || "",
      email: user.email || "",
      phone: "",
      university: "",
      major: "",
      graduationYear: "",
      skills: "",
      experience: "",
      coverLetter: "",
      resumeDriveLink: "",
      agreeToTerms: false,
    });
    setErrors({});
  };

  // ✅ Submit to Django REST API -> MySQL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      setErrors({ submit: "Please login first (token missing)." });
      return;
    }

    const user = safeJsonParse<any>(localStorage.getItem("user"), null);
    const studentId = user?.id || user?.uid;
    if (!studentId) {
      setErrors({ submit: "User not found. Please login again." });
      return;
    }

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, submit: "" }));

    try {
      const payload = {
        internship: internshipId,
        student: studentId,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        college: formData.university,
        course: formData.major,
        graduation_year: formData.graduationYear,
        skills: formData.skills,
        experience: formData.experience,
        cover_letter: formData.coverLetter,
        resume_link: formData.resumeDriveLink,
        agree_to_terms: formData.agreeToTerms,
      };

      const res = await fetch(`${API_BASE}/applications/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errText = "Failed to submit application.";
        try {
          const errData = await res.json();
          errText = typeof errData === "string" ? errData : JSON.stringify(errData);
        } catch {}
        setErrors({ submit: errText });
        return;
      }

      setSubmitSuccess(true);

      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        resetForm();
      }, 1200);
    } catch (error) {
      console.error(error);
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 relative">
          {/* ✅ Close button */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
            aria-label="Close"
          >
            <X size={22} />
          </button>

          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
                <CheckCircle size={28} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Application Submitted!
              </h2>
              <p className="text-gray-600 mb-6">
                Your application has been successfully submitted.
              </p>
              <button
                type="button"
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Apply for Internship</h2>
              <p className="text-gray-600 mb-6">Fill out the form below to submit your application</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.submit && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-md">
                    {errors.submit}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.fullName ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      placeholder="Your full name"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      placeholder="Your email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      placeholder="Your phone number"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      University *
                    </label>
                    <input
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.university ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      placeholder="Your university"
                    />
                    {errors.university && (
                      <p className="mt-1 text-sm text-red-600">{errors.university}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Major *
                    </label>
                    <input
                      name="major"
                      value={formData.major}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.major ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      placeholder="Your major"
                    />
                    {errors.major && (
                      <p className="mt-1 text-sm text-red-600">{errors.major}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Graduation Year *
                    </label>
                    <input
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.graduationYear ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      placeholder="2026"
                    />
                    {errors.graduationYear && (
                      <p className="mt-1 text-sm text-red-600">{errors.graduationYear}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills *
                  </label>
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-4 py-2 border ${
                      errors.skills ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    placeholder="Java, Python, React..."
                  />
                  {errors.skills && (
                    <p className="mt-1 text-sm text-red-600">{errors.skills}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience
                  </label>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Projects / internships / work..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Letter *
                  </label>
                  <textarea
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full px-4 py-2 border ${
                      errors.coverLetter ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    placeholder="Why are you applying?"
                  />
                  {errors.coverLetter && (
                    <p className="mt-1 text-sm text-red-600">{errors.coverLetter}</p>
                  )}
                </div>

                {/* Resume Drive Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resume Google Drive Link *
                  </label>
                  <div className="flex items-center gap-2">
                    <Paperclip size={18} className="text-emerald-600" />
                    <input
                      name="resumeDriveLink"
                      value={formData.resumeDriveLink}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.resumeDriveLink ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                  {errors.resumeDriveLink && (
                    <p className="mt-1 text-sm text-red-600">{errors.resumeDriveLink}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Drive link “Anyone with link can view” set பண்ணுங்க.
                  </p>
                </div>

                {/* Terms */}
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
                    {errors.agreeToTerms && (
                      <p className="text-sm text-red-600 mt-1">{errors.agreeToTerms}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-70"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;
