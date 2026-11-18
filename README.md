# TeamTracker

TeamTracker is a modern, full-stack team collaboration, project management, and task tracking SaaS platform equipped with real-time Socket.IO collaboration and an AI productivity assistant.

## Features
- **Authentication & RBAC:** Secure JWT authentication with Admin, Team Leader, and Team Member roles. Public registration creates Team Member accounts only.
- **Modern SaaS Dashboard:** Real-time project metrics, task analytics, charts, and activity feeds.
- **Advanced Task Management:** Drag-and-drop Kanban board (`@dnd-kit`), List view, priority/status filters, comments, and real-time updates.
- **Live Collaboration:** Project chat channels and live notifications via Socket.IO.
- **AI Productivity Assistant:** Context-aware project insights, overdue task identification, and workload recommendations.
- **Admin Control Panel:** User activation/deactivation, role assignment, and audit logs.
- **Dark & Light Themes:** Persistent theme toggle.

## Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios, Lucide React, Recharts, Socket.IO Client, `@dnd-kit`
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Socket.IO, Helmet, Express Rate Limit
- **DevOps:** Docker, Docker Compose, Nginx, GitHub Actions

## Quick Start with Docker
1. Copy `.env.example` to `.env` and customize values if needed.
2. Run:
   ```bash
   docker compose up --build
   ```
3. Open `http://localhost:3000` in your browser.

## Local Development (Without Docker)
1. **Backend:**
   ```bash
   cd server
   npm install
   cp ../.env.example .env
   npm run dev
   ```
2. **Frontend:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

## Testing
```bash
cd server
npm test
```
