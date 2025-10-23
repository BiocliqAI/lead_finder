import React from 'react';
import { DiagnosticCenter, Specialist } from '../types';

const SpecialistList: React.FC<{ title: string; specialists: Specialist[] }> = ({ title, specialists }) => {
  if (!specialists || specialists.length === 0) {
    return (
        <div>
            <h4 className="text-md font-semibold text-teal-400 mt-4 mb-2">{title}</h4>
            <p className="text-sm text-blue-300 italic">No {title.toLowerCase()} found nearby for this center.</p>
        </div>
    );
  }
  return (
    <div>
      <h4 className="text-md font-semibold text-teal-400 mt-4 mb-2">{title}</h4>
      <ul className="space-y-2">
        {specialists.map((specialist, index) => (
          <li key={index} className="text-sm p-3 bg-slate-700/50 rounded-md">
            <p className="font-medium text-slate-200">{specialist.name}</p>
            <p className="text-blue-200 mt-1">{specialist.address}</p>
            {specialist.phone && (
              <p className="text-blue-200 flex items-center mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                {specialist.phone}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

interface SpecialistModalProps {
  center: DiagnosticCenter | null;
  onClose: () => void;
}

export const SpecialistModal: React.FC<SpecialistModalProps> = ({ center, onClose }) => {
  React.useEffect(() => {
    if (center) {
      const handleEsc = (event: KeyboardEvent) => {
         if (event.key === 'Escape') {
          onClose();
         }
      };
      window.addEventListener('keydown', handleEsc);
      document.body.classList.add('overflow-hidden');
  
      return () => {
        window.removeEventListener('keydown', handleEsc);
        document.body.classList.remove('overflow-hidden');
      };
    }
  }, [center, onClose]);

  if (!center) return null;

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-slate-800 p-6 z-10 flex justify-between items-center border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-teal-300">Specialists Near</h2>
            <p className="text-blue-200 mt-1">{center.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {Object.entries(center.nearbySpecialists).length > 0 ? (
             Object.entries(center.nearbySpecialists).map(([specialty, specialists]) => (
                <SpecialistList
                  key={specialty}
                  title={capitalize(specialty)}
                  specialists={specialists}
                />
             ))
          ) : (
            <p className="text-blue-200 text-center py-4">No specialist information was found for this center.</p>
          )}
        </div>
      </div>
    </div>
  );
};