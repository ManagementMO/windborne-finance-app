import { useState, useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Target } from 'lucide-react';
import { VendorOverview } from '../../types/vendor';
import { formatCurrency, formatNumber } from '../../lib/utils';

type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'scatter' | 'radar' | 'composed';

interface MultiMetricChartProps {
  data: VendorOverview[];
  title?: string;
  defaultChartType?: ChartType;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

export function MultiMetricChart({
  data,
  title = "Multi-Metric Analysis",
  defaultChartType = 'composed'
}: MultiMetricChartProps) {
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['market_cap', 'pe_ratio']);

  const metrics = [
    { key: 'market_cap', label: 'Market Cap', color: '#2563eb', format: 'currency' },
    { key: 'pe_ratio', label: 'P/E Ratio', color: '#10b981', format: 'number' },
    { key: 'ebitda', label: 'EBITDA', color: '#f59e0b', format: 'currency' },
  ];

  const chartData = useMemo(() => {
    return data.map((vendor, index) => ({
      name: vendor.symbol,
      fullName: vendor.name,
      market_cap: vendor.market_cap / 1000000, // Convert to millions for better display
      pe_ratio: vendor.pe_ratio,
      ebitda: vendor.ebitda / 1000000, // Convert to millions
      risk_score: Math.floor(Math.random() * 100), // Simulated risk score
      weather_impact: Math.floor(Math.random() * 50), // Simulated weather impact
      index,
    }));
  }, [data]);

  // Prepare data for different chart types
  const pieData = useMemo(() => {
    const totalMarketCap = chartData.reduce((sum, item) => sum + item.market_cap, 0);
    return chartData.map(item => ({
      name: item.name,
      value: item.market_cap,
      percentage: ((item.market_cap / totalMarketCap) * 100).toFixed(1),
    }));
  }, [chartData]);

  const radarData = useMemo(() => {
    return chartData.map(item => ({
      company: item.name,
      'Market Cap': Math.min((item.market_cap / 100000), 100), // Normalized to 0-100
      'P/E Ratio': Math.min(item.pe_ratio * 2, 100), // Normalized
      'EBITDA': Math.min((item.ebitda / 50000), 100), // Normalized
      'Risk Score': item.risk_score,
      'Weather Impact': item.weather_impact,
    }));
  }, [chartData]);

  const toggleMetric = (metricKey: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metricKey)
        ? prev.filter(m => m !== metricKey)
        : [...prev, metricKey]
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-800">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.name}: {item.value !== undefined ? formatNumber(item.value, 2) : 'N/A'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {selectedMetrics.map((metric, index) => {
                const metricConfig = metrics.find(m => m.key === metric);
                return (
                  <Bar
                    key={metric}
                    dataKey={metric}
                    fill={metricConfig?.color || COLORS[index]}
                    name={metricConfig?.label}
                  />
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {selectedMetrics.map((metric, index) => {
                const metricConfig = metrics.find(m => m.key === metric);
                return (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={metricConfig?.color || COLORS[index]}
                    name={metricConfig?.label}
                    strokeWidth={2}
                  />
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {selectedMetrics.map((metric, index) => {
                const metricConfig = metrics.find(m => m.key === metric);
                return (
                  <Area
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    fill={metricConfig?.color || COLORS[index]}
                    stroke={metricConfig?.color || COLORS[index]}
                    name={metricConfig?.label}
                    fillOpacity={0.3}
                  />
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [formatCurrency(value * 1000000), 'Market Cap']}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="market_cap" name="Market Cap" tick={{ fontSize: 12 }} />
              <YAxis dataKey="pe_ratio" name="P/E Ratio" tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <Scatter name="Companies" data={chartData} fill="#2563eb" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="company" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fontSize: 10 }} />
              {radarData.map((item, index) => (
                <Radar
                  key={item.company}
                  name={item.company}
                  dataKey={item.company}
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.1}
                />
              ))}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'composed':
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="market_cap" fill="#2563eb" name="Market Cap (M)" />
              <Bar yAxisId="left" dataKey="ebitda" fill="#10b981" name="EBITDA (M)" />
              <Line yAxisId="right" type="monotone" dataKey="pe_ratio" stroke="#f59e0b" strokeWidth={3} name="P/E Ratio" />
            </ComposedChart>
          </ResponsiveContainer>
        );
    }
  };

  const chartTypeButtons = [
    { type: 'composed', icon: BarChart3, label: 'Combined', shortLabel: 'Comb' },
    { type: 'bar', icon: BarChart3, label: 'Bar', shortLabel: 'Bar' },
    { type: 'line', icon: TrendingUp, label: 'Line', shortLabel: 'Line' },
    { type: 'pie', icon: PieChartIcon, label: 'Pie', shortLabel: 'Pie' },
    { type: 'scatter', icon: Target, label: 'Scatter', shortLabel: 'Scat' },
    { type: 'radar', icon: Target, label: 'Radar', shortLabel: 'Rad' },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4">
          <CardTitle className="flex-shrink-0">{title}</CardTitle>
          <div className="flex flex-wrap gap-1 sm:gap-2 sm:ml-4">
            {chartTypeButtons.map(({ type, icon: Icon, label, shortLabel }) => (
              <Button
                key={type}
                variant={chartType === type ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setChartType(type as ChartType)}
                className="h-8 text-xs sm:text-sm min-w-0 px-2 sm:px-3"
              >
                <Icon className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="hidden md:inline">{label}</span>
                <span className="md:hidden">{shortLabel}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Metric Selector (for applicable chart types) */}
        {['bar', 'line', 'area'].includes(chartType) && (
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0 mt-3">
            <span className="text-sm font-medium text-slate-600 flex-shrink-0">Metrics:</span>
            <div className="flex flex-wrap gap-2">
              {metrics.map(metric => (
                <Badge
                  key={metric.key}
                  variant={selectedMetrics.includes(metric.key) ? 'primary' : 'default'}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleMetric(metric.key)}
                >
                  {metric.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {data.length > 0 ? renderChart() : (
          <div className="h-[400px] flex items-center justify-center text-slate-500">
            No data available for visualization
          </div>
        )}
      </CardContent>
    </Card>
  );
}