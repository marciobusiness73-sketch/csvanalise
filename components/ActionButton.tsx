import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  text: string;
  loadingText?: string;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  text,
  loadingText = "Carregando...",
  disabled = false,
  isLoading = false,
  variant = 'primary',
  fullWidth = false,
}) => {
  const baseClasses = `
    flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg shadow-sm
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-all duration-200 ease-in-out
  `;
  const variantClasses = {
    primary: `
      bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500
      disabled:bg-blue-300 disabled:cursor-not-allowed
    `,
    secondary: `
      bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500
      disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
    `,
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass}`}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {isLoading ? loadingText : text}
    </button>
  );
};