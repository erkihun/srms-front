import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../lib/axiosClient.js';
import { useAuth } from '../../context/AuthContext.jsx';

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'];

export default function TechnicianAssignedTaskPage() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DONE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const priorityBadgeClass = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const loadTasks = async () => {
    if (!authUser?.id) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/tasks', {
        params: { assigned_to: authUser.id },
      });
      setTasks(res.data || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to load your assigned tasks.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [authUser?.id]);

  if (!authUser) {
    return (
      <div className="text-sm text-red-600">
        You are not logged in. Please login again.
      </div>
    );
  }

  if (authUser.role !== 'TECHNICIAN') {
    return (
      <div className="text-sm text-slate-600">
        This page is only available for technicians.
      </div>
    );
  }

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus && t.status !== filterStatus) return false;
    return true;
  });

  const handleView = (taskId) => {
    navigate(`/technician/tasks/${taskId}`);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold mb-1 text-blue-950">
            My Assigned Tasks
          </h2>
          <p className="text-xs text-slate-500">
            Tasks assigned to you by the admin (separate from service tickets).
          </p>
        </div>
        <div className="text-[11px] text-slate-500">
          Total: <span className="font-semibold">{tasks.length}</span>
        </div>
      </div>

      
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      
      <div className="bg-white rounded-lg border border-slate-200 px-3 py-2 flex flex-wrap items-center gap-3 text-xs">
        <span className="font-medium text-slate-600">Filter:</span>
        <select
          className="rounded-md border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={loadTasks}
          className="ml-auto inline-flex items-center rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        {loading ? (
          <div className="p-4 text-sm text-slate-500">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">
            No tasks assigned to you.
          </div>
        ) : (
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  Title
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  Priority
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  Due Date
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  Created By
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-slate-100 hover:bg-slate-50/80"
                >
                  <td className="px-3 py-2 align-top">
                    <div className="text-xs font-medium text-slate-900">
                      {t.title}
                    </div>
                    {t.description && (
                      <div className="text-[11px] text-slate-500 mt-0.5 whitespace-pre-line line-clamp-2">
                        {t.description}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${statusBadgeClass(
                        t.status
                      )}`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${priorityBadgeClass(
                        t.priority
                      )}`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top text-slate-700">
                    {formatDate(t.due_date)}
                  </td>
                  <td className="px-3 py-2 align-top text-slate-700">
                    {t.created_by_name || '-'}
                  </td>
                  <td className="px-3 py-2 align-top text-xs">
                    <button
                      type="button"
                      onClick={() => handleView(t.id)}
                      className="inline-flex items-center rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-slate-50"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

