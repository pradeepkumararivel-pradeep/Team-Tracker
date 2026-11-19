const jwt = require('jsonwebtoken');
const Project = require('../models/Project');

const onlineUsers = new Map();

const socketHandler = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next();
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_dev_secret');
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next();
    }
  });

  io.on('connection', (socket) => {
    if (socket.userId) {
      onlineUsers.set(socket.userId, socket.id);
      io.emit('online_users', Array.from(onlineUsers.keys()));
    }

    socket.on('join_project', async (projectId) => {
      if (!projectId) return;
      try {
        const project = await Project.findById(projectId);
        if (project) {
          socket.join(projectId);
        }
      } catch (err) {
        // Ignore invalid room joins
      }
    });

    socket.on('leave_project', (projectId) => {
      if (projectId) socket.leave(projectId);
    });

    socket.on('send_message', (data) => {
      if (data?.projectId) {
        io.to(data.projectId).emit('receive_message', data);
      }
    });

    socket.on('task_update', (data) => {
      if (data?.projectId) {
        io.to(data.projectId).emit('task_updated', data);
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('online_users', Array.from(onlineUsers.keys()));
      }
    });
  });
};

module.exports = socketHandler;
