import { useState, useCallback } from 'react';
import { Filter, X, Search, Sliders } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface FilterState {
  dateRange: {
    start: string;
    end: string;
    preset: string;
  };
  metrics: string[];
  sectors: string[];
  riskLevels: string[];
  marketCapRange: {
    min: number;
    max: number;
  };
  peRatioRange: {
    min: number;
    max: number;
  };
  searchQuery: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  availableMetrics?: string[];
  availableSectors?: string[];
}

const defaultMetrics = ['Market Cap', 'Revenue', 'P/E Ratio', 'EBITDA', 'Weather Impact'];
const defaultSectors = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Manufacturing'];
const riskLevels = ['Low', 'Medium', 'High'];
const datePresets = [
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'last_90_days', label: 'Last 90 days' },
  { value: 'last_year', label: 'Last year' },
  { value: 'all_time', label: 'All time' },
];

export function FilterPanel({
  filters,
  onFiltersChange,
  onReset,
  availableMetrics = defaultMetrics,
  availableSectors = defaultSectors,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  }, [filters, onFiltersChange]);

  const toggleArrayFilter = useCallback((
    key: 'metrics' | 'sectors' | 'riskLevels',
    value: string
  ) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  }, [filters, updateFilter]);

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.dateRange.preset !== 'all_time') count++;
    if (filters.metrics.length < availableMetrics.length) count++;
    if (filters.sectors.length < availableSectors.length) count++;
    if (filters.riskLevels.length < riskLevels.length) count++;
    if (filters.marketCapRange.min > 0 || filters.marketCapRange.max < 1000000000000) count++;
    if (filters.peRatioRange.min > 0 || filters.peRatioRange.max < 100) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-600" />
            <CardTitle className="text-base">Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="primary" className="h-5 px-2 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              <Sliders className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">Search</label>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={e => updateFilter('searchQuery', e.target.value)}
              placeholder="Search companies..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">Date Range</label>
          <select
            value={filters.dateRange.preset}
            onChange={e => updateFilter('dateRange', {
              ...filters.dateRange,
              preset: e.target.value
            })}
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {datePresets.map(preset => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        {/* Metrics */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">Metrics</label>
          <div className="space-y-2">
            {availableMetrics.map(metric => (
              <label key={metric} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={filters.metrics.includes(metric)}
                  onChange={() => toggleArrayFilter('metrics', metric)}
                  className="mr-2 rounded"
                />
                {metric}
              </label>
            ))}
          </div>
        </div>

        {/* Sectors */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">Sectors</label>
          <div className="space-y-2">
            {availableSectors.map(sector => (
              <label key={sector} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={filters.sectors.includes(sector)}
                  onChange={() => toggleArrayFilter('sectors', sector)}
                  className="mr-2 rounded"
                />
                {sector}
              </label>
            ))}
          </div>
        </div>

        {/* Risk Levels */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">Risk Levels</label>
          <div className="space-y-2">
            {riskLevels.map(level => (
              <label key={level} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={filters.riskLevels.includes(level)}
                  onChange={() => toggleArrayFilter('riskLevels', level)}
                  className="mr-2 rounded"
                />
                {level} Risk
              </label>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <>
            {/* Market Cap Range */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Market Cap Range (Billions)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.marketCapRange.min / 1000000000}
                  onChange={e => updateFilter('marketCapRange', {
                    ...filters.marketCapRange,
                    min: parseFloat(e.target.value) * 1000000000 || 0
                  })}
                  className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.marketCapRange.max === 1000000000000 ? '' : filters.marketCapRange.max / 1000000000}
                  onChange={e => updateFilter('marketCapRange', {
                    ...filters.marketCapRange,
                    max: parseFloat(e.target.value) * 1000000000 || 1000000000000
                  })}
                  className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* P/E Ratio Range */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">P/E Ratio Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.peRatioRange.min || ''}
                  onChange={e => updateFilter('peRatioRange', {
                    ...filters.peRatioRange,
                    min: parseFloat(e.target.value) || 0
                  })}
                  className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.peRatioRange.max === 100 ? '' : filters.peRatioRange.max}
                  onChange={e => updateFilter('peRatioRange', {
                    ...filters.peRatioRange,
                    max: parseFloat(e.target.value) || 100
                  })}
                  className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        )}

        {/* Reset Button */}
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="w-full"
          >
            Reset All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Default filter state
export const defaultFilterState: FilterState = {
  dateRange: {
    start: '',
    end: '',
    preset: 'all_time',
  },
  metrics: defaultMetrics,
  sectors: defaultSectors,
  riskLevels: riskLevels,
  marketCapRange: {
    min: 0,
    max: 1000000000000, // 1 trillion
  },
  peRatioRange: {
    min: 0,
    max: 100,
  },
  searchQuery: '',
};