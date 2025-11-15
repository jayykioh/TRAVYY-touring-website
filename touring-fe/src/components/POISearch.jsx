import React, { useState, useEffect, useCallback } from 'react';
import logger from "../utils/logger";
import { Search, X, MapPin, Loader2 } from 'lucide-react';
import { debounce } from 'lodash';

export default function POISearch({ zoneId, onSelectPOI }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Debounced search
  const searchPOIs = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery || searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/zones/${zoneId}/search?q=${encodeURIComponent(searchQuery)}`);
        const json = await res.json();
        
        if (json.ok) {
          setResults(json.results || []);
        }
      } catch (err) {
        logger.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 400),
    [zoneId]
  );

  useEffect(() => {
    searchPOIs(query);
  }, [query, searchPOIs]);

  const handleSelect = (poi) => {
    onSelectPOI(poi);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Tìm địa điểm trong khu vực..."
          className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#02A0AA] focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#02A0AA] animate-spin" />
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-auto">
          {results.map((poi) => (
            <button
              key={poi.id}
              onClick={() => handleSelect(poi)}
              className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#02A0AA] mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-slate-900">{poi.name}</p>
                  {poi.address && (
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{poi.address}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && query.length >= 2 && !loading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-center text-sm text-slate-600">
          Không tìm thấy địa điểm phù hợp
        </div>
      )}
    </div>
  );
}