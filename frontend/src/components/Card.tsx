import React, { useState } from "react";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  onClick?: () => void;
  id?: string;
}

export function Card({
  title,
  children,
  footer,
  className,
  collapsible = false,
  onClick,
  id,
}: CardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [renderContent, setRenderContent] = useState(true);
  const [animationClass, setAnimationClass] = useState("");

  const handleCollapseToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCollapsed) {
      setRenderContent(true);
      setAnimationClass("animate-collapseIn");
    } else {
      setAnimationClass("animate-collapseOut");
      setTimeout(() => {
        setRenderContent(false);
      }, 200);
    }
    setIsCollapsed(!isCollapsed);
  };

  const handleHeaderClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      id={id}
      className={
        `bg-white/90 dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-all duration-200 text-gray-700 dark:text-gray-200 ` +
        className
      }
    >
      {title && (
        <div
          onClick={handleHeaderClick}
          className="flex justify-between items-center mb-4"
        >
          <h2 className="text-lg font-semibold">{title}</h2>
          {collapsible && (
            <button
              onClick={handleCollapseToggle}
              className="flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full text-gray-600 dark:text-gray-100 transition-transform duration-200 hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none"
            >
              <span
                className={`transform transition-transform duration-200 ${
                  isCollapsed ? "rotate-0" : "rotate-180"
                }`}
              >
                {isCollapsed ? "+" : "–"}
              </span>
            </button>
          )}
        </div>
      )}
      {(!collapsible || renderContent) && (
        <div className={`${collapsible ? animationClass : ""}`}>{children}</div>
      )}
      {footer && (
        <div className="mt-4 border-t border-gray-300 dark:border-gray-600 pt-4">
          {footer}
        </div>
      )}
    </div>
  );
}
