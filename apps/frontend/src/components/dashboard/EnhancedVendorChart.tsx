import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, PieChart, Pie, Cell,
  ComposedChart, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import {
  BarChart3, LineChart as LineChartIcon, Activity as ScatterIcon,
  PieChart as PieIcon, TrendingUp, Filter, Download,
  Target, DollarSign, Percent, Eye
} from 'lucide-react';
import { VendorOverview, ChartMetric } from '../../types/vendor';
import { formatChartMetricValue, getChartMetricLabel, formatCurrency, formatNumber } from '../../lib/utils';

interface EnhancedVendorChartProps {
  vendors: VendorOverview[];
  isLoading: boolean;
}

type ChartType = 'bar' | 'line' | 'scatter' | 'pie' | 'composed' | 'area' | 'radar';
type SortOrder = 'asc' | 'desc' | 'alphabetical';
type MetricGroup = 'financial' | 'valuation' | 'performance' | 'all';

const chartTypes: { value: ChartType; label: string; icon: React.ReactNode }[] = [
  { value: 'bar', label: 'Bar Chart', icon: <BarChart3 className="h-4 w-4" /> },
  { value: 'line', label: 'Line Chart', icon: <LineChartIcon className="h-4 w-4" /> },
  { value: 'scatter', label: 'Scatter Plot', icon: <ScatterIcon className="h-4 w-4" /> },
  { value: 'pie', label: 'Pie Chart', icon: <PieIcon className="h-4 w-4" /> },
  { value: 'composed', label: 'Combined', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'area', label: 'Area Chart', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'radar', label: 'Radar Chart', icon: <Target className="h-4 w-4" /> }
];

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

const pieColors = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea', '#c2410c', '#0891b2'];

export function EnhancedVendorChart({ vendors, isLoading }: EnhancedVendorChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>('market_cap');
  const [secondaryMetric, setSecondaryMetric] = useState<ChartMetric>('pe_ratio');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedGroup, setSelectedGroup] = useState<MetricGroup>('all');
  const [showInsights, setShowInsights] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter metrics based on selected group
  const availableMetrics = useMemo(() => {
    if (selectedGroup === 'all') return chartMetrics;
    return chartMetrics.filter(metric => metric.group === selectedGroup);
  }, [selectedGroup]);

  // Process and sort chart data
  const chartData = useMemo(() => {
    const data = (vendors || []).map(vendor => ({
      symbol: vendor.symbol,
      name: (vendor.name && vendor.name.length > 15) ? vendor.symbol : vendor.name || vendor.symbol,
      fullName: vendor.name || vendor.symbol,
      market_cap: vendor.market_cap,
      pe_ratio: vendor.pe_ratio,
      ebitda: vendor.ebitda,
      primary: vendor[selectedMetric],
      secondary: vendor[secondaryMetric],
    }));

    // Sort data
    return data.sort((a, b) => {
      if (sortOrder === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }
      const aVal = a.primary || 0;
      const bVal = b.primary || 0;
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [vendors, selectedMetric, secondaryMetric, sortOrder]);

  // Calculate sales insights
  const insights = useMemo(() => {
    if (!vendors.length) return null;

    const totalMarketCap = vendors.reduce((sum, v) => sum + v.market_cap, 0);
    const avgPE = vendors.filter(v => v.pe_ratio > 0).reduce((sum, v, _, arr) => sum + v.pe_ratio / arr.length, 0);
    const topPerformer = vendors.reduce((max, v) => v[selectedMetric] > max[selectedMetric] ? v : max);
    const marketLeader = vendors.reduce((max, v) => v.market_cap > max.market_cap ? v : max);

    // Growth potential analysis
    const highGrowthVendors = vendors.filter(v => v.pe_ratio > avgPE && v.pe_ratio > 0).length;
    const valueVendors = vendors.filter(v => v.pe_ratio > 0 && v.pe_ratio < avgPE).length;

    return {
      totalMarketCap,
      avgPE: avgPE || 0,
      topPerformer,
      marketLeader,
      highGrowthCount: highGrowthVendors,
      valueCount: valueVendors,
      concentration: (marketLeader.market_cap / totalMarketCap) * 100
    };
  }, [vendors, selectedMetric]);

  const exportData = () => {
    const csvContent = [
      ['Company', 'Symbol', 'Market Cap', 'P/E Ratio', 'EBITDA'],
      ...chartData.map(item => [
        item.fullName,
        item.symbol,
        formatCurrency(item.market_cap),
        item.pe_ratio > 0 ? formatNumber(item.pe_ratio, 2) : 'N/A',
        formatCurrency(item.ebitda)
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vendor_comparison_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-800 mb-2">{data.fullName}</p>
          <p className="text-xs text-slate-500 mb-2">{data.symbol}</p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">
              {getChartMetricLabel(selectedMetric)}: {formatChartMetricValue(data.primary, selectedMetric)}
            </p>
            {chartType === 'scatter' || chartType === 'composed' ? (
              <p className="text-sm text-green-600">
                {getChartMetricLabel(secondaryMetric)}: {formatChartMetricValue(data.secondary, secondaryMetric)}
              </p>
            ) : null}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="h-[400px] flex items-center justify-center text-slate-500">
          No data available for comparison
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
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
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="primary"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                stroke="#1d4ed8"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#64748b' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="primary"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                dataKey="primary"
                name={getChartMetricLabel(selectedMetric)}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis
                type="number"
                dataKey="secondary"
                name={getChartMetricLabel(secondaryMetric)}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={<CustomTooltip />}
              />
              <Scatter dataKey="secondary" fill="#2563eb" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="primary"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#64748b' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="primary"
                stroke="#2563eb"
                fill="url(#colorGradient)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#64748b' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="left" dataKey="primary" fill="#2563eb" />
              <Line yAxisId="right" type="monotone" dataKey="secondary" stroke="#dc2626" strokeWidth={3} />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'radar':
        const radarData = chartData.map(item => ({
          ...item,
          marketCapNorm: Math.min(100, (item.market_cap / 1e12) * 100),
          peRatioNorm: Math.min(100, (item.pe_ratio / 50) * 100),
          ebitdaNorm: Math.min(100, (item.ebitda / 1e11) * 100),
        }));

        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData[0] ? [radarData[0]] : []}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Market Cap"
                dataKey="marketCapNorm"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.6}
              />
              <Radar
                name="P/E Ratio"
                dataKey="peRatioNorm"
                stroke="#dc2626"
                fill="#dc2626"
                fillOpacity={0.6}
              />
              <Radar
                name="EBITDA"
                dataKey="ebitdaNorm"
                stroke="#16a34a"
                fill="#16a34a"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Vendor Comparison</CardTitle>
          <div className="flex gap-2">
            {chartTypes.slice(0, 4).map((_, index) => (
              <Skeleton key={index} height="32px" width="100px" className="rounded" />
            ))}
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Enhanced Vendor Comparison
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

        {/* Chart Type Selection */}
        <div className="flex flex-wrap gap-2 mt-4">
          {chartTypes.map((type) => (
            <Button
              key={type.value}
              variant={chartType === type.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setChartType(type.value)}
              className="flex items-center gap-1"
            >
              {type.icon}
              {type.label}
            </Button>
          ))}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <label className="text-sm font-medium text-slate-700 mb-2 block">Primary Metric</label>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value as ChartMetric)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                >
                  {availableMetrics.map(metric => (
                    <option key={metric.value} value={metric.value}>{metric.label}</option>
                  ))}
                </select>
              </div>

              {(chartType === 'scatter' || chartType === 'composed') && (
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Secondary Metric</label>
                  <select
                    value={secondaryMetric}
                    onChange={(e) => setSecondaryMetric(e.target.value as ChartMetric)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                  >
                    {availableMetrics.filter(m => m.value !== selectedMetric).map(metric => (
                      <option key={metric.value} value={metric.value}>{metric.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Sort Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                >
                  <option value="desc">Highest to Lowest</option>
                  <option value="asc">Lowest to Highest</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Sales Insights Panel */}
        {showInsights && insights && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Sales Intelligence Insights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(insights.totalMarketCap)}</p>
                <p className="text-xs text-blue-700">Total Portfolio Value</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{insights.topPerformer.symbol}</p>
                <p className="text-xs text-green-700">Top {getChartMetricLabel(selectedMetric)} Performer</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{formatNumber(insights.concentration, 1)}%</p>
                <p className="text-xs text-amber-700">Market Concentration ({insights.marketLeader.symbol})</p>
              </div>
              <div className="text-center">
                <div className="flex gap-2 justify-center">
                  <Badge variant="info">{insights.highGrowthCount} Growth</Badge>
                  <Badge variant="success">{insights.valueCount} Value</Badge>
                </div>
                <p className="text-xs text-slate-600 mt-1">Investment Styles</p>
              </div>
            </div>
          </div>
        )}

        {/* Chart Container */}
        <div className="bg-white rounded-lg border border-slate-200">
          {renderChart()}
        </div>

        {/* Chart Legend for Composed/Scatter charts */}
        {(chartType === 'scatter' || chartType === 'composed') && (
          <div className="mt-4 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span className="text-sm text-slate-600">{getChartMetricLabel(selectedMetric)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span className="text-sm text-slate-600">{getChartMetricLabel(secondaryMetric)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}