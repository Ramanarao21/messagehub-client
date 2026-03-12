import type { Group, CreateGroupData, GroupMessage } from '../../types/group.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Get auth token
const getToken = (): string | null => localStorage.getItem('auth_token');

// Group interfaces

// Group API calls
export const groupAPI = {
  // Get all groups
  getGroups: async (): Promise<{ groups: Group[] }> => {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/groups`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch groups');
    }
    
    return response.json();
  },

  // Create a new group
  createGroup: async (groupData: CreateGroupData): Promise<{ group: Group }> => {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(groupData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create group');
    }
    
    return response.json();
  },

  // Get group messages
  getGroupMessages: async (groupId: string | number): Promise<{ messages: GroupMessage[] }> => {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/messages`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch group messages');
    }
    
    return response.json();
  },

  // Send message to group
  sendGroupMessage: async (groupId: string | number, message: string): Promise<{ message: GroupMessage }> => {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send group message');
    }
    
    return response.json();
  },

  // Add member to group
  addMember: async (groupId: string | number, userId: string | number): Promise<{ success: boolean }> => {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add member');
    }
    
    return response.json();
  },

  // Leave group
  leaveGroup: async (groupId: string | number): Promise<{ success: boolean }> => {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/leave`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to leave group');
    }
    
    return response.json();
  },
};
