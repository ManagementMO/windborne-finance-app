import { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import {
  BarChart3, Filter, Download, Eye, ArrowUpDown, ArrowUp, ArrowDown,
  Target, DollarSign, Percent, TrendingUp, Palette
} from 'lucide-react';
import { VendorOverview, ChartMetric } from '../../types/vendor';
import { formatChartMetricValue, getChartMetricLabel, formatCurrency, formatNumber } from '../../lib/utils';

interface InteractiveVendorChartProps {
  vendors: VendorOverview[];
  isLoading: boolean;
}

type SortOrder = 'asc' | 'desc' | 'alphabetical';
type MetricGroup = 'financial' | 'valuation' | 'performance' | 'all';
type ColorScheme = 'gradient' | 'category' | 'performance' | 'rainbow';

const metricGroups: { value: MetricGroup; label: string; metrics: ChartMetric[] }[] = [
  {
    value: 'financial',
    label: 'Financial Size',
    metrics: ['market_cap', 'ebitda']
  },
  {
    value: 'valuation',
    label: 'Valuation',
    metrics: ['pe_ratio']
  },
  {
    value: 'all',
    label: 'All Metrics',
    metrics: ['market_cap', 'pe_ratio', 'ebitda']
  }
];

const chartMetrics: { value: ChartMetric; label: string; group: MetricGroup; icon: React.ReactNode }[] = [
  { value: 'market_cap', label: 'Market Cap', group: 'financial', icon: <DollarSign className="h-4 w-4" /> },
  { value: 'pe_ratio', label: 'P/E Ratio', group: 'valuation', icon: <Percent className="h-4 w-4" /> },
  { value: 'ebitda', label: 'EBITDA', group: 'financial', icon: <TrendingUp className="h-4 w-4" /> },
];

const colorSchemes = {
  gradient: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#312e81'],
  category: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899'],
  performance: ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#059669'],
  rainbow: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff']
};

export function InteractiveVendorChart({ vendors, isLoading }: InteractiveVendorChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>('market_cap');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedGroup, setSelectedGroup] = useState<MetricGroup>('all');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('category');
  const [showInsights, setShowInsights] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [minValue, setMinValue] = useState<number>(0);
  const [maxValue, setMaxValue] = useState<number>(0);
  const [selectedVendors, setSelectedVendors] = useState<string[]>(
    vendors.map(v => v.symbol) // Initially select all vendors
  );

  // Update selected vendors when vendors prop changes
  useEffect(() => {
    const newVendorSymbols = vendors.map(v => v.symbol);
    setSelectedVendors(prev => {
      // Keep only selected vendors that still exist, and add new ones
      const existing = prev.filter(symbol => newVendorSymbols.includes(symbol));
      const newOnes = newVendorSymbols.filter(symbol => !prev.includes(symbol));
      return [...existing, ...newOnes];
    });
  }, [vendors]);

  // Filter metrics based on selected group
  const availableMetrics = useMemo(() => {
    if (selectedGroup === 'all') return chartMetrics;
    return chartMetrics.filter(metric => metric.group === selectedGroup);
  }, [selectedGroup]);

  // Calculate value ranges for filtering
  const valueRange = useMemo(() => {
    if (!vendors.length) return { min: 0, max: 0 };
    const values = vendors.map(v => v[selectedMetric]).filter(v => v > 0);
    if (values.length === 0) return { min: 0, max: 0 };
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }, [vendors, selectedMetric]);

  // Initialize filters when metric changes
  useMemo(() => {
    if (minValue === 0 && maxValue === 0) {
      setMinValue(valueRange.min);
      setMaxValue(valueRange.max);
    }
  }, [valueRange, minValue, maxValue]);

  // Process, filter, and sort chart data
  const chartData = useMemo(() => {
    let filteredVendors = vendors.filter(vendor => {
      // First filter by selected vendors
      if (!selectedVendors.includes(vendor.symbol)) return false;

      const value = vendor[selectedMetric];
      if (value <= 0) return false;
      if (minValue > 0 && value < minValue) return false;
      if (maxValue > 0 && value > maxValue) return false;
      return true;
    });

    const data = filteredVendors.map(vendor => ({
      symbol: vendor.symbol,
      name: (vendor.name && vendor.name.length > 15) ? vendor.symbol : vendor.name || vendor.symbol,
      fullName: vendor.name || vendor.symbol,
      value: vendor[selectedMetric],
      marketCap: vendor.market_cap,
      peRatio: vendor.pe_ratio,
      ebitda: vendor.ebitda,
    }));

    // Sort data
    return data.sort((a, b) => {
      if (sortOrder === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }
      const aVal = a.value || 0;
      const bVal = b.value || 0;
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [vendors, selectedMetric, sortOrder, minValue, maxValue, selectedVendors]);

  // Get colors for bars
  const getBarColor = (index: number) => {
    const colors = colorSchemes[colorScheme];
    return colors[index % colors.length];
  };

  // Calculate sales insights
  const insights = useMemo(() => {
    if (!chartData.length) return null;

    const totalValue = chartData.reduce((sum, item) => sum + (item.value || 0), 0);
    const avgValue = totalValue / chartData.length;
    const topPerformer = chartData[0]; // Already sorted
    const bottomPerformer = chartData[chartData.length - 1];

    // Calculate distribution metrics
    const aboveAverage = chartData.filter(item => (item.value || 0) > avgValue).length;
    const belowAverage = chartData.length - aboveAverage;

    // Calculate concentration (top performer's share)
    const concentration = totalValue > 0 ? ((topPerformer?.value || 0) / totalValue) * 100 : 0;

    return {
      totalValue,
      avgValue,
      topPerformer,
      bottomPerformer,
      aboveAverage,
      belowAverage,
      concentration,
      dataPoints: chartData.length
    };
  }, [chartData]);

  const exportData = () => {
    const csvContent = [
      ['Company', 'Symbol', 'Market Cap', 'P/E Ratio', 'EBITDA', `Selected Metric (${getChartMetricLabel(selectedMetric)})`],
      ...chartData.map(item => [
        item.fullName,
        item.symbol,
        formatCurrency(item.marketCap),
        item.peRatio > 0 ? formatNumber(item.peRatio, 2) : 'N/A',
        formatCurrency(item.ebitda),
        formatChartMetricValue(item.value, selectedMetric)
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vendor_bar_chart_${selectedMetric}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const barColor = getBarColor(chartData.findIndex(item => item.symbol === data.symbol));

      return (
        <div className="bg-white/95 backdrop-blur-sm p-5 border border-slate-200 rounded-xl shadow-xl min-w-[280px]">
          {/* Header with company info */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-4 h-4 rounded-full shadow-sm"
              style={{ backgroundColor: barColor }}
            />
            <div>
              <p className="font-bold text-slate-800 text-base leading-tight">{data.fullName}</p>
              <p className="text-sm text-slate-500 font-medium">{data.symbol}</p>
            </div>
          </div>

          {/* Key metrics grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Market Cap</p>
              <p className="text-sm font-bold text-slate-800">{formatCurrency(data.marketCap)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">P/E Ratio</p>
              <p className="text-sm font-bold text-slate-800">
                {data.peRatio > 0 ? formatNumber(data.peRatio, 2) : 'N/A'}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">EBITDA</p>
            <p className="text-sm font-bold text-slate-800">{formatCurrency(data.ebitda)}</p>
          </div>

          {/* Highlighted selected metric */}
          <div
            className="rounded-lg p-4 border-l-4"
            style={{
              backgroundColor: `${barColor}15`,
              borderLeftColor: barColor
            }}
          >
            <p className="text-sm font-bold mb-1" style={{ color: barColor }}>
              {getChartMetricLabel(selectedMetric)}
            </p>
            <p className="text-lg font-bold text-slate-800">
              {formatChartMetricValue(data.value, selectedMetric)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Interactive Vendor Comparison
          </CardTitle>
          <div className="flex gap-2">
            <Skeleton height="32px" width="100px" className="rounded" />
            <Skeleton height="32px" width="80px" className="rounded" />
            <Skeleton height="32px" width="90px" className="rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton height="400px" width="100%" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs max-w-2xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-blue-600">📊</span>
              <span className="font-semibold text-blue-800">Data Sources</span>
            </div>
            <div className="text-blue-700 leading-relaxed space-y-1">
              <p>
                <span className="font-medium">Real API Data:</span> Market cap, EBITDA, P/E ratios from Alpha Vantage
              </p>
              <p>
                <span className="font-medium">Proof-of-Concept:</span> WindBorne sales assessments, weather risk algorithms & analytics dashboard (time constraints - but using real API data where possible)
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Interactive Vendor Comparison
            <Badge variant="info" className="ml-2">
              {chartData.length} of {selectedVendors.length} Selected
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-1" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowInsights(!showInsights)}>
              <Eye className="h-4 w-4 mr-1" />
              Insights
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Metric Group</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value as MetricGroup)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                >
                  {metricGroups.map(group => (
                    <option key={group.value} value={group.value}>{group.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Metric</label>
                <select
                  value={selectedMetric}
                  onChange={(e) => {
                    setSelectedMetric(e.target.value as ChartMetric);
                    setMinValue(0);
                    setMaxValue(0);
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                >
                  {availableMetrics.map(metric => (
                    <option key={metric.value} value={metric.value}>{metric.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3" />
                  Sort Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                >
                  <option value="desc">
                    <ArrowDown className="h-3 w-3 inline mr-1" />
                    Highest to Lowest
                  </option>
                  <option value="asc">
                    <ArrowUp className="h-3 w-3 inline mr-1" />
                    Lowest to Highest
                  </option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block flex items-center gap-1">
                  <Palette className="h-3 w-3" />
                  Color Scheme
                </label>
                <select
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value as ColorScheme)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                >
                  <option value="category">Category Colors</option>
                  <option value="gradient">Blue Gradient</option>
                  <option value="performance">Performance Colors</option>
                  <option value="rainbow">Rainbow Colors</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Value Range Filter
                </label>
                <div className="space-y-1">
                  <input
                    type="number"
                    placeholder="Min value"
                    value={minValue || ''}
                    onChange={(e) => setMinValue(Number(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Max value"
                    value={maxValue || ''}
                    onChange={(e) => setMaxValue(Number(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Company Selection */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-700">Company Selection</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedVendors(vendors.map(v => v.symbol))}
                    className="text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedVendors([])}
                    className="text-xs"
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {vendors.map(vendor => (
                  <label
                    key={vendor.symbol}
                    className="flex items-center gap-2 p-2 rounded border hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedVendors.includes(vendor.symbol)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVendors(prev => [...prev, vendor.symbol]);
                        } else {
                          setSelectedVendors(prev => prev.filter(s => s !== vendor.symbol));
                        }
                      }}
                      className="rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">
                        {vendor.symbol}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {vendor.name.length > 20 ? vendor.name.substring(0, 20) + '...' : vendor.name}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {selectedVendors.length} of {vendors.length} companies selected
              </div>
            </div>

            {/* Quick Reset */}
            <div className="flex justify-between items-center">
              <div className="text-xs text-slate-500">
                Range: {formatChartMetricValue(valueRange.min, selectedMetric)} - {formatChartMetricValue(valueRange.max, selectedMetric)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMinValue(0);
                  setMaxValue(0);
                  setSortOrder('desc');
                  setSelectedGroup('all');
                  setSelectedVendors(vendors.map(v => v.symbol));
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Sales Insights Panel */}
        {showInsights && insights && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Sales Analytics Dashboard
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {formatChartMetricValue(insights.totalValue, selectedMetric)}
                </p>
                <p className="text-xs text-blue-700">Total {getChartMetricLabel(selectedMetric)}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{insights.topPerformer?.symbol}</p>
                <p className="text-xs text-green-700">
                  Top Performer ({formatChartMetricValue(insights.topPerformer?.value, selectedMetric)})
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{formatNumber(insights.concentration, 1)}%</p>
                <p className="text-xs text-amber-700">Market Concentration</p>
              </div>
              <div className="text-center">
                <div className="flex gap-2 justify-center">
                  <Badge variant="success">{insights.aboveAverage} Above Avg</Badge>
                  <Badge variant="warning">{insights.belowAverage} Below Avg</Badge>
                </div>
                <p className="text-xs text-slate-600 mt-1">Performance Distribution</p>
              </div>
            </div>
          </div>
        )}

        {/* Chart Container */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 shadow-sm p-6">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={420}>
              <BarChart
                data={chartData}
                margin={{
                  top: 30,
                  right: 40,
                  left: 30,
                  bottom: 70,
                }}
              >
                {/* Enhanced Grid */}
                <CartesianGrid
                  strokeDasharray="2 2"
                  stroke="#e2e8f0"
                  strokeOpacity={0.6}
                  horizontal={true}
                  vertical={false}
                />

                {/* Gradient Definitions */}
                <defs>
                  {chartData.map((_, index) => (
                    <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={getBarColor(index)} stopOpacity={1} />
                      <stop offset="100%" stopColor={getBarColor(index)} stopOpacity={0.7} />
                    </linearGradient>
                  ))}
                </defs>

                {/* Enhanced X-Axis */}
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 13, fill: '#475569', fontWeight: 500 }}
                  axisLine={{ stroke: '#cbd5e1', strokeWidth: 1.5 }}
                  tickLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                  angle={-35}
                  textAnchor="end"
                  height={90}
                  interval={0}
                />

                {/* Enhanced Y-Axis */}
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                  axisLine={{ stroke: '#cbd5e1', strokeWidth: 1.5 }}
                  tickLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                  width={80}
                  tickFormatter={(value) => {
                    if (selectedMetric === 'market_cap' || selectedMetric === 'ebitda') {
                      if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
                      if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
                      if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
                      return `$${value}`;
                    }
                    return value.toString();
                  }}
                />

                {/* Custom Tooltip - No Background Hover */}
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={false}
                />

                {/* Enhanced Bars with Gradients */}
                <Bar
                  dataKey="value"
                  radius={[6, 6, 0, 0]}
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth={2}
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#gradient-${index})`}
                      className="hover:opacity-90 transition-opacity duration-200"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-slate-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium mb-2">No data matches your filters</p>
                <p className="text-sm mb-4">Try adjusting your filter criteria to see results</p>
                <Button
                  onClick={() => {
                    setMinValue(0);
                    setMaxValue(0);
                    setSelectedVendors(vendors.map(v => v.symbol));
                    setSelectedGroup('all');
                  }}
                  variant="outline"
                  size="sm"
                >
                  Reset All Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Color Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {chartData.slice(0, 8).map((item, index) => (
            <div key={item.symbol} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: getBarColor(index) }}
              />
              <span className="text-xs text-slate-600">{item.symbol}</span>
            </div>
          ))}
          {chartData.length > 8 && (
            <span className="text-xs text-slate-500">+{chartData.length - 8} more</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}