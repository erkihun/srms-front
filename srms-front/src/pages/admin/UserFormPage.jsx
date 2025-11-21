import React, { useEffect, useState } from 'react';
import axios from '../../lib/axiosClient.js';
import { useNavigate, useParams, Link } from 'react-router-dom';

const ROLES = ['ADMIN', 'TECHNICIAN'];

export default function UserFormPage() {
  const { id } = useParams(); 
  const isEdit = Boolean(id);

  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit); 

  const [form, setForm] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    role: 'ADMIN',
    department_id: '',
    phone: '',
    is_active: true,
    avatarFile: null,
    avatarPreview: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  useEffect(() => {
    const loadDeps = axios.get('/departments');

    if (!isEdit) {
      loadDeps
        .then((usr) => setDepartments(usr.data || []))
        .catch((err) => {
          console.error(err);
          setError('Failed to load departments.');
        });
      return;
    }

    setLoading(true);
    Promise.all([loadDeps, axios.get(`/users/${id}`)])
      .then(([depRes, userRes]) => {
        setDepartments(depRes.data || []);
        const u = userRes.data;
        setForm((f) => ({
          ...f,
          full_name: u.full_name || '',
          username: u.username || '',
          email: u.email || '',
          password: '',
          role: u.role || 'ADMIN',
          department_id: u.department_id || '',
          phone: u.phone || '',
          is_active: u.is_active,
          avatarFile: null,
          avatarPreview: u.avatar_url || '',
        }));
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load user or departments.');
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setForm((f) => ({ ...f, avatarFile: null, avatarPreview: '' }));
      return;
    }
    setForm((f) => ({
      ...f,
      avatarFile: file,
      avatarPreview: URL.createObjectURL(file),
    }));
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('full_name', form.full_name);
    fd.append('username', form.username || '');
    fd.append('email', form.email);
    fd.append('role', form.role);
    fd.append('department_id', form.department_id || '');
    fd.append('phone', form.phone || '');
    fd.append('is_active', form.is_active ? 'true' : 'false');

    if (!isEdit) {
      fd.append('password', form.password);
    }

    if (form.avatarFile) {
      fd.append('avatar', form.avatarFile);
    }

    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.full_name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!form.email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!isEdit && !form.password.trim()) {
      setError('Password is required for new users.');
      return;
    }

    setSaving(true);
    try {
      const fd = buildFormData();

      if (isEdit) {
        await axios.put(`/users/${id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('User updated successfully.');
      } else {
        await axios.post('/users', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('User created successfully.');
      }

      setTimeout(() => navigate('/users'), 600);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to save user. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-slate-500">
        Loading user information...
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-blue-950">
            {isEdit ? 'Edit User' : 'Add New User'}
          </h2>
          <p className="text-xs text-slate-500">
            {isEdit
              ? 'Update details for this system user.'
              : 'Create a new admin or technician account.'}
          </p>
        </div>
        <Link
          to="/users"
          className="text-xs font-medium text-blue-700 hover:text-blue-900"
        >
          ← Back to users
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

      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-950 p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.full_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, full_name: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Username
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
                placeholder="e.g. jdoe"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
          </div>

          
          {!isEdit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="Initial password"
                />
              </div>
            </div>
          )}

          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Role
              </label>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Department
              </label>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.department_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department_id: e.target.value }))
                }
              >
                <option value="">-- None / ICT central --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Phone
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="+2519..."
              />
            </div>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Avatar
              </label>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-[11px] font-semibold text-slate-700">
                  {form.avatarPreview ? (
                    <img
                      src={resolveAvatarUrl(form.avatarPreview)}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials(form.full_name)
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="text-xs"
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Optional – image file will be uploaded and stored on the server.
              </p>
            </div>

            <div className="flex items-center gap-2 mt-5 md:mt-7">
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
                ? 'Update User'
                : 'Create User'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/users')}
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


