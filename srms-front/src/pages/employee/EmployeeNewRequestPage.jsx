import React, { useEffect, useState } from 'react';
import axios from '../../lib/axiosClient.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function EmployeeNewRequestPage() {
  const { user } = useAuth(); 
const [myTickets, setMyTickets] = useState([]);
const [myTicketsLoading, setMyTicketsLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [departmentId, setDepartmentId] = useState('');  
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');

  const [saving, setSaving] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setMetaLoading(true);
    Promise.all([axios.get('/departments'), axios.get('/categories')])
      .then(([depRes, catRes]) => {
        const deps = depRes.data || [];
        const cats = catRes.data || [];
        setDepartments(deps);
        setCategories(cats);

        if (user?.department_id) {
          setDepartmentId(String(user.department_id));
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load departments or categories.');
      })
      .finally(() => {
        setMetaLoading(false);
      });
  }, [user]);

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
      await axios.post('/tickets', {
        title: title.trim(),
        description: description.trim(),
        priority,
        department_id: departmentId,   
        category_id: categoryId,
      });

      setSuccess('Your request has been submitted successfully.');
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setCategoryId('');
    } catch (err) {
      console.error(err);
      setError('Failed to submit request. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setCategoryId('');
    setError('');
    setSuccess('');
  };

  const selectedDepartment = departments.find(
    (d) => String(d.id) === String(departmentId)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-blue-950">
          New Service Request
        </h1>
        <p className="text-xs text-slate-500">
          Use this form to request ICT support for computers, printers, networks, or software.
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

            <div className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 flex items-center justify-between">
              <span>
                {metaLoading
                  ? 'Loading...'
                  : selectedDepartment
                  ? selectedDepartment.name
                  : 'Not linked to any department'}
              </span>
              <span className="text-[10px] text-slate-500 ml-2">
                from your account
              </span>
            </div>

            
            <input type="hidden" value={departmentId} required />
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
            {saving ? 'Submitting...' : metaLoading ? 'Loading...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}


