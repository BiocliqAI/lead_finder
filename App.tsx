import React, { useState, useEffect } from 'react';
import { SearchForm } from './components/SearchForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { findCentersAndSpecialists } from './services/geminiService';
import type { ApiResponse } from './types';
import { StatusDisplay } from './components/StatusDisplay';
import AnimatedBackground from './components/AnimatedBackground';

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
    const initialMessage = city ? `Initializing search for "${city}"...` : 'Initializing search using your location...';
    setStatusMessages([initialMessage]);
    
    const handleStatusUpdate = (newMessage: string) => {
      setStatusMessages(prev => [...prev, newMessage]);
    };

    if (!city && !userLocation) {
      setError("Current location is not available. Please enter a city or grant location permission.");
      setLoading(false);
      return;
    }

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
    <div className="relative min-h-screen bg-slate-900 text-white p-4 sm:p-8 font-sans overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <header className="text-center my-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mb-2">
            Biocliq Lead Finder
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
             Your lead generation companion
          </p>
        </header>
        
        <main>
          <SearchForm onSearch={handleSearch} loading={loading} isLocationAvailable={!!userLocation} />

          {loading && <StatusDisplay statuses={statusMessages} />}

          {error && (
            <div className="text-center mt-8 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg max-w-2xl mx-auto">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}
          
          {!loading && <ResultsDisplay results={results} />}
        </main>
      </div>
    </div>
  );
};

export default App;