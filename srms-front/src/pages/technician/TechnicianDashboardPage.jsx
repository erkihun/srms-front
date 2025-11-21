import React, { useEffect, useState } from 'react';
import axios from '../../lib/axiosClient.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function TechnicianDashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ assigned: 0, inProgress: 0, resolved: 0 });
  const [tickets, setTickets] = useState([]);
  const [rating, setRating] = useState({ score: null, count: 0 });
  const [taskRating, setTaskRating] = useState({ score: null, count: 0 });
  const [taskStats, setTaskStats] = useState({ total: 0, open: 0, inProgress: 0, done: 0 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const [summaryRes, ticketsRes, ratingRes, taskRatingRes, tasksRes] = await Promise.all([
          axios.get('/dashboard/technician-summary'),
          axios.get('/tickets', { params: { assigned: 'true' } }),
          axios.get('/dashboard/technician-rating'),
          axios.get('/dashboard/technician-task-rating'),
          axios.get('/tasks', { params: { assigned_to: user?.id } }),
        ]);

        setSummary({
          assigned: summaryRes.data?.assigned ?? 0,
          inProgress: summaryRes.data?.inProgress ?? 0,
          resolved: summaryRes.data?.resolved ?? 0,
        });

        setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);

        setRating({
          score:
            ratingRes.data && ratingRes.data.score != null
              ? Number(ratingRes.data.score)
              : null,
          count: ratingRes.data?.count ? Number(ratingRes.data.count) : 0,
        });

        setTaskRating({
          score:
            taskRatingRes.data && taskRatingRes.data.score != null
              ? Number(taskRatingRes.data.score)
              : null,
          count: taskRatingRes.data?.count ? Number(taskRatingRes.data.count) : 0,
        });

        const taskList = Array.isArray(tasksRes.data) ? tasksRes.data : [];
        setTaskStats({
          total: taskList.length,
          open: taskList.filter((t) => t.status === 'OPEN').length,
          inProgress: taskList.filter((t) => t.status === 'IN_PROGRESS').length,
          done: taskList.filter((t) => t.status === 'DONE' || t.status === 'CANCELLED').length,
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load technician dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <div className="text-sm text-slate-500">Loading...</div>;
  }

  if (error) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-blue-950">
          Technician Overview
        </h2>
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      </div>
    );
  }

  if (!summary) {
    return <div className="text-sm text-red-500">Failed to load summary.</div>;
  }

  const totalAssigned = tickets.length;
  const openCount = tickets.filter(
    (t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED'
  ).length;

  const priorityCounts = {
    CRITICAL: tickets.filter((t) => t.priority === 'CRITICAL').length,
    HIGH: tickets.filter((t) => t.priority === 'HIGH').length,
    MEDIUM: tickets.filter((t) => t.priority === 'MEDIUM').length,
    LOW: tickets.filter((t) => t.priority === 'LOW').length,
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

const renderStars = (score) => {
  if (score == null) return null;
  const rounded = Math.round(score);
  return (
    <span className="text-base space-x-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rounded ? 'text-yellow-400' : 'text-slate-300'}>
          ★
        </span>
      ))}
    </span>
  );
};

  return (
    <div className="space-y-5">
      
      <div>
        <h2 className="text-lg font-semibold text-blue-950">Technician Overview</h2>
        <p className="text-xs text-slate-500">Quick summary of tickets currently assigned to you.</p>
      </div>

      
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-lg border border-slate-200 border-t-4 border-t-blue-500 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Assigned tickets
          </p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {summary.assigned}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">All tickets that are currently assigned to you.</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 border-t-4 border-t-orange-500 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            In progress
          </p>
          <p className="text-2xl font-semibold text-blue-700 mt-1">
            {summary.inProgress}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Tickets you are actively working on.</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 border-t-4 border-t-emerald-500 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Resolved / closed
          </p>
          <p className="text-2xl font-semibold text-emerald-700 mt-1">
            {summary.resolved}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Tickets you have completed.</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 border-t-4 border-t-slate-500 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Open (not done)
          </p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {openCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Assigned to you but not yet resolved or closed.</p>
        </div>
      </div>

      
      <div className="grid gap-4 md:grid-cols-2">
        
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Priority breakdown
          </h3>
          <p className="text-[11px] text-slate-500 mb-3">Distribution of your currently assigned tickets by priority.</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-md border border-slate-200 p-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-slate-800">Critical</p>
                <p className="text-[11px] text-slate-500">Needs immediate attention</p>
              </div>
              <span
                className={`inline-flex items-center justify-center w-8 h-8 rounded-full border text-[11px] font-semibold ${priorityBadgeClass(
                  'CRITICAL'
                )}`}
              >
                {priorityCounts.CRITICAL}
              </span>
            </div>

            <div className="rounded-md border border-slate-200 p-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-slate-800">High</p>
                <p className="text-[11px] text-slate-500">Work is severely impacted</p>
              </div>
              <span
                className={`inline-flex items-center justify-center w-8 h-8 rounded-full border text-[11px] font-semibold ${priorityBadgeClass(
                  'HIGH'
                )}`}
              >
                {priorityCounts.HIGH}
              </span>
            </div>

            <div className="rounded-md border border-slate-200 p-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-slate-800">Medium</p>
                <p className="text-[11px] text-slate-500">Normal support requests</p>
              </div>
              <span
                className={`inline-flex items-center justify-center w-8 h-8 rounded-full border text-[11px] font-semibold ${priorityBadgeClass(
                  'MEDIUM'
                )}`}
              >
                {priorityCounts.MEDIUM}
              </span>
            </div>

            <div className="rounded-md border border-slate-200 p-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-slate-800">Low</p>
                <p className="text-[11px] text-slate-500">Minor issues or requests</p>
              </div>
              <span
                className={`inline-flex items-center justify-center w-8 h-8 rounded-full border text-[11px] font-semibold ${priorityBadgeClass(
                  'LOW'
                )}`}
              >
                {priorityCounts.LOW}
              </span>
            </div>
          </div>
        </div>

        
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Assignment details
          </h3>
          <p className="text-[11px] text-slate-500 mb-3">Snapshot of your active workload.</p>

          <dl className="space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <dt className="text-slate-600">Total assigned tickets (list)</dt>
              <dd className="font-semibold text-slate-900">
                {totalAssigned}
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <dt className="text-slate-600">Open (any status except done)</dt>
              <dd className="font-semibold text-slate-900">
                {openCount}
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <dt className="text-slate-600">In progress (status)</dt>
              <dd className="font-semibold text-blue-700">
                {summary.inProgress}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Resolved / closed</dt>
              <dd className="font-semibold text-emerald-700">
                {summary.resolved}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-1">
          Tasks assigned to you
        </h3>
        <p className="text-[11px] text-slate-500 mb-3">
          Current task workload and completion.
        </p>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-md border border-slate-200 p-3">
            <dt className="text-slate-600">Total</dt>
            <dd className="text-lg font-semibold text-slate-900">{taskStats.total}</dd>
          </div>
          <div className="rounded-md border border-slate-200 p-3">
            <dt className="text-slate-600">Open</dt>
            <dd className="text-lg font-semibold text-blue-700">{taskStats.open}</dd>
          </div>
          <div className="rounded-md border border-slate-200 p-3">
            <dt className="text-slate-600">In progress</dt>
            <dd className="text-lg font-semibold text-orange-700">{taskStats.inProgress}</dd>
          </div>
          <div className="rounded-md border border-slate-200 p-3">
            <dt className="text-slate-600">Done / Cancelled</dt>
            <dd className="text-lg font-semibold text-emerald-700">{taskStats.done}</dd>
          </div>
        </dl>
      </div>


<div className="grid gap-4 md:grid-cols-2">
  
  <div className="bg-white rounded-lg border border-slate-200 p-4">
    <h3 className="text-sm font-semibold text-blue-900 mb-1">
      Employee feedback rating
    </h3>
    <p className="text-[11px] text-slate-500 mb-3">
      Average rating given by employees for tickets you handled.
    </p>

    {rating.score == null || rating.count === 0 ? (
      <p className="text-xs text-slate-500">
        No ratings from employees yet.
      </p>
    ) : (
      <div className="flex items-center gap-4">
        <div>
          <div className="text-3xl font-semibold text-slate-900">
            {rating.score.toFixed(1)}
          </div>
          <div className="text-[11px] text-slate-500">
            Based on {rating.count} rating{rating.count === 1 ? '' : 's'}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div>{renderStars(rating.score)}</div>
          <div className="text-[11px] text-slate-500">
            5 ★ = excellent service, 1 ★ = needs improvement
          </div>
        </div>
      </div>
    )}
  </div>

  
  <div className="bg-white rounded-lg border border-slate-200 p-4">
    <h3 className="text-sm font-semibold text-blue-900 mb-1">
      Admin feedback rating (tasks)
    </h3>
    <p className="text-[11px] text-slate-500 mb-3">
      Ratings provided by admins on your task work.
    </p>

    {taskRating.score == null || taskRating.count === 0 ? (
      <p className="text-xs text-slate-500">No admin ratings yet.</p>
    ) : (
      <div className="flex items-center gap-4">
        <div>
          <div className="text-3xl font-semibold text-slate-900">
            {taskRating.score.toFixed(1)}
          </div>
          <div className="text-[11px] text-slate-500">
            Based on {taskRating.count} rating
            {taskRating.count === 1 ? '' : 's'}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div>{renderStars(taskRating.score)}</div>
          <div className="text-[11px] text-slate-500">
            5 ★ = excellent delivery, 1 ★ = needs improvement
          </div>
        </div>
      </div>
    )}
  </div>
</div>

    </div>
  );
}





