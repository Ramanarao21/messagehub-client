import React from 'react';

interface AvatarProps {
  name: string;
  image?: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ name, image, size = 'md', online }) => {
  const sizes = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-2xl'
  };

  return (
    <div className="relative">
      {image ? (
        <img 
          src={image} 
          alt={name}
          className={`${sizes[size]} rounded-full object-cover`}
        />
      ) : (
        <div className={`${sizes[size]} bg-teal-700 rounded-full flex items-center justify-center`}>
          <span className="text-white font-bold">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
      )}
    </div>
  );
};

export default Avatar;
