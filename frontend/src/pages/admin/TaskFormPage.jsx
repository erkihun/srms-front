import React, { useEffect, useState } from 'react';
import axios from '../../lib/axiosClient.js';
import { useNavigate, useParams, Link } from 'react-router-dom';

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];

export default function TaskFormPage() {
  const { id } = useParams(); 
  const isEdit = Boolean(id);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'OPEN',
    priority: 'MEDIUM',
    assigned_to: '',
    due_date: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const formatDateInput = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  };

  const loadMeta = async () => {
    try {
      const userRes = await axios.get('/users');
      setUsers(userRes.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load users.');
    }
  };

  const loadTask = async () => {
    if (!isEdit) return;
    setLoading(true);
    try {
      const tsk = await axios.get(`/tasks/${id}`);
      const t = tsk.data;
      setForm({
        title: t.title || '',
        description: t.description || '',
        status: t.status || 'OPEN',
        priority: t.priority || 'MEDIUM',
        assigned_to: t.assigned_to || '',
        due_date: formatDateInput(t.due_date),
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load task.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeta();
    loadTask();
  }, [id]);

  const technicians = users.filter(
    (u) => u.role === 'TECHNICIAN' && (u.is_active ?? true)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description || '',
        status: form.status,
        priority: form.priority,
        assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
        due_date: form.due_date || null,
      };

      if (isEdit) {
        await axios.put(`/tasks/${id}`, payload);
        setSuccess('Task updated successfully.');
      } else {
        await axios.post('/tasks', payload);
        setSuccess('Task created successfully.');
      }

      setTimeout(() => navigate('/tasks'), 600);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to save task. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-slate-500">
        Loading task information...
      </div>
    );
  }

  return (
    <div className="space-y-5 ">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-blue-950">
            {isEdit ? 'Edit Task' : 'Add Task'}
          </h2>
          <p className="text-xs text-slate-500">
            {isEdit
              ? 'Update details for this admin task.'
              : 'Create a new internal task for follow-up.'}
          </p>
        </div>
        <Link
          to="/tasks"
          className="text-xs font-medium text-blue-700 hover:text-blue-900"
        >
          ← Back to tasks
        </Link>
      </div>

      
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
          {success}
        </div>
      )}

      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-500 p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Prepare monthly report"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Assigned To (Technician)
              </label>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.assigned_to}
                onChange={(e) =>
                  setForm((f) => ({ ...f, assigned_to: e.target.value }))
                }
              >
                <option value="">-- Unassigned --</option>
                {technicians.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Optional details about this task"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Status
              </label>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Priority
              </label>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priority: e.target.value }))
                }
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Due Date
              </label>
              <input
                type="date"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.due_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, due_date: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {saving
                ? 'Saving...'
                : isEdit
                ? 'Update Task'
                : 'Add Task'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


