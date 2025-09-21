import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { VendorOverview, HealthFlag } from '../types/vendor';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  if (value === 0) return '$0';
  
  // For very large numbers, use abbreviated format with proper comma formatting
  if (value >= 1e12) {
    return `$${(value / 1e12).toLocaleString('en-US', { maximumFractionDigits: 1 })}T`;
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toLocaleString('en-US', { maximumFractionDigits: 1 })}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toLocaleString('en-US', { maximumFractionDigits: 1 })}K`;
  }
  
  // For smaller numbers, show full value with commas
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, decimals: number = 2): string {
  if (value === 0) return '0';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function getHealthFlags(vendor: VendorOverview): HealthFlag[] {
  const flags: HealthFlag[] = [];
  
  // P/E Ratio Analysis
  if (vendor.pe_ratio > 40) {
    flags.push({
      type: 'warning',
      label: '🟡 High P/E',
      condition: true
    });
  } else if (vendor.pe_ratio < 5 && vendor.pe_ratio > 0) {
    flags.push({
      type: 'info',
      label: '🟢 Low P/E',
      condition: true
    });
  }
  
  // EBITDA Analysis
  if (vendor.ebitda < 0) {
    flags.push({
      type: 'error',
      label: '🔴 Unprofitable',
      condition: true
    });
  } else if (vendor.ebitda > 0 && vendor.ebitda < 500000000) { // Less than $500M EBITDA
    flags.push({
      type: 'warning',
      label: '🟡 Low EBITDA',
      condition: true
    });
  }
  
  // Market Cap Analysis
  if (vendor.market_cap > 100000000000) { // > $100B
    flags.push({
      type: 'info',
      label: '🔷 Large Cap',
      condition: true
    });
  } else if (vendor.market_cap < 2000000000) { // < $2B
    flags.push({
      type: 'warning',
      label: '🟡 Small Cap',
      condition: true
    });
  }
  
  // P/E Ratio == 0 typically means no earnings or N/A
  if (vendor.pe_ratio === 0) {
    flags.push({
      type: 'warning',
      label: '⚪ No P/E Data',
      condition: true
    });
  }
  
  // Strong Financial Health (good P/E, positive EBITDA, decent size)
  if (vendor.pe_ratio > 5 && vendor.pe_ratio < 25 && vendor.ebitda > 1000000000 && vendor.market_cap > 5000000000) {
    flags.push({
      type: 'info',
      label: '💪 Strong Metrics',
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