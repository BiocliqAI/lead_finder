import React, { useState, useRef, useEffect } from 'react';

const ALL_SPECIALTIES = [
  'Urologists', 'Cardiologists', 'Diabetologists', 'Neurologists', 'Dermatologists',
  'Gastroenterologists', 'Oncologists', 'Orthopedic Surgeons', 'Pediatricians',
  'Psychiatrists', 'Radiologists', 'Ophthalmologists', 'Endocrinologists'
];

interface SpecialtySelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled: boolean;
}

export const SpecialtySelector: React.FC<SpecialtySelectorProps> = ({ selected, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (specialty: string) => {
    const newSelected = selected.includes(specialty)
      ? selected.filter(s => s !== specialty)
      : [...selected, specialty];
    onChange(newSelected);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-left flex justify-between items-center disabled:opacity-50"
      >
        <span className="text-slate-300">
          {selected.length > 0 ? `${selected.length} specialt${selected.length === 1 ? 'y' : 'ies'} selected` : 'Select specialties'}
        </span>
        <svg className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-slate-700 border border-slate-600 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
          <ul className="p-2">
            {ALL_SPECIALTIES.map(specialty => (
              <li key={specialty}>
                <label className="flex items-center p-2 rounded-md hover:bg-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(specialty)}
                    onChange={() => handleToggle(specialty)}
                    className="h-4 w-4 rounded bg-slate-800 border-slate-500 text-sky-500 focus:ring-sky-500"
                  />
                  <span className="ml-3 text-slate-200">{specialty}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};