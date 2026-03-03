import React, { useEffect, useState } from "react";
import { Bell, RefreshCcw } from "lucide-react";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000/api";

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  target_type: "all" | "specific";
  target_users: number[];
  created_by: number;
  created_at: string; // ISO
};

const NotificationsPage: React.FC = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setItems([]);
        setError("Please login to view notifications.");
        return;
      }

      const res = await fetch(`${API_BASE}/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) setError("Session expired. Please login again.");
        else setError("Failed to load notifications.");
        setItems([]);
        return;
      }

      const data = await res.json();
      const list: NotificationItem[] = Array.isArray(data) ? data : data?.results ?? [];
      setItems(list);
    } catch (e) {
      console.error(e);
      setError("Network error. Please try again.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} • ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="max-w-3xl mx-auto pt-24 pb-16 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-emerald-800 flex items-center gap-2">
            <Bell className="h-6 w-6" /> Notifications
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Admin announcements and updates will appear here.
          </p>
        </div>

        <button
          onClick={fetchNotifications}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="bg-white border rounded-xl p-6 text-gray-600">Loading...</div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="bg-white border rounded-xl p-6 text-gray-600">
          No notifications yet.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-4">
          {items.map((n) => (
            <div key={n.id} className="bg-white border rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-emerald-800">{n.title}</h3>
                  <p className="text-gray-700 mt-2 whitespace-pre-line">{n.message}</p>
                </div>
                <span className="text-xs text-gray-500 shrink-0">
                  {formatDate(n.created_at)}
                </span>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Target: <span className="font-medium">{n.target_type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;