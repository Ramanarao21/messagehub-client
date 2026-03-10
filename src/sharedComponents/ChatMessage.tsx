import React from 'react';
import Avatar from './Avatar';

interface ChatMessageProps {
  message: string;
  sender: string;
  timestamp: string;
  isOwn?: boolean;
  senderImage?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  sender, 
  timestamp, 
  isOwn = false,
  senderImage 
}) => {
  return (
    <div className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <Avatar name={sender} image={senderImage} size="sm" />
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div className={`px-4 py-2 rounded-2xl ${
          isOwn 
            ? 'bg-teal-700 text-white rounded-br-sm' 
            : 'bg-slate-100 text-slate-900 rounded-bl-sm'
        }`}>
          <p className="text-sm">{message}</p>
        </div>
        <span className="text-xs text-slate-400 mt-1">{timestamp}</span>
      </div>
    </div>
  );
};

export default ChatMessage;
