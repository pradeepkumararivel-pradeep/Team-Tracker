import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-violet-200/50 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-300/50 lg:min-h-[620px] lg:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white sm:flex lg:p-12">
          <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -right-10 -top-6 h-52 w-52 rounded-full border border-white/10" />
          <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500 text-xl font-bold shadow-lg shadow-indigo-950/40">
                T
              </div>
              <span className="text-lg font-semibold tracking-tight">TeamTracker</span>
            </div>

            <div className="mt-20 max-w-sm">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-medium text-indigo-200">
                <Sparkles size={14} />
                A clearer way to work together
              </div>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
                Great work starts with a team in sync.
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-400">
                Bring your projects, tasks, and conversations together in one place.
              </p>
            </div>
          </div>

        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-sm">
            <div className="mb-8 sm:mb-10">
              <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white shadow-lg shadow-indigo-200 sm:hidden">
                T
              </div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">
                Workspace access
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                Welcome back to TeamTracker
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Sign in to pick up where you and your team left off.
              </p>
            </div>

            {error && (
              <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <LockKeyhole size={15} className="text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign in'}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Create an account
              </Link>
            </p>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <LockKeyhole size={13} aria-hidden="true" />
              Your workspace is private and secure
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
