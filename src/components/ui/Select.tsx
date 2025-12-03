import { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  className = "",
  disabled = false
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedOption = options.find(option => option.value === value);
    setSelectedLabel(selectedOption ? selectedOption.label : '');
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            w-full px-4 py-2 border border-gray-300 rounded-lg 
            focus:ring-2 focus:ring-blue-500 focus:border-transparent 
            transition-colors duration-200 
            disabled:opacity-50 disabled:cursor-not-allowed
            text-left flex items-center justify-between
            ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : ''}
            ${selectedLabel ? 'text-gray-900' : 'text-gray-500'}
          `}
        >
          <span className="truncate">
            {selectedLabel || placeholder}
          </span>

          <div className="flex items-center space-x-1 ml-2">
            {value && !disabled && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-400" />
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-2 text-gray-500 text-center">
              No hay opciones disponibles
            </div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionClick(option)}
                className={`
                  w-full px-4 py-2 text-left text-gray-900 hover:bg-gray-100 
                  transition-colors focus:outline-none focus:bg-gray-100
                  ${option.value === value ? 'bg-blue-50 text-blue-700' : ''}
                `}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
