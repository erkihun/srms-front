import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../assets/ps-logo2.png';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await login(email.trim(), password);

      if (res?.ok) {
        const role = res.user?.role;
        if (role === 'ADMIN') {
          navigate('/');
        } else if (role === 'TECHNICIAN') {
          navigate('/technician');
        } else {
          navigate('/employee');
        }
      } else {
        setError(
          res?.message || 'Unable to sign in. Please check your credentials.'
        );
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong while signing in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-orange-50 flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-6xl">
        
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-blue-100 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-56 w-56 rounded-full bg-orange-100 blur-3xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white/80 border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/70 overflow-hidden backdrop-blur-xl">
          
          <div className="hidden md:flex flex-col justify-between px-10 py-9 border-r border-slate-200 bg-gradient-to-br from-blue-50 via-blue-100 to-orange-50">
            <div>
              
              <div className="inline-flex items-center gap-3 rounded-full px-3 py-1 mb-7 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="h-12 w-12 rounded-md overflow-hidden flex items-center justify-center">
                    <img
                      src={logo}
                      alt="SRMS Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-slate-700">
                    ICT Service Request
                  </span>
                </div>
              </div>

              <h4 className="text-2xl font-semibold text-slate-900 leading-snug mb-3">
                ICT Service Request Management System
              </h4>

              <p className="text-sm text-slate-700 mb-6">
                A centralized platform for logging, tracking, and resolving ICT
                incidents across government offices — improving accountability,
                transparency, and service quality.
              </p>

              
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
                    Key capabilities
                  </p>
                  <ul className="space-y-2 text-sm text-slate-800">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                      <span>
                        Employees submit structured tickets for hardware,
                        software, and network issues with clear categorization.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500" />
                      <span>
                        ICT teams prioritize, assign, and update requests
                        within a transparent workflow and full history.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400" />
                      <span>
                        Management monitors volumes, turnaround time, and
                        service performance using consolidated records.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 mt-6">
              <p className="text-[11px] text-slate-600">
                For internal use within authorized government offices only. Use
                of this system may be logged and audited.
              </p>
            </div>
          </div>

          
          <div className="flex items-center justify-center px-6 py-8 bg-white/70">
            <div className="w-full max-w-md">
              
              <div className="mb-6 flex items-center justify-center md:hidden">
                <div className="inline-flex items-center gap-3 rounded-full bg-white border border-slate-200 px-3 py-1 shadow-sm">
                  <div className="h-7 w-7 rounded-md overflow-hidden bg-blue-900 flex items-center justify-center">
                    <img
                      src={logo}
                      alt="SRMS Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-800">
                    ICT Service Request Management System
                  </span>
                </div>
              </div>

            
               
              
                  
                  <div className="mb-6 space-y-1.5">
                   
                    <h2 className="text-xl font-semibold text-slate-900">
                      Sign in to your account
                    </h2>
                    <p className="text-xs text-slate-600">
                      Use your institutional email and password to manage or
                      submit ICT service requests.
                    </p>
                  </div>

                  
                  {error && (
                    <div className="mb-4 flex items-start gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2">
                      <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-red-500" />
                      <p className="text-[11px] text-red-800">{error}</p>
                    </div>
                  )}

                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-800">
                        Email address
                      </label>
                      <input
                        type="email"
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                        placeholder="you@institution.gov"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-medium text-slate-800">
                          Password
                        </label>
                        <button
                          type="button"
                          className="text-[11px] text-slate-500 hover:text-slate-800"
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="current-password"
                          required
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-1 w-full inline-flex justify-center items-center gap-2 rounded-md bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-200 hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                      {loading && (
                        <span className="h-3 w-3 animate-spin rounded-full border-[2px] border-white border-t-transparent" />
                      )}
                      <span>{loading ? 'Signing in…' : 'Sign In'}</span>
                    </button>
                  </form>

                  <p className="text-[11px] text-slate-600 mt-4 text-center">
                    Don’t have an account?{' '}
                    <Link
                      to="/register"
                      className="font-medium text-orange-600 hover:text-orange-700"
                    >
                      Register as employee
                    </Link>
                  </p>

                  <p className="mt-3 text-[10px] text-center text-slate-500">
                    By signing in, you confirm that you are an authorized user
                    and agree to comply with institutional ICT policies.
                  </p>
          
           
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

