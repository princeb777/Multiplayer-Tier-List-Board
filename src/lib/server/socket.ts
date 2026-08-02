import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';

// We store the current state of each room here.
// In production, this might be Redis or a database.
const roomStates = new Map<string, any[]>();

export function setupSocket(server: HTTPServer) {
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
      const state = roomStates.get(roomId) || [];
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
