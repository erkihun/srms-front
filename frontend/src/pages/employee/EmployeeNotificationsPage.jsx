import React, { useEffect, useState } from 'react';
import axios from '../../lib/axiosClient.js';
import { Link } from 'react-router-dom';

export default function EmployeeNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/notifications');
      const list = Array.isArray(res.data) ? res.data : [];
      setNotifications(list);
    } catch (err) {
      console.error(err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkOne = async (id) => {
    try {
      await axios.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error(err);
      alert('Failed to mark notification as read.');
    }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await axios.post('/notifications/read-all');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to mark all as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-4">
      
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-blue-950">
            Notifications
          </h2>
          <p className="text-xs text-slate-500">
            Updates about your ICT service requests.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={markingAll || unreadCount === 0}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {markingAll ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      
      {error && (
        <div className="text-xs text-red-800 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500">
            Loading notifications...
          </p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-slate-500">
            You don’t have any notifications yet.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex items-start justify-between gap-3 py-3 ${
                  n.is_read ? 'bg-white' : 'bg-slate-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {!n.is_read && (
                      <span className="inline-flex h-2 w-2 rounded-full bg-blue-600" />
                    )}
                    <p className="font-medium text-slate-900 text-[13px]">
                      {n.title}
                    </p>
                  </div>
                  <p className="text-[12px] text-slate-600 whitespace-pre-line">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>
                      {n.created_at
                        ? new Date(n.created_at).toLocaleString()
                        : ''}
                    </span>
                    {n.link_url && (
                      <Link
                        to={n.link_url}
                        className="font-medium text-blue-700 hover:text-blue-900"
                      >
                        View details →
                      </Link>
                    )}
                  </div>
                </div>

                {!n.is_read && (
                  <button
                    type="button"
                    onClick={() => handleMarkOne(n.id)}
                    className="mt-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

