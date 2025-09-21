import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { vendorApi } from '../../lib/api';
import { useMockMode } from '../../hooks/useMockMode';
import { VendorOverview } from '../../types/vendor';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { Skeleton } from '../ui/Skeleton';

interface VendorDeepDiveModalProps {
  vendor: VendorOverview | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VendorDeepDiveModal({ vendor, isOpen, onClose }: VendorDeepDiveModalProps) {
  const isMockMode = useMockMode();
  
  // Validate vendor data before making API calls
  const isValidVendor = !!(vendor && 
    typeof vendor.symbol === 'string' && 
    vendor.symbol.length > 0 && 
    vendor.symbol !== 'undefined' &&
    vendor.symbol !== 'null');
  
  const { data: incomeData, isLoading: isLoadingIncome, isError: isIncomeError } = useQuery({
    queryKey: ['vendorIncome', vendor?.symbol, isMockMode ? 'mock' : 'live'],
    queryFn: () => vendorApi.getIncomeStatement(vendor!.symbol),
    enabled: isOpen && isValidVendor,
    staleTime: isMockMode ? Infinity : 5 * 60 * 1000,
    retry: isMockMode ? 0 : 1,
    throwOnError: false,
  });

  const { data: dailyData, isLoading: isLoadingDaily, isError: isDailyError } = useQuery({
    queryKey: ['vendorDaily', vendor?.symbol, isMockMode ? 'mock' : 'live'],
    queryFn: () => vendorApi.getDailySeries(vendor!.symbol),
    enabled: isOpen && isValidVendor,
    staleTime: isMockMode ? Infinity : 5 * 60 * 1000,
    retry: isMockMode ? 0 : 1,
    throwOnError: false,
  });

  if (!isOpen || !isValidVendor) return null;

  const chartData = dailyData?.time_series
    ?.slice(-100)
    ?.reverse()
    ?.map((item: any) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      fullDate: item.date,
      price: item.close,
    })) || [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="text-sm text-slate-600">{data.fullDate}</p>
          <p className="text-sm text-blue-600 font-medium">
            Close: ${data.price.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">{vendor.name}</h2>
            <p className="text-sm text-slate-600">{vendor.symbol} - Deep Dive Analysis</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Income Statement Section */}
            <div>
              <h3 className="text-lg font-medium text-slate-800 mb-4">Financial Performance</h3>
              {isLoadingIncome ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton height="16px" width="120px" />
                      <Skeleton height="20px" width="160px" />
                    </div>
                  ))}
                </div>
              ) : isIncomeError ? (
                <div className="text-center text-slate-500 py-8">
                  Unable to load income statement data
                </div>
              ) : incomeData?.annual_reports?.length ? (
                <div className="space-y-4">
                  {incomeData.annual_reports.slice(0, 4).map((report: any) => (
                    <div key={report.fiscal_date_ending} className="bg-slate-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-slate-600 mb-3">
                        Year ending {new Date(report.fiscal_date_ending).getFullYear()}
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">Total Revenue</p>
                          <p className="text-sm font-medium text-slate-800">
                            {formatCurrency(report.total_revenue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">Net Income</p>
                          <p className={`text-sm font-medium ${
                            report.net_income >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(report.net_income)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  Income statement data not available
                </div>
              )}
            </div>

            {/* Stock Price Chart Section */}
            <div>
              <h3 className="text-lg font-medium text-slate-800 mb-4">Stock Price (Last 100 Days)</h3>
              {isLoadingDaily ? (
                <Skeleton height="300px" width="100%" />
              ) : isDailyError ? (
                <div className="text-center text-slate-500 py-8">
                  Unable to load stock price data
                </div>
              ) : chartData.length > 0 ? (
                <div className="bg-slate-50 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={{ stroke: '#e2e8f0' }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={{ stroke: '#e2e8f0' }}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#2563eb' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  Stock price data not available
                </div>
              )}
            </div>
          </div>

          {/* Overview Section */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Key Metrics Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Market Cap</p>
                <p className="text-lg font-semibold text-slate-800">
                  {formatCurrency(vendor.market_cap)}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider">P/E Ratio</p>
                <p className="text-lg font-semibold text-slate-800">
                  {vendor.pe_ratio > 0 ? formatNumber(vendor.pe_ratio, 2) : 'N/A'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider">EBITDA</p>
                <p className="text-lg font-semibold text-slate-800">
                  {formatCurrency(vendor.ebitda)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}