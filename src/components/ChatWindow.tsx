import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../sharedComponents/Button';
import Avatar from '../sharedComponents/Avatar';
import ChatMessage from '../sharedComponents/ChatMessage';
import FriendListItem from '../sharedComponents/FriendListItem';
import { dmAPI } from '../api/dm.ts';
import { initializeSocket, disconnectSocket, sendDM, onReceiveDM, onUserStatus } from '../socket/socket.ts';
import type { Message, User } from '../types/chat.types';


const ChatWindow = () => {
  const { user, logout, isLoggingOut } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Initialize socket and fetch users on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      initializeSocket(token);
      fetchUsers();
    }

    return () => {
      disconnectSocket();
    };
  }, []);

  // Listen for incoming messages (dm:receive event)
  useEffect(() => {
    const cleanup = onReceiveDM((data: any) => {
      console.log('📨 dm:receive event received:', data);
      
      // Backend sends: { id, senderId, senderUsername, recipientId, content, messageType, createdAt }
      const newMessage: any = {
        id: String(data.id || Date.now()),
        senderId: String(data.senderId),
        receiverId: String(data.recipientId),
        message: data.content || data.message || '',
        timestamp: data.createdAt || new Date().toISOString(),
        isOwn: String(data.senderId) === String(user?.id),
        content: data.content,
        senderUsername: data.senderUsername
      };

      console.log('Processing message:', {
        from: data.senderId,
        to: data.recipientId,
        selectedUser: selectedUser?.id,
        currentUser: user?.id,
        isOwn: newMessage.isOwn
      });

      // Add message if it's from/to the selected user
      if (selectedUser && (
        String(data.senderId) === String(selectedUser.id) ||
        String(data.recipientId) === String(selectedUser.id)
      )) {
        console.log('✅ Adding message to chat');
        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.some(m => String(m.id) === String(newMessage.id));
          if (exists) {
            console.log('⚠️ Message already exists, skipping');
            return prev;
          }
          return [...prev, newMessage];
        });
      }

      // Update user list with last message
      setUsers(prev => prev.map(u => 
        String(u.id) === String(data.senderId)
          ? { ...u, lastMessage: data.content || data.message, unreadCount: (u.unreadCount || 0) + 1 }
          : u
      ));
    });

    return cleanup;
  }, [selectedUser, user?.id]);

  // Listen for user status changes
  useEffect(() => {
    const cleanup = onUserStatus((data: { userId: string; online: boolean }) => {
      console.log('👤 User status changed:', data);
      setUsers(prev => prev.map(u => 
        String(u.id) === String(data.userId) ? { ...u, online: data.online } : u
      ));
      
      // Update selected user status
      if (selectedUser && String(selectedUser.id) === String(data.userId)) {
        setSelectedUser(prev => prev ? { ...prev, online: data.online } : null);
      }
    });

    return cleanup;
  }, [selectedUser]);

  // Fetch messages when user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(String(selectedUser.id));
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true); 
      const response = await dmAPI.getUsers();
      console.log('✅ Users fetched:', response);
      
      // Convert id to string if needed
      const normalizedUsers = response.users.map(u => ({
        ...u,
        id: String(u.id),
        online: u.online || false
      }));
      
      setUsers(normalizedUsers);
    } catch (error: any) {
      console.error('❌ Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      fetchUsers();
      return;
    }

    try {
      setLoading(true);
      const response = await dmAPI.searchUsers(query);
      
      const normalizedUsers = response.users.map(u => ({
        ...u,
        id: String(u.id),
        online: u.online || false
      }));
      
      setUsers(normalizedUsers);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      console.log('📥 Fetching messages for user:', userId);
      const response = await dmAPI.getMessages(String(userId), 50);
      console.log('✅ Messages fetched:', response);
      
      // Normalize messages with isOwn flag
      // Backend returns: { id, userId, recipientId, content, createdAt, sender: { id, username } }
      const normalizedMessages: Message[] = (response.messages || []).map(msg => ({
        id: String(msg.id),
        senderId: String(msg.userId || msg.senderId),
        receiverId: String(msg.recipientId || msg.receiverId),
        message: msg.content || msg.message || '',
        content: msg.content || msg.message || '',
        timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
        createdAt: msg.createdAt || msg.timestamp || new Date().toISOString(),
        isOwn: String(msg.userId || msg.senderId) === String(user?.id),
        userId: msg.userId,
        recipientId: msg.recipientId,
        conversationId: msg.conversationId,
        messageType: msg.messageType,
        isRead: msg.isRead,
        readAt: msg.readAt,
        sender: msg.sender
      }));
      
      setMessages(normalizedMessages);
    } catch (error) {
      console.error('❌ Failed to fetch messages:', error);
      setMessages([]);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedUser) return;

    const messageText = messageInput.trim();
    const recipientId = String(selectedUser.id);
    
    console.log('📤 Sending message:', {
      recipientId,
      content: messageText,
      currentUserId: user?.id
    });

    const tempMessage: any = {
      id: `temp-${Date.now()}`,
      senderId: String(user?.id) || 'me',
      receiverId: recipientId,
      recipientId: recipientId,
      message: messageText,
      content: messageText,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isOwn: true,
    };

    // Optimistically add message
    setMessages(prev => [...prev, tempMessage]);
    setMessageInput('');

    try {
      // Send via socket using dm:send event (PRIMARY METHOD)
      console.log('🔌 Sending via socket (dm:send)...');
      sendDM(recipientId, messageText, 'text');
      console.log('✅ Message sent via socket');
      
      // Note: Backend will emit dm:sent confirmation which we can listen to
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      alert('Failed to send message. Please check your connection.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={user?.username || 'User'} size="md" online={true} />
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user?.username}</h1>
            <p className="text-sm text-slate-500">Online</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Users List */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Messages</h2>
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-slate-500">Loading...</div>
            ) : users.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                {searchQuery ? 'No users found' : 'No users available'}
              </div>
            ) : (
              users.map(u => (
                <FriendListItem
                  key={u.id}
                  id={String(u.id)}
                  name={u.username}
                  image={u.avatar}
                  online={u.online || false}
                  lastMessage={u.lastMessage || 'Start a conversation'}
                  timestamp={u.lastMessageTime || ''}
                  unreadCount={u.unreadCount || 0}
                  isActive={String(selectedUser?.id) === String(u.id)}
                  onClick={() => setSelectedUser(u)}
                />
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
                <Avatar 
                  name={selectedUser.username} 
                  image={selectedUser.avatar}
                  size="md" 
                  online={selectedUser.online}
                />
                <div>
                  <h3 className="font-semibold text-slate-900">{selectedUser.username}</h3>
                  <p className="text-sm text-slate-500">
                    {selectedUser.online ? 'Active now' : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-500 mt-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map(msg => (
                    <ChatMessage
                      key={msg.id}
                      message={msg.content || msg.message || ''}
                      sender={msg.isOwn ? 'You' : selectedUser.username}
                      timestamp={formatTimestamp(msg.timestamp || msg.createdAt || '')}
                      isOwn={msg.isOwn || false}
                      senderImage={msg.isOwn ? undefined : selectedUser.avatar}
                    />
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-slate-200 p-4">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-base transition-all duration-200 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 placeholder:text-slate-300"
                    />
                  </div>
                  <Button 
                    variant="primary" 
                    size="md"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Select a conversation</h3>
                <p className="text-slate-500">Choose a user from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
