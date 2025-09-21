import React, { useState, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Cloud, Download } from 'lucide-react';
import { CSVLink } from 'react-csv';
import { vendorApi } from './lib/api';
import { useMockMode } from './hooks/useMockMode';
import { VendorOverview } from './types/vendor';
import { VendorSearch } from './components/dashboard/VendorSearch';
import { VendorTable } from './components/dashboard/VendorTable';
import { VendorChart } from './components/dashboard/VendorChart';
import { VendorDeepDiveModal } from './components/dashboard/VendorDeepDiveModal';
import { WeatherFinanceInsights } from './components/weather-finance/WeatherFinanceInsights';
import { Button } from './components/ui/Button';
import { ApiHealthCheck } from './components/ui/ApiHealthCheck';
import { formatCurrency, formatNumber } from './lib/utils';

function App() {
  const [activeTickers, setActiveTickers] = useState<string[]>(['TEL', 'ST', 'DD', 'CE', 'LYB']);
  const [selectedVendor, setSelectedVendor] = useState<VendorOverview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMockMode = useMockMode();
  
  const vendorQueries = useQueries({
    queries: activeTickers.map(ticker => ({
      queryKey: ['vendorOverview', ticker, isMockMode ? 'mock' : 'live'],
      queryFn: () => vendorApi.getOverview(ticker),
      staleTime: isMockMode ? Infinity : 5 * 60 * 1000, // Cache mock data indefinitely
      retry: isMockMode ? 0 : 1, // Don't retry mock data
      throwOnError: false,
    })),
  });

  // Debug logging for vendor queries (only in development)
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Vendor queries status:', vendorQueries.map(q => ({
        isLoading: q.isLoading,
        isError: q.isError,
        data: q.data ? { symbol: q.data.symbol, name: q.data.name } : null,
        error: q.error?.message
      })));
    }
  }, [vendorQueries]);

  const vendors = vendorQueries
    .map(query => query.data)
    .filter((vendor): vendor is VendorOverview => {
      const isValid = vendor !== undefined && 
        typeof vendor.symbol === 'string' &&
        vendor.symbol.length > 0 &&
        vendor.symbol !== 'undefined' &&
        vendor.symbol !== 'null' &&
        typeof vendor.name === 'string' &&
        vendor.name.length > 0 &&
        vendor.name !== 'undefined' &&
        vendor.name !== 'null';
      
      if (!isValid && vendor) {
        console.log('Filtered out vendor:', vendor);
      }
      
      return isValid;
    });

  const isLoading = vendorQueries.some(query => query.isLoading);
  const hasError = vendorQueries.some(query => query.isError);
  const allErrors = vendorQueries.every(query => query.isError && !query.isLoading);

  const addVendor = (ticker: string) => {
    if (!activeTickers.includes(ticker.toUpperCase())) {
      setActiveTickers(prev => [...prev, ticker.toUpperCase()]);
    }
  };

  const removeVendor = (ticker: string) => {
    setActiveTickers(prev => prev.filter(t => t !== ticker));
  };

  const openModal = (vendor: VendorOverview) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedVendor(null);
    setIsModalOpen(false);
  };

  // Memoize CSV data generation for performance
  const { csvData, csvHeaders } = useMemo(() => {
    const data = vendors.map(vendor => ({
      Symbol: vendor.symbol,
      Name: vendor.name,
      'Market Cap': formatCurrency(vendor.market_cap),
      'P/E Ratio': vendor.pe_ratio > 0 ? formatNumber(vendor.pe_ratio, 2) : 'N/A',
      EBITDA: formatCurrency(vendor.ebitda),
    }));

    const headers = [
      { label: 'Symbol', key: 'Symbol' },
      { label: 'Name', key: 'Name' },
      { label: 'Market Cap', key: 'Market Cap' },
      { label: 'P/E Ratio', key: 'P/E Ratio' },
      { label: 'EBITDA', key: 'EBITDA' },
    ];

    return { csvData: data, csvHeaders: headers };
  }, [vendors]);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Cloud className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-slate-800">
                WindBorne Vendor Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ApiHealthCheck />
              <VendorSearch 
                onAddVendor={addVendor} 
                activeTickers={activeTickers}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Error State */}
          {allErrors && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-amber-800">API Connection Issue</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Unable to connect to the WindBorne API at http://127.0.0.1:8000. Please ensure the backend server is running.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {hasError && !allErrors && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                Some vendor data could not be loaded. Please try again later.
              </p>
            </div>
          )}

          {/* Vendor Table Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-medium text-slate-800">
                Active Vendors ({vendors.length})
              </h2>
              {vendors.length > 0 && (
                <CSVLink
                  data={csvData}
                  headers={csvHeaders}
                  filename={`windborne-vendors-${new Date().toISOString().split('T')[0]}.csv`}
                  className="inline-flex"
                >
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </CSVLink>
              )}
            </div>

            <VendorTable
              vendors={vendors}
              isLoading={isLoading}
              onRemoveVendor={removeVendor}
              onVendorClick={openModal}
            />
          </div>

          {/* Chart Section */}
          {(vendors.length > 0 || isLoading) && (
            <VendorChart
              vendors={vendors}
              isLoading={isLoading}
            />
          )}

          {/* Weather-Finance Intelligence Section */}
          {vendors.length > 0 && (
            <WeatherFinanceInsights
              activeVendors={activeTickers}
            />
          )}

          {/* Empty State */}
          {vendors.length === 0 && !isLoading && !hasError && (
            <div className="text-center py-12">
              <Cloud className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                No vendors added yet
              </h3>
              <p className="text-slate-600 mb-4">
                Search for vendors using the search bar in the header to get started.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Deep Dive Modal */}
      <VendorDeepDiveModal
        vendor={selectedVendor}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}

export default App;