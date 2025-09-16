/**
 * Input Component - Tucumán Turismo Theme
 * Generic reusable input component with institutional design system
 */

import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  size = 'md',
  fullWidth = false,
  variant = 'default',
  className = '',
  disabled,
  required,
  ...props
}, ref) => {
  const baseClasses = 'transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50';
  
  const variantClasses = {
    default: 'border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary-light',
    filled: 'border-0 bg-surface focus:bg-background focus:ring-2 focus:ring-primary',
    outlined: 'border-2 border-border bg-transparent focus:border-primary focus:ring-2 focus:ring-primary-light',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-md min-h-[36px]',
    md: 'px-4 py-2.5 text-sm rounded-lg min-h-[42px]',
    lg: 'px-4 py-3 text-base rounded-lg min-h-[48px]',
  };

  const stateClasses = error
    ? 'border-danger focus:border-danger focus:ring-danger-light bg-danger-light/10'
    : variantClasses[variant];

  const inputClasses = [
    baseClasses,
    sizeClasses[size],
    stateClasses,
    leftIcon ? (size === 'lg' ? 'pl-12' : 'pl-10') : '',
    rightIcon ? (size === 'lg' ? 'pr-12' : 'pr-10') : '',
    fullWidth ? 'w-full' : '',
    disabled ? 'bg-muted-light text-muted' : 'text-foreground',
    className,
  ].filter(Boolean).join(' ');

  const iconClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5',
  };

  const iconPositionClasses = {
    sm: 'top-2.5',
    md: 'top-3',
    lg: 'top-3.5',
  };

  const labelClasses = [
    'block text-sm font-semibold mb-2 transition-colors',
    error ? 'text-danger' : 'text-foreground',
    required ? 'after:content-["*"] after:ml-1 after:text-danger' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className={labelClasses}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className={`absolute left-3 ${iconPositionClasses[size]} z-10 pointer-events-none`}>
            <span className={`${iconClasses[size]} ${error ? 'text-danger' : 'text-muted'} transition-colors`}>
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          disabled={disabled}
          required={required}
          {...props}
        />
        
        {rightIcon && (
          <div className={`absolute right-3 ${iconPositionClasses[size]} z-10 pointer-events-none`}>
            <span className={`${iconClasses[size]} ${error ? 'text-danger' : 'text-muted'} transition-colors`}>
              {rightIcon}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-start space-x-1">
          <svg className="w-4 h-4 text-danger mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-danger font-medium">{error}</p>
        </div>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-muted leading-relaxed">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;