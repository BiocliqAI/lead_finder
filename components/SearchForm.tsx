import React, { useState } from 'react';
import { SpecialtySelector } from './SpecialtySelector';

interface SearchFormProps {
  onSearch: (city: string, numberOfCenters: string, specialties: string[]) => void;
  isLocationAvailable: boolean;
  loading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLocationAvailable, loading }) => {
  const [city, setCity] = useState('');
  const [numberOfCenters, setNumberOfCenters] = useState('5');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([
    'Urologists', 'Cardiologists', 'Diabetologists'
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim() && selectedSpecialties.length > 0) {
      onSearch(city.trim(), numberOfCenters, selectedSpecialties);
    }
  };

  const handleLocationSearch = () => {
    if (isLocationAvailable && selectedSpecialties.length > 0) {
      setCity(''); // Clear the input field
      onSearch('', numberOfCenters, selectedSpecialties);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex items-center bg-slate-800 border border-slate-700 rounded-full shadow-lg overflow-hidden">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city/town or pin code..."
          className="w-full px-6 py-4 bg-transparent focus:outline-none text-slate-100 placeholder-teal-700"
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleLocationSearch}
          disabled={loading || !isLocationAvailable || selectedSpecialties.length === 0}
          className="flex-shrink-0 px-4 py-1.5 mx-2 rounded-lg border border-slate-700 text-teal-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex flex-col items-center justify-center"
          title={!isLocationAvailable ? "Location permission not granted or unavailable" : "Use my current location"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium mt-1">Or Near Me</span>
        </button>
        <button
          type="submit"
          disabled={loading || !city.trim() || selectedSpecialties.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-bold py-4 px-8 transition-colors duration-300 flex items-center justify-center"
        >
          {loading ? (
             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : (
            'Search'
          )}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="num-centers" className="block text-sm font-medium text-teal-200 mb-1">Number of Centers</label>
          <select
            id="num-centers"
            value={numberOfCenters}
            onChange={(e) => setNumberOfCenters(e.target.value)}
            disabled={loading}
            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-teal-100 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          >
            <option value="5">Top 5</option>
            <option value="10">Top 10</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-teal-200 mb-1">Specialists</label>
          <SpecialtySelector 
            selected={selectedSpecialties}
            onChange={setSelectedSpecialties}
            disabled={loading}
          />
        </div>
      </div>
    </form>
  );
};