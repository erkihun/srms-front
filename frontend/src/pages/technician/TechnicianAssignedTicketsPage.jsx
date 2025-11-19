import React, { useEffect, useState } from 'react';
import axios from '../../lib/axiosClient.js';
import { Link } from 'react-router-dom';

export default function TechnicianAssignedTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/tickets', { params: { assigned: 'true' } })
      .then((res) => setTickets(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">
        My Assigned Tickets
      </h2>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        {loading ? (
          <div className="p-4 text-sm text-slate-500">Loading...</div>
        ) : tickets.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">
            No tickets assigned to you yet.
          </div>
        ) : (
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left">Code</th>
                <th className="px-3 py-2 text-left">Title</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Priority</th>
                <th className="px-3 py-2 text-left">Department</th>
                <th className="px-3 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{t.ticket_code}</td>
                  <td className="px-3 py-2">{t.title}</td>
                  <td className="px-3 py-2">{t.status}</td>
                  <td className="px-3 py-2">{t.priority}</td>
                  <td className="px-3 py-2">{t.department_name}</td>
<td className="px-3 py-2">
  <Link
    to={`/technician/tickets/${t.id}`}
    className="inline-flex items-center px-3 py-1.5 text-[11px] font-medium 
               rounded-md bg-blue-700 text-white 
               hover:bg-blue-800 transition"
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
