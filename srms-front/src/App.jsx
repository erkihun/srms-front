import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import MainLayout from './components/layout/MainLayout.jsx';
import EmployeeLayout from './components/layout/EmployeeLayout.jsx';
import TechnicianLayout from './components/layout/TechnicianLayout.jsx';

import LoginPage from './pages/LoginPage.jsx';
import EmployeeRegisterPage from './pages/employee/EmployeeRegisterPage.jsx';

import DashboardPage from './pages/admin/DashboardPage.jsx';
import UsersListPage from './pages/admin/UsersListPage.jsx';
import UserFormPage from './pages/admin/UserFormPage.jsx'
import EmployeesPage from './pages/admin/EmployeesPage.jsx';
import DepartmentsPage from './pages/admin/DepartmentsPage.jsx';
import CategoriesPage from './pages/admin/CategoriesPage.jsx';
import TicketsPage from './pages/admin/TicketsPage.jsx';
import TicketDetailPage from './pages/admin/TicketDetailPage.jsx';
import TaskDetailPage from './pages/admin/TaskDetailPage.jsx';
import TasksListPage from './pages/admin/TasksListPage.jsx';
import TaskFormPage from './pages/admin/TaskFormPage.jsx';
import TechnicianPerformancePage from './pages/admin/TechnicianPerformancePage.jsx';

import EmployeeMyTicketsPage from './pages/employee/EmployeeMyTicketsPage.jsx';
import EmployeeNewRequestPage from './pages/employee/EmployeeNewRequestPage.jsx';
import EmployeeTicketDetailPage from './pages/employee/EmployeeTicketDetailPage.jsx';
import EmployeeNotificationsPage from './pages/employee/EmployeeNotificationsPage.jsx';
import EmployeeProfilePage from './pages/employee/EmployeeProfilePage.jsx';

import TechnicianAssignedTicketsPage from './pages/technician/TechnicianAssignedTicketsPage.jsx';
import TechnicianTicketDetailPage from './pages/technician/TechnicianTicketDetailPage.jsx';
import TechnicianDashboardPage from './pages/technician/TechnicianDashboardPage.jsx';
import TechnicianAssignedTaskPage from './pages/technician/TechnicianAssignedTaskPage.jsx';
import TechnicianTaskDetailPage from './pages/technician/TechnicianTaskDetailPage.jsx';

import ProfilePage from './pages/ProfilePage.jsx';

function PrivateRoute({ children, allowedRoles }) {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white rounded-lg shadow-md border border-slate-200 px-6 py-4 text-sm text-slate-600">
          Checking your session...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/" replace />;
    if (user.role === 'TECHNICIAN') return <Navigate to="/technician" replace />;
    if (user.role === 'EMPLOYEE') return <Navigate to="/employee" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<EmployeeRegisterPage />} />

      
      <Route
        path="/"
        element={
          <PrivateRoute>
            {user?.role === 'ADMIN' ? (
              <MainLayout />
            ) : user?.role === 'TECHNICIAN' ? (
              <Navigate to="/technician" replace />
            ) : (
              <Navigate to="/employee" replace />
            )}
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
      <Route path="users" element={<UsersListPage />} />
      <Route path="users/new" element={<UserFormPage />} />
      <Route path="users/:id/edit" element={<UserFormPage />} />
      <Route path="employees" element={<EmployeesPage />} />

        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="tickets/:id" element={<TicketDetailPage />} />
        
        <Route path="profile" element={<ProfilePage />} />
        
        <Route path="tasks" element={<TasksListPage />} />
        <Route path="tasks/new" element={<TaskFormPage />} />
        <Route path="tasks/:id" element={<TaskDetailPage />} />
        <Route path="tasks/:id/edit" element={<TaskFormPage />} />
        <Route path="technician-performance" element={<TechnicianPerformancePage />} />
      </Route>

      
      <Route
        path="/employee"
        element={
          <PrivateRoute allowedRoles={['EMPLOYEE']}>
            <EmployeeLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<EmployeeMyTicketsPage />} />
        
        <Route path="requests/:id" element={<EmployeeTicketDetailPage />} />
        <Route path="new-request" element={<EmployeeNewRequestPage />} />
        <Route path="tickets/:id" element={<EmployeeTicketDetailPage />} />
        <Route path="notifications" element={<EmployeeNotificationsPage />} />
        <Route path="profile" element={<EmployeeProfilePage />} />
      </Route>

      
      <Route
        path="/technician"
        element={
          <PrivateRoute allowedRoles={['TECHNICIAN']}>
            <TechnicianLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<TechnicianDashboardPage />} />
        <Route path="assigned" element={<TechnicianAssignedTicketsPage />} />
        <Route path="tickets/:id" element={<TechnicianTicketDetailPage />} />
        
        <Route path="profile" element={<ProfilePage />} />
        <Route path="/technician/tasks" element={<TechnicianAssignedTaskPage />} />
        <Route
  path="/technician/tasks/:id"
  element={<TechnicianTaskDetailPage />}
/>
      </Route>

      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

