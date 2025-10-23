import React, { useState } from 'react';
import { ApiResponse, DiagnosticCenter } from '../types';
import { SpecialistModal } from './SpecialistModal';


const CenterCard: React.FC<{ center: DiagnosticCenter; onShowSpecialists: () => void }> = ({ center, onShowSpecialists }) => (
  <div className="bg-slate-800/50 border border-slate-700 rounded-lg shadow-xl p-6 flex flex-col justify-between transition-transform hover:scale-[1.02] duration-300">
    <div>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold text-teal-300 pr-2">{center.name}</h3>
        {center.googleRating > 0 && (
          <div className="flex-shrink-0 flex items-center gap-1 bg-slate-700 px-3 py-1 rounded-full text-sm" title={`Google Rating: ${center.googleRating.toFixed(1)}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-bold text-amber-300">{center.googleRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {center.hasCTMachine && (
        <span className="text-xs font-medium bg-teal-500/20 text-teal-300 px-2 py-1 rounded-full mb-4 inline-block">
          ✓ CT Machine Available
        </span>
      )}

      <div className="space-y-2 text-blue-100 mb-4">
        <p className="flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
          <span>{center.address}</span>
        </p>
        {center.contactDetails.phone && (
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
            {center.contactDetails.phone}
          </p>
        )}
        {center.contactDetails.website && (
          <a href={center.contactDetails.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
            Visit Website
          </a>
        )}
      </div>
      
      {center.userReviewSummary && (
        <div className="my-4 border-t border-slate-700 pt-4">
          <h4 className="text-sm font-semibold text-teal-200 mb-2">What Users Say</h4>
          <blockquote className="text-sm text-blue-100 italic border-l-2 border-teal-500 pl-3">
            {center.userReviewSummary}
          </blockquote>
        </div>
      )}
    </div>

    <div className="mt-auto pt-4 border-t border-slate-700">
        <button
            onClick={onShowSpecialists}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            Show Nearby Specialists
        </button>
    </div>
  </div>
);

const GroundingSources: React.FC<{ sources: ApiResponse['groundingSources'] }> = ({ sources }) => {
    if (!sources || sources.length === 0) return null;

    return (
        <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold text-teal-200 mb-3">Data Sources</h3>
            <div className="flex flex-wrap justify-center gap-4">
                {sources.map((source, index) => (
                    <a
                        key={index}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm bg-slate-700 text-blue-300 px-3 py-1 rounded-full hover:bg-slate-600 transition-colors"
                    >
                        {source.title || (source.type === 'maps' ? 'Google Maps' : 'Google Search')}
                    </a>
                ))}
            </div>
        </div>
    );
};

export const ResultsDisplay: React.FC<{ results: ApiResponse | null }> = ({ results }) => {
  const [selectedCenter, setSelectedCenter] = useState<DiagnosticCenter | null>(null);

  if (!results) {
    return null;
  }
  
  if (results.diagnosticCenters.length === 0) {
    return <p className="text-center text-blue-200 mt-8">No diagnostic centers with CT machines were found. Please try a different city.</p>;
  }

  return (
    <>
      <div className="w-full max-w-6xl mx-auto mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.diagnosticCenters.map((center, index) => (
            <CenterCard 
                key={index} 
                center={center} 
                onShowSpecialists={() => setSelectedCenter(center)} 
            />
          ))}
        </div>
        <GroundingSources sources={results.groundingSources} />
      </div>

      <SpecialistModal 
        center={selectedCenter} 
        onClose={() => setSelectedCenter(null)} 
      />
    </>
  );
};