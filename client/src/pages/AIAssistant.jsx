import React, { useState } from 'react';
import api from '../services/api';
import { Bot, Send } from 'lucide-react';

export default function AIAssistant() {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your TeamTracker AI Productivity Assistant. Ask me about overdue tasks, project progress summaries, or task priorities.'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const userMsg = prompt;
    setPrompt('');
    setHistory((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const { data } = await api.post('/ai/query', { prompt: userMsg });
      setHistory((prev) => [...prev, { sender: 'ai', text: data.response }]);
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        { sender: 'ai', text: err.response?.data?.message || 'Unable to process AI request.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2">
        <Bot className="text-indigo-500" />
        <h3 className="font-bold">AI Productivity Assistant</h3>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {history.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl text-sm max-w-lg ${
              item.sender === 'user'
                ? 'ml-auto bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            {item.text}
          </div>
        ))}
        {loading && <p className="text-xs text-slate-500">Analyzing workspace data...</p>}
      </div>

      <form onSubmit={handleAsk} className="p-4 border-t border-slate-200 dark:border-slate-800 flex space-x-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Summarize project progress or check overdue tasks..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
        />
        <button type="submit" className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
