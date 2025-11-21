import React, { useEffect, useState } from 'react';
import axios from '../../lib/axiosClient.js';
import { Link } from 'react-router-dom';
import { getSlaBadgeProps } from '../../utils/sla.js';

const STATUS_OPTIONS = ['ALL', 'NEW', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'];
const PRIORITY_OPTIONS = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  const [error, setError] = useState('');

  const loadMeta = async () => {
    try {
      const [depRes, catRes] = await Promise.all([
        axios.get('/departments'),
        axios.get('/categories'),
      ]);
      setDepartments(depRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (departmentFilter) params.department_id = departmentFilter;
      if (categoryFilter) params.category_id = categoryFilter;

      const tik = await axios.get('/tickets', { params });

      let data = tik.data || [];

      if (priorityFilter !== 'ALL') {
        data = data.filter((t) => t.priority === priorityFilter);
      }
      if (search.trim()) {
        const s = search.trim().toLowerCase();
        data = data.filter(
          (t) =>
            t.ticket_code?.toLowerCase().includes(s) ||
            t.title?.toLowerCase().includes(s) ||
            t.requester_name?.toLowerCase().includes(s)
        );
      }

      setTickets(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter, departmentFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTickets();
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ON_HOLD':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CLOSED':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const priorityBadgeClass = (priority) => {
    switch (priority) {
      case 'LOW':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-5">
      
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-blue-950">
            All Tickets
          </h2>
          <p className="text-xs text-slate-500">
            Overview of all ICT service requests across departments.
          </p>
        </div>
      </div>

      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 border-t-4 border-t-blue-950 p-4 space-y-3">
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'All statuses' : s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p === 'ALL' ? 'All priorities' : p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col md:flex-row gap-2 items-start md:items-center justify-between pt-2 border-t border-slate-100"
        >
          <div className="flex-1 w-full">
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by code, title, or requester..."
              className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="pt-4 md:pt-5">
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-blue-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-800"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        {loading ? (
          <div className="p-4 text-sm text-slate-500">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">
            No tickets found for the selected filters.
          </div>
        ) : (
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  Code
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  Title
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  Priority
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  Requester
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  Department
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase">
                  Assigned
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                  SLA
                </th>
                <th className="px-3 py-2 text-right text-[11px] font-medium text-slate-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => {
                const sla = getSlaBadgeProps(t) || null;

                return (
                  <tr
                    key={t.id}
                    className="border-b border-slate-100 hover:bg-slate-50/80"
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-slate-800">
                      {t.ticket_code}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{t.title}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${statusBadgeClass(
                          t.status
                        )}`}
                      >
                        {t.status}
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
                      {t.requester_name}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {t.department_name}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {t.assignee_name ? t.assignee_name : '—'}
                    </td>
                    <td className="px-3 py-2">
                      {sla ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold ${sla.className}`}
                        >
                          {sla.label}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex justify-end">
                        <Link
                          to={`/tickets/${t.id}`}
                          className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

