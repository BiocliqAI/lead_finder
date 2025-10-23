import React from 'react';

interface StatusDisplayProps {
  statuses: string[];
}

const CheckIcon = () => (
  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin h-5 w-5 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ statuses }) => {
  if (!statuses || statuses.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 p-6 bg-slate-800/50 border border-slate-700 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-slate-300 mb-4">Search Progress</h3>
      <ul className="space-y-3">
        {statuses.map((status, index) => (
          <li key={index} className="flex items-center text-slate-400">
            <div className="mr-3 flex-shrink-0">
              {index < statuses.length - 1 ? <CheckIcon /> : <SpinnerIcon />}
            </div>
            <span className={index < statuses.length - 1 ? 'text-slate-500 line-through' : 'text-slate-200 font-medium'}>
              {status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};