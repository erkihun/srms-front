import React, { useEffect, useState } from 'react';
import axios from '../../lib/axiosClient.js';
import { Link, useNavigate } from 'react-router-dom';

export default function EmployeeRegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [departments, setDepartments] = useState([]);
  const [loadingDeps, setLoadingDeps] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoadingDeps(true);
    axios
      .get('/departments')
      .then((res) => {
        setDepartments(res.data || []);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load departments. Please try again later.');
      })
      .finally(() => setLoadingDeps(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (!departmentId) {
      setError('Please select your department.');
      return;
    }

    setSaving(true);
    try {
      await axios.post('/auth/register-employee', {
        full_name: fullName,
        email,
        password,
        role: 'EMPLOYEE',            
        department_id: departmentId, 
      });

      setSuccess('Account created successfully. You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        'Failed to create account. Please try again.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="space-y-1 text-center">
          <h1 className="text-lg font-semibold text-slate-900">
            Employee Self-Registration
          </h1>
          <p className="text-xs text-slate-500">
            Create your ICT service request account using your work email.
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

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-600">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-600">
              Work email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@organization.gov"
              required
            />
          </div>

          
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-600">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              disabled={loadingDeps}
              required
            >
              <option value="">
                {loadingDeps ? 'Loading departments…' : 'Select department'}
              </option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-600">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-600">
              Confirm password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving || loadingDeps}
            className="w-full rounded-md bg-blue-700 px-4 py-2 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {saving ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-700 hover:text-blue-900"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


