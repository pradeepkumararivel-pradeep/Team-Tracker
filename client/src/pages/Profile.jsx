import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Pencil, ShieldCheck, UserRound } from 'lucide-react';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const { data } = await api.put('/auth/profile', { name, bio });
      const updated = { ...user, ...data.data };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      setName(updated.name || '');
      setBio(updated.bio || '');
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setName(user?.name || '');
    setBio(user?.bio || '');
    setError('');
    setMessage('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setBio(user?.bio || '');
    setError('');
    setIsEditing(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
      <header className="relative isolate overflow-hidden rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-white via-indigo-50 to-violet-100 p-6 shadow-sm dark:border-indigo-400/15 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/70 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-20 -z-10 h-56 w-56 rounded-full bg-indigo-400/15 blur-3xl dark:bg-indigo-500/15"
        />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-3xl font-bold text-white shadow-lg shadow-indigo-600/20 ring-4 ring-white/70 dark:ring-slate-800/80">
            P
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
              Account profile
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {(name || user?.name || 'Your Name').toUpperCase()}
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-200">
                <ShieldCheck size={14} />
                {user?.role || 'Team Member'}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Manage your account details and how you appear to your team.
            </p>
            {user?.email && (
              <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            )}
          </div>
        </div>
      </header>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
              <UserRound size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
                Personal details
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Profile Settings
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Keep your team profile up to date.
              </p>
            </div>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-indigo-400/40 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-200"
              >
                <Pencil size={15} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-8">
          {message && (
            <div
              role="status"
              className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
            >
              <CheckCircle2 size={17} />
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
            >
              {error}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="profile-name" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-600 dark:focus:border-indigo-400 dark:focus:bg-slate-950"
                  />
                </div>
                <div>
                  <label htmlFor="profile-role" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Role
                  </label>
                  <input
                    id="profile-role"
                    type="text"
                    disabled
                    value={user?.role || ''}
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="profile-bio" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Bio
                </label>
                <textarea
                  id="profile-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-600 dark:focus:border-indigo-400 dark:focus:bg-slate-950"
                  placeholder="Write a short bio"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Share a little about your role, interests, or what you’re working on.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your role is managed by your workspace administrator.
                </p>
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-500/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Full Name
                  </p>
                  <p className="mt-2 break-words font-medium text-slate-900 dark:text-white">
                    {user?.name || 'Name not set'}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Role
                  </p>
                  <p className="mt-2 font-medium text-slate-900 dark:text-white">{user?.role || 'Team Member'}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Bio
                </p>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {user?.bio || 'No bio added yet.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
