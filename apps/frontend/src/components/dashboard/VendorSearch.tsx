import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { vendorApi } from '../../lib/api';
import { useDebounce } from '../../hooks/useDebounce';
import { SearchResult } from '../../types/vendor';

interface VendorSearchProps {
  onAddVendor: (ticker: string) => void;
  activeTickers: string[];
}

export function VendorSearch({ onAddVendor, activeTickers }: VendorSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: searchResults, isLoading, isError } = useQuery({
    queryKey: ['vendorSearch', debouncedSearchTerm],
    queryFn: () => vendorApi.searchVendors(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length > 2,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    throwOnError: false,
  });

  const handleSelectResult = (result: SearchResult) => {
    if (!activeTickers.includes(result.symbol)) {
      onAddVendor(result.symbol);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  const filteredResults = searchResults?.results?.filter(
    result => !activeTickers.includes(result.symbol)
  ) || [];

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search for vendors..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {isOpen && debouncedSearchTerm.length > 2 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-slate-500">
              Searching...
            </div>
          ) : isError ? (
            <div className="p-4 text-center text-slate-500">
              Search unavailable (API not connected)
            </div>
          ) : filteredResults.length > 0 ? (
            <ul>
              {filteredResults.map((result) => (
                <li key={result.symbol}>
                  <button
                    onClick={() => handleSelectResult(result)}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-slate-800">
                          {result.symbol}
                        </div>
                        <div className="text-sm text-slate-600 truncate">
                          {result.name}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {(result.match_score * 100).toFixed(0)}%
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-slate-500">
              No results found
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}