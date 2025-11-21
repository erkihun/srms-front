import React, { useEffect, useState } from 'react';
import axios from '../lib/axiosClient.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProfilePage() {
  const { user: authUser } = useAuth(); 
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    avatarFile: null,
    avatarPreview: '',
    new_password: '',
    confirm_password: '',
  });

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

  const loadProfile = async () => {
    if (!authUser?.id) return;
    setError('');
    setSuccess('');
    try {
      const res = await axios.get(`/users/${authUser.id}`);
      setUser(res.data);
      setForm((f) => ({
        ...f,
        full_name: res.data.full_name || '',
        username: res.data.username || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        avatarFile: null,
        avatarPreview: res.data.avatar_url || '',
        new_password: '',
        confirm_password: '',
      }));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load profile.');
    }
  };

  useEffect(() => {
    loadProfile();
  }, [authUser?.id]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!authUser?.id) {
      setError('Not authenticated.');
      return;
    }
    if (!form.full_name.trim()) {
      setError('Full name is required.');
      return;
    }

    if (form.new_password || form.confirm_password) {
      if (!form.new_password || !form.confirm_password) {
        setError('Please fill both new password and confirmation.');
        return;
      }
      if (form.new_password.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      if (form.new_password !== form.confirm_password) {
        setError('New password and confirmation do not match.');
        return;
      }
    }

    setSaving(true);
    try {
      const prof = new FormData();
      prof.append('full_name', form.full_name);
      prof.append('username', form.username || '');
      prof.append('phone', form.phone || '');
      prof.append('email', form.email);

      if (form.avatarFile) {
        prof.append('avatar', form.avatarFile);
      }

      if (form.new_password) {
        prof.append('password', form.new_password);
      }

      const res = await axios.put(`/users/${authUser.id}`, prof, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(
        form.new_password
          ? 'Profile and password updated successfully.'
          : 'Profile updated successfully.'
      );
      setUser(res.data);
      setForm((f) => ({
        ...f,
        avatarFile: null,
        avatarPreview: res.data.avatar_url || f.avatarPreview,
        new_password: '',
        confirm_password: '',
      }));
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to update profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!authUser) {
    return (
      <div className="text-sm text-red-600">
        You are not logged in. Please login again.
      </div>
    );
  }

  if (!user) {
    if (error) {
      return (
        <div className="max-w-lg mx-auto mt-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      );
    }
    return (
      <div className="text-sm text-slate-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      
      <div className="bg-blue-950 rounded-2xl p-4 sm:p-5 text-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-md bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center text-sm font-semibold">
            {form.avatarPreview ? (
              <img
                src={resolveAvatarUrl(form.avatarPreview)}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-base sm:text-lg">
                {initials(form.full_name || user.full_name)}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold truncate">
              {form.full_name || user.full_name}
            </h2>
            <p className="text-xs sm:text-[11px] text-blue-100 truncate">
              {form.email}
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5 text-[10px]">
              <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5">
                Role:&nbsp;
                <span className="font-semibold uppercase">
                  {authUser?.role}
                </span>
              </span>
            </div>
          </div>
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

      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-800">
                Profile information
              </h3>
              <span className="text-[11px] text-slate-400">
                Keep your details up to date.
              </span>
            </div>

            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1 border-t border-slate-100">
              <div className="flex-1 text-xs space-y-1">
                <p className="font-medium text-slate-700">
                  Profile photo
                </p>
                <p className="text-slate-500">
                  This will be used across the system to identify your account.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="mt-2 text-[11px]"
                />
                <p className="text-[10px] text-slate-400">
                  Upload a square image (max 2MB) for best results.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              
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
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
                  value={form.email}
                  readOnly
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  Email changes are managed by the system administrator.
                </p>
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
          </div>

          
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-800">
                Change password
              </h3>
              <span className="text-[11px] text-slate-400">
                Optional – leave empty to keep current password.
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  New password
                </label>
                <input
                  type="password"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.new_password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, new_password: e.target.value }))
                  }
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Confirm new password
                </label>
                <input
                  type="password"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.confirm_password}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      confirm_password: e.target.value,
                    }))
                  }
                  placeholder="Re-type new password"
                />
              </div>
            </div>

            <p className="text-[10px] text-slate-400">
              For security reasons, you may be asked to confirm this change
              through your registered contact information if verification
              features are enabled by the administrator.
            </p>
          </div>

          
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={loadProfile}
              disabled={saving}
              className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


