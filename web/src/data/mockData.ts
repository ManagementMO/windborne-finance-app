export type Vendor = {
  symbol: string;
  name: string;
  marketCap: number;
  peRatio: number;
  eps: number;
  revenueGrowth: number;
  sentiment: 'positive' | 'neutral' | 'negative';
};

export type VendorIncomeStatement = {
  year: number;
  revenue: number;
};

export const VENDORS_MOCK_DATA: Vendor[] = [
  { symbol: 'TEL', name: 'TE Connectivity', marketCap: 50.3e9, peRatio: 22.5, eps: 6.20, revenueGrowth: 5.2, sentiment: 'positive' },
  { symbol: 'ST', name: 'Sensata Technologies', marketCap: 7.8e9, peRatio: 18.2, eps: 2.50, revenueGrowth: -2.1, sentiment: 'negative' },
  { symbol: 'DD', name: 'DuPont', marketCap: 35.1e9, peRatio: 15.7, eps: 4.80, revenueGrowth: 1.5, sentiment: 'neutral' },
  { symbol: 'APH', name: 'Amphenol', marketCap: 65.2e9, peRatio: 30.1, eps: 3.90, revenueGrowth: 8.9, sentiment: 'positive' },
  { symbol: 'ROK', name: 'Rockwell Automation', marketCap: 33.4e9, peRatio: 25.8, eps: 10.50, revenueGrowth: 4.7, sentiment: 'positive' },
];

export const INCOME_STATEMENT_MOCK_DATA: Record<string, VendorIncomeStatement[]> = {
  TEL: [
    { year: 2021, revenue: 13.8e9 },
    { year: 2022, revenue: 14.9e9 },
    { year: 2023, revenue: 16.0e9 },
  ],
  ST: [
    { year: 2021, revenue: 3.5e9 },
    { year: 2022, revenue: 3.8e9 },
    { year: 2023, revenue: 4.0e9 },
  ],
  DD: [
    { year: 2021, revenue: 12.0e9 },
    { year: 2022, revenue: 13.0e9 },
    { year: 2023, revenue: 12.5e9 },
  ],
  APH: [
    { year: 2021, revenue: 10.0e9 },
    { year: 2022, revenue: 11.0e9 },
    { year: 2023, revenue: 12.0e9 },
  ],
  ROK: [
    { year: 2021, revenue: 7.0e9 },
    { year: 2022, revenue: 7.8e9 },
    { year: 2023, revenue: 8.5e9 },
  ],
}; 