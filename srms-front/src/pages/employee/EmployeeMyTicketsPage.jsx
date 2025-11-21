import React, { useEffect, useState } from 'react';
import axios from '../../lib/axiosClient.js';
import { Link } from 'react-router-dom';

export default function EmployeeMyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/tickets', { params: { mine: 'true' } })
      .then((res) => setTickets(res.data || []))
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
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

  return (
    <div className="space-y-4">
      
      <div>
        <h2 className="text-lg font-semibold text-blue-950">
          My Requests
        </h2>
        <p className="text-xs text-slate-500">
          All ICT service requests you have submitted.
        </p>
      </div>

      
      <div  className=" border border-slate-200 border-t-4 border-t-blue-500 bg-white p-5 shadow-lg space-y-4"
      >
        {loading ? (
          <div className="p-4 text-sm text-slate-500">Loading...</div>
        ) : tickets.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">
            You have not submitted any requests yet.
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
                <th className="px-3 py-2 text-right text-[11px] font-medium text-slate-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-slate-100 hover:bg-slate-50/80"
                >
                  <td className="px-3 py-2 whitespace-nowrap text-slate-800">
                    {t.ticket_code}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {t.title}
                  </td>
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
                  <td className="px-3 py-2 text-right">
<Link
  to={`/employee/tickets/${t.id}`}
  className="text-xs font-medium text-blue-700 hover:text-blue-900"
>
  View
</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

