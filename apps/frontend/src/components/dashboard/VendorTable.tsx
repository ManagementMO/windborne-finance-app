import { X } from 'lucide-react';
import { VendorOverview } from '../../types/vendor';
import { Badge } from '../ui/Badge';
import { TableRowSkeleton } from '../ui/Skeleton';
import { formatCurrency, formatNumber, getHealthFlags, getContractReadiness, getWeatherExposure, getSalesOpportunity } from '../../lib/utils';

interface VendorTableProps {
  vendors: VendorOverview[];
  isLoading: boolean;
  onRemoveVendor: (ticker: string) => void;
  onVendorClick: (vendor: VendorOverview) => void;
}

export function VendorTable({ vendors, isLoading, onRemoveVendor, onVendorClick }: VendorTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Market Cap
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  P/E Ratio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  EBITDA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Contract Readiness
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Weather Exposure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Sales Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRowSkeleton key={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Market Cap
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  P/E Ratio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  EBITDA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Contract Readiness
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Weather Exposure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Sales Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {vendors.map((vendor) => {
                const contractReadiness = getContractReadiness(vendor);
                const weatherExposure = getWeatherExposure(vendor);
                const salesOpportunity = getSalesOpportunity(vendor);
                return (
                  <tr
                    key={vendor.symbol}
                    onClick={() => onVendorClick(vendor)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          {vendor.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {vendor.symbol}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                      {formatCurrency(vendor.market_cap)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                      {vendor.pe_ratio > 0 ? formatNumber(vendor.pe_ratio, 2) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                      {formatCurrency(vendor.ebitda)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <Badge variant="info" className={`text-xs ${contractReadiness.color}`}>
                          {contractReadiness.score}
                        </Badge>
                        <span className="text-xs text-slate-500">{contractReadiness.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <Badge variant="warning" className={`text-xs ${weatherExposure.color}`}>
                          {weatherExposure.level}
                        </Badge>
                        <span className="text-xs text-slate-500">{weatherExposure.sectors}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <Badge variant="error" className={`text-xs ${salesOpportunity.color}`}>
                          {salesOpportunity.priority}
                        </Badge>
                        <span className="text-xs text-slate-500">{salesOpportunity.reason}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveVendor(vendor.symbol);
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Remove vendor"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {vendors.map((vendor) => {
          const contractReadiness = getContractReadiness(vendor);
          const weatherExposure = getWeatherExposure(vendor);
          const salesOpportunity = getSalesOpportunity(vendor);
          return (
            <div
              key={vendor.symbol}
              onClick={() => onVendorClick(vendor)}
              className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-slate-800">{vendor.name}</h3>
                  <p className="text-sm text-slate-500">{vendor.symbol}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveVendor(vendor.symbol);
                  }}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  title="Remove vendor"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Market Cap</p>
                  <p className="text-sm font-medium text-slate-800">{formatCurrency(vendor.market_cap)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">P/E Ratio</p>
                  <p className="text-sm font-medium text-slate-800">
                    {vendor.pe_ratio > 0 ? formatNumber(vendor.pe_ratio, 2) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">EBITDA</p>
                  <p className="text-sm font-medium text-slate-800">{formatCurrency(vendor.ebitda)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Contract Status</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="info" className={`text-xs ${contractReadiness.color}`}>
                      {contractReadiness.score}
                    </Badge>
                    <span className="text-xs text-slate-500">{contractReadiness.label}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Weather Risk</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="warning" className={`text-xs ${weatherExposure.color}`}>
                      {weatherExposure.level}
                    </Badge>
                    <span className="text-xs text-slate-500">{weatherExposure.sectors}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Sales Priority</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="error" className={`text-xs ${salesOpportunity.color}`}>
                      {salesOpportunity.priority}
                    </Badge>
                    <span className="text-xs text-slate-500">{salesOpportunity.reason}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}