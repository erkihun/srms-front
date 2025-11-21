import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../lib/axiosClient.js';

export default function EmployeeTicketDetailPage() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loadingTicket, setLoadingTicket] = useState(true);

  const [attachments, setAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(true);

  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('MEDIUM');
  const [savingEdit, setSavingEdit] = useState(false);

  const [showRating, setShowRating] = useState(false);
  const [ratingValue, setRatingValue] = useState(0); 
  const [ratingComment, setRatingComment] = useState('');
  const [savingRating, setSavingRating] = useState(false);

  const loadTicket = async () => {
    setLoadingTicket(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.get(`/tickets/${id}`);
      setTicket(res.data);

      setEditTitle(res.data.title || '');
      setEditDescription(res.data.description || '');
      setEditPriority(res.data.priority || 'MEDIUM');

      if (
        res.data.feedback_rating !== null &&
        res.data.feedback_rating !== undefined
      ) {
        setRatingValue(Number(res.data.feedback_rating));
        setRatingComment(res.data.feedback_comment || '');
      } else {
        setRatingValue(0);
        setRatingComment('');
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setError('You are not allowed to view this request.');
      } else if (err.response?.status === 404) {
        setError('Request not found.');
      } else {
        setError('Failed to load request details.');
      }
    } finally {
      setLoadingTicket(false);
    }
  };

  const loadAttachments = async () => {
    setAttachmentsLoading(true);
    try {
      const res = await axios.get(`/tickets/${id}/attachments`);
      setAttachments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setAttachmentsLoading(false);
    }
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await axios.get(`/tickets/${id}/logs`);
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
    loadAttachments();
    loadLogs();
  }, [id]);

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

  const canEdit = ticket && ticket.status === 'NEW';

  const canRate =
    ticket &&
    (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') &&
    (ticket.feedback_rating === null ||
      ticket.feedback_rating === undefined);

  const renderStaticStars = (score) => {
    if (score == null) return null;
    const rounded = Math.round(Number(score));
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={i <= rounded ? 'text-yellow-400' : 'text-slate-300'}
        >
          ★
        </span>
      );
    }
    return <div className="flex items-center gap-1 text-base">{stars}</div>;
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;

    setSavingEdit(true);
    setError('');
    setSuccess('');
    try {
      await axios.patch(`/tickets/${id}/employee-update`, {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
      });
      await loadTicket();
      setEditMode(false);
      setSuccess('Your request has been updated.');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to update your request. You can only edit while status is NEW.'
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!canRate) return;

    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }

    setSavingRating(true);
    setError('');
    setSuccess('');
    try {
      await axios.post(`/tickets/${id}/feedback`, {
        rating: ratingValue,
        comment: ratingComment,
      });
      await loadTicket();
      setShowRating(false);
      setSuccess('Thank you for your feedback.');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to submit your rating. Please try again.'
      );
    } finally {
      setSavingRating(false);
    }
  };

  if (loadingTicket) {
    return (
      <div className="text-sm text-slate-500">
        Loading request details...
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
        <Link
          to="/employee"
          className="inline-flex text-xs text-blue-700 hover:text-blue-900"
        >
          ← Back to My Requests
        </Link>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-red-600">
          Request not found.
        </div>
        <Link
          to="/employee"
          className="inline-flex text-xs text-blue-700 hover:text-blue-900"
        >
          ← Back to My Requests
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-blue-950">
            {ticket.ticket_code} – {ticket.title}
          </h2>
          <p className="text-xs text-slate-500">
            This page shows the status and history of your ICT service
            request.
          </p>
        </div>

        <div className="flex items-center gap-2">
          
          {canEdit && (
            <button
              type="button"
              onClick={() => setEditMode((v) => !v)}
              className="rounded-md border border-blue-600 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
            >
              {editMode ? 'Cancel edit' : 'Edit request'}
            </button>
          )}

          
          {canRate && (
            <button
              type="button"
              onClick={() => setShowRating((v) => !v)}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
            >
              {showRating ? 'Close rating' : 'Give rating'}
            </button>
          )}

          <Link
            to="/employee"
            className="text-xs font-medium text-blue-700 hover:text-blue-900"
          >
            ← Back to My Requests
          </Link>
        </div>
      </div>

      
      <div className="flex flex-wrap gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide text-slate-500">
            Status
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${statusBadgeClass(
              ticket.status
            )}`}
          >
            {ticket.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide text-slate-500">
            Priority
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${priorityBadgeClass(
              ticket.priority
            )}`}
          >
            {ticket.priority}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-medium">Created:</span>
          <span>
            {ticket.created_at
              ? new Date(ticket.created_at).toLocaleString()
              : '—'}
          </span>
        </div>
        {ticket.feedback_rating !== null &&
          ticket.feedback_rating !== undefined && (
            <div className="flex items-center gap-2 text-xs text-emerald-700">
              <span className="font-medium">Your rating:</span>
              <div className="flex items-center gap-2">
                {renderStaticStars(ticket.feedback_rating)}
                <span className="text-[11px] text-slate-700">
                  {Number(ticket.feedback_rating).toFixed(1)} / 5
                </span>
              </div>
            </div>
          )}
      </div>

      
      {(success || error) && (
        <div className="space-y-2">
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
        </div>
      )}

      
      <div className="grid gap-4 lg:grid-cols-3">
        
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm space-y-2 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              Request Details
            </h3>
            <div>
              <span className="font-medium text-slate-700">
                Requester:
              </span>{' '}
              <span className="text-slate-800">
                {ticket.requester_name}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-700">
                Department:
              </span>{' '}
              <span className="text-slate-800">
                {ticket.department_name || '—'}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-700">
                Category:
              </span>{' '}
              <span className="text-slate-800">
                {ticket.category_name || '—'}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-700">
                Assigned Technician:
              </span>{' '}
              <span className="text-slate-800">
                {ticket.assignee_name || 'Not assigned yet'}
              </span>
            </div>
            <div className="mt-3">
              <span className="font-medium text-slate-700">
                Description:
              </span>
              <p className="mt-1 whitespace-pre-line text-slate-700 leading-relaxed text-[13px]">
                {ticket.description || 'No description provided.'}
              </p>
            </div>
          </div>

          
          {editMode && canEdit && (
            <form
              onSubmit={handleSaveEdit}
              className="bg-white rounded-2xl border border-blue-200 border-l-4 border-l-blue-500 p-4 text-sm space-y-3 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Edit your request (allowed while status is NEW)
              </h3>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600">
                  Priority
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-48 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-md bg-blue-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  {savingEdit ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          )}

          
          {showRating && canRate && (
            <form
              onSubmit={handleSubmitRating}
              className="bg-white rounded-2xl border border-emerald-200 border-l-4 border-l-emerald-500 p-4 text-sm space-y-3 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-emerald-900 mb-1">
                Rate the support you received
              </h3>
              <p className="text-xs text-slate-500 mb-1">
                Please rate your overall satisfaction from 1 (very
                dissatisfied) to 5 (very satisfied).
              </p>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRatingValue(n)}
                      className="h-8 w-8 flex items-center justify-center rounded-full border border-transparent focus:outline-none"
                    >
                      <span
                        className={
                          n <= ratingValue
                            ? 'text-yellow-400 text-xl'
                            : 'text-slate-300 text-xl'
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                  <span className="text-[11px] text-slate-500 ml-1">
                    {ratingValue
                      ? `Selected: ${ratingValue} star${
                          ratingValue === 1 ? '' : 's'
                        }`
                      : 'Click on a star to choose your rating.'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600">
                  Comment (optional)
                </label>
                <textarea
                  rows={3}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Describe what went well or what can be improved."
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRating(false)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRating}
                  className="rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {savingRating ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          )}

          
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm space-y-3 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              Attachments
            </h3>
            {attachmentsLoading ? (
              <p className="text-xs text-slate-500">
                Loading attachments...
              </p>
            ) : attachments.length === 0 ? (
              <p className="text-xs text-slate-500">
                No attachments uploaded for this request.
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

        
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm space-y-3 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              Activity History
            </h3>
            {logsLoading ? (
              <p className="text-xs text-slate-500">
                Loading activity...
              </p>
            ) : logs.length === 0 ? (
              <p className="text-xs text-slate-500">
                No activity has been recorded yet.
              </p>
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
                        Status: {log.old_status || '—'} →{' '}
                        {log.new_status || '—'}
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
      </div>
    </div>
  );
}


