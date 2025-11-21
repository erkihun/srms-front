import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../lib/axiosClient.js';
import { useNavigate } from 'react-router-dom';

export default function EmployeesPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewEmployee, setViewEmployee] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const navigate = useNavigate();

  const loadEmployees = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.get('/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const employees = useMemo(
    () => users.filter((u) => u.role === 'EMPLOYEE'),
    [users]
  );

  const handleView = async (id) => {
    setError('');
    setSuccess('');
    setViewLoading(true);
    try {
      const res = await axios.get(`/users/${id}`);
      setViewEmployee(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load employee details.');
    } finally {
      setViewLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this employee?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/users/${id}`);
      setSuccess('Employee deactivated.');
      await loadEmployees();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to deactivate employee.');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-blue-950">Employees</h1>
        <p className="text-xs text-slate-500">
          Directory of registered employee accounts for the ICT service portal.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="border border-slate-200 border-t-4 border-t-blue-600 rounded-lg bg-white p-4 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500">Loading employees...</p>
        ) : employees.length === 0 ? (
          <p className="text-sm text-slate-500">No employee accounts found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                    Department
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b border-slate-100 hover:bg-slate-50/80"
                >
                  <td className="px-3 py-2 text-slate-800">{emp.full_name}</td>
                  <td className="px-3 py-2 text-slate-600">{emp.email}</td>
                  <td className="px-3 py-2 text-slate-600">
                    {emp.department_name || '—'}
                  </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          emp.is_active
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleView(emp.id)}
                          className="inline-flex items-center rounded-full border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/users/${emp.id}/edit`)}
                          className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeactivate(emp.id)}
                          className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100"
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Employee Details</h3>
              <button
                onClick={() => setViewEmployee(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ×
              </button>
            </div>
            {viewLoading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : (
              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  <span className="text-slate-500">Name:</span>{' '}
                  {viewEmployee?.full_name}
                </p>
                <p>
                  <span className="text-slate-500">Email:</span>{' '}
                  {viewEmployee?.email}
                </p>
                <p>
                  <span className="text-slate-500">Department:</span>{' '}
                  {viewEmployee?.department_name || '—'}
                </p>
                <p>
                  <span className="text-slate-500">Status:</span>{' '}
                  {viewEmployee?.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
