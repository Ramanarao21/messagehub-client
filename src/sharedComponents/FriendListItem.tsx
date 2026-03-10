import React from 'react';
import Avatar from './Avatar';

interface FriendListItemProps {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  image?: string;
  online?: boolean;
  unreadCount?: number;
  isActive?: boolean;
  onClick: () => void;
}

const FriendListItem: React.FC<FriendListItemProps> = ({ 
  name, 
  lastMessage, 
  timestamp, 
  image, 
  online,
  unreadCount = 0,
  isActive = false,
  onClick 
}) => {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 p-4 cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
        isActive ? 'bg-teal-50 border-l-4 border-teal-700' : ''
      }`}
    >
      <Avatar name={name} image={image} size="md" online={online} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-slate-900 truncate">{name}</h3>
          <span className="text-xs text-slate-400">{timestamp}</span>
        </div>
        <p className="text-sm text-slate-500 truncate">{lastMessage}</p>
      </div>
      {unreadCount > 0 && (
        <div className="w-6 h-6 bg-teal-700 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">{unreadCount}</span>
        </div>
      )}
    </div>
  );
};

export default FriendListItem;
