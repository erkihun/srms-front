import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import axios from '../../lib/axiosClient.js';
import NotificationBell from '../NotificationBell.jsx';
import logo from '../../assets/ps-logo2.png';

function MyRequestsIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  );
}

function NewRequestIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="7" />
      <path d="M12 9v6M9 12h6" />
    </svg>
  );
}

function LogoutIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h-3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h3" />
      <path d="M10 12h10" />
      <path d="M17 9l3 3-3 3" />
    </svg>
  );
}

function BellIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
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
  );
}

export default function EmployeeLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const linkBaseClasses =
    'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors';
  const activeMyRequests = 'bg-blue-700 text-white';
  const activeNewRequest = 'bg-orange-500 text-white';
  const inactiveLink = 'text-slate-700 hover:bg-slate-100';

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const res = await axios.get('/notifications', {
          params: { unread: 'true' },
        });
        if (!isMounted) return;

        const list = Array.isArray(res.data) ? res.data : [];
        setUnreadCount(list.length);
        setHasUnread(list.length > 0);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };

    loadNotifications();
    const intervalId = setInterval(loadNotifications, 60000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const goNotifications = () => {
    navigate('/employee/notifications');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex h-14 items-center justify-between gap-3">
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                
                <div className="h-12 w-12 rounded-md overflow-hidden flex items-center justify-center">
                  <img
                    src={logo}
                    alt="SRMS Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-blue-950">
                    PSHRDB ICT Service Request System
                  </span>
                  <span className="hidden sm:inline text-[11px] text-slate-500">
                    Logged in as{' '}
                    <span className="font-medium">{user?.full_name}</span>{' '}
                 
                  </span>
                </div>
              </div>
            </div>

            
            <nav className="hidden md:flex items-center gap-2">
              
              <NotificationBell />

              <NavLink
                to="/employee"
                end
                className={({ isActive }) =>
                  `${linkBaseClasses} ${
                    isActive ? activeMyRequests : inactiveLink
                  }`
                }
              >
                <MyRequestsIcon className="h-4 w-4" />
                <span>My Requests</span>
              </NavLink>

              <NavLink
                to="/employee/new-request"
                className={({ isActive }) =>
                  `${linkBaseClasses} ${
                    isActive ? activeNewRequest : inactiveLink
                  }`
                }
              >
                <NewRequestIcon className="h-4 w-4" />
                <span>New Request</span>
              </NavLink>

              <button
                onClick={logout}
                className="ml-2 inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                <LogoutIcon className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </nav>

            
            <div className="flex items-center gap-2 md:hidden">
              
              <button
                type="button"
                className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-blue-700"
                onClick={goNotifications}
              >
                <BellIcon className="h-3.5 w-3.5" />
                {hasUnread && (
                  <span className="absolute -top-0.5 -right-0.5 inline-flex min-h-[14px] min-w-[14px] items-center justify-center rounded-full bg-red-500 px-0.5">
                    <span className="sr-only">Unread notifications</span>
                    <span className="text-[9px] text-white font-semibold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </span>
                )}
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 p-1.5 text-slate-700 hover:bg-slate-50"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
              >
                <span className="sr-only">Toggle navigation</span>
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          
          <div className="sm:hidden pb-1">
            <p className="text-[11px] text-slate-500">
              Logged in as{' '}
              <span className="font-medium">{user?.full_name}</span>{' '}
              <span className="text-orange-600">
                ({user?.role})
              </span>
            </p>
          </div>

          
          {menuOpen && (
            <div className="md:hidden pb-3 border-t border-slate-200">
              <div className="pt-2 flex flex-col gap-1">
                <NavLink
                  to="/employee"
                  end
                  className={({ isActive }) =>
                    `${linkBaseClasses} ${
                      isActive ? activeMyRequests : inactiveLink
                    }`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  <MyRequestsIcon className="h-4 w-4" />
                  <span>My Requests</span>
                </NavLink>

                <NavLink
                  to="/employee/new-request"
                  className={({ isActive }) =>
                    `${linkBaseClasses} ${
                      isActive ? activeNewRequest : inactiveLink
                    }`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  <NewRequestIcon className="h-4 w-4" />
                  <span>New Request</span>
                </NavLink>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="mt-1 inline-flex items-center gap-1.5 w-full text-left rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <LogoutIcon className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

