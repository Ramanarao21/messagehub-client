import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import Button from '../sharedComponents/Button';
import Avatar from '../sharedComponents/Avatar';
import ChatMessage from '../sharedComponents/ChatMessage';
import FriendListItem from '../sharedComponents/FriendListItem';
import type { User } from '../types/auth.types';

const ChatWindow = () => {
  const { user, logout, isLoggingOut } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageInput, setMessageInput] = useState('');
  
  const { users, messages, isLoadingUsers, isLoadingMessages, sendMessage, isSending } = useChat(
    selectedUser?.id || null
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedUser) return;

    try {
      await sendMessage(selectedUser.id, messageInput);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Convert users to friend format for display
  const friends = users
    .filter(u => u.id !== user?.id)
    .map(u => ({
      id: u.id,
      name: u.username,
      image: undefined,
      online: u.online || false,
      lastMessage: '', // You can enhance this with last message from backend
      timestamp: '',
      unreadCount: 0,
    }));

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
        {/* Friends List */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoadingUsers ? (
              <div className="p-4 text-center text-slate-500">Loading users...</div>
            ) : friends.length === 0 ? (
              <div className="p-4 text-center text-slate-500">No users available</div>
            ) : (
              friends.map(friend => (
                <FriendListItem
                  key={friend.id}
                  {...friend}
                  isActive={selectedUser?.id === friend.id}
                  onClick={() => setSelectedUser(users.find(u => u.id === friend.id) || null)}
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
                {isLoadingMessages ? (
                  <div className="text-center text-slate-500">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-slate-500">No messages yet. Start the conversation!</div>
                ) : (
                  messages.map(msg => (
                    <ChatMessage
                      key={msg.id}
                      message={msg.content || msg.message || ''}
                      sender={msg.isOwn ? 'You' : selectedUser.username}
                      timestamp={new Date(msg.timestamp || msg.createdAt || new Date()).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      isOwn={msg.isOwn || false}
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
                      disabled={isSending}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-base transition-all duration-200 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 placeholder:text-slate-300 disabled:opacity-50"
                    />
                  </div>
                  <Button 
                    variant="primary" 
                    size="md"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || isSending}
                  >
                    {isSending ? 'Sending...' : 'Send'}
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
                <p className="text-slate-500">Choose a friend from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
