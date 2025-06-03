import { ReactNode } from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (newVal: boolean) => void;
  iconOn?: ReactNode;
  iconOff?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  iconOn,
  iconOff,
  disabled = false,
  className = "",
}: ToggleProps) {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative inline-flex items-center h-6 w-12 cursor-pointer transition-colors duration-200 ease-in-out
        ${
          checked
            ? "bg-green-500 dark:bg-green-600"
            : "bg-gray-300 dark:bg-gray-600"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        rounded-full ${className}`}
    >
      <span
        className={`absolute left-0 inline-flex items-center justify-center h-6 w-6 transform rounded-full shadow transition-transform duration-200 ease-in-out
          ${
            checked ? "translate-x-6" : "translate-x-0"
          } bg-white dark:bg-gray-200`}
      >
        {checked ? iconOn : iconOff}
      </span>
    </div>
  );
}
