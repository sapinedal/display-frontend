import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'save' | 'prueba';
  size?: 'sm' | 'md' | 'lg' | 'xs';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  useCan?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  useCan,
}) => {
  const { useCan: canAccess } = useAuth();
  
  if (useCan && !canAccess(useCan)) {
    return null;
  }
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    save: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    prueba: 'bg-blue-600 text-black'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xs: 'px-2 py-1 text-xs'
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && iconPosition === 'left' && (
        <Icon className="w-4 h-4 mr-2" />
      )}
      {children}
      {Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 ml-2" />
      )}
    </button>
  );
};

export default Button; 