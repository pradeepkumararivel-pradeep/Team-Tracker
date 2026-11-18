# Production Deployment Guide

## 1. MongoDB Atlas Setup
1. Create a MongoDB Atlas account and deploy a free M0 cluster.
2. Create a database user under **Database Access** with Read/Write permissions.
3. Under **Network Access**, allow access from your hosting provider IPs (or `0.0.0.0/0` for dynamic cloud environments).
4. Copy the connection string (`MONGO_URI`).

## 2. Backend Deployment (Render)
1. Push your repository to GitHub.
2. Create a new **Web Service** on Render connected to your GitHub repo.
3. Set **Root Directory** to `server`.
4. **Build Command:** `npm install`
5. **Start Command:** `node server.js`
6. Add Environment Variables: `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `AI_API_KEY`.

## 3. Frontend Deployment (Vercel)
1. Import your GitHub repository into Vercel.
2. Set **Root Directory** to `client`.
3. **Framework Preset:** Vite.
4. Add Environment Variable: `VITE_API_URL=https://your-render-backend.onrender.com/api` and `VITE_SOCKET_URL=https://your-render-backend.onrender.com`.
5. Deploy!
