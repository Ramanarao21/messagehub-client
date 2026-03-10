export interface Friend {
  id: string;
  name: string;
  image?: string;
  online: boolean;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export interface Message {
  id: string | number;
  userId?: string | number;
  senderId?: string | number;
  recipientId?: string | number;
  receiverId?: string | number;
  conversationId?: number;
  content?: string;
  message?: string;
  messageType?: string;
  isRead?: boolean;
  readAt?: string;
  timestamp?: string;
  createdAt?: string;
  isOwn?: boolean;
  senderUsername?: string;
  sender?: {
    id: number;
    username: string;
  };
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: Message;
}

export interface SocketMessage {
  id?: string | number;
  senderId: string | number;
  senderUsername?: string;
  receiverId?: string | number;
  recipientId?: string | number;
  message?: string;
  content?: string;
  timestamp?: string;
  createdAt?: string;
  messageType?: string;
}

export interface User {
  id: string | number;
  username: string;
  email: string;
  avatar?: string;
  online?: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  createdAt?: string;
}

export interface Conversation {
  conversationId: number;
  otherUser: {
    id: number;
    username: string;
  };
  lastMessage?: {
    id: number;
    content: string;
    createdAt: string;
  };
  lastMessageAt?: string;
  createdAt?: string;
}

