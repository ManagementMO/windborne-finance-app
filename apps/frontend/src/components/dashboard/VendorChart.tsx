import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { VendorOverview, ChartMetric } from '../../types/vendor';
import { formatChartMetricValue, getChartMetricLabel } from '../../lib/utils';

interface VendorChartProps {
  vendors: VendorOverview[];
  isLoading: boolean;
}

const chartMetrics: { value: ChartMetric; label: string }[] = [
  { value: 'market_cap', label: 'Market Cap' },
  { value: 'pe_ratio', label: 'P/E Ratio' },
  { value: 'ebitda', label: 'EBITDA' },
];

export function VendorChart({ vendors, isLoading }: VendorChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>('market_cap');

  const chartData = (vendors || []).map(vendor => ({
    symbol: vendor.symbol,
    name: (vendor.name && vendor.name.length > 15) ? vendor.symbol : vendor.name || vendor.symbol,
    value: vendor[selectedMetric],
    fullName: vendor.name || vendor.symbol,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-800">{data.fullName}</p>
          <p className="text-sm text-slate-600">{data.symbol}</p>
          <p className="text-sm text-blue-600">
            {getChartMetricLabel(selectedMetric)}: {formatChartMetricValue(data.value, selectedMetric)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendor Comparison</CardTitle>
          <div className="flex gap-2">
            {chartMetrics.map((metric) => (
              <Skeleton key={metric.value} height="32px" width="80px" className="rounded" />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton height="300px" width="100%" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Comparison</CardTitle>
        <div className="flex flex-wrap gap-2">
          {chartMetrics.map((metric) => (
            <Button
              key={metric.value}
              variant={selectedMetric === metric.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedMetric(metric.value)}
            >
              {metric.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
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
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
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
                    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
                    return `$${value}`;
                  }
                  return value.toString();
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill="#2563eb" 
                radius={[4, 4, 0, 0]}
                stroke="#1d4ed8"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-slate-500">
            No data available for comparison
          </div>
        )}
      </CardContent>
    </Card>
  );
}