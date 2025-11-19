import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../lib/axiosClient.js';

export default function TechnicianTicketDetailPage() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loadingTicket, setLoadingTicket] = useState(true);

  const [status, setStatus] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const [attachments, setAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [note, setNote] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const reloadTicket = async () => {
    setLoadingTicket(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.get(`/tickets/${id}`);
      setTicket(res.data);
      setStatus(res.data.status);
    } catch (err) {
      console.error(err);
      setError('Failed to load ticket.');
    } finally {
      setLoadingTicket(false);
    }
  };

  const reloadLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await axios.get(`/tickets/${id}/logs`);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  const reloadAttachments = async () => {
    setAttachmentsLoading(true);
    try {
      const res = await axios.get(`/tickets/${id}/attachments`);
      setAttachments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAttachmentsLoading(false);
    }
  };

  useEffect(() => {
    reloadTicket();
    reloadLogs();
    reloadAttachments();
  }, [id]);

  const ticketLocked =
    ticket && ticket.status === 'RESOLVED' && ticket.feedback_rating != null;

  const updateStatus = async () => {
    if (!status) return;

    if (ticketLocked) {
      setError('This ticket is resolved and rated by the employee. Further changes are not allowed.');
      return;
    }

    setSavingStatus(true);
    setSuccess('');
    setError('');
    try {
      await axios.patch(`/tickets/${id}/status`, { status });
      await reloadTicket();
      await reloadLogs();
      setSuccess('Ticket status updated successfully.');
    } catch (err) {
      console.error(err);
      setError('Failed to update status.');
    } finally {
      setSavingStatus(false);
    }
  };

  const addNote = async () => {
    if (ticketLocked) {
      setError('This ticket is resolved and rated by the employee. Further work logs are not allowed.');
      return;
    }

    if (!note.trim()) {
      alert('Please write a note.');
      return;
    }

    setSavingNote(true);
    setSuccess('');
    setError('');
    try {
      await axios.post(`/tickets/${id}/notes`, {
        note,
        time_spent_minutes: timeSpent ? Number(timeSpent) : undefined,
      });

      setNote('');
      setTimeSpent('');

      await reloadLogs();
      setSuccess('Work log added successfully.');
    } catch (err) {
      console.error(err);
      setError('Failed to add work log.');
    } finally {
      setSavingNote(false);
    }
  };

  const uploadAttachment = async () => {
    if (ticketLocked) {
      setError('This ticket is resolved and rated by the employee. Further attachments are not allowed.');
      return;
    }

    if (!selectedFile) {
      alert('Please choose a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);
    setSuccess('');
    setError('');
    try {
      await axios.post(`/tickets/${id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSelectedFile(null);
      await reloadAttachments();
      setSuccess('Attachment uploaded successfully.');
    } catch (err) {
      console.error(err);
      setError('Failed to upload attachment.');
    } finally {
      setUploading(false);
    }
  };

  if (loadingTicket) {
    return (
      <div className="text-sm text-slate-500">
        Loading ticket details...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-sm text-red-500">
        Ticket not found.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      
      <div>
        <h2 className="text-lg font-semibold text-blue-950">
          {ticket.ticket_code} – {ticket.title}
        </h2>
        <p className="text-xs text-slate-500">
          Technician view · Update status, add work logs, and upload attachments.
        </p>
      </div>

      
      {ticketLocked && (
        <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          This ticket is <span className="font-semibold">RESOLVED</span> and the
          employee has already submitted a satisfaction rating. The ticket is now
          locked and cannot be modified.
        </div>
      )}

      
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
          <span className="font-medium text-slate-700">Priority:</span>{' '}
          <span className="text-slate-800">{ticket.priority}</span>
        </div>
        <div>
          <span className="font-medium text-slate-700">Current Status:</span>{' '}
          <span className="text-slate-800">{ticket.status}</span>
        </div>

        
        {ticket.feedback_rating && (
          <div className="mt-2 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2">
            <div className="text-xs text-emerald-900 font-semibold">
              Employee satisfaction rating: {ticket.feedback_rating}/5
            </div>
            {ticket.feedback_comment && (
              <div className="mt-1 text-[11px] text-emerald-800">
                “{ticket.feedback_comment}”
              </div>
            )}
          </div>
        )}

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
              disabled={ticketLocked}
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
              onClick={uploadAttachment}
              disabled={uploading || !selectedFile || ticketLocked}
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

      
      <div className="bg-white rounded-lg border border-slate-200 p-4 text-sm space-y-4">
        <h3 className="text-sm font-semibold text-blue-900">
          Status & Work Log
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Status
            </label>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={status}
              disabled={ticketLocked}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="NEW">NEW</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="ON_HOLD">ON_HOLD</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
            <button
              type="button"
              onClick={updateStatus}
              disabled={savingStatus || ticketLocked}
              className="mt-2 inline-flex items-center rounded-md bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {savingStatus ? 'Updating...' : 'Update Status'}
            </button>
          </div>

          
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Work note
            </label>
            <textarea
              rows={3}
              value={note}
              disabled={ticketLocked}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              placeholder="Describe the work you performed on this ticket..."
            />
            <label className="block text-xs font-medium text-slate-600 mb-1 mt-2">
              Time spent (minutes)
            </label>
            <input
              type="number"
              min="0"
              value={timeSpent}
              disabled={ticketLocked}
              onChange={(e) => setTimeSpent(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
            />
            <button
              type="button"
              onClick={addNote}
              disabled={savingNote || ticketLocked}
              className="mt-2 inline-flex items-center rounded-md bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {savingNote ? 'Saving...' : 'Add Work Log'}
            </button>
          </div>
        </div>
      </div>

      
      <div className="bg-white rounded-lg border border-slate-200 p-4 text-sm space-y-2">
        <h3 className="text-sm font-semibold text-blue-900 mb-1">
          History
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

