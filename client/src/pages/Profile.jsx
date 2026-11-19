import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [message, setMessage] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    const { data } = await api.put('/auth/profile', { name, bio });
    const updated = { ...user, ...data.data };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    setMessage('Profile updated successfully!');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
          Account
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Profile Settings
        </h2>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        {message && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label htmlFor="profile-name" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Full Name
          </label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-400"
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
        <div>
          <label htmlFor="profile-bio" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Bio
          </label>
          <textarea
            id="profile-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-400"
            placeholder="Write a short bio"
          />
        </div>
        <div className="flex justify-end border-t border-slate-100 pt-5 dark:border-slate-800">
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
          >
            Save Changes
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
