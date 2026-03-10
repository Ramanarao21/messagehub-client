import { io, Socket } from 'socket.io-client';
import type { SocketMessage } from '../types/chat.types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

class SocketService {
  private socket: Socket | null = null;
  private messageHandlers: Set<(message: SocketMessage) => void> = new Set();
  private userStatusHandlers: Set<(data: { userId: string; online: boolean }) => void> = new Set();

  connect(token: string): void {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('receiveMessage', (message: SocketMessage) => {
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.socket.on('userStatus', (data: { userId: string; online: boolean }) => {
      this.userStatusHandlers.forEach(handler => handler(data));
    });

    this.socket.on('error', (error: Error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(receiverId: string, message: string): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('sendMessage', { receiverId, message });
  }

  onMessage(handler: (message: SocketMessage) => void): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onUserStatus(handler: (data: { userId: string; online: boolean }) => void): () => void {
    this.userStatusHandlers.add(handler);
    return () => this.userStatusHandlers.delete(handler);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
