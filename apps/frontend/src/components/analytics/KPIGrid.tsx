import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Zap } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
// import { Badge } from '../ui/Badge';
import { formatCurrency, formatNumber } from '../../lib/utils';

interface KPIData {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'currency' | 'number' | 'percentage' | 'custom';
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  subtext?: string;
}

interface KPIGridProps {
  kpis: KPIData[];
  cols?: number;
}

export function KPIGrid({ kpis, cols = 4 }: KPIGridProps) {
  const formatValue = (value: number | string, format?: string) => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return `${formatNumber(value, 1)}%`;
      case 'number':
        return formatNumber(value);
      default:
        return value.toString();
    }
  };

  const getChangeIcon = (changeType?: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  const getChangeColor = (changeType?: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  const getCardColor = (color?: string) => {
    switch (color) {
      case 'blue':
        return 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white';
      case 'green':
        return 'border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white';
      case 'red':
        return 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white';
      case 'yellow':
        return 'border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-white';
      case 'purple':
        return 'border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white';
      default:
        return 'border-l-4 border-l-slate-300 bg-white';
    }
  };

  const getGridCols = (cols: number) => {
    switch (cols) {
      case 1: return 'lg:grid-cols-1';
      case 2: return 'lg:grid-cols-2';
      case 3: return 'lg:grid-cols-3';
      case 4: return 'lg:grid-cols-4';
      case 5: return 'lg:grid-cols-5';
      case 6: return 'lg:grid-cols-6';
      default: return 'lg:grid-cols-4';
    }
  };

  return (
    <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 ${getGridCols(cols)}`}>
      {kpis.map((kpi) => (
        <Card key={kpi.id} className={`hover:shadow-md transition-shadow ${getCardColor(kpi.color)}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {kpi.icon}
                <span className="text-sm font-medium text-slate-600">{kpi.title}</span>
              </div>
              {kpi.change !== undefined && (
                <div className={`flex items-center space-x-1 ${getChangeColor(kpi.changeType)}`}>
                  {getChangeIcon(kpi.changeType)}
                  <span className="text-xs font-medium">
                    {kpi.change > 0 ? '+' : ''}{formatNumber(kpi.change, 1)}%
                  </span>
                </div>
              )}
            </div>
            <div className="mb-1">
              <span className="text-2xl font-bold text-slate-800">
                {formatValue(kpi.value, kpi.format)}
              </span>
            </div>
            {kpi.subtext && (
              <p className="text-xs text-slate-500">{kpi.subtext}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Default KPI configurations
export const defaultKPIs: KPIData[] = [
  {
    id: 'total-market-cap',
    title: 'Total Market Cap',
    value: 0,
    format: 'currency',
    icon: <DollarSign className="h-4 w-4 text-blue-600" />,
    color: 'blue',
    subtext: 'Combined market capitalization'
  },
  {
    id: 'avg-pe-ratio',
    title: 'Avg P/E Ratio',
    value: 0,
    format: 'number',
    icon: <Target className="h-4 w-4 text-green-600" />,
    color: 'green',
    subtext: 'Portfolio average'
  },
  {
    id: 'weather-risk-score',
    title: 'Weather Risk Score',
    value: 0,
    format: 'number',
    icon: <Zap className="h-4 w-4 text-yellow-600" />,
    color: 'yellow',
    subtext: 'Composite risk assessment'
  },
  {
    id: 'companies-tracked',
    title: 'Companies Tracked',
    value: 0,
    format: 'number',
    icon: <Users className="h-4 w-4 text-purple-600" />,
    color: 'purple',
    subtext: 'Active vendors'
  }
];