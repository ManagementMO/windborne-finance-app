import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { VendorOverview, HealthFlag } from '../types/vendor';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  if (value === 0) return '$0';
  
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(1)}T`;
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(1)}K`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, decimals: number = 2): string {
  if (value === 0) return '0';
  return value.toFixed(decimals);
}

export function getHealthFlags(vendor: VendorOverview): HealthFlag[] {
  const flags: HealthFlag[] = [];
  
  if (vendor.pe_ratio > 40) {
    flags.push({
      type: 'warning',
      label: 'High P/E',
      condition: true
    });
  }
  
  if (vendor.pe_ratio < 5 && vendor.pe_ratio > 0) {
    flags.push({
      type: 'info',
      label: 'Low P/E',
      condition: true
    });
  }
  
  if (vendor.ebitda < 0) {
    flags.push({
      type: 'error',
      label: 'Negative EBITDA',
      condition: true
    });
  }
  
  return flags;
}

export function formatChartMetricValue(value: number, metric: string): string {
  switch (metric) {
    case 'market_cap':
    case 'ebitda':
      return formatCurrency(value);
    case 'pe_ratio':
      return formatNumber(value, 2);
    default:
      return value.toString();
  }
}

export function getChartMetricLabel(metric: string): string {
  switch (metric) {
    case 'market_cap':
      return 'Market Cap';
    case 'pe_ratio':
      return 'P/E Ratio';
    case 'ebitda':
      return 'EBITDA';
    default:
      return metric;
  }
}