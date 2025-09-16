/**
 * Button Component - Tucumán Turismo Theme
 * Generic reusable button component with institutional design system
 */

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none shadow-sm';

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    secondary: 'bg-secondary text-white hover:bg-secondary-hover focus:ring-secondary shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    outline: 'border-2 border-primary bg-white text-primary hover:bg-primary-light focus:ring-primary hover:border-primary-hover',
    ghost: 'text-primary hover:bg-primary-light focus:ring-primary hover:text-primary-hover',
    danger: 'bg-danger text-white hover:bg-red-700 focus:ring-danger shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    success: 'bg-success text-white hover:bg-green-700 focus:ring-success shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    warning: 'bg-warning text-white hover:bg-amber-600 focus:ring-warning shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[40px]',
    lg: 'px-6 py-2.5 text-base min-h-[44px]',
    xl: 'px-8 py-3 text-base min-h-[48px]',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-5 h-5',
  };

  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  const iconClasses = iconSizeClasses[size];

  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg 
            className={`animate-spin -ml-1 mr-2 ${iconClasses} text-current`} 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
              className="opacity-25" 
            />
            <path 
              fill="currentColor" 
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
              className="opacity-75" 
            />
          </svg>
          {children}
        </>
      ) : (
        <>
          {leftIcon && (
            <span className={`mr-2 ${iconClasses} flex-shrink-0`}>
              {leftIcon}
            </span>
          )}
          <span className="truncate">{children}</span>
          {rightIcon && (
            <span className={`ml-2 ${iconClasses} flex-shrink-0`}>
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;