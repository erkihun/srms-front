
import React, { useEffect, useState } from 'react';
import axios from '../../lib/axiosClient.js';
import { useNavigate } from 'react-router-dom';

export default function UsersListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [viewUser, setViewUser] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const navigate = useNavigate();

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

  const formatDateTime = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  };

  const loadUsers = () => {
    setLoading(true);
    setError('');
    axios
      .get('/users')
      .then((usr) => setUsers(usr.data || []))
      .catch((err) => {
        console.error(err);
        setError('Failed to load users.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/users/${id}`);
      setSuccess('User deactivated.');
      loadUsers();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Failed to deactivate user.'
      );
    }
  };

  const handleActivate = async (user) => {
    setError('');
    setSuccess('');
    try {
      const fd = new FormData();
      fd.append('is_active', 'true');
      await axios.put(`/users/${user.id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('User activated.');
      loadUsers();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Failed to activate user.'
      );
    }
  };

  const handleView = async (id) => {
    setError('');
    setSuccess('');
    setViewLoading(true);
    try {
      const usr = await axios.get(`/users/${id}`);
      setViewUser(usr.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Failed to load user details.'
      );
    } finally {
      setViewLoading(false);
    }
  };

  const closeViewModal = () => setViewUser(null);

  const roleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TECHNICIAN':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'EMPLOYEE':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1 text-blue-950">Users</h2>
          <p className="text-xs text-slate-500">
            Manage system users, their roles, and profile information.
          </p>
        </div>
        <button
          onClick={() => navigate('/users/new')}
          className="inline-flex items-center rounded-md bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800"
        >
          + Add User
        </button>
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

      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        {loading ? (
          <div className="p-4 text-sm text-slate-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">No users found.</div>
        ) : (
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  User
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  Email
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  Phone
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  Role
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
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-100 hover:bg-slate-50/80"
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-[11px] font-semibold text-slate-700">
                        {u.avatar_url ? (
                          <img
                            src={resolveAvatarUrl(u.avatar_url)}
                            alt={u.full_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initials(u.full_name)
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-900">
                          {u.full_name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {u.username ? `@${u.username}` : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-700">{u.email}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {u.phone || '-'}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${roleBadgeClass(
                        u.role
                      )}`}
                    >
                      {u.role}
                    </span>
                  </td>
                
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${
                        u.is_active
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
<td className="px-3 py-2">
  <div className="flex items-center gap-2">
    <button
      onClick={() => handleView(u.id)}
      className="inline-flex items-center rounded-full border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
    >
      View
    </button>

    <button
      onClick={() => navigate(`/users/${u.id}/edit`)}
      className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100"
    >
      Edit
    </button>

    {u.is_active ? (
      <button
        onClick={() => handleDeactivate(u.id)}
        className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100"
      >
        Deactivate
      </button>
    ) : (
      <button
        onClick={() => handleActivate(u)}
        className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
      >
        Activate
      </button>
    )}
  </div>
</td>


                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                User Details
              </h3>
              <button
                onClick={closeViewModal}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {viewLoading ? (
              <div className="text-sm text-slate-500">Loading...</div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xs font-semibold text-slate-700">
                    {viewUser.avatar_url ? (
                      <img
                        src={resolveAvatarUrl(viewUser.avatar_url)}
                        alt={viewUser.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials(viewUser.full_name)
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {viewUser.full_name}
                    </div>
                    {viewUser.username && (
                      <div className="text-xs text-slate-500">
                        @{viewUser.username}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <div className="text-slate-500">Email</div>
                    <div className="text-slate-800">{viewUser.email}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Phone</div>
                    <div className="text-slate-800">
                      {viewUser.phone || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Role</div>
                    <div className="text-slate-800">{viewUser.role}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Department</div>
                    <div className="text-slate-800">
                      {viewUser.department_name || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Status</div>
                    <div className="text-slate-800">
                      {viewUser.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Created At</div>
                    <div className="text-slate-800">
                      {formatDateTime(viewUser.created_at)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Last Updated</div>
                    <div className="text-slate-800">
                      {formatDateTime(viewUser.updated_at)}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={closeViewModal}
                    className="px-3 py-1.5 text-xs rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

