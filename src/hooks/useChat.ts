import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../services/api';
import { socketService } from '../services/socket';
import { authApi } from '../services/api';
import type { Message, SocketMessage } from '../types/chat.types';

export const useChat = (selectedUserId: string | null) => {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);

  // Fetch users list
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: chatApi.getUsers,
  });

  // Fetch messages for selected user
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', selectedUserId],
    queryFn: () => selectedUserId ? chatApi.getMessages(selectedUserId) : Promise.resolve({ messages: [] }),
    enabled: !!selectedUserId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ receiverId, message }: { receiverId: string; message: string }) =>
      chatApi.sendMessage(receiverId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedUserId] });
    },
  });

  // Initialize socket connection
  useEffect(() => {
    const token = authApi.getToken();
    if (token) {
      socketService.connect(token);
    }

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Handle incoming messages via socket
  useEffect(() => {
    const unsubscribe = socketService.onMessage((socketMessage: SocketMessage) => {
      const newMessage: Message = {
        id: String(Date.now()),
        senderId: String(socketMessage.senderId),
        receiverId: String(socketMessage.receiverId || socketMessage.recipientId),
        recipientId: String(socketMessage.recipientId || socketMessage.receiverId),
        message: socketMessage.message || socketMessage.content,
        content: socketMessage.content || socketMessage.message,
        timestamp: socketMessage.timestamp || socketMessage.createdAt,
        createdAt: socketMessage.createdAt || socketMessage.timestamp,
        isOwn: false,
      };

      setMessages(prev => [...prev, newMessage]);
      
    
      queryClient.invalidateQueries({ queryKey: ['messages', selectedUserId] });
    });

    return unsubscribe;
  }, [queryClient, selectedUserId]);

  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages);
    }
  }, [messagesData]);

  const sendMessage = useCallback(
    async (receiverId: string, message: string) => {
      if (!message.trim()) return;

      try {
        // Send via socket for real-time delivery
        socketService.sendMessage(receiverId, message);

        // Also send via API for persistence
        await sendMessageMutation.mutateAsync({ receiverId, message });

        // Optimistically add message to UI
        const newMessage: Message = {
          id: String(Date.now()),
          senderId: 'me',
          receiverId,
          recipientId: receiverId,
          message,
          content: message,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          isOwn: true,
        };
        setMessages(prev => [...prev, newMessage]);
      } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
      }
    },
    [sendMessageMutation]
  );

  return {
    users: usersData?.users || [],
    messages,
    isLoadingUsers,
    isLoadingMessages,
    sendMessage,
    isSending: sendMessageMutation.isPending,
  };
};
