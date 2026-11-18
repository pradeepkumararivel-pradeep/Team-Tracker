import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FolderKanban, CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading dashboard analytics...</div>;
  }

  const cards = [
    { label: 'Total Projects', value: stats?.totalProjects || 0, icon: FolderKanban, color: 'text-indigo-500' },
    { label: 'Completed Tasks', value: stats?.completedTasks || 0, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Pending Tasks', value: stats?.pendingTasks || 0, icon: Clock, color: 'text-amber-500' },
    { label: 'Overdue Tasks', value: stats?.overdueTasks || 0, icon: AlertTriangle, color: 'text-rose-500' },
    { label: 'Productivity', value: `${stats?.productivityRate || 0}%`, icon: TrendingUp, color: 'text-cyan-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{card.label}</span>
                <Icon className={card.color} size={20} />
              </div>
              <p className="text-3xl font-bold mt-2">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold mb-4">Task Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.tasksByStatus || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {(stats?.recentActivity || []).length === 0 ? (
              <p className="text-sm text-slate-500">No recent activity recorded.</p>
            ) : (
              stats.recentActivity.map((act) => (
                <div key={act._id} className="text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
                  <p className="font-medium">{act.details}</p>
                  <p className="text-xs text-slate-500">
                    {act.user?.name} • {new Date(act.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
