import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../lib/axiosClient.js';

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssigned, setFilterAssigned] = useState('');

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

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      status: 'OPEN',
      priority: 'MEDIUM',
      assigned_to: '',
      due_date: '',
    });
    setEditingId(null);
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  };

  const formatDateInput = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10); 
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [taskRes, userRes] = await Promise.all([
        axios.get('/tasks'),
        axios.get('/users'),
      ]);
      setTasks(taskRes.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load tasks or users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

      if (editingId) {
        await axios.put(`/tasks/${editingId}`, payload);
        setSuccess('Task updated successfully.');
      } else {
        await axios.post('/tasks', payload);
        setSuccess('Task created successfully.');
      }

      resetForm();
      loadData();
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

  const handleEdit = (task) => {
    setEditingId(task.id);
    setForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'OPEN',
      priority: task.priority || 'MEDIUM',
      assigned_to: task.assigned_to || '',
      due_date: formatDateInput(task.due_date),
    });
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/tasks/${id}`);
      setSuccess('Task deleted.');
      loadData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    setError('');
    setSuccess('');
    try {
      await axios.put(`/tasks/${task.id}`, {
        status: newStatus,
      });
      setSuccess('Task status updated.');
      loadData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const technicians = users.filter(
    (u) => u.role === 'TECHNICIAN' && (u.is_active ?? true)
  );

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterAssigned && String(t.assigned_to) !== filterAssigned) return false;
    return true;
  });

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

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold mb-1 text-blue-950">Tasks</h2>
          <p className="text-xs text-slate-500">
            Admin tasks for follow-up and internal work (separate from tickets).
          </p>
        </div>
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
        <h3 className="text-sm font-semibold text-blue-900 mb-3">
          {editingId ? 'Edit Task' : 'Add Task'}
        </h3>

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

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {saving
                ? 'Saving...'
                : editingId
                ? 'Update Task'
                : 'Add Task'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>

      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <div className="px-3 py-2 border-b border-slate-100 flex flex-wrap items-center gap-3 text-xs">
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

          <select
            className="rounded-md border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filterAssigned}
            onChange={(e) => setFilterAssigned(e.target.value)}
          >
            <option value="">All assignees</option>
            {technicians.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-4 text-sm text-slate-500">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">No tasks found.</div>
        ) : (
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  Title
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  Assigned To
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
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase w-48">
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
                  <td className="px-3 py-2">
                    <div className="text-xs font-medium text-slate-900">
                      {t.title}
                    </div>
                    {t.description && (
                      <div className="text-[11px] text-slate-500 line-clamp-2">
                        {t.description}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {t.assigned_to_name || '-'}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${statusBadgeClass(
                        t.status
                      )}`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${priorityBadgeClass(
                        t.priority
                      )}`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {formatDate(t.due_date)}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/tasks/${t.id}`)}
                        className="inline-flex items-center rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-slate-50"
                      >
                        View
                      </button>

                      <button
                        onClick={() => handleEdit(t)}
                        className="inline-flex items-center px-3 py-1.5 rounded-md border border-blue-600 text-[11px] font-medium text-blue-700 hover:bg-blue-600 hover:text-white transition"
                      >
                        Edit
                      </button>

                   

                      <button
                        onClick={() => handleDelete(t.id)}
                        className="inline-flex items-center px-3 py-1.5 rounded-md border border-red-500 text-[11px] font-medium text-red-600 hover:bg-red-500 hover:text-white transition"
                      >
                        Delete
                      </button>
                    </div>
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


