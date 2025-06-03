import React from "react";
import { FiUser, FiLock, FiMail } from "react-icons/fi";

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  type?: "text" | "password" | "email" | "";
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export function TextField({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  onKeyDown,
}: TextFieldProps) {
  const getIcon = () => {
    switch (type) {
      case "password":
        return (
          <FiLock className="text-gray-500 dark:text-gray-400" size={18} />
        );
      case "email":
        return (
          <FiMail className="text-gray-500 dark:text-gray-400" size={18} />
        );
      case "text":
        return (
          <FiUser className="text-gray-500 dark:text-gray-400" size={18} />
        );
      default:
        return null;
    }
  };

  const icon = getIcon();
  const paddingLeft = icon ? "pl-10" : "pl-4";

  return (
    <div className="w-full">
      {label && (
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
          {label}
        </label>
      )}

      <div className="relative flex items-center bg-white/80 dark:bg-gray-700 rounded-xl shadow-md border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-400 transition-all duration-200">
        {icon && <span className="absolute left-3">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={`w-full ${paddingLeft} pr-4 py-2 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-xl`}
        />
      </div>
    </div>
  );
}
