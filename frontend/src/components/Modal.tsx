import React, { useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const closeModal = () => {
      setIsClosing(true);
      setTimeout(() => {
        setIsClosing(false);
        onClose();
      }, 200);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "escape") closeModal();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!isOpen && !isClosing) return null;

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/30 dark:bg-black/50 backdrop-blur-md transition-opacity duration-300 z-50 ${
        isClosing ? "animate-fadeOut" : "animate-fadeIn"
      }`}
      onClick={closeModal}
    >
      <div
        className={`bg-white/90 dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-auto max-w-2xl min-w-[400px] mx-4 transition-all transform text-gray-700 dark:text-gray-200 ${
          isClosing ? "animate-modalOut" : "animate-modalIn"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-lg font-semibold text-center mb-2">{title}</h2>
        )}
        <div className="w-full overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
