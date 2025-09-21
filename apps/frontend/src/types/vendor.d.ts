export interface VendorOverview {
  symbol: string;
  name: string;
  market_cap: number;
  pe_ratio: number;
  ebitda: number;
}

export interface IncomeReport {
  fiscal_date_ending: string;
  total_revenue: number;
  net_income: number;
}

export interface VendorIncomeStatement {
  symbol: string;
  annual_reports: IncomeReport[];
}

export interface TimeSeriesData {
  date: string;
  close: number;
}

export interface VendorDailySeries {
  symbol: string;
  time_series: TimeSeriesData[];
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  market_open: string;
  market_close: string;
  timezone: string;
  currency: string;
  match_score: number;
}

export interface VendorSearchResponse {
  results: SearchResult[];
}

export type ChartMetric = 'market_cap' | 'pe_ratio' | 'ebitda';

export interface HealthFlag {
  type: 'warning' | 'info' | 'error';
  label: string;
  condition: boolean;
}