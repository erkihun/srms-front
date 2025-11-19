import React, { useEffect, useState } from 'react';
import axios from '../lib/axiosClient.js';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const res = await axios.get('/notifications');
      const list = Array.isArray(res.data) ? res.data : [];
      setNotifications(list);
      setUnread(list.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error('Failed to load notifications', err);
      setError('Failed to load notifications.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAllRead = async () => {
    try {
      setError('');
      await axios.post('/notifications/read-all');
      await load();
    } catch (err) {
      console.error('Failed to mark all read', err);
      setError('Failed to mark all as read.');
    }
  };

  const toggleOpen = () => {
    setOpen((prev) => !prev);
    if (!open) {
      load();
    }
  };

  return (
    <div className="relative">
      
      <button
        type="button"
        onClick={toggleOpen}
        className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-blue-700"
      >
        <span className="sr-only">Open notifications</span>
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-600 px-0.5 text-[9px] font-semibold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      
      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-md border border-slate-200 bg-white shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800">
                Notifications
              </span>
              <span className="text-[10px] text-slate-400">
                {unread > 0
                  ? `${unread} unread`
                  : 'All caught up'}
              </span>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              className="text-[10px] font-medium text-blue-600 hover:text-blue-800 disabled:text-slate-300"
              disabled={unread === 0}
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {error ? (
              <p className="px-3 py-2 text-[11px] text-red-600">
                {error}
              </p>
            ) : notifications.length === 0 ? (
              <p className="px-3 py-2 text-[11px] text-slate-500">
                You don&apos;t have any notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <a
                  key={n.id}
                  href={n.link_url || '#'}
                  className={`block px-3 py-2 text-[11px] border-b last:border-b-0 ${
                    n.is_read
                      ? 'bg-white hover:bg-slate-50'
                      : 'bg-blue-50/70 hover:bg-blue-100'
                  }`}
                >
                  <p className="text-slate-800">{n.message}</p>
                  <span className="mt-0.5 block text-[10px] text-slate-400">
                    {n.created_at
                      ? new Date(n.created_at).toLocaleString()
                      : ''}
                  </span>
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

