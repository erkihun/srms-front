import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import axios from '../../lib/axiosClient.js';
import NotificationBell from '../NotificationBell.jsx';

import logo from '../../assets/ps-logo.png';

function DashboardIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="15" width="7" height="6" rx="1" />
    </svg>
  );
}

function UsersIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <circle cx="9" cy="7" r="3" />
      <path d="M22 21v-1a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a3 3 0 0 1 0 5.76" />
    </svg>
  );
}

function DepartmentsIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21V9l9-6 9 6v12" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function CategoriesIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7h7V3H3z" />
      <path d="M14 7h7V3h-7z" />
      <path d="M3 21h7v-4H3z" />
      <path d="M14 21h7v-8h-7z" />
    </svg>
  );
}

function TicketsIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9h2a2 2 0 0 1 0 4H3v4a2 2 0 0 0 2 2h6l10-10-4-4-10 10v-6a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

function TasksIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11l2 2 4-4" />
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 4V2" />
      <path d="M17 4V2" />
      <path d="M3 8h18" />
    </svg>
  );
}

function PerformanceIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21h18" />
      <path d="M7 21v-7" />
      <path d="M12 21v-11" />
      <path d="M17 21v-4" />
      <path d="M7 10l3-3 2 2 4-4" />
    </svg>
  );
}

function EmployeeIcon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="3" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a3 3 0 0 1 0 5.76" />
    </svg>
  );
}

function SidebarContent({ onLinkClick }) {
  const navLinkBase =
    'flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm';
  const navLinkActive = 'bg-blue-800 text-orange-300';
  const navLinkInactive =
    'text-blue-100 hover:bg-blue-900 hover:text-orange-200';

  return (
    <div className="flex flex-col h-full">
      
      <div className="h-20 flex items-center px-4 border-b border-blue-900">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-md flex items-center justify-center overflow-hidden">
            <img
              src={logo}
              alt="PSHRDB Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold tracking-wide">
              PSHRDB
            </span>
            <span className="text-[11px] text-blue-100/80">
              ICT Service Request
            </span>
          </div>
        </div>
      </div>

      
      <nav className="flex-1 px-2 py-4 space-y-1 text-sm overflow-y-auto">
        <NavLink
          to="/"
          end
          onClick={onLinkClick}
          className={({ isActive }) =>
            [navLinkBase, isActive ? navLinkActive : navLinkInactive].join(' ')
          }
        >
          <DashboardIcon />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/users"
          onClick={onLinkClick}
          className={({ isActive }) =>
            [navLinkBase, isActive ? navLinkActive : navLinkInactive].join(' ')
          }
        >
          <UsersIcon />
          <span>Users</span>
        </NavLink>

        <NavLink
          to="/employees"
          onClick={onLinkClick}
          className={({ isActive }) =>
            [navLinkBase, isActive ? navLinkActive : navLinkInactive].join(' ')
          }
        >
          <EmployeeIcon />
          <span>Employees</span>
        </NavLink>

        <NavLink
          to="/departments"
          onClick={onLinkClick}
          className={({ isActive }) =>
            [navLinkBase, isActive ? navLinkActive : navLinkInactive].join(' ')
          }
        >
          <DepartmentsIcon />
          <span>Departments</span>
        </NavLink>

        <NavLink
          to="/categories"
          onClick={onLinkClick}
          className={({ isActive }) =>
            [navLinkBase, isActive ? navLinkActive : navLinkInactive].join(' ')
          }
        >
          <CategoriesIcon />
          <span>Categories</span>
        </NavLink>

        <NavLink
          to="/tickets"
          onClick={onLinkClick}
          className={({ isActive }) =>
            [navLinkBase, isActive ? navLinkActive : navLinkInactive].join(' ')
          }
        >
          <TicketsIcon />
          <span>Tickets</span>
        </NavLink>

        <NavLink
          to="/tasks"
          onClick={onLinkClick}
          className={({ isActive }) =>
            [navLinkBase, isActive ? navLinkActive : navLinkInactive].join(' ')
          }
        >
          <TasksIcon />
          <span>Tasks</span>
        </NavLink>

        <NavLink
          to="/technician-performance"
          onClick={onLinkClick}
          className={({ isActive }) =>
            [navLinkBase, isActive ? navLinkActive : navLinkInactive].join(' ')
          }
        >
          <PerformanceIcon />
          <span>Technician Performance</span>
        </NavLink>
      </nav>

      <div className="px-4 py-3 border-t border-blue-900 text-[11px] text-blue-200">
        ICT Service Request Management System
      </div>
    </div>
  );
}

export default function MainLayout() {
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

  const handleProfileClick = () => {
    navigate('/profile');
    setSidebarOpen(false);
  };

  const handleLogoutClick = () => {
    logout();
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      
      <aside className="hidden lg:flex w-64 bg-blue-950 text-blue-50">
        <SidebarContent />
      </aside>

      
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          
          <div className="relative z-50 w-64 bg-blue-950 text-blue-50 shadow-xl">
            <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      
      <main className="flex-1 flex flex-col">
        
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
            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
              <NotificationBell />

              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={handleProfileClick}
                title="View profile"
              >
                <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-[11px] font-semibold text-slate-700">
                  {user.avatar_url ? (
                    <img
                      src={resolveAvatarUrl(user.avatar_url)}
                      alt={user.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials(user.full_name)
                  )}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-medium text-slate-800 truncate max-w-[140px]">
                    {user.full_name}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                    {user.email}
                  </span>
                </div>
              </div>

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
                className="inline-flex items-center rounded-md bg-orange-500 px-2.5 sm:px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-orange-600"
              >
                Logout
              </button>
            </div>
          )}
        </header>

        
        <div className="flex-1 p-3 sm:p-4 lg:p-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full">
            <div className="p-3 sm:p-4 lg:p-6 h-full overflow-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

