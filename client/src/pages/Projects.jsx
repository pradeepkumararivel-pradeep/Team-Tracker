import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, Trash2 } from 'lucide-react';

export default function Projects() {
  const { setPageHeader } = useOutletContext();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', deadline: '', priority: 'Medium' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [actionError, setActionError] = useState('');
  const [deletingProjectId, setDeletingProjectId] = useState('');
  const [memberProject, setMemberProject] = useState(null);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberError, setMemberError] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [projectResponse, taskResponse] = await Promise.all([
        api.get('/projects'),
        api.get('/tasks')
      ]);
      setProjects(projectResponse.data.data || []);
      setTasks(taskResponse.data.data || []);
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Unable to load projects and progress.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      await api.post('/projects', form);
      setForm({ title: '', description: '', deadline: '', priority: 'Medium' });
      setShowModal(false);
      fetchProjects();
    } catch (error) {
      setCreateError(error.response?.data?.message || 'Unable to create the project.');
    } finally {
      setCreating(false);
    }
  };

  const handleManageMembers = async (project) => {
    setMemberProject(project);
    setAvailableMembers([]);
    setSelectedMemberId('');
    setMemberError('');
    setMembersLoading(true);
    try {
      const { data } = await api.get(`/projects/${project._id}/available-members`);
      setAvailableMembers(data.data || []);
    } catch (error) {
      setMemberError(error.response?.data?.message || 'Unable to load available team members.');
    } finally {
      setMembersLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberProject || !selectedMemberId) return;

    setMemberError('');
    try {
      const { data } = await api.post(`/projects/${memberProject._id}/members`, { userId: selectedMemberId });
      setMemberProject(data.data);
      setProjects((current) => current.map((project) =>
        project._id === data.data._id ? data.data : project
      ));
      setAvailableMembers((current) => current.filter((member) => member._id !== selectedMemberId));
      setSelectedMemberId('');
    } catch (error) {
      setMemberError(error.response?.data?.message || 'Unable to add this team member.');
    }
  };

  const handleDeleteProject = async (project) => {
    const confirmed = window.confirm(
      `Delete "${project.title}" and all tasks in this project? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingProjectId(project._id);
    setActionError('');
    try {
      await api.delete(`/projects/${project._id}`);
      setProjects((current) => current.filter((item) => item._id !== project._id));
      setTasks((current) => current.filter((task) =>
        String(task.project?._id || task.project) !== String(project._id)
      ));
      if (memberProject?._id === project._id) setMemberProject(null);
    } catch (error) {
      setActionError(error.response?.data?.message || `Unable to delete "${project.title}".`);
    } finally {
      setDeletingProjectId('');
    }
  };

  const canCreate = user?.role === 'Admin' || user?.role === 'Team Leader';
  const isAdmin = user?.role === 'Admin';
  const canManageMembers = (project) =>
    user?.role === 'Admin' || (user?.role === 'Team Leader' && project.owner?._id === user?._id);
  const projectTitleCounts = projects.reduce((counts, project) => {
    const title = String(project.title || '').trim().toLowerCase();
    counts.set(title, (counts.get(title) ?? 0) + 1);
    return counts;
  }, new Map());

  useEffect(() => {
    setPageHeader({
      title: 'Projects',
      subtitle: 'Manage team initiatives and track milestones',
      actionLabel: canCreate ? 'New Project' : null,
      onAction: canCreate ? () => {
        setCreateError('');
        setShowModal(true);
      } : null
    });

    return () => setPageHeader(null);
  }, [setPageHeader, canCreate]);

  return (
    <div className="space-y-6">
      {actionError && <p role="alert" className="text-sm text-red-500">{actionError}</p>}

      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500" role="status">Loading projects...</div>
      ) : loadError ? (
        <div className="p-8 text-center rounded-2xl border border-red-200 dark:border-red-900/50" role="alert">
          <p className="text-sm text-red-500">{loadError}</p>
          <button
            type="button"
            onClick={fetchProjects}
            className="mt-3 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Try again
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <h3 className="font-semibold">No projects yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            {canCreate ? 'Create a project to start organizing team tasks.' : 'You have not been added to a project yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const normalizedTitle = String(proj.title || '').trim().toLowerCase();
            const hasDuplicateTitle = (projectTitleCounts.get(normalizedTitle) ?? 0) > 1;
            const projectTasks = tasks.filter((task) => {
              const taskProjectId = task.project?._id || task.project;
              return String(taskProjectId) === String(proj._id);
            });
            const taskCount = projectTasks.length;
            const completedCount = projectTasks.filter((task) => task.status === 'Completed').length;
            const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
            const progressDescription = taskCount === 0
              ? 'No tasks have been added yet. Progress will appear when tasks are created.'
              : `${completedCount} of ${taskCount} tasks completed`;
            const memberCount = proj.members?.length ?? 0;
            const deadline = proj.deadline ? new Date(proj.deadline).toLocaleDateString() : 'No deadline';

            return (
              <article
                key={proj._id}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-indigo-500/60"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      title={`Project status: ${proj.status}`}
                      className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 font-medium transition-colors duration-200 group-hover:bg-indigo-500/20 group-focus-within:bg-indigo-500/20"
                    >
                      {proj.status}
                    </span>
                    <span
                      title={`Priority: ${proj.priority}`}
                      className="text-xs text-slate-500 transition-colors duration-200 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-focus-within:text-slate-700 dark:group-focus-within:text-slate-300"
                    >
                      {proj.priority}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold">{proj.title}</h3>
                    {hasDuplicateTitle && (
                      <span
                        title={`Project ID: ${proj._id}`}
                        className="shrink-0 rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-500 dark:bg-slate-800"
                      >
                        ID {String(proj._id).slice(-6).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{proj.description}</p>
                </div>

                <div className="mt-6 space-y-3">
                  <div
                    title={progressDescription}
                    aria-label={`Project progress: ${progressDescription}`}
                    role="group"
                    tabIndex={0}
                    className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{taskCount === 0 ? 'No tasks yet' : `${progress}%`}</span>
                    </div>
                    <div
                      className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden transition-colors duration-200 group-hover:bg-slate-300 dark:group-hover:bg-slate-700 group-focus-within:bg-slate-300 dark:group-focus-within:bg-slate-700"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progress}
                      aria-valuetext={progressDescription}
                    >
                      <div
                        className="h-full bg-indigo-600 transition-all duration-500 ease-out group-hover:bg-indigo-500 group-focus-within:bg-indigo-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="flex items-center space-x-1">
                      <Users size={14} />
                      <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{deadline}</span>
                    </span>
                  </div>

                  <Link
                    to={`/tasks?project=${encodeURIComponent(proj._id)}`}
                    className="block w-full px-3 py-2 rounded-lg bg-indigo-600 text-white text-center text-sm transition-colors duration-200 hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                  >
                    <span>View tasks ({taskCount})</span>
                  </Link>
                  {canManageMembers(proj) && (
                    <button
                      type="button"
                      onClick={() => handleManageMembers(proj)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      Manage members
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(proj)}
                      disabled={deletingProjectId === proj._id}
                      className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-300 text-red-600 text-sm transition-colors duration-200 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      <Trash2 size={15} />
                      {deletingProjectId === proj._id ? 'Deleting...' : 'Delete project'}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Create New Project</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Project Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
              />
              <textarea
                required
                placeholder="Project Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
              />
              <input
                type="date"
                required
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
              />
              {createError && <p role="alert" className="text-sm text-red-500">{createError}</p>}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700"
                >
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-50">
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {memberProject && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Manage {memberProject.title} members</h3>
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Current members</p>
              <p className="text-sm text-slate-500">
                {(memberProject.members || []).map((member) => member.name).join(', ') || 'No members yet'}
              </p>
            </div>
            {membersLoading ? (
              <p className="text-sm text-slate-500">Loading available members...</p>
            ) : availableMembers.length > 0 ? (
              <form onSubmit={handleAddMember} className="space-y-4">
                <select
                  required
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                >
                  <option value="">Select a team member</option>
                  {availableMembers.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="w-full px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-50"
                  disabled={!selectedMemberId}
                >
                  Add to project
                </button>
              </form>
            ) : (
              <p className="text-sm text-slate-500">All active users are already project members.</p>
            )}
            {memberError && <p role="alert" className="text-sm text-red-500 mt-3">{memberError}</p>}
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setMemberProject(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
