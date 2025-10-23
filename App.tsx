import React, { useState, useEffect } from 'react';
import { SearchForm } from './components/SearchForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { findCentersAndSpecialists } from './services/geminiService';
import type { ApiResponse } from './types';
import { StatusDisplay } from './components/StatusDisplay';

const Logo = () => (
  <svg
    width="160"
    height="160"
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Diagnostic Center Services Diagram"
    className="mx-auto mb-4"
  >
    <defs>
      <g id="icon-bg">
        <circle cx="15" cy="15" r="15" fill="#1e293b" stroke="#334155" strokeWidth="2" />
      </g>
    </defs>
    <style>{`
      .line { stroke: #475569; stroke-width: 1.5; }
      .icon-path { stroke: #38bdf8; stroke-width: 2.5; fill: none; stroke-linecap: round; stroke-linejoin: round; }
      .center-circle { stroke: #06b6d4; stroke-width: 4; fill: #1e293b; }
      .center-symbol { fill: #38bdf8; }
    `}</style>
    
    {/* Connections */}
    <line x1="100" y1="60" x2="100" y2="28" className="line" />
    <line x1="135" y1="72" x2="158" y2="58" className="line" />
    <line x1="135" y1="128" x2="158" y2="142" className="line" />
    <line x1="100" y1="140" x2="100" y2="172" className="line" />
    <line x1="65" y1="128" x2="42" y2="142" className="line" />
    <line x1="65" y1="72" x2="42" y2="58" className="line" />
    
    {/* Center */}
    <circle cx="100" cy="100" r="40" className="center-circle" />
    <path d="M100 82 v 36" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
    <path d="M95 88 c 10 5 -5 14 5 19" fill="none" stroke="#94a3b8" strokeWidth="2" />
    <path d="M105 88 c -10 5 5 14 -5 19" fill="none" stroke="#94a3b8" strokeWidth="2" />
    <text x="85" y="112" fontFamily="serif" fontSize="30" fontWeight="bold" className="center-symbol">D</text>

    {/* Icons */}
    <g transform="translate(85, 0)">
      <use href="#icon-bg" />
      <circle cx="13" cy="13" r="6" className="icon-path" />
      <line x1="17" y1="17" x2="23" y2="23" className="icon-path" />
    </g>
    <g transform="translate(155, 45)">
      <use href="#icon-bg" />
      <path d="M8 15 h 4 l 2 -5 l 5 10 l 3 -5 h 4" className="icon-path" />
    </g>
    <g transform="translate(155, 125)">
      <use href="#icon-bg" />
      <path d="M10 10 l 10 10" className="icon-path" strokeWidth="3"/>
      <circle cx="9" cy="9" r="2.5" fill="#38bdf8" stroke="none" />
      <circle cx="21" cy="21" r="2.5" fill="#38bdf8" stroke="none" />
    </g>
    <g transform="translate(85, 170)">
      <use href="#icon-bg" />
      <path d="M15 8 v 14 M 8 15 h 14" className="icon-path" />
    </g>
    <g transform="translate(15, 125)">
      <use href="#icon-bg" />
      <path d="M12 12 h 5 v 5 l 5 2 v -2 l 3 -3 M17 17 v 6 M10 23 h 10" className="icon-path" />
    </g>
    <g transform="translate(15, 45)">
      <use href="#icon-bg" />
      <path d="M15,8 a7,3.5 0 0,0 0,14 a5,5 0 0,0 0,-14 m-2,14 v2 a3,3 0 0,0 4,0 v-2 m-6,-8 a2,2 0 0,0 8,0" className="icon-path" />
    </g>
  </svg>
);


const App: React.FC = () => {
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (geoError) => {
        console.warn("Geolocation permission denied or unavailable.", geoError.message);
      }
    );
  }, []);

  const handleSearch = async (city: string, numberOfCenters: string, specialties: string[]) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setStatusMessages(['Initializing search...']);
    
    const handleStatusUpdate = (newMessage: string) => {
      setStatusMessages(prev => [...prev, newMessage]);
    };

    try {
      const data = await findCentersAndSpecialists(city, numberOfCenters, specialties, userLocation, handleStatusUpdate);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 font-sans">
      <header className="text-center mb-10">
        <Logo />
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mb-2">
          Diagnostic & Specialist Finder
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Instantly locate top diagnostic centers and nearby specialists with AI-powered search.
        </p>
      </header>
      
      <main>
        <SearchForm onSearch={handleSearch} loading={loading} />

        {loading && <StatusDisplay statuses={statusMessages} />}

        {error && (
          <div className="text-center mt-8 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg max-w-2xl mx-auto">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}
        
        {!loading && <ResultsDisplay results={results} />}
      </main>
    </div>
  );
};

export default App;
