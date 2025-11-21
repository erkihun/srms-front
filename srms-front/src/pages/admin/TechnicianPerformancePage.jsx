import React, { useEffect, useState } from 'react';
import axios from '../../lib/axiosClient.js';


export default function TechnicianPerformancePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const tec = await axios.get('/dashboard/technician-performance');
      const list = tec.data?.technicians ?? [];
      setData(list);
    } catch (err) {
      console.error(err);
      setError('Failed to load technician performance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-blue-950">Technician Performance</h2>
          <p className="text-xs text-slate-500">Ticket feedback (employees) + Task ratings (admin)</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-md border border-orange-200 bg-orange-500 text-white px-3 py-1.5 text-xs font-semibold hover:bg-orange-600 shadow-sm"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Loading technician performance...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">No technician data available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((tech) => (
            <TechnicianCard key={tech.technician_id} tech={tech} />
          ))}
        </div>
      )}
    </div>
  );
}





function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-blue-900">{value}</p>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}

function CategoryList({ items }) {
  if (!items?.length) {
    return <p className="text-xs text-slate-500">No category data</p>;
  }
  return (
    <div className="space-y-1 text-xs">
      {items.map((c) => (
        <div key={c.category_id} className="flex justify-between border-b border-slate-100 py-1">
          <span className="text-slate-700">{c.category_name || 'Uncategorized'}</span>
          <span className="text-blue-800 font-semibold">{c.tickets} tickets</span>
        </div>
      ))}
    </div>
  );
}

function TrendList({ items }) {
  if (!items?.length) {
    return <p className="text-xs text-slate-500">No rating history</p>;
  }
  return (
    <div className="space-y-1 text-xs">
      {items.map((e, idx) => (
        <div key={idx} className="flex justify-between border-b border-slate-100 py-1">
          <span className="text-slate-700">
            {e.month ? new Date(e.month).toLocaleString('default', { month: 'short', year: 'numeric' }) : 'N/A'}
          </span>
          <span className="text-slate-600">
            {e.avg_rating !== null
              ? `${e.avg_rating.toFixed(2)} (${e.ratings_count} ratings)`
              : 'No ratings'}
          </span>
        </div>
      ))}
    </div>
  );
}

function TechnicianCard({ tech }) {
  const openCount = tech.tickets_total - tech.tickets_closed;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-blue-950">{tech.full_name}</p>
         
        </div>
        <div className="flex flex-wrap gap-2">
          <StatCard label="Tickets" value={`${tech.tickets_closed}/${tech.tickets_total}`} sub="Closed / total" />
          <StatCard
            label="Avg Ticket Rating"
            value={tech.avg_ticket_rating !== null ? tech.avg_ticket_rating.toFixed(2) : 'N/A'}
            sub="Employee feedback"
          />
          <StatCard
            label="Avg Task Rating"
            value={tech.avg_task_rating !== null ? tech.avg_task_rating.toFixed(2) : 'N/A'}
            sub={`${tech.tasks_rated_count} rated of ${tech.tasks_total}`}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-blue-100 p-4 bg-blue-50/60">
          <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">Category expertise</p>
          <CategoryList items={tech.category_breakdown} />
        </div>
        <div className="rounded-xl border border-orange-100 p-4 bg-orange-50/70">
          <p className="text-[11px] uppercase tracking-wide text-orange-600 mb-2">Rating trend (tickets)</p>
          <TrendList items={tech.rating_trend_monthly} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <StatCard
          label="Avg Resolution Time"
          value={
            tech.avg_resolution_hours !== null
              ? `${tech.avg_resolution_hours.toFixed(1)}h`
              : 'N/A'
          }
          sub="Resolved/Closed tickets"
        />
        <StatCard label="Tasks" value={tech.tasks_total} sub={`${tech.tasks_rated_count} rated`} />
        <StatCard
          label="Open vs Closed"
          value={`${openCount} open / ${tech.tickets_closed} closed`}
          sub="Based on ticket counts"
        />
      </div>
    </div>
  );
}

