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

const roomStates = new Map();

function clearAllData() {
  console.log('Running scheduled cleanup of rooms and uploads...');
  roomStates.clear();
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
}

// Run immediately on start
clearAllData();

// Clear all data once a week (7 days * 24 hrs * 60 mins * 60 secs * 1000 ms)
setInterval(clearAllData, 7 * 24 * 60 * 60 * 1000);

const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

// Serve the uploads folder directly since files uploaded at runtime 
// aren't included in SvelteKit's pre-built client assets.
app.use('/uploads', express.static(uploadsDir));

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
