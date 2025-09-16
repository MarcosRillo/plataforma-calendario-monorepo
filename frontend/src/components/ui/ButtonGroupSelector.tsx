'use client';


interface ButtonGroupSelectorOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface ButtonGroupSelectorProps {
  options: ButtonGroupSelectorOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ButtonGroupSelector: React.FC<ButtonGroupSelectorProps> = ({
  options,
  selectedValue,
  onSelect,
  label,
  required = false,
  error,
  disabled = false,
  layout = 'horizontal',
  size = 'md',
  className = '',
}) => {
  const gridClass = layout === 'horizontal' 
    ? 'grid grid-cols-1 md:grid-cols-2 gap-3' 
    : 'flex flex-col gap-3';

  const buttonSizeClass = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  }[size];

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Button Group */}
      <div className={gridClass}>
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          
          return (
            <div
              key={option.value}
              className={`relative border rounded-lg transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => !disabled && onSelect(option.value)}
            >
              <div className={`${buttonSizeClass} text-left`}>
                {/* Icon and Label Row */}
                <div className="flex items-center space-x-2 mb-1">
                  {option.icon && (
                    <div className={`flex-shrink-0 ${
                      isSelected ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {option.icon}
                    </div>
                  )}
                  <div className={`font-medium ${
                    isSelected ? 'text-blue-700' : 'text-gray-900'
                  }`}>
                    {option.label}
                  </div>
                </div>

                {/* Description */}
                {option.description && (
                  <div className={`text-sm ${
                    isSelected ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {option.description}
                  </div>
                )}

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
