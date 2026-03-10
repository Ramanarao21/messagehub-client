const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
import type { Conversation, User , Message } from "../types/chat.types";
export const getToken = (): string | null => localStorage.getItem('auth_token');



// DM (Direct Message) API calls
export const dmAPI = {
  // Get all conversations
  getConversations: async (): Promise<{ conversations: Conversation[] }> => {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/dm/conversations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }
    
    return response.json();
  },

  // Get all users for chat list
  getUsers: async (): Promise<{ users: User[] }> => {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    return response.json();
  },

  // Search users by username or email
  searchUsers: async (query: string): Promise<{ users: User[] }> => {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/users/search?query=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to search users');
    }
    
    return response.json();
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<{ user: User }> => {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    
    return response.json();
  },

  // Get messages with a specific user (NEW ENDPOINT)
  getMessages: async (otherUserId: string, limit: number = 50): Promise<{ messages: Message[] }> => {
    const token = getToken();
    
    console.log(`📥 Fetching messages: GET /dm/conversation/${otherUserId}?limit=${limit}`);
    
    const response = await fetch(`${API_BASE_URL}/dm/conversation/${otherUserId}?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('API Error:', errorData);
      throw new Error(errorData.error || `Failed to fetch messages (${response.status})`);
    }
    
    const data = await response.json();
    console.log('✅ Messages fetched:', data);
    return data;
  },

  // Mark messages as read
  markAsRead: async (conversationId: number): Promise<{ success: boolean }> => {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/dm/conversation/${conversationId}/read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark as read');
    }
    
    return response.json();
  },
};
