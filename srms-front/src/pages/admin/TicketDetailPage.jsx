import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../lib/axiosClient.js';

export default function TicketDetailPage() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [assignId, setAssignId] = useState('');
  const [users, setUsers] = useState([]);

  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [attachments, setAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

const reloadTicket = () => {
  setLoading(true);
  axios
    .get(`/tickets/${id}`)
    .then((tik) => {
      setTicket(tik.data);
      setStatus(tik.data.status);
      setAssignId(
        tik.data.assigned_to_id != null ? String(tik.data.assigned_to_id) : ''
      );
    })
    .catch((err) => {
      console.error(err);
      setError('Failed to load ticket.');
    })
    .finally(() => setLoading(false));
};


  const reloadLogs = () => {
    setLogsLoading(true);
    axios
      .get(`/tickets/${id}/logs`)
      .then((tik) => setLogs(tik.data))
      .catch(console.error)
      .finally(() => setLogsLoading(false));
  };

  const reloadAttachments = () => {
    setAttachmentsLoading(true);
    axios
      .get(`/tickets/${id}/attachments`)
      .then((tik) => setAttachments(tik.data))
      .catch(console.error)
      .finally(() => setAttachmentsLoading(false));
  };

  const loadUsers = () => {
    axios
      .get('/users')
      .then((tik) => setUsers(tik.data))
      .catch(console.error);
  };

  useEffect(() => {
    reloadTicket();
    reloadLogs();
    reloadAttachments();
    loadUsers();
  }, [id]);

  const updateStatus = async () => {
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await axios.patch(`/tickets/${id}/status`, { status });
      reloadTicket();
      reloadLogs();
      setSuccess('Ticket status updated successfully.');
    } catch (err) {
      console.error(err);
      setError('Failed to update status.');
    } finally {
      setSaving(false);
    }
  };

  const assignTicket = async () => {
    if (!assignId) return;
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await axios.patch(`/tickets/${id}/assign`, {
        assigned_to_id: assignId,
      });
      reloadTicket();
      reloadLogs();
      setSuccess('Ticket assigned successfully.');
    } catch (err) {
      console.error(err);
      setError('Failed to assign ticket.');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAttachment = async () => {
    if (!selectedFile) {
      alert('Please choose a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);
    try {
      await axios.post(`/tickets/${id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      reloadAttachments();
      setSelectedFile(null);
      alert('Attachment uploaded.');
    } catch (err) {
      console.error(err);
      alert('Failed to upload attachment');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-slate-500">Loading ticket...</div>;
  }

  if (!ticket) {
    return <div className="text-sm text-red-500">Ticket not found.</div>;
  }

  return (
    <div className="space-y-5">
      
      <div>
        <h2 className="text-lg font-semibold text-blue-950">
          {ticket.ticket_code} – {ticket.title}
        </h2>
        <p className="text-xs text-slate-500">
          Status: <span className="font-medium">{ticket.status}</span> · Priority:{' '}
          <span className="font-medium">{ticket.priority}</span>
        </p>
      </div>

      
      {success && (
        <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
          {success}
        </div>
      )}
      {error && (
        <div className="text-xs text-red-800 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      
      <div className="bg-white rounded-lg border border-slate-200 border-t-4 border-t-blue-500 p-4 text-sm space-y-2">
        <div>
          <span className="font-medium text-slate-700">Requester:</span>{' '}
          <span className="text-slate-800">{ticket.requester_name}</span>
        </div>
        <div>
          <span className="font-medium text-slate-700">Department:</span>{' '}
          <span className="text-slate-800">{ticket.department_name || '-'}</span>
        </div>
        <div>
          <span className="font-medium text-slate-700">Category:</span>{' '}
          <span className="text-slate-800">{ticket.category_name || '-'}</span>
        </div>
        <div>
          <span className="font-medium text-slate-700">Assigned to:</span>{' '}
          <span className="text-slate-800">{ticket.assignee_name || '-'}</span>
        </div>
        <div className="mt-2">
          <span className="font-medium text-slate-700">Description:</span>
          <p className="mt-1 whitespace-pre-line text-slate-700">
            {ticket.description || 'No description provided.'}
          </p>
        </div>
      </div>

      
      <div className="bg-white rounded-lg border border-slate-200 border-t-4 border-t-orange-500 p-4 text-sm space-y-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-1">
          Attachments
        </h3>

        <div className="flex flex-col gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Choose attachment
            </label>
            <input
              type="file"
              className="text-xs"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setSelectedFile(file);
              }}
            />
            {selectedFile && (
              <p className="text-[11px] text-slate-600 mt-1">
                Selected:{' '}
                <span className="font-medium text-slate-800">
                  {selectedFile.name}
                </span>
              </p>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={handleUploadAttachment}
              disabled={uploading || !selectedFile}
              className="inline-flex items-center rounded-md bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {uploading ? 'Uploading...' : 'Upload Attachment'}
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-600 mb-1">
            Files
          </h4>
          {attachmentsLoading ? (
            <p className="text-xs text-slate-500">Loading attachments...</p>
          ) : attachments.length === 0 ? (
            <p className="text-xs text-slate-500">
              No attachments uploaded yet.
            </p>
          ) : (
            <ul className="space-y-1 text-xs">
              {attachments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-1 last:border-b-0"
                >
                  <div>
                    <a
                      href={`http://localhost:4000/uploads/${a.filename_stored}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      {a.filename_original}
                    </a>
                    <span className="text-[11px] text-slate-500 ml-2">
                      ({a.mime_type || 'file'})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {a.uploaded_by_name}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      
      <div className="bg-white rounded-lg border border-slate-200 p-4 text-sm space-y-3">
        <h3 className="text-sm font-semibold text-blue-900">
          Update Status / Assignment
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Status
            </label>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="NEW">NEW</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="ON_HOLD">ON_HOLD</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
            <button
              onClick={updateStatus}
              disabled={saving}
              className="mt-2 inline-flex items-center rounded-md bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-60"
            >
              Update Status
            </button>
          </div>
      <div>
  <label className="block text-xs font-medium text-slate-600 mb-1">
    Assign to Technician
  </label>
  <select
    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={assignId}
    onChange={(e) => setAssignId(e.target.value)}
  >
    <option value="">-- Select technician --</option>
    {users
      .filter((u) => u.role === 'TECHNICIAN' && u.is_active)
      .map((u) => (
        <option key={u.id} value={String(u.id)}>
          {u.full_name}
        </option>
      ))}
  </select>
  <button
    onClick={assignTicket}
    disabled={saving || !assignId}
    className="mt-2 inline-flex items-center rounded-md bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-60"
  >
    Assign Ticket
  </button>
</div>

        </div>
      </div>

      
      <div className="bg-white rounded-lg border border-slate-200 p-4 text-sm space-y-2">
        <h3 className="text-sm font-semibold text-blue-900 mb-1">
          Work Log / History
        </h3>
        {logsLoading ? (
          <p className="text-xs text-slate-500">Loading logs...</p>
        ) : logs.length === 0 ? (
          <p className="text-xs text-slate-500">No activity recorded yet.</p>
        ) : (
          <ul className="space-y-2 text-xs">
            {logs.map((log) => (
              <li
                key={log.id}
                className="border border-slate-100 rounded-md px-3 py-2 bg-slate-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">
                    {log.action_type.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  By {log.created_by_name}
                </div>
                {log.old_status || log.new_status ? (
                  <div className="text-[11px] text-slate-600">
                    Status: {log.old_status || '—'} → {log.new_status || '—'}
                  </div>
                ) : null}
                {log.note && (
                  <div className="text-[11px] text-slate-600 mt-1">
                    Note: {log.note}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

