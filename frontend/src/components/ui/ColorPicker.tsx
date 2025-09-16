/**
 * ColorPicker Component
 * Pure presentation component for color selection
 * Uses HTML5 color input with enhanced UI
 */

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = (props) => {
  const { 
    label,
    value,
    onChange,
    disabled = false,
    className = ''
  } = props;

  const handleColorChange = (newValue: string) => {
    onChange(newValue);
  };

  const handleHexChange = (hexValue: string) => {
    // Simple hex validation - only allow valid hex characters
    if (/^#[0-9A-Fa-f]{0,6}$/.test(hexValue)) {
      onChange(hexValue);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        {/* Color preview */}
        <div 
          className="w-12 h-12 border-2 border-gray-300 rounded-lg shadow-sm"
          style={{ backgroundColor: value }}
        />
        
        {/* Color input */}
        <input
          type="color"
          value={value}
          onChange={(e) => handleColorChange(e.target.value)}
          disabled={disabled}
          className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        />
        
        {/* Hex value display */}
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => handleHexChange(e.target.value)}
            disabled={disabled}
            placeholder="#000000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
};
