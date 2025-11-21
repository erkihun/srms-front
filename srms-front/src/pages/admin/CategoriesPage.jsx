import React, { useEffect, useState } from 'react';
import axios from '../../lib/axiosClient.js';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    is_active: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCategories = () => {
    setLoading(true);
    setError('');
    axios
      .get('/categories')
      .then((res) => setCategories(res.data || []))
      .catch((err) => {
        console.error(err);
        setError('Failed to load categories.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', is_active: true });
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim()) {
      setError('Category name is required.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`/categories/${editingId}`, form);
        setSuccess('Category updated successfully.');
      } else {
        await axios.post('/categories', form);
        setSuccess('Category created successfully.');
      }
      resetForm();
      loadCategories();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to save category. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description || '',
      is_active: !!cat.is_active,
    });
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/categories/${id}`);
      setSuccess('Category deleted.');
      loadCategories();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Failed to delete category.'
      );
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-lg font-semibold mb-1 text-blue-950">
          Categories
        </h2>
        <p className="text-xs text-slate-500">
          Manage issue categories such as Hardware, Software, Network, etc.
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
          {editingId ? 'Edit Category' : 'Add Category'}
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
            <input
              id="is_active"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={form.is_active}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_active: e.target.checked }))
              }
            />
            <label
              htmlFor="is_active"
              className="text-xs font-medium text-slate-600"
            >
              Active
            </label>
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
                ? 'Update Category'
                : 'Add Category'}
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
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">
            No categories defined yet.
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
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  Active
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase w-40">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-b border-slate-100 hover:bg-slate-50/80"
                >
                  <td className="px-3 py-2 text-slate-800">{cat.name}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {cat.description || '-'}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${
                        cat.is_active
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
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

