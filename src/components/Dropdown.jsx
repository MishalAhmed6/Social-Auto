import { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import '../styles/Dropdown.css';

const Dropdown = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select...',
  required = false,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => 
    (typeof opt === 'string' ? opt : opt.value) === value
  );

  const displayValue = selectedOption 
    ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label)
    : placeholder;

  const handleSelect = (option) => {
    const optionValue = typeof option === 'string' ? option : option.value;
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`dropdown-wrapper ${className}`} ref={dropdownRef}>
      {label && (
        <label className="dropdown-label">
          {label}
          {required && <span className="required-asterisk">*</span>}
        </label>
      )}
      <div 
        className={`dropdown ${isOpen ? 'dropdown-open' : ''} ${disabled ? 'dropdown-disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`dropdown-value ${!selectedOption ? 'dropdown-placeholder' : ''}`}>
          {displayValue}
        </span>
        <FiChevronDown className={`dropdown-arrow ${isOpen ? 'dropdown-arrow-open' : ''}`} />
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          {options.length === 0 ? (
            <div className="dropdown-empty">No options available</div>
          ) : (
            options.map((option, index) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              const isSelected = value === optionValue;
              
              return (
                <div
                  key={index}
                  className={`dropdown-item ${isSelected ? 'dropdown-item-selected' : ''}`}
                  onClick={() => handleSelect(option)}
                >
                  {optionLabel}
                  {isSelected && <span className="dropdown-check">✓</span>}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

