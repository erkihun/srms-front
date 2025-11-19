import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import axios from '../../lib/axiosClient.js';
import NotificationBell from '../NotificationBell.jsx';

import logo from '../../assets/ps-logo.png';

function WrenchIcon({ className = 'h-4 w-4' }) {
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
      <path d="M21 3a6 6 0 0 1-7.56 7.56L9 15l-3 3-2-2 3-3 4.44-4.44A6 6 0 0 1 21 3z" />
      <circle cx="5" cy="19" r="2" />
    </svg>
  );
}

function TicketIcon({ className = 'h-4 w-4' }) {
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
      <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3.5a1.5 1.5 0 0 1-3 0V13a1.5 1.5 0 0 1 3 0V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V13.5a1.5 1.5 0 0 1 3 0V11a1.5 1.5 0 0 1-3 0V7z" />
      <path d="M9 7v10" />
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

function DashboardIcon({ className = 'h-4 w-4' }) {
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
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="11" width="7" height="10" rx="1" />
      <rect x="3" y="15" width="7" height="6" rx="1" />
    </svg>
  );
}

/** Shared sidebar content (desktop + mobile) */
function TechnicianSidebar({ onLinkClick }) {
  const linkBase =
    'flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm';
  const active = 'bg-blue-600 text-white';
  const inactive = 'text-slate-100 hover:bg-blue-900 hover:text-white';

  return (
    <div className="flex flex-col h-full bg-blue-950 text-slate-50">
      
      <div className="h-16 flex items-center px-4 border-b border-blue-900">
        <div className="flex items-center gap-2">
          <div className="h-12 w-12 rounded-md overflow-hidden flex items-center justify-center">
            <img
              src={logo}
              alt="PSHRDB Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] font-semibold tracking-wide">
              PSHRDB ICT
            </span>
            <span className="text-[10px] text-blue-200">
              Technician Panel
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 text-sm overflow-y-auto">
        <NavLink
          to="/technician"
          end
          onClick={onLinkClick}
          className={({ isActive }) =>
            [linkBase, isActive ? 'bg-orange-500 text-white' : inactive].join(' ')
          }
        >
          <DashboardIcon />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/technician/assigned"
          end
          onClick={onLinkClick}
          className={({ isActive }) =>
            [linkBase, isActive ? 'bg-orange-500 text-white' : inactive].join(
              ' ',
            )
          }
        >
          <TicketIcon />
          <span>My Assigned Tickets</span>
        </NavLink>

        <NavLink
          to="/technician/tasks"
          end
          onClick={onLinkClick}
          className={({ isActive }) =>
            [linkBase, isActive ? 'bg-orange-500 text-white' : inactive].join(
              ' ',
            )
          }
        >
          <WrenchIcon />
          <span>My Assigned Tasks</span>
        </NavLink>
      </nav>

   
    </div>
  );
}

export default function TechnicianLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const resolveAvatarUrl = (avatar) => {
    if (!avatar) return '';
    if (avatar.startsWith('http') || avatar.startsWith('blob:')) return avatar;

    try {
      const base = axios.defaults.baseURL || '';
      if (!base) return avatar;
      const origin = new URL(base).origin;
      return origin + avatar;
    } catch {
      return avatar;
    }
  };

  if (user?.role !== 'TECHNICIAN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-blue-600 px-6 py-5 text-center max-w-md">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <WrenchIcon className="h-5 w-5" />
          </div>
          <p className="text-sm text-slate-700 font-medium">
            Technician workspace only
          </p>
          <p className="mt-1 text-xs text-slate-500">
            You must be assigned the{' '}
            <span className="font-semibold">TECHNICIAN</span> role to access
            this area.
          </p>
        </div>
      </div>
    );
  }

  const handleProfileClick = () => {
    navigate('/technician/profile');
    setSidebarOpen(false);
  };

  const handleLogoutClick = () => {
    logout();
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      
      <aside className="hidden lg:block w-56">
        <TechnicianSidebar />
      </aside>

      
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          
          <div className="relative z-50 w-56 h-full">
            <TechnicianSidebar onLinkClick={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      
      <div className="flex-1 flex flex-col">
        
        <header className="h-14 bg-white border-b border-blue-100 flex items-center px-3 sm:px-4 lg:px-6 gap-3">
          
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center h-8 w-8 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </button>

          
          <div className="hidden xs:flex items-center gap-2">
            <div className="h-7 w-7 rounded-md overflow-hidden bg-blue-900 flex items-center justify-center">
              <img
                src={logo}
                alt="PSHRDB Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-[11px] xs:text-xs sm:text-sm font-semibold text-blue-950 tracking-wide truncate">
                ICT Service Request{' '}
                <span className="text-orange-500">Management System</span>
              </h1>
              <span className="text-[10px] xs:text-[11px] text-slate-500">
                Technician workspace
              </span>
            </div>
          </div>

          
         <div className="flex-1 min-w-0">
            <p className="text-[11px] xs:text-xs sm:text-sm font-semibold text-blue-950 leading-tight truncate">
              <span className="hidden sm:inline">
                Addis Ababa City Administration Public Service and Human
                Resource Development Bureau
              </span>
              <span className="sm:hidden">PSHRDB</span>{' '}
              <span className="text-orange-500">
                ICT Service Request Management System
              </span>
            </p>
          </div>

          {user && (
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <NotificationBell />

              <button
                type="button"
                onClick={handleProfileClick}
                className="flex items-center gap-2"
                title="View profile"
              >
                <div className="h-8 w-8 rounded-md bg-slate-200 overflow-hidden flex items-center justify-center text-[11px] font-semibold text-slate-700">
                  {user.avatar_url ? (
                    <img
                      src={resolveAvatarUrl(user.avatar_url)}
                      alt={user.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs sm:text-sm">
                      {initials(user.full_name)}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-[11px] leading-tight text-slate-600 text-left">
                  <span className="font-medium truncate max-w-[140px]">
                    {user.full_name}
                  </span>
                  <span className="text-slate-500 truncate max-w-[140px]">
                    {user.email}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleProfileClick}
                className="hidden md:inline-flex items-center rounded-md border border-slate-300 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
              >
                My Profile
              </button>

              <button
                type="button"
                onClick={handleLogoutClick}
                className="inline-flex items-center gap-1.5 rounded-md bg-orange-500 px-2.5 sm:px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-orange-600"
              >
                <LogoutIcon className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </header>

        
        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full">
            <div className="p-3 sm:p-4 lg:p-6 h-full overflow-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

