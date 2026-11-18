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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">User & Role Management</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-slate-200 dark:border-slate-800">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 text-slate-500">{u.email}</td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Team Leader">Team Leader</option>
                      <option value="Team Member">Team Member</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={u.isActive ? 'text-emerald-500' : 'text-rose-500'}>
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStatus(u._id)}
                      className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
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

      <div>
        <h2 className="text-xl font-bold mb-4">Audit Logs</h2>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 max-h-80 overflow-y-auto">
          {logs.map((log) => (
            <div key={log._id} className="text-xs border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="font-bold text-indigo-500">[{log.action}]</span> {log.details} —{' '}
              <span className="text-slate-500">
                {log.user?.email} ({new Date(log.createdAt).toLocaleString()})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
