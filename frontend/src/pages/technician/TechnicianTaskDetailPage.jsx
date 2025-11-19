import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../lib/axiosClient.js';
import { useAuth } from '../../context/AuthContext.jsx';

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'];

export default function TechnicianTaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [task, setTask] = useState(null);
  const [progress, setProgress] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [note, setNote] = useState('');
  const [statusValue, setStatusValue] = useState('OPEN');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  };

  const formatShortDate = (value) => {
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

  const priorityBadgeClass = (p) => {
    switch (p) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'LOW':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const loadTask = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/tasks/${id}`);
      setTask(res.data);
      setStatusValue(res.data.status || 'OPEN');
      setNote('');
    } catch (err) {
      console.error(err);
      setError('Failed to load task.');
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const res = await axios.get(`/tasks/${id}/progress`);
      setProgress(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTask();
    loadProgress();
  }, [id]);

  if (!task) {
    return loading ? (
      <div className="text-sm text-slate-500">Loading task...</div>
    ) : (
      <div className="text-sm text-red-600">Task not found.</div>
    );
  }

  const hasFinalRating = task.technician_rating != null;
  const canEdit =
    authUser?.role === 'TECHNICIAN' &&
    task?.assigned_to === authUser.id &&
    !hasFinalRating;

  const handleSaveProgress = async () => {
    if (!canEdit) return;
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await axios.put(`/tasks/${id}`, { status: statusValue, technician_note: note });
      setSuccess('Progress updated.');
      setNote('');
      await Promise.all([loadTask(), loadProgress()]);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update progress. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-blue-950">
            Task Details (Technician)
          </h2>
          <p className="text-[11px] text-slate-500">
            View task info, see admin rating and comments, and update your progress (if allowed).
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          ← Back
        </button>
      </div>

      
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
          {success}
        </div>
      )}

      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
        
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-slate-600 whitespace-pre-line mt-1">
              {task.description}
            </p>
          )}
        </div>

        
        <div className="flex flex-wrap gap-4 text-xs">
          <div>
            <span className="font-medium text-slate-500">Current Status:</span>{' '}
            <span
              className={`px-2 py-0.5 rounded-full border font-medium ${statusBadgeClass(
                task.status
              )}`}
            >
              {task.status.replace('_', ' ')}
            </span>
          </div>

          <div>
            <span className="font-medium text-slate-500">Priority:</span>{' '}
            <span
              className={`px-2 py-0.5 rounded-full border font-medium ${priorityBadgeClass(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          </div>

          <div>
            <span className="font-medium text-slate-500">Due:</span>{' '}
            <span className="text-slate-700">
              {formatShortDate(task.due_date)}
            </span>
          </div>

          <div>
            <span className="font-medium text-slate-500">Created:</span>{' '}
            <span className="text-slate-700">
              {formatDate(task.created_at)}
            </span>
          </div>

          <div>
            <span className="font-medium text-slate-500">Admin Rating:</span>{' '}
            {hasFinalRating ? (
              <span className="px-2 py-0.5 rounded-full border border-orange-200 bg-orange-50 text-orange-700 font-semibold">
                {task.technician_rating} / 5
              </span>
            ) : (
              <span className="text-slate-500">Not rated yet</span>
            )}
          </div>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2 border-t border-slate-200">
          <div>
            <div className="font-medium text-slate-700">Assigned To</div>
            <div className="text-slate-600">
              {task.assigned_to_name || '-'}
            </div>
          </div>
          <div>
            <div className="font-medium text-slate-700">Created By</div>
            <div className="text-slate-600">
              {task.created_by_name || '-'}
            </div>
          </div>
        </div>

        
        <div className="pt-3 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-700">
              Update Progress
            </div>
         
          </div>

          {canEdit ? (
            <>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    New Status
                  </label>
                  <select
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={statusValue}
                    onChange={(e) => setStatusValue(e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-slate-700">
                    Progress Note
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Saved together with status as a progress entry
                  </span>
                </div>
                <textarea
                  rows={4}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Describe what you did, findings, parts replaced, next steps, etc."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveProgress}
                  className="inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Progress'}
                </button>
              </div>
            </>
          ) : ('')}
        </div>

        
        <div className="pt-4 border-t border-slate-200 space-y-2">
          <div className="text-sm font-medium text-slate-700">
            Progress History
          </div>

          {progress.length === 0 ? (
            <p className="text-xs text-slate-500">
              No progress entries yet.
            </p>
          ) : (
            <ul className="space-y-2">
           {progress.map((p) => (
  <li
    key={p.id}
    className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
  >
    <div className="flex justify-between items-center mb-1">
      <div className="flex items-center gap-2">
        <span
          className={`px-2 py-0.5 rounded-full border font-medium ${statusBadgeClass(
            p.status
          )}`}
        >
          {p.status.replace('_', ' ')}
        </span>
        <span className="text-[11px] text-slate-500">
          {p.technician_name
            ? `Technician: ${p.technician_name}`
            : 'System / Admin update'}
        </span>
      </div>
      <span className="text-[11px] text-slate-400">
        {formatDate(p.created_at)}
      </span>
    </div>

    {p.note && (
      <div className="text-[11px] text-slate-700 whitespace-pre-line mb-1">
        {p.note}
      </div>
    )}

    {p.admin_comment && (
      <div className="mt-1 rounded-md border border-orange-100 bg-orange-50 px-2 py-1">
        <span className="text-[11px] font-semibold text-orange-800">
          Admin comment:{' '}
        </span>
        <span className="text-[11px] text-orange-900">
          {p.admin_comment}
        </span>
        {p.admin_name && (
          <span className="text-[10px] text-orange-700 ml-1">
            (by {p.admin_name})
          </span>
        )}
      </div>
    )}
  </li>
))}

            </ul>
          )}
        </div>
      </div>
    </div>
  );
}


