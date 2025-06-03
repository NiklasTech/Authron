import { FiCheck } from "react-icons/fi";

interface CustomCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomCheckbox({
  id,
  checked,
  onChange,
  label,
  className = "",
  disabled = false,
}: CustomCheckboxProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative flex items-center">
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          onClick={() => !disabled && onChange(!checked)}
          className={`w-5 h-5 flex items-center justify-center rounded
            ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
            ${
              checked
                ? "bg-blue-500 dark:bg-blue-600 border-blue-500 dark:border-blue-600"
                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500"
            }
            border transition-colors duration-200 ease-in-out`}
        >
          {checked && <FiCheck className="text-white" size={12} />}
        </div>
      </div>
      {label && (
        <label
          htmlFor={id}
          className={`ml-2 text-sm font-medium
            ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
            ${
              checked
                ? "text-gray-800 dark:text-gray-200"
                : "text-gray-700 dark:text-gray-300"
            }`}
        >
          {label}
        </label>
      )}
    </div>
  );
}
