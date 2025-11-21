import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../../lib/axiosClient.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function EmployeeNewRequestPage() {
  const { user } = useAuth(); 
  const location = useLocation();
  const editTicket = location.state?.editTicket;
  const isEdit = Boolean(editTicket?.id);
const [myTickets, setMyTickets] = useState([]);
const [myTicketsLoading, setMyTicketsLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);

  const [title, setTitle] = useState(editTicket?.title || '');
  const [priority, setPriority] = useState(editTicket?.priority || 'MEDIUM');
  const [departmentId, setDepartmentId] = useState(editTicket?.department_id ? String(editTicket.department_id) : '');  
  const [categoryId, setCategoryId] = useState(editTicket?.category_id ? String(editTicket.category_id) : '');
  const [description, setDescription] = useState(editTicket?.description || '');
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [existingAttachmentsLoading, setExistingAttachmentsLoading] = useState(false);

  useEffect(() => {
    setMetaLoading(true);
    Promise.all([axios.get('/departments'), axios.get('/categories')])
      .then(([depRes, catRes]) => {
        const deps = depRes.data || [];
        const cats = catRes.data || [];
        setDepartments(deps);
        setCategories(cats);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load departments or categories.');
      })
      .finally(() => {
        setMetaLoading(false);
      });
  }, []);

  useEffect(() => {
    if (user?.department_id && !isEdit) {
      setDepartmentId(String(user.department_id));
    }
  }, [user, isEdit]);

  useEffect(() => {
    if (isEdit) {
      setTitle(editTicket?.title || '');
      setDescription(editTicket?.description || '');
      setPriority(editTicket?.priority || 'MEDIUM');
      setCategoryId(editTicket?.category_id ? String(editTicket.category_id) : '');
      setDepartmentId(editTicket?.department_id ? String(editTicket.department_id) : '');
    }
  }, [editTicket, isEdit]);

  useEffect(() => {
    if (!isEdit || !editTicket?.id) return;
    const loadExistingAttachments = async () => {
      setExistingAttachmentsLoading(true);
      try {
        const res = await axios.get(`/tickets/${editTicket.id}/attachments`);
        setExistingAttachments(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setExistingAttachmentsLoading(false);
      }
    };
    loadExistingAttachments();
  }, [isEdit, editTicket]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Request title is required.');
      return;
    }
    if (!priority) {
      setError('Priority is required.');
      return;
    }
    if (!departmentId) {
      setError('Your department is not set. Contact the system administrator.');
      return;
    }
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }

    setSaving(true);

    try {
      if (isEdit && editTicket?.id) {
        const ticketId = editTicket.id;
        await axios.patch(`/tickets/${ticketId}/employee-update`, {
          title: title.trim(),
          description: description.trim(),
          priority,
          department_id: departmentId,
          category_id: categoryId,
        });

        if (attachments.length > 0) {
          await Promise.all(
            attachments.map((file) => {
              const formData = new FormData();
              formData.append('file', file);
              return axios.post(`/tickets/${ticketId}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
            })
          );
        }

        setSuccess(
          attachments.length > 0
            ? 'Your request was updated and attachments uploaded.'
            : 'Your request was updated successfully.'
        );
      } else {
        const ticketRes = await axios.post('/tickets', {
          title: title.trim(),
          description: description.trim(),
          priority,
          department_id: departmentId,   
          category_id: categoryId,
        });

        const created = ticketRes?.data;

        if (attachments.length > 0 && created?.id) {
          await Promise.all(
            attachments.map((file) => {
              const formData = new FormData();
              formData.append('file', file);
              return axios.post(`/tickets/${created.id}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
            })
          );
        }

        setSuccess(
          attachments.length > 0
            ? 'Your request and attachments were submitted successfully.'
            : 'Your request has been submitted successfully.'
        );
        setTitle('');
        setDescription('');
        setPriority('MEDIUM');
        setCategoryId('');
      }

      setAttachments([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error(err);
      setError('Failed to submit request. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    if (isEdit) {
      setTitle(editTicket?.title || '');
      setDescription(editTicket?.description || '');
      setPriority(editTicket?.priority || 'MEDIUM');
      setCategoryId(editTicket?.category_id ? String(editTicket.category_id) : '');
      setDepartmentId(editTicket?.department_id ? String(editTicket.department_id) : departmentId);
    } else {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setCategoryId('');
    }
    setAttachments([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError('');
    setSuccess('');
  };

  const selectedDepartment = departments.find(
    (d) => String(d.id) === String(departmentId)
  );
  const accountDepartmentName =
    selectedDepartment?.name ||
    user?.department_name ||
    (user?.department?.name ?? null);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-blue-950">
          {isEdit ? 'Edit Service Request' : 'New Service Request'}
        </h1>
        <p className="text-xs text-slate-500">
          {isEdit
            ? 'Update your existing request details (allowed while status is NEW).'
            : 'Use this form to request ICT support for computers, printers, networks, or software.'}
        </p>
      </div>

      
      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      
      <form
        onSubmit={handleSubmit}
        className=" border border-slate-200 border-t-4 border-t-blue-500 bg-white p-5 shadow-lg space-y-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-600">
              Request title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Printer not working in HR office"
              required
            />
          </div>

          
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-600">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={metaLoading}
              required
            >
              <option value="LOW">Low – minor issue</option>
              <option value="MEDIUM">Medium – normal priority</option>
              <option value="HIGH">High – work blocked</option>
              <option value="CRITICAL">Critical – urgent</option>
            </select>
          </div>

          
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-600">
              Department <span className="text-red-500">*</span>
            </label>

            {user?.department_id ? (
              <>
                <div className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 flex items-center justify-between">
                  <span>
                    {metaLoading
                      ? 'Loading...'
                      : accountDepartmentName || 'Not linked to any department'}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-2">
                    from your account
                  </span>
                </div>
                <input type="hidden" value={departmentId} required />
              </>
            ) : (
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={metaLoading}
                required
              >
                <option value="">
                  {metaLoading ? 'Loading departments...' : 'Select department'}
                </option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-600">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={metaLoading}
              required
            >
              <option value="">
                {metaLoading ? 'Loading categories...' : 'Select category'}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        
        <div className="space-y-1">
          <label className="block text-[11px] font-medium text-slate-600">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={5}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the problem, where it happens, any error messages, and how it affects your work."
            required
          />
        </div>

        
        <div className="space-y-1">
          <label className="block text-[11px] font-medium text-slate-600">
            Attachments (optional)
          </label>
          {isEdit && (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-700 mb-2">
              <div className="text-[11px] font-medium text-slate-600 mb-1">
                Existing attachments
              </div>
              {existingAttachmentsLoading ? (
                <div className="text-[11px] text-slate-500">Loading attachments...</div>
              ) : existingAttachments.length === 0 ? (
                <div className="text-[11px] text-slate-500">No attachments uploaded yet.</div>
              ) : (
                <ul className="space-y-1">
                  {existingAttachments.map((a) => (
                    <li key={a.id}>
                      <a
                        href={`http://localhost:4000/uploads/${a.filename_stored}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 hover:text-blue-900 hover:underline"
                      >
                        {a.filename_original}
                      </a>
                      <span className="text-[10px] text-slate-500 ml-2">
                        ({a.mime_type || 'file'})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={(e) => setAttachments(Array.from(e.target.files || []))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-[10px] text-slate-500">
            You can add screenshots or files to help technicians diagnose the issue.
          </p>
          {attachments.length > 0 && (
            <div className="text-[11px] text-slate-600">
              {attachments.length} file{attachments.length > 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md border border-slate-300 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={saving || metaLoading}
            className="rounded-md bg-blue-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {saving
              ? isEdit
                ? 'Saving...'
                : 'Submitting...'
              : metaLoading
              ? 'Loading...'
              : isEdit
              ? 'Save Changes'
              : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}


