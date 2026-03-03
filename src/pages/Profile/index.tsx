import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faSignOutAlt,
  faTimes,
  faEdit,
  faSave,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

interface UserData {
  id?: number | string;
  username?: string;
  email?: string;
}

interface EditData {
  username: string;
}

interface Errors {
  username?: string;
  form?: string;
}

interface ProfileProps {
  onClose?: () => void;
}

const PROFILE_ENDPOINT = "/users/me/";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000/api";

function getToken() {
  return localStorage.getItem("access_token") || "";
}

async function apiRequest<T>(
  path: string,
  method: string = "GET",
  body?: any
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.detail || "Request failed");
  }

  return data as T;
}

const Profile: React.FC<ProfileProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditData>({ username: "" });

  const [errors, setErrors] = useState<Errors>({});
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // =========================
  // Fetch user profile
  // =========================
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!getToken()) {
          navigate("/login", { replace: true });
          return;
        }

        const data = await apiRequest<UserData>(PROFILE_ENDPOINT);

        setUserData(data);
        setEditData({
          username: data.username || "",
        });
      } catch (err) {
        console.error(err);

        // logout if token invalid
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  // =========================
  // Logout
  // =========================
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  // =========================
  // Edit handlers
  // =========================
  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
    setUpdateSuccess(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({ username: userData?.username || "" });
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ username: e.target.value });

    if (errors.username) {
      setErrors({});
    }
  };

  const validate = () => {
    const newErr: Errors = {};

    if (!editData.username.trim()) {
      newErr.username = "Username required";
    } else if (editData.username.length < 3) {
      newErr.username = "Minimum 3 characters";
    }

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  // =========================
  // Save profile
  // =========================
  const handleSave = async () => {
    if (!validate()) return;

    try {
      const updated = await apiRequest<UserData>(
        PROFILE_ENDPOINT,
        "PATCH",
        { username: editData.username.trim() }
      );

      setUserData(updated);
      setIsEditing(false);
      setUpdateSuccess(true);

      setTimeout(() => setUpdateSuccess(false), 2500);
    } catch (err: any) {
      setErrors({
        form: err.message || "Update failed",
      });
    }
  };

  // =========================
  // Loading UI
  // =========================
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md relative">

        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}

        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faUser} className="text-teal-500 text-3xl" />
          </div>

          {isEditing ? (
            <div className="w-full">
              <input
                type="text"
                value={editData.username}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold">
                {userData?.username || "User"}
              </h2>
              <p className="text-gray-600">
                {userData?.email || "-"}
              </p>
            </>
          )}
        </div>

        {updateSuccess && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-3">
            Profile updated successfully
          </div>
        )}

        {errors.form && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-3">
            {errors.form}
          </div>
        )}

        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex-1 bg-teal-500 text-white p-3 rounded"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Save
              </button>

              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-200 p-3 rounded"
              >
                <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="flex-1 bg-teal-500 text-white p-3 rounded"
              >
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Edit
              </button>

              <button
                onClick={handleLogout}
                className="flex-1 bg-red-50 text-red-500 p-3 rounded"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
