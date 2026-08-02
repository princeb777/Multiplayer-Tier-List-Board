import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { readdirSync, unlinkSync } from 'fs';
import { join } from 'path';

// We store the current state of each room here.
// In production, this might be Redis or a database.
const roomStates = new Map<string, any[]>();

export function setupSocket(server: HTTPServer) {
  function clearAllData() {
    console.log('Running scheduled cleanup of rooms and uploads...');
    roomStates.clear();
    try {
      const uploadsDir = join(process.cwd(), 'static', 'uploads');
      if (!readdirSync(process.cwd()).includes('static')) return; // Just in case static doesn't exist
      
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

  // Clear all data once a week
  setInterval(clearAllData, 7 * 24 * 60 * 60 * 1000);

  const io = new Server(server, {
    cors: {
      origin: '*',
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
      
      // Send the current room state to the newly joined client
      const state = roomStates.get(roomId) || null;
      socket.emit('sync-state', state);
    });

    socket.on('update-state', (roomId: string, newState: any[]) => {
      // Keep master state
      roomStates.set(roomId, newState);
      // Broadcast to everyone else in the room
      socket.to(roomId).emit('sync-state', newState);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}
