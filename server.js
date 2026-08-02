import { handler } from './build/handler.js';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { readdirSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const app = express();
const server = createServer(app);

// Recreate the Socket.io logic identically to src/lib/server/socket.ts
// (Render runs this server directly)

// Ensure static/uploads exists
const uploadsDir = join(process.cwd(), 'static', 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

// Clean up old uploads on server start
try {
  const files = readdirSync(uploadsDir);
  let deletedCount = 0;
  for (const file of files) {
    if (file !== '.gitkeep') {
      unlinkSync(join(uploadsDir, file));
      deletedCount++;
    }
  }
  if (deletedCount > 0) {
    console.log(`Cleaned up ${deletedCount} leftover file(s) in static/uploads/`);
  }
} catch (err) {
  console.error('Error cleaning up uploads directory:', err);
}

const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

const roomStates = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    const state = roomStates.get(roomId) || [];
    socket.emit('sync-state', state);
  });

  socket.on('update-state', (roomId, newState) => {
    roomStates.set(roomId, newState);
    socket.to(roomId).emit('sync-state', newState);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Let SvelteKit handle everything else, including serving static/uploads
app.use(handler);

// Render sets the PORT environment variable automatically
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Production server running on port ${PORT}`);
});
