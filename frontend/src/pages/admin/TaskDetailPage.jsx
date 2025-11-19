import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../lib/axiosClient.js';
import { useAuth } from '../../context/AuthContext.jsx';

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'];

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [task, setTask] = useState(null);
  const [progress, setProgress] = useState([]);

  const [loading, setLoading] = useState(true);
  const [ratingSaving, setRatingSaving] = useState(false);
  const [commentSaving, setCommentSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [rating, setRating] = useState('');

  const [commentDrafts, setCommentDrafts] = useState({});

  const formatDateTime = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'DONE':
        return 'bg-blue-600 text-white border-blue-600';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const priorityBadgeClass = (p) => {
    switch (p) {
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'LOW':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const loadTask = async () => {
    setLoading(true);
    setError('');
    try {
      const tsk = await axios.get(`/tasks/${id}`);
      const t = tsk.data;
      setTask(t);
      setRating(t.technician_rating || '');
    } catch (err) {
      console.error(err);
      setError('Failed to load task.');
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const tsk = await axios.get(`/tasks/${id}/progress`);
      const list = tsk.data || [];
      setProgress(list);

      const drafts = {};
      list.forEach((p) => {
        drafts[p.id] = '';
      });
      setCommentDrafts(drafts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTask();
    loadProgress();
  }, [id]);

  const ratingLocked =
    task &&
    task.status === 'DONE' &&
    task.technician_rating != null;

  const canRate =
    task &&
    task.status === 'DONE' &&
    task.assigned_to &&
    STATUS_OPTIONS.includes(task.status) &&
    !ratingLocked;

  const handleSaveRating = async () => {
    setError('');
    setSuccess('');

    if (!canRate) {
      setError('Rating can only be set once, when the task is DONE and not yet rated.');
      return;
    }

    if (!rating) {
      setError('Please select a rating between 1 and 5.');
      return;
    }

    setRatingSaving(true);
    try {
      await axios.put(`/tasks/${id}`, {
        technician_rating: Number(rating),
      });

      setSuccess('Technician rating saved successfully.');
      await loadTask();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to save rating. Please try again.'
      );
    } finally {
      setRatingSaving(false);
    }
  };

  const handleAdminCommentChange = (progressId, value) => {
    setCommentDrafts((prev) => ({ ...prev, [progressId]: value }));
  };

  const handleSaveAdminComment = async (progressId) => {
    if (ratingLocked) {
      setError('Comments are locked because this task has a final rating.');
      return;
    }

    if (!authUser || authUser.role !== 'ADMIN') return;

    const newText = (commentDrafts[progressId] || '').trim();
    if (!newText) {
      setError('Please write a comment before saving.');
      return;
    }

    const progressItem = progress.find((p) => p.id === progressId);
    const existing = progressItem?.admin_comment || '';

    const nowLabel = new Date().toLocaleString();
    const block = `[${authUser.full_name} – ${nowLabel}]\n${newText}`;

    const combined = existing ? `${existing}\n\n${block}` : block;

    setCommentSaving(true);
    setError('');
    setSuccess('');

    try {
      await axios.put(`/tasks/${id}/progress/${progressId}/admin-comment`, {
        admin_comment: combined,
      });

      setSuccess('Admin comment saved.');
      setCommentDrafts((prev) => ({
        ...prev,
        [progressId]: '',
      }));
      await loadProgress();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to save admin comment. Please try again.'
      );
    } finally {
      setCommentSaving(false);
    }
  };

  if (!authUser || authUser.role !== 'ADMIN') {
    return (
      <div className="text-sm text-red-600">
        You are not authorized to view this page.
      </div>
    );
  }

  if (!task) {
    return loading ? (
      <div className="text-sm text-slate-500">Loading task...</div>
    ) : (
      <div className="text-sm text-red-600">Task not found.</div>
    );
  }

  return (
    <div>
      
      <div className="flex items-center justify-between gap-3 py-1 mb-5">
        <div className="space-y-1 ">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1">
            <span className="text-[11px] font-semibold text-blue-900 uppercase tracking-wide">
              Admin · Task Details
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
        >
          ← Back
        </button>
      </div>

      
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
          {success}
        </div>
      )}

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        <aside className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">
              Task Overview
            </h3>
            {task.technician_rating != null && (
              <span className="text-[11px] text-slate-500">
                Rating:{' '}
                <span className="font-semibold text-orange-600">
                  {task.technician_rating} / 5
                </span>
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">
                  Status
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full border font-medium ${statusBadgeClass(
                    task.status
                  )}`}
                >
                  {task.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">
                  Priority
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full border font-medium ${priorityBadgeClass(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">
                  Due Date
                </span>
                <span className="text-slate-700">
                  {task.due_date ? formatDateTime(task.due_date) : '-'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">
                  Created
                </span>
                <span className="text-slate-700">
                  {formatDateTime(task.created_at)}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-2">
              <div>
                <div className="text-[11px] font-semibold text-slate-600 mb-0.5 uppercase tracking-wide">
                  Assigned Technician
                </div>
                <div className="text-[13px] text-slate-800">
                  {task.assigned_to_name || '-'}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-600 mb-0.5 uppercase tracking-wide">
                  Created By
                </div>
                <div className="text-[13px] text-slate-800">
                  {task.created_by_name || '-'}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-1">
              <div className="text-[11px] font-semibold text-slate-600 mb-0.5 uppercase tracking-wide">
                Title
              </div>
              <div className="text-[13px] font-medium text-slate-900">
                {task.title || '-'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-slate-600 mb-0.5 uppercase tracking-wide">
                Description
              </div>
              <div className="text-[12px] text-slate-700 whitespace-pre-line">
                {task.description || 'No description provided.'}
              </div>
            </div>

            {task.technician_note && (
              <div className="border-t border-slate-200 pt-3 space-y-1">
                <div className="text-[11px] font-semibold text-slate-600 mb-0.5 uppercase tracking-wide">
                  Latest Technician Note
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] text-slate-700 whitespace-pre-line">
                  {task.technician_note}
                </div>
              </div>
            )}
          </div>
        </aside>

        
        <div className="lg:col-span-2 space-y-5">
          
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-orange-500 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Technician Rating
              </h3>
              {task.assigned_to && (
                <span className="text-[11px] text-slate-500">
                  Technician:&nbsp;
                  <span className="font-medium text-blue-800">
                    {task.assigned_to_name || '—'}
                  </span>
                </span>
              )}
            </div>

            {!task.assigned_to ? (
              <p className="text-xs text-slate-500">
                This task is not assigned to any technician. Assign it first (from the Tasks list page) to enable rating.
              </p>
            ) : (
              <>
                {task.status !== 'DONE' ? (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">
                      Rating can be set once the task status is{' '}
                      <span className="font-semibold text-blue-800">DONE</span>.
                    </p>
                    <p className="text-xs text-slate-600">
                      {task.technician_rating
                        ? `Current rating: ${task.technician_rating} / 5`
                        : 'No rating has been given yet.'}
                    </p>
                  </div>
                ) : ratingLocked ? (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-600">
                      Final rating has been submitted and cannot be modified.
                    </p>
                    <p className="text-sm font-semibold text-orange-600">
                      {task.technician_rating} / 5
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1fr-auto] gap-2 items-center max-w-xs">
                      <select
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        disabled={ratingSaving}
                      >
                        <option value="">-- Select rating --</option>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleSaveRating}
                        disabled={ratingSaving}
                        className="inline-flex items-center rounded-md bg-blue-700 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-60"
                      >
                        {ratingSaving ? 'Saving...' : 'Save Rating'}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      This rating can be set only once for this task.
                    </p>
                  </div>
                )}
              </>
            )}
          </section>

          
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-blue-600 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Progress History
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Track technician updates and add admin comments per step.
                </p>
              </div>
              <span className="text-[11px] text-slate-400">
                {progress.length} entr{progress.length === 1 ? 'y' : 'ies'}
              </span>
            </div>

            {progress.length === 0 ? (
              <p className="text-xs text-slate-500">No progress entries yet.</p>
            ) : (
              <ul className="space-y-3">
                {progress.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full border font-medium ${statusBadgeClass(
                            p.status
                          )}`}
                        >
                          {p.status.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {p.technician_name
                            ? `Technician: ${p.technician_name}`
                            : 'by System/Admin'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {formatDateTime(p.created_at)}
                      </span>
                    </div>

                    {p.note && (
                      <div className="text-[11px] text-slate-700 whitespace-pre-line mb-2">
                        {p.note}
                      </div>
                    )}

                    
                    <div className="border-t border-slate-200 pt-2 mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-700">
                            Admin Comments
                          </span>
                          {p.admin_comment && (
                            <span className="inline-flex items-center rounded-full bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 text-[10px] font-medium">
                              History
                            </span>
                          )}
                        </div>
                        {p.admin_name && (
                          <span className="text-[10px] text-slate-400">
                            Last by{' '}
                            <span className="font-medium text-orange-700">
                              {p.admin_name}
                            </span>
                          </span>
                        )}
                      </div>

                      
                      {p.admin_comment && (
                        <div className="mb-2 rounded-md bg-white border border-slate-200 px-2 py-1.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                              Comment history
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Read-only
                            </span>
                          </div>
                          <div className="max-h-32 overflow-y-auto pr-1 text-[11px] text-slate-700 whitespace-pre-line">
                            {p.admin_comment}
                          </div>
                        </div>
                      )}

                      
                      {ratingLocked ? (
                        <p className="mt-1 text-[11px] text-slate-500 italic">
                          Comments are locked because this task has a final rating.
                        </p>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">
                              Add new comment
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Your name & time will be attached
                            </span>
                          </div>

                          <textarea
                            rows={2}
                            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={commentDrafts[p.id] ?? ''}
                            onChange={(e) =>
                              handleAdminCommentChange(p.id, e.target.value)
                            }
                            placeholder="Write a new admin comment to append to the history..."
                          />

                          <div className="mt-1 flex justify-end gap-2">
                            {!!commentDrafts[p.id]?.trim() && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleAdminCommentChange(p.id, '')
                                }
                                className="inline-flex items-center rounded-md border border-slate-200 px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-100"
                                disabled={commentSaving}
                              >
                                Clear
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={commentSaving}
                              onClick={() => handleSaveAdminComment(p.id)}
                              className="inline-flex items-center rounded-md bg-blue-700 px-3 py-1 text-[11px] font-medium text-white hover:bg-blue-800 disabled:opacity-60"
                            >
                              {commentSaving ? 'Saving...' : 'Save Comment'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

