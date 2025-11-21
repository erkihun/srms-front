import React, { useEffect, useState } from 'react';
import axios from '../../lib/axiosClient.js';
import { Link } from 'react-router-dom';
import { getSlaBadgeProps } from '../../utils/sla.js';

export default function DashboardPage() {
  const [summary, setSummary] = useState({ total: 0, open: 0, resolved: 0 });
  const [recentTickets, setRecentTickets] = useState([]);
  const [ticketStats, setTicketStats] = useState({
    priority: {},
    monthly: [],
    ratingTrend: [],
  });
  const [taskSummary, setTaskSummary] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    done: 0,
    cancelled: 0,
  });
  const [taskRatingSummary, setTaskRatingSummary] = useState({
    avg: null,
    count: 0,
  });
  const [techPerformance, setTechPerformance] = useState([]);
  const [overallFeedback, setOverallFeedback] = useState({
    avg: null,
    count: 0,
  });

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingTechPerf, setLoadingTechPerf] = useState(true);
  const [error, setError] = useState('');

  const computeTicketStats = (list) => {
    const priorityCounts = list.reduce((acc, t) => {
      const p = t.priority || 'UNKNOWN';
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {});

    const monthlyMap = new Map();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      monthlyMap.set(key, {
        label: d.toLocaleString('default', { month: 'short' }),
        count: 0,
      });
    }

    list.forEach((t) => {
      if (!t.created_at) return;
      const key = new Date(t.created_at).toISOString().slice(0, 7);
      if (monthlyMap.has(key)) {
        monthlyMap.get(key).count += 1;
      }
    });

    const ratingTrendMap = new Map();
    list.forEach((t) => {
      if (t.feedback_rating == null || !t.created_at) return;
      const key = new Date(t.created_at).toISOString().slice(0, 7);
      if (!ratingTrendMap.has(key)) {
        ratingTrendMap.set(key, {
          sum: 0,
          count: 0,
          date: new Date(t.created_at),
        });
      }
      const entry = ratingTrendMap.get(key);
      entry.sum += Number(t.feedback_rating);
      entry.count += 1;
    });

    const ratingTrendArr = Array.from(ratingTrendMap.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([, val]) => ({
        month: val.date.toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        }),
        avg: val.count ? val.sum / val.count : null,
      }));

    const totalRatings = Array.from(ratingTrendMap.values()).reduce(
      (acc, v) => ({
        sum: acc.sum + v.sum,
        count: acc.count + v.count,
      }),
      { sum: 0, count: 0 }
    );

    setTicketStats({
      priority: priorityCounts,
      monthly: Array.from(monthlyMap.values()),
      ratingTrend: ratingTrendArr,
    });
    setOverallFeedback({
      avg: totalRatings.count
        ? totalRatings.sum / totalRatings.count
        : null,
      count: totalRatings.count,
    });
  };

  useEffect(() => {
    const loadSummary = async () => {
      setLoadingSummary(true);
      try {
        const res = await axios.get('/dashboard/summary');
        setSummary({
          total: res.data?.total ?? 0,
          open: res.data?.open ?? 0,
          resolved: res.data?.resolved ?? 0,
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard summary.');
      } finally {
        setLoadingSummary(false);
      }
    };

    const loadRecentTickets = async () => {
      setLoadingTickets(true);
      try {
        const res = await axios.get('/tickets');
        const data = Array.isArray(res.data) ? res.data : [];
        const sorted = [...data].sort((a, b) => {
          const aDate = a.created_at
            ? new Date(a.created_at).getTime()
            : 0;
          const bDate = b.created_at
            ? new Date(b.created_at).getTime()
            : 0;
          return bDate - aDate;
        });
        setRecentTickets(sorted.slice(0, 5));
        computeTicketStats(data);
      } catch (err) {
        console.error(err);
        setError((prev) => prev || 'Failed to load recent tickets.');
      } finally {
        setLoadingTickets(false);
      }
    };

    const loadTasks = async () => {
      setLoadingTasks(true);
      try {
        const res = await axios.get('/tasks');
        const list = Array.isArray(res.data) ? res.data : [];
        setTaskSummary({
          total: list.length,
          open: list.filter((t) => t.status === 'OPEN').length,
          inProgress: list.filter((t) => t.status === 'IN_PROGRESS').length,
          done: list.filter((t) => t.status === 'DONE').length,
          cancelled: list.filter((t) => t.status === 'CANCELLED').length,
        });

        const rated = list.filter(
          (t) => t.technician_rating != null
        );
        const total = rated.reduce(
          (acc, t) => acc + Number(t.technician_rating),
          0
        );
        setTaskRatingSummary({
          avg: rated.length ? total / rated.length : null,
          count: rated.length,
        });
      } catch (err) {
        console.error(err);
        setError((prev) => prev || 'Failed to load tasks summary.');
      } finally {
        setLoadingTasks(false);
      }
    };

    const loadTechPerformance = async () => {
      setLoadingTechPerf(true);
      try {
        const res = await axios.get('/dashboard/technician-performance');
        setTechPerformance(res.data?.technicians || []);
      } catch (err) {
        console.error(err);
        setError(
          (prev) => prev || 'Failed to load technician performance.'
        );
      } finally {
        setLoadingTechPerf(false);
      }
    };

    loadSummary();
    loadRecentTickets();
    loadTasks();
    loadTechPerformance();
  }, []);

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

  const maxCount = (arr) =>
    arr.length ? Math.max(...arr.map((x) => x.count ?? 0)) || 1 : 1;

  const ChartBar = ({ label, value, max, color = 'bg-blue-500' }) => {
    const numericValue = Number(value) || 0;
    const pct = max ? Math.round((numericValue / max) * 100) : 0;

    return (
      <div>
        <div className="flex items-center justify-between text-[11px] text-slate-600">
          <span className="truncate max-w-[160px]">{label}</span>
          <span className="font-semibold text-slate-900">
            {numericValue.toFixed
              ? numericValue.toFixed(2).replace(/\.00$/, '')
              : numericValue}
          </span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-slate-100">
          <div
            className={`h-2 rounded-full ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  const TinyBars = ({ data, colorClass = 'bg-blue-500' }) => {
    const maxVal = maxCount(data);
    return (
      <div className="grid grid-cols-6 gap-2 items-end h-24">
        {data.map((d, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center gap-1"
          >
            <div
              className={`w-6 rounded-md ${colorClass}`}
              style={{
                height: `${(d.count / maxVal) * 88 + 8}px`,
              }}
              title={`${d.label}: ${d.count}`}
            />
            <span className="text-[11px] text-slate-600">
              {d.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-blue-950">
            Admin Dashboard
          </h2>
       
        </div>
      
      </div>

      
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-1">
          {error}
        </div>
      )}

      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-1 w-full rounded-full bg-blue-900" />
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-[11px] font-medium text-slate-500">
                Total Tickets
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {loadingSummary ? '' : summary.total}
              </p>
            </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-900 text-white">
      
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        
        <rect x="4" y="7" width="14" height="10" rx="2" />
        
        <path d="M10 7v10" strokeDasharray="2 2" />
        
        <path d="M15 11.5l-1 .6.2-1.1-.8-.8 1.1-.1.5-1 .5 1 1.1.1-.8.8.2 1.1z" />
      </svg>
    </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            All tickets across the organization.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-orange-200 bg-white p-4 shadow-sm">
          <div className="h-1 w-full rounded-full bg-orange-500" />
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-[11px] font-medium text-orange-700">
                Open Tickets
              </p>
              <p className="mt-1 text-2xl font-semibold text-orange-700">
                {loadingSummary ? '' : summary.open}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-700 text-base">
              <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 4h10" />
        <path d="M7 20h10" />
        <path d="M8 4c0 3 3 4 4 5 1-1 4-2 4-5" />
        <path d="M8 20c0-3 3-4 4-5 1 1 4 2 4 5" />
        
        <path d="M10 7h4l-2 2z" />
      </svg>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-orange-700/80">
            Tickets that are not yet resolved or closed.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
          <div className="h-1 w-full rounded-full bg-emerald-500" />
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-[11px] font-medium text-emerald-700">
                Resolved / Closed
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-700">
                {loadingSummary ? '' : summary.resolved}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-base">
              <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 4h6l4 4v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        <path d="M14 4v4h4" />
        
        <path d="M9 14l2 2 4-4" />
      </svg>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-emerald-700/80">
            Completed tickets, including fully closed cases.
          </p>
        </div>
      </div>

      
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-blue-900">
            Task Overview
          </h3>
          <span className="text-[11px] text-slate-500">
            {loadingTasks ? 'Updating...' : 'Synced on load'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-slate-600">Total Tasks</p>
            <p className="text-xl font-semibold text-slate-900">
              {loadingTasks ? '' : taskSummary.total}
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-blue-700 font-medium">Open Tasks</p>
            <p className="text-xl font-semibold text-blue-900">
              {loadingTasks ? '' : taskSummary.open}
            </p>
          </div>
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
            <p className="text-orange-700 font-medium">
              In-progress Tasks
            </p>
            <p className="text-xl font-semibold text-orange-900">
              {loadingTasks ? '' : taskSummary.inProgress}
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-emerald-700 font-medium">
              Done / Cancelled
            </p>
            <p className="text-xl font-semibold text-emerald-900">
              {loadingTasks
                ? ''
                : taskSummary.done + taskSummary.cancelled}
            </p>
          </div>
        </div>
      </div>

      
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-blue-900">
              Ticket & Task Overview
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            {loadingTasks ? 'Updating...' : 'Synced on load'}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-slate-600">
              Overall ticket satisfaction
            </p>
            <p className="text-xl font-semibold text-slate-900">
              {overallFeedback.avg != null
                ? overallFeedback.avg.toFixed(2)
                : ''}
            </p>
            <p className="text-[11px] text-slate-500">
              Based on {overallFeedback.count} ratings
            </p>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-emerald-700 font-medium">
              Task rating (admin)
            </p>
            <p className="text-xl font-semibold text-emerald-900">
              {taskRatingSummary.avg != null
                ? taskRatingSummary.avg.toFixed(2)
                : ''}
            </p>
            <p className="text-[11px] text-emerald-700/80">
              {taskRatingSummary.count} rated tasks
            </p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-blue-700 font-medium">Open tickets</p>
            <p className="text-xl font-semibold text-blue-900">
              {summary.open}
            </p>
            <p className="text-[11px] text-blue-700/80">
              Of {summary.total} total
            </p>
          </div>

          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
            <p className="text-orange-700 font-medium">
              Tasks in progress
            </p>
            <p className="text-xl font-semibold text-orange-900">
              {taskSummary.inProgress}
            </p>
            <p className="text-[11px] text-orange-700/80">
              Of {taskSummary.total} tasks
            </p>
          </div>
        </div>
      </div>

      
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-blue-900">
            Tickets by month
          </h3>
          <p className="text-[11px] text-slate-500 mb-3">
            Past 6 months
          </p>
          {loadingTickets ? (
            <p className="text-xs text-slate-500">Loading...</p>
          ) : (
            <TinyBars data={ticketStats.monthly} />
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-blue-900">
            Tickets by priority
          </h3>
          <p className="text-[11px] text-slate-500 mb-3">All tickets</p>
          {loadingTickets ? (
            <p className="text-xs text-slate-500">Loading...</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(ticketStats.priority).map(
                ([p, count]) => (
                  <ChartBar
                    key={p}
                    label={p}
                    value={count}
                    max={
                      Math.max(
                        ...Object.values(ticketStats.priority),
                        1
                      )
                    }
                    color={
                      p === 'CRITICAL'
                        ? 'bg-red-500'
                        : p === 'HIGH'
                        ? 'bg-orange-500'
                        : p === 'MEDIUM'
                        ? 'bg-blue-500'
                        : 'bg-slate-500'
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>

      
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-blue-900">
            Technician performance
          </h3>
          <p className="text-[11px] text-slate-500 mb-3">
            Average ticket rating per technician
          </p>
          {loadingTechPerf ? (
            <p className="text-xs text-slate-500">Loading...</p>
          ) : techPerformance.length === 0 ? (
            <p className="text-xs text-slate-500">
              No technician data.
            </p>
          ) : (
            <div className="space-y-2">
              {techPerformance.map((t) => {
                const avg =
                  t.avg_ticket_rating != null
                    ? Number(t.avg_ticket_rating)
                    : 0;
                return (
                  <ChartBar
                    key={t.technician_id}
                    label={t.full_name}
                    value={avg}
                    max={5}
                    color="bg-emerald-500"
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-blue-900">
            Satisfaction rating trend
          </h3>
          <p className="text-[11px] text-slate-500 mb-3">
            Monthly average ticket feedback
          </p>
          {loadingTickets ? (
            <p className="text-xs text-slate-500">Loading...</p>
          ) : ticketStats.ratingTrend.length === 0 ? (
            <p className="text-xs text-slate-500">No ratings yet.</p>
          ) : (
            <TinyBars
              colorClass="bg-orange-500"
              data={ticketStats.ratingTrend.map((r) => ({
                label: r.month.split(' ')[0],
                count: r.avg || 0,
              }))}
            />
          )}
        </div>
      </div>

    </div>
  );
}

