import React, { useEffect, useState } from 'react';
import axios from '../../lib/axiosClient.js';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadDepartments = () => {
    setLoading(true);
    setError('');
    axios
      .get('/departments')
      .then((res) => setDepartments(res.data || []))
      .catch((err) => {
        console.error(err);
        setError('Failed to load departments.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const resetForm = () => {
    setForm({ name: '', description: '' });
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim()) {
      setError('Department name is required.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`/departments/${editingId}`, form);
        setSuccess('Department updated successfully.');
      } else {
        await axios.post('/departments', form);
        setSuccess('Department created successfully.');
      }
      resetForm();
      loadDepartments();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to save department. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (dep) => {
    setEditingId(dep.id);
    setForm({ name: dep.name, description: dep.description || '' });
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/departments/${id}`);
      setSuccess('Department deleted.');
      loadDepartments();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Failed to delete department.'
      );
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-lg font-semibold mb-1 text-blue-950">
          Departments
        </h2>
        <p className="text-xs text-slate-500">
          Manage office departments that submit service requests.
        </p>
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

      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-950 p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">
          {editingId ? 'Edit Department' : 'Add Department'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Description
            </label>
            <textarea
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
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
                ? 'Update Department'
                : 'Add Department'}
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
        {loading ? (
          <div className="p-4 text-sm text-slate-500">
            Loading departments...
          </div>
        ) : departments.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">
            No departments defined yet.
          </div>
        ) : (
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  Description
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase w-40">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dep) => (
                <tr
                  key={dep.id}
                  className="border-b border-slate-100 hover:bg-slate-50/80"
                >
                  <td className="px-3 py-2 text-slate-800">{dep.name}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {dep.description || '-'}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(dep)}
                        className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(dep.id)}
                        className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100"
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

