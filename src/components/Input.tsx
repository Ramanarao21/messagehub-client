import React from 'react';

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
}

const Input: React.FC<InputProps> = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange,
  label
}) => {
  return (
    <div className="w-full mb-6">
      {label && (
        <label className="block mb-2 text-sm font-medium text-slate-600">
          {label}
        </label>
      )}
      <input 
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl text-base transition-all duration-200 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 placeholder:text-slate-300 bg-white"
      />
    </div>
  );
};

export default Input;
