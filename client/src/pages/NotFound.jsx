import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4">
      <h1 className="text-6xl font-extrabold text-indigo-500">404</h1>
      <p className="text-xl mt-4">Page not found</p>
      <Link to="/" className="mt-6 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500">
        Back to Dashboard
      </Link>
    </div>
  );
}
