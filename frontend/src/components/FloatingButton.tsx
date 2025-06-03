import { FiPlus } from "react-icons/fi";

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-10 transition-transform transform hover:scale-110"
      aria-label="Neuen Eintrag hinzufügen"
    >
      <FiPlus size={26} />
    </button>
  );
}
