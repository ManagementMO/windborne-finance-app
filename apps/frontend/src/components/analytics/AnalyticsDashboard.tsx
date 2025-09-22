import { useState, useMemo, useCallback, useRef } from 'react';
import { useQueries } from '@tanstack/react-query';
import { DashboardLayout } from './DashboardLayout';
import { KPIGrid, defaultKPIs } from './KPIGrid';
import { AdvancedDataTable } from './AdvancedDataTable';
import { MultiMetricChart } from './MultiMetricChart';
import { FilterPanel, FilterState, defaultFilterState } from './FilterPanel';
import { ExportTools } from './ExportTools';
import { WeatherFinanceInsights } from '../weather-finance/WeatherFinanceInsights';
import { VendorDeepDiveModal } from '../dashboard/VendorDeepDiveModal';
import { vendorApi } from '../../lib/api';
import { useMockMode } from '../../hooks/useMockMode';
import { VendorOverview } from '../../types/vendor';
import { formatCurrency, formatNumber } from '../../lib/utils';

interface AnalyticsDashboardProps {
  initialTickers?: string[];
}

export function AnalyticsDashboard({
  initialTickers = ['TEL', 'ST', 'DD', 'CE', 'LYB', 'AAPL', 'MSFT', 'GOOGL']
}: AnalyticsDashboardProps) {
  const [activeTickers] = useState<string[]>(initialTickers);
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<VendorOverview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const isMockMode = useMockMode();

  // Fetch vendor data
  const vendorQueries = useQueries({
    queries: activeTickers.map(ticker => ({
      queryKey: ['vendorOverview', ticker, isMockMode ? 'mock' : 'live'],
      queryFn: () => vendorApi.getOverview(ticker),
      staleTime: isMockMode ? Infinity : 5 * 60 * 1000,
      retry: isMockMode ? 0 : 1,
      throwOnError: false,
    })),
  });

  // Process and filter vendor data
  const { vendors, filteredVendors } = useMemo(() => {
    const allVendors = vendorQueries
      .map(query => query.data)
      .filter((vendor): vendor is VendorOverview => {
        return vendor !== undefined &&
          typeof vendor.symbol === 'string' &&
          vendor.symbol.length > 0 &&
          typeof vendor.name === 'string' &&
          vendor.name.length > 0;
      });

    // Apply filters
    const filtered = allVendors.filter(vendor => {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (!vendor.symbol.toLowerCase().includes(query) &&
            !vendor.name.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Market cap filter
      if (vendor.market_cap < filters.marketCapRange.min ||
          vendor.market_cap > filters.marketCapRange.max) {
        return false;
      }

      // P/E ratio filter
      if (vendor.pe_ratio > 0) {
        if (vendor.pe_ratio < filters.peRatioRange.min ||
            vendor.pe_ratio > filters.peRatioRange.max) {
          return false;
        }
      }

      return true;
    });

    return { vendors: allVendors, filteredVendors: filtered };
  }, [vendorQueries, filters]);

  // Calculate KPIs
  const kpiData = useMemo(() => {
    const totalMarketCap = filteredVendors.reduce((sum, vendor) => sum + vendor.market_cap, 0);
    const validPERatios = filteredVendors.filter(v => v.pe_ratio > 0).map(v => v.pe_ratio);
    const avgPERatio = validPERatios.length > 0
      ? validPERatios.reduce((sum, ratio) => sum + ratio, 0) / validPERatios.length
      : 0;
    const weatherRiskScore = Math.floor(Math.random() * 100); // Simulated

    return [
      {
        ...defaultKPIs[0],
        value: totalMarketCap,
        change: 5.2,
        changeType: 'increase' as const,
      },
      {
        ...defaultKPIs[1],
        value: avgPERatio,
        change: -2.1,
        changeType: 'decrease' as const,
      },
      {
        ...defaultKPIs[2],
        value: weatherRiskScore,
        change: 8.3,
        changeType: 'increase' as const,
      },
      {
        ...defaultKPIs[3],
        value: filteredVendors.length,
        change: 0,
        changeType: 'neutral' as const,
      },
    ];
  }, [filteredVendors]);

  // Event handlers
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilterState);
  }, []);

  const handleToggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const handleRefreshData = useCallback(() => {
    vendorQueries.forEach(query => query.refetch());
  }, [vendorQueries]);

  const handleExportData = useCallback(() => {
    const csvContent = [
      ['Symbol', 'Company Name', 'Market Cap', 'P/E Ratio', 'EBITDA'],
      ...filteredVendors.map(vendor => [
        vendor.symbol,
        vendor.name,
        formatCurrency(vendor.market_cap),
        vendor.pe_ratio > 0 ? formatNumber(vendor.pe_ratio, 2) : 'N/A',
        formatCurrency(vendor.ebitda),
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredVendors]);

  const handleVendorClick = useCallback((vendor: VendorOverview) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedVendor(null);
    setIsModalOpen(false);
  }, []);

  const isLoading = vendorQueries.some(query => query.isLoading);

  return (
    <>
      <DashboardLayout
        onExportData={handleExportData}
        onRefreshData={handleRefreshData}
        onToggleFilters={handleToggleFilters}
        showFilters={showFilters}
      >
        <div className="space-y-6">
          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="col-span-12 lg:col-span-3">
                <div className="space-y-4">
                  <FilterPanel
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onReset={handleResetFilters}
                  />
                  <ExportTools
                    data={filteredVendors}
                    chartRef={chartRef}
                    title="Vendor Analytics"
                  />
                </div>
              </div>
            )}

            {/* Main Dashboard Content */}
            <div className={`col-span-12 ${showFilters ? 'lg:col-span-9' : ''}`}>
              <div className="space-y-6">
                {/* KPI Cards */}
                <KPIGrid kpis={kpiData} cols={4} />

                {/* Charts Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div ref={chartRef} className="min-w-0">
                    <MultiMetricChart
                      data={filteredVendors}
                      title="Financial Metrics Analysis"
                      defaultChartType="composed"
                    />
                  </div>
                  <div className="min-w-0">
                    <MultiMetricChart
                      data={filteredVendors}
                      title="Market Distribution"
                      defaultChartType="pie"
                    />
                  </div>
                </div>

                {/* Advanced Data Table */}
                <AdvancedDataTable
                  data={filteredVendors}
                  onRowClick={handleVendorClick}
                  onExport={handleExportData}
                  title="Vendor Performance Analysis"
                />

                {/* Weather Finance Intelligence */}
                {filteredVendors.length > 0 && (
                  <WeatherFinanceInsights
                    activeVendors={filteredVendors.map(v => v.symbol)}
                  />
                )}

                {/* Additional Analytics Charts */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="min-w-0">
                    <MultiMetricChart
                      data={filteredVendors}
                      title="Risk vs Performance"
                      defaultChartType="scatter"
                    />
                  </div>
                  <div className="min-w-0">
                    <MultiMetricChart
                      data={filteredVendors}
                      title="Company Comparison Radar"
                      defaultChartType="radar"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
                <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span className="text-slate-700">Loading analytics data...</span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredVendors.length === 0 && vendors.length > 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                No data matches your filters
              </h3>
              <p className="text-slate-600 mb-4">
                Try adjusting your filter criteria to see more results.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Deep Dive Modal */}
      <VendorDeepDiveModal
        vendor={selectedVendor}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}

export default AnalyticsDashboard;