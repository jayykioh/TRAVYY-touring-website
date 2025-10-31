
import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, MapPin, Loader2, Compass } from 'lucide-react';
import { debounce } from 'lodash';
import { motion, AnimatePresence } from 'framer-motion';

export default function POISearch({ zoneId, onSelectPOI }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState(null);

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
        console.error('Search error:', err);
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
    setSelectedPOI(poi);
    setIsOpen(false);
    // onSelectPOI will be called after user chooses a nearby or confirms
  };

  // Simulate nearby POIs (in real app, fetch from API)
  const nearbyPOIs = selectedPOI
    ? [
        { id: selectedPOI.id + '-1', name: selectedPOI.name + ' (gần đây 1)', address: selectedPOI.address },
        { id: selectedPOI.id + '-2', name: selectedPOI.name + ' (gần đây 2)', address: selectedPOI.address },
        { id: selectedPOI.id + '-3', name: selectedPOI.name + ' (gần đây 3)', address: selectedPOI.address },
      ]
    : [];

  return (
    <div className="relative">
      {/* Search Input */}
      <motion.div layout className="relative" initial={false} animate={{ scale: 1 }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedPOI(null);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Tìm địa điểm trong khu vực..."
          className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#02A0AA] focus:border-transparent shadow transition-all duration-200 focus:shadow-lg bg-white/90"
          style={{ transition: 'box-shadow 0.2s' }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
              setSelectedPOI(null);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#02A0AA] animate-spin" />
        )}
      </motion.div>

      {/* Results Dropdown with animation */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-auto"
          >
            {results.map((poi) => (
              <button
                key={poi.id}
                onClick={() => handleSelect(poi)}
                className="w-full px-4 py-3 text-left hover:bg-[#e6f7fa] border-b border-slate-100 last:border-b-0 transition-colors duration-150"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* No results */}
      <AnimatePresence>
        {isOpen && query.length >= 2 && !loading && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-center text-sm text-slate-600"
          >
            Không tìm thấy địa điểm phù hợp
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nearby search after selecting a POI */}
      <AnimatePresence>
        {selectedPOI && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute z-50 w-full mt-2 bg-white border border-[#02A0AA] rounded-xl shadow-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-[#02A0AA]" />
              <span className="font-semibold text-[#02A0AA] text-sm">Địa điểm gần "{selectedPOI.name}"</span>
            </div>
            <div className="space-y-1 mb-3">
              {nearbyPOIs.map((poi) => (
                <button
                  key={poi.id}
                  onClick={() => {
                    onSelectPOI(poi);
                    setSelectedPOI(null);
                    setQuery('');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#e6f7fa] transition-colors text-sm"
                >
                  <span className="font-medium text-slate-900">{poi.name}</span>
                  {poi.address && (
                    <span className="block text-xs text-slate-500">{poi.address}</span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                onSelectPOI(selectedPOI);
                setSelectedPOI(null);
                setQuery('');
              }}
              className="w-full mt-2 rounded-lg bg-[#02A0AA] text-white py-2 font-semibold hover:bg-[#028a94] transition-all"
            >
              Thêm địa điểm này
            </button>
            <button
              onClick={() => setSelectedPOI(null)}
              className="w-full mt-2 rounded-lg bg-slate-100 text-slate-600 py-2 font-medium hover:bg-slate-200 transition-all"
            >
              Quay lại tìm kiếm
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}