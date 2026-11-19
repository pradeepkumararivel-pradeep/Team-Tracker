import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Send } from 'lucide-react';

const getChannelSlug = (title) =>
  String(title || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'project';

const getInitials = (name) =>
  String(name || 'Team Member')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const mergeMessages = (current, incoming) => {
  const messagesById = new Map(current.map((message) => [message._id, message]));
  incoming.forEach((message) => messagesById.set(message._id, message));
  return Array.from(messagesById.values()).sort(
    (first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
  );
};

const formatTimestamp = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

export default function Chat() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const selectedProjectRef = useRef('');
  const activeProject = projects.find((project) => project._id === selectedProject);
  const activeChannel = activeProject ? `#${getChannelSlug(activeProject.title)}` : '';

  useEffect(() => {
    let active = true;
    api.get('/projects')
      .then((res) => {
        if (!active) return;
        const list = res.data.data || [];
        setProjects(list);
        if (list.length > 0) {
          selectedProjectRef.current = list[0]._id;
          setSelectedProject(list[0]._id);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load project channels.');
        }
      })
      .finally(() => {
        if (active) setProjectsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedProject) {
      setMessages([]);
      setMessagesLoading(false);
      return undefined;
    }

    let active = true;
    setMessages([]);
    setMessagesLoading(true);
    setError('');

    api.get(`/chat/${selectedProject}`)
      .then((res) => {
        if (active) setMessages((current) => mergeMessages(current, res.data.data || []));
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load messages for this channel.');
        }
      })
      .finally(() => {
        if (active) setMessagesLoading(false);
      });

    const handleReceiveMessage = (message) => {
      const messageProjectId = message.project?._id || message.project;
      if (messageProjectId && String(messageProjectId) !== String(selectedProject)) return;
      if (active) setMessages((current) => mergeMessages(current, [message]));
    };

    if (socket) {
      socket.emit('join_project', selectedProject);
      socket.on('receive_message', handleReceiveMessage);
    }

    return () => {
      active = false;
      if (socket) {
        socket.off('receive_message', handleReceiveMessage);
        socket.emit('leave_project', selectedProject);
      }
    };
  }, [selectedProject, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const handleProjectChange = (event) => {
    selectedProjectRef.current = event.target.value;
    setSelectedProject(event.target.value);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const content = text.trim();
    const projectId = selectedProjectRef.current;
    if (!content || !projectId || isSending) return;

    setIsSending(true);
    setError('');
    try {
      const { data } = await api.post(`/chat/${projectId}`, { content });
      if (selectedProjectRef.current === projectId && data.data) {
        setMessages((current) => mergeMessages(current, [data.data]));
      }
      setText('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Message could not be sent. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleComposerKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const handleComposerChange = (event) => {
    setText(event.target.value);
    if (error) setError('');
  };

  const canSend = Boolean(selectedProject && text.trim() && !isSending);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold">Project Channel</h3>
          {activeChannel && <p className="text-xs text-slate-500 mt-1">{activeChannel}</p>}
        </div>
        <select
          aria-label="Select project channel"
          value={selectedProject}
          onChange={handleProjectChange}
          disabled={projectsLoading || projects.length === 0}
          className="max-w-[60%] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm disabled:opacity-50"
        >
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              #{getChannelSlug(project.title)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {projectsLoading || messagesLoading ? (
          <p className="text-sm text-slate-500 text-center py-8">Loading chat...</p>
        ) : !activeProject ? (
          <p className="text-sm text-slate-500 text-center py-8">
            No project channels are available yet. Join or create a project to start chatting.
          </p>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-slate-500 text-center">
              No messages in {activeChannel} yet. Start the conversation below.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const senderId = message.sender?._id || message.sender;
            const isCurrentUser = String(senderId) === String(user?._id);
            const senderName = message.sender?.name || 'Team Member';

            return (
              <div
                key={message._id}
                className={`flex items-end gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isCurrentUser && (
                  <div className="h-9 w-9 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold">
                    {getInitials(senderName)}
                  </div>
                )}
                <div className={`max-w-[80%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`flex items-center gap-2 mb-1 text-xs ${isCurrentUser ? 'justify-end' : ''}`}>
                    <span className="font-semibold">{isCurrentUser ? `${senderName} (You)` : senderName}</span>
                    {message.sender?.role && <span className="text-slate-500">{message.sender.role}</span>}
                    <time className="text-slate-400" dateTime={message.createdAt}>
                      {formatTimestamp(message.createdAt)}
                    </time>
                  </div>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                      isCurrentUser
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
                {isCurrentUser && (
                  <div className="h-9 w-9 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
                    {getInitials(senderName)}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800">
        <div className="px-4 pt-3 flex items-center justify-between text-xs text-slate-500">
          <span>{activeChannel ? `Posting in ${activeChannel}` : 'Select a project channel to send a message'}</span>
          {isSending && <span>Sending...</span>}
        </div>
        {error && <p role="alert" className="px-4 pt-2 text-sm text-red-500">{error}</p>}
        <form onSubmit={handleSend} className="p-4 pt-2 flex items-end gap-2">
          <textarea
            rows={2}
            value={text}
            onChange={handleComposerChange}
            onKeyDown={handleComposerKeyDown}
            placeholder="Message your team..."
            aria-label="Message your team"
            disabled={!selectedProject || isSending}
            className="flex-1 resize-none px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
            <span>Send</span>
          </button>
        </form>
        <p className="px-4 pb-3 -mt-2 text-[11px] text-slate-400">Enter to send · Shift+Enter for a new line</p>
      </div>
    </div>
  );
}
