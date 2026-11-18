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
    <div className="max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
      {message && <p className="mb-4 text-sm text-emerald-500">{message}</p>}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-700"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Role</label>
          <input
            type="text"
            disabled
            value={user?.role || ''}
            className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-700 opacity-60"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-700"
          />
        </div>
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium">
          Save Changes
        </button>
      </form>
    </div>
  );
}
