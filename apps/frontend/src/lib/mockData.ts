import type { VendorOverview, VendorIncomeStatement, VendorDailySeries, VendorSearchResponse } from '../types/vendor';

export const mockVendorOverviews: VendorOverview[] = [
  {
    symbol: "TEL",
    name: "TE Connectivity Ltd",
    market_cap: 43500000000,
    pe_ratio: 18.2,
    ebitda: 2800000000
  },
  {
    symbol: "ST",
    name: "STMicroelectronics N.V.",
    market_cap: 38200000000,
    pe_ratio: 15.7,
    ebitda: 3200000000
  },
  {
    symbol: "DD",
    name: "DuPont de Nemours Inc",
    market_cap: 35600000000,
    pe_ratio: 14.9,
    ebitda: 4100000000
  },
  {
    symbol: "CE",
    name: "Celanese Corporation",
    market_cap: 12800000000,
    pe_ratio: 11.3,
    ebitda: 1900000000
  },
  {
    symbol: "LYB",
    name: "LyondellBasell Industries N.V.",
    market_cap: 28400000000,
    pe_ratio: 9.8,
    ebitda: 5200000000
  }
];

export const mockIncomeStatement = (symbol: string): VendorIncomeStatement => ({
  symbol,
  annual_reports: [
    {
      fiscal_date_ending: "2023-12-31",
      total_revenue: 15800000000,
      net_income: 1200000000
    },
    {
      fiscal_date_ending: "2022-12-31", 
      total_revenue: 14200000000,
      net_income: 980000000
    },
    {
      fiscal_date_ending: "2021-12-31",
      total_revenue: 13100000000,
      net_income: 850000000
    }
  ]
});

export const mockDailySeries = (symbol: string): VendorDailySeries => {
  // Different base prices for different symbols
  const basePrices: Record<string, number> = {
    'TEL': 145,
    'ST': 48,
    'DD': 85,
    'CE': 118,
    'LYB': 92,
  };
  
  const basePrice = basePrices[symbol] || 100;
  const dates: VendorDailySeries['time_series'] = [];
  let currentPrice = basePrice;
  
  for (let i = 99; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate realistic price movement with some trending
    const dailyChange = (Math.random() - 0.48) * 0.05; // Slight upward bias
    currentPrice = Math.max(currentPrice * (1 + dailyChange), 10);
    
    dates.push({
      date: date.toISOString().split('T')[0],
      close: Number(currentPrice.toFixed(2))
    });
  }
  
  return {
    symbol,
    time_series: dates.sort((a, b) => a.date.localeCompare(b.date)) // Ensure chronological order
  };
};

export const mockSearchResults = (_keywords: string): VendorSearchResponse => ({
  results: [
    {
      symbol: "AAPL",
      name: "Apple Inc",
      type: "Equity",
      region: "United States",
      market_open: "09:30",
      market_close: "16:00",
      timezone: "UTC-04",
      currency: "USD",
      match_score: 1.0
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      type: "Equity", 
      region: "United States",
      market_open: "09:30",
      market_close: "16:00",
      timezone: "UTC-04",
      currency: "USD",
      match_score: 0.8
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc Class A",
      type: "Equity",
      region: "United States", 
      market_open: "09:30",
      market_close: "16:00",
      timezone: "UTC-04",
      currency: "USD",
      match_score: 0.6
    }
  ]
});