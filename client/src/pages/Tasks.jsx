import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { Plus, Download } from 'lucide-react';

const COLUMNS = ['To Do', 'In Progress', 'Review', 'Completed'];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [view, setView] = useState('kanban');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', project: '', priority: 'Medium', deadline: '' });
  const { socket } = useSocket();

  const loadData = async () => {
    const [taskRes, projRes] = await Promise.all([api.get('/tasks'), api.get('/projects')]);
    setTasks(taskRes.data.data || []);
    setProjects(projRes.data.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('task_updated', () => loadData());
    return () => socket.off('task_updated');
  }, [socket]);

  const handleStatusChange = async (taskId, newStatus) => {
    await api.put(`/tasks/${taskId}`, { status: newStatus });
    loadData();
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    await api.post('/tasks', form);
    setShowModal(false);
    setForm({ title: '', description: '', project: '', priority: 'Medium', deadline: '' });
    loadData();
  };

  const exportCSV = () => {
    const headers = ['Title,Project,Status,Priority,Deadline'];
    const rows = tasks.map(
      (t) => `"${t.title}","${t.project?.title || ''}","${t.status}","${t.priority}","${t.deadline || ''}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teamtracker-tasks.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Tasks</h2>
          <p className="text-sm text-slate-500">Track deliverables across Kanban and List views</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView(view === 'kanban' ? 'list' : 'kanban')}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm"
          >
            Switch to {view === 'kanban' ? 'List' : 'Kanban'}
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm"
          >
            <Download size={16} />
            <span>CSV</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium"
          >
            <Plus size={16} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {view === 'kanban' ? (
        <DndContext collisionDetection={closestCenter}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {COLUMNS.map((col) => (
              <div
                key={col}
                className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 min-h-[420px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">{col}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800">
                    {tasks.filter((t) => t.status === col).length}
                  </span>
                </div>
                <div className="space-y-3">
                  {tasks
                    .filter((t) => t.status === col)
                    .map((task) => (
                      <div
                        key={task._id}
                        className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500">
                            {task.priority}
                          </span>
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            className="text-xs bg-transparent border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5"
                          >
                            {COLUMNS.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                        <p className="font-semibold text-sm">{task.title}</p>
                        <p className="text-xs text-slate-500">{task.project?.title}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </DndContext>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="p-4">Task</th>
                <th className="p-4">Project</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t._id} className="border-b border-slate-200 dark:border-slate-800">
                  <td className="p-4 font-medium">{t.title}</td>
                  <td className="p-4 text-slate-500">{t.project?.title}</td>
                  <td className="p-4">{t.priority}</td>
                  <td className="p-4">
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t._id, e.target.value)}
                      className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1"
                    >
                      {COLUMNS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Create Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <select
                required
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-700"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                placeholder="Task Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-700"
              />
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-700"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white">
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
