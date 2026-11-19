import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  const loadAdminData = async () => {
    const [uRes, lRes] = await Promise.all([api.get('/admin/users'), api.get('/admin/logs')]);
    setUsers(uRes.data.data || []);
    setLogs(lRes.data.data || []);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (userId, role) => {
    await api.put(`/admin/users/${userId}/role`, { role });
    loadAdminData();
  };

  const handleToggleStatus = async (userId) => {
    await api.put(`/admin/users/${userId}/status`);
    loadAdminData();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
          Administration
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          User & Role Management
        </h2>
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/30"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{u.email}</td>
                  <td className="px-5 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Team Leader">Team Leader</option>
                      <option value="Team Member">Team Member</option>
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u._id)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Audit Logs</h2>
        <div className="mt-4 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {logs.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No audit logs yet</p>
          ) : (
            logs.map((log) => (
              <div
                key={log._id}
                className="border-b border-slate-100 px-5 py-4 text-xs last:border-0 dark:border-slate-800"
              >
                <span className="mr-2 inline-flex rounded-md bg-indigo-50 px-2 py-1 font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  {log.action}
                </span>
                <span className="text-slate-700 dark:text-slate-300">{log.details}</span>
                <span className="mt-1 block text-slate-500 dark:text-slate-500">
                  {log.user?.email} · {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
