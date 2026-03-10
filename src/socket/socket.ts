import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

let socket: Socket | null = null;

// Initialize socket connection
export const initializeSocket = (token: string): Socket => {
  if (socket?.connected) {
    console.log('✅ Socket already connected:', socket.id);
    return socket;
  }

  console.log('🔌 Initializing socket connection...');
  console.log('Socket URL:', SOCKET_URL);
  console.log('Token:', token ? 'Present' : 'Missing');

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Connection events
  socket.on('connect', () => {
    console.log('✅ Socket connected successfully! ID:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected. Reason:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_failed', () => {
    console.error('❌ Socket reconnection failed after all attempts');
  });

  return socket;
};

// Disconnect socket
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Get socket instance
export const getSocket = (): Socket | null => socket;

// Check connection status
export const isConnected = (): boolean => socket?.connected || false;

// ============ DM Events ============

// Send DM (using dm:send event)
export const sendDM = (recipientId: string, content: string, messageType: string = 'text'): void => {
  if (!socket?.connected) {
    console.error('❌ Socket not connected, cannot send message');
    return;
  }
  
  console.log('🔌 Emitting dm:send event:', { recipientId, content, messageType });
  socket.emit('dm:send', { recipientId: Number(recipientId), content, messageType });
  console.log('✅ Message emitted to socket');
};

// Listen for incoming DMs (dm:receive event)
export const onReceiveDM = (callback: (data: any) => void): (() => void) => {
  if (!socket) {
    console.warn('⚠️ Socket not initialized for onReceiveDM');
    return () => {};
  }
  
  console.log('👂 Listening for dm:receive events');
  
  socket.on('dm:receive', (data) => {
    console.log('🔔 dm:receive event received:', data);
    callback(data);
  });
  
  return () => {
    console.log('🔇 Removing dm:receive listener');
    socket?.off('dm:receive', callback);
  };
};

// Listen for sent message confirmation (dm:sent event)
export const onMessageSent = (callback: (data: any) => void): (() => void) => {
  if (!socket) return () => {};
  
  console.log('👂 Listening for dm:sent events');
  
  socket.on('dm:sent', (data) => {
    console.log('✅ dm:sent event received:', data);
    callback(data);
  });
  
  return () => socket?.off('dm:sent', callback);
};

// Listen for user status changes (user:online and user:offline events)
export const onUserStatus = (callback: (data: { userId: string; online: boolean; username?: string }) => void): (() => void) => {
  if (!socket) return () => {};
  
  console.log('👂 Listening for user:online and user:offline events');
  
  socket.on('user:online', (data) => {
    console.log('✅ user:online event:', data);
    callback({ userId: String(data.userId), online: true, username: data.username });
  });
  
  socket.on('user:offline', (data) => {
    console.log('❌ user:offline event:', data);
    callback({ userId: String(data.userId), online: false, username: data.username });
  });
  
  return () => {
    socket?.off('user:online');
    socket?.off('user:offline');
  };
};

// Listen for typing indicator (dm:typing:user event)
export const onTyping = (callback: (data: { userId: string; username: string; isTyping: boolean }) => void): (() => void) => {
  if (!socket) return () => {};
  
  socket.on('dm:typing:user', (data) => {
    console.log('⌨️ User typing:', data);
    callback({ ...data, isTyping: true });
  });
  
  socket.on('dm:typing:stop', (data) => {
    console.log('⌨️ User stopped typing:', data);
    callback({ userId: String(data.userId), username: '', isTyping: false });
  });
  
  return () => {
    socket?.off('dm:typing:user');
    socket?.off('dm:typing:stop');
  };
};

// Emit typing indicator (dm:typing:start and dm:typing:stop)
export const emitTyping = (recipientId: string, isTyping: boolean): void => {
  if (!socket?.connected) return;
  
  const event = isTyping ? 'dm:typing:start' : 'dm:typing:stop';
  socket.emit(event, { recipientId: Number(recipientId) });
};

// ============ Group Events ============

// Join group room
export const joinGroup = (groupId: string): void => {
  if (!socket?.connected) return;
  socket.emit('joinGroup', { groupId });
};

// Leave group room
export const leaveGroup = (groupId: string): void => {
  if (!socket?.connected) return;
  socket.emit('leaveGroup', { groupId });
};

// Send group message
export const sendGroupMessage = (groupId: string, message: string): void => {
  if (!socket?.connected) return;
  socket.emit('sendGroupMessage', { groupId, message });
};

// Listen for group messages
export const onReceiveGroupMessage = (callback: (data: any) => void): (() => void) => {
  if (!socket) return () => {};
  
  socket.on('receiveGroupMessage', callback);
  
  return () => socket?.off('receiveGroupMessage', callback);
};
