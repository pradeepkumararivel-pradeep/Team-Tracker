import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { Send } from 'lucide-react';

export default function Chat() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const { socket } = useSocket();

  useEffect(() => {
    api.get('/projects').then((res) => {
      const list = res.data.data || [];
      setProjects(list);
      if (list.length > 0) setSelectedProject(list[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    api.get(`/chat/${selectedProject}`).then((res) => setMessages(res.data.data || []));
    if (socket) {
      socket.emit('join_project', selectedProject);
      const handler = (msg) => setMessages((prev) => [...prev, msg]);
      socket.on('receive_message', handler);
      return () => socket.off('receive_message', handler);
    }
  }, [selectedProject, socket]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedProject) return;
    await api.post(`/chat/${selectedProject}`, { content: text });
    setText('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-bold">Project Channel</h3>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm"
        >
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              # {p.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((m, idx) => (
          <div key={m._id || idx} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 max-w-xl">
            <p className="text-xs font-semibold text-indigo-500">{m.sender?.name || 'Team Member'}</p>
            <p className="text-sm mt-1">{m.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-800 flex space-x-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message your team..."
          className="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
        />
        <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white flex items-center space-x-1">
          <Send size={16} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
