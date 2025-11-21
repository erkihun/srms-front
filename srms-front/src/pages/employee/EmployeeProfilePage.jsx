import React, { useEffect, useState } from 'react';
import axios from '../../lib/axiosClient.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function EmployeeProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [profileRes, deptRes] = await Promise.all([
          axios.get('/auth/me'),
          axios.get('/departments'),
        ]);
        const profile = profileRes.data || {};
        setFullName(profile.full_name || '');
        setEmail(profile.email || '');
        setPhone(profile.phone || '');
        setDepartmentId(profile.department_id ? String(profile.department_id) : '');
        setDepartments(deptRes.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load profile information.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSuccess('');
    if (newPassword && newPassword !== confirmPassword) {
      setError('New password and confirmation must match.');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('full_name', fullName);
      fd.append('phone', phone);
      fd.append('department_id', departmentId);
      if (newPassword) {
        fd.append('password', newPassword);
      }
      await axios.put(`/users/${user.id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Profile updated successfully.');
      if (newPassword) {
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-blue-950">My Profile</h1>
        <p className="text-xs text-slate-500">
          Update your contact information and department details.
        </p>
      </div>

      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-slate-200 border-t-4 border-t-blue-600 bg-white p-4 shadow-sm space-y-3"
      >
        <div className="space-y-1">
          <label className="block text-[11px] font-medium text-slate-600">
            Full Name
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-medium text-slate-600">
            Email
          </label>
          <input
            type="email"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
            value={email}
            disabled
          />
          <p className="text-[10px] text-slate-500">
            Contact your administrator to change your email.
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-medium text-slate-600">
            Phone
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +251900000000"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-medium text-slate-600">
            Department
          </label>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
          >
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-medium text-slate-600">
            New Password
          </label>
          <input
            type="password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
            minLength={6}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-medium text-slate-600">
            Confirm New Password
          </label>
          <input
            type="password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-700 px-4 py-2 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
