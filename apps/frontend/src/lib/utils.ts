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

  // EBITDA-to-Market Cap Efficiency Ratio Analysis
  if (vendor.ebitda > 0 && vendor.market_cap > 0) {
    const ebitdaToMarketCapRatio = vendor.ebitda / vendor.market_cap;
    if (ebitdaToMarketCapRatio > 0.15) { // >15% EBITDA yield - very efficient
      flags.push({
        type: 'info',
        label: '⚡ High Efficiency',
        condition: true
      });
    } else if (ebitdaToMarketCapRatio < 0.03) { // <3% EBITDA yield - potentially overvalued
      flags.push({
        type: 'warning',
        label: '📈 Premium Valuation',
        condition: true
      });
    }
  }

  // Mega-Cap Growth Concern (high P/E for large companies)
  if (vendor.market_cap > 50000000000 && vendor.pe_ratio > 35) { // $50B+ with P/E >35
    flags.push({
      type: 'warning',
      label: '🔶 Expensive Large Cap',
      condition: true
    });
  }

  // Value Investment Opportunity
  if (vendor.pe_ratio > 0 && vendor.pe_ratio < 12 && vendor.ebitda > 2000000000 && vendor.market_cap > 10000000000) {
    flags.push({
      type: 'info',
      label: '💎 Value Opportunity',
      condition: true
    });
  }

  return flags;
}

// WindBorne-specific vendor assessment for sales team
export function getContractReadiness(vendor: VendorOverview): { score: string; label: string; color: string } {
  // Advanced financial stability assessment using multiple metrics
  const marketCapB = vendor.market_cap / 1000000000; // Convert to billions
  const ebitdaB = vendor.ebitda / 1000000000; // Convert to billions

  // Calculate EBITDA margin (profitability efficiency)
  const ebitdaMargin = vendor.ebitda > 0 ? vendor.ebitda / vendor.market_cap : 0;

  // Financial strength score (0-100)
  let strengthScore = 0;

  // Size component (40% weight)
  if (marketCapB > 100) strengthScore += 40;
  else if (marketCapB > 50) strengthScore += 35;
  else if (marketCapB > 20) strengthScore += 30;
  else if (marketCapB > 10) strengthScore += 25;
  else if (marketCapB > 5) strengthScore += 20;
  else if (marketCapB > 2) strengthScore += 15;
  else if (marketCapB > 1) strengthScore += 10;
  else strengthScore += 5;

  // Profitability component (40% weight)
  if (ebitdaB > 10) strengthScore += 40;
  else if (ebitdaB > 5) strengthScore += 35;
  else if (ebitdaB > 2) strengthScore += 30;
  else if (ebitdaB > 1) strengthScore += 25;
  else if (ebitdaB > 0.5) strengthScore += 20;
  else if (ebitdaB > 0.1) strengthScore += 15;
  else if (ebitdaB > 0) strengthScore += 10;
  else strengthScore += 0; // Negative EBITDA

  // Efficiency component (20% weight) - EBITDA margin
  if (ebitdaMargin > 0.15) strengthScore += 20; // >15% margin
  else if (ebitdaMargin > 0.10) strengthScore += 16; // >10% margin
  else if (ebitdaMargin > 0.07) strengthScore += 12; // >7% margin
  else if (ebitdaMargin > 0.05) strengthScore += 8; // >5% margin
  else if (ebitdaMargin > 0.02) strengthScore += 4; // >2% margin
  else strengthScore += 0;

  // P/E ratio adjustment (bonus/penalty)
  if (vendor.pe_ratio > 0) {
    if (vendor.pe_ratio < 15) strengthScore += 5; // Value stock bonus
    else if (vendor.pe_ratio > 50) strengthScore -= 5; // Overvalued penalty
  }

  // Assign grades based on comprehensive score
  if (strengthScore >= 85) {
    return { score: 'A+', label: 'Fortune 500 Ready', color: 'text-emerald-700 bg-emerald-100' };
  } else if (strengthScore >= 75) {
    return { score: 'A', label: 'Enterprise Target', color: 'text-green-700 bg-green-100' };
  } else if (strengthScore >= 60) {
    return { score: 'A-', label: 'Large Corporate', color: 'text-blue-700 bg-blue-100' };
  } else if (strengthScore >= 45) {
    return { score: 'B+', label: 'Mid-Market Prime', color: 'text-indigo-700 bg-indigo-100' };
  } else if (strengthScore >= 30) {
    return { score: 'B', label: 'Growth Company', color: 'text-amber-700 bg-amber-100' };
  } else if (strengthScore >= 20) {
    return { score: 'B-', label: 'Emerging Player', color: 'text-orange-700 bg-orange-100' };
  } else {
    return { score: 'C', label: 'Startup/Distressed', color: 'text-slate-600 bg-slate-100' };
  }
}

export function getWeatherExposure(vendor: VendorOverview): { level: string; sectors: string; color: string } {
  // Advanced weather sensitivity analysis using company data and financial metrics
  const symbol = vendor.symbol.toUpperCase();
  const name = vendor.name.toLowerCase();
  const marketCapB = vendor.market_cap / 1000000000;

  // Weather exposure score (0-100)
  let exposureScore = 0;

  // Industry-specific weather sensitivity analysis
  // Critical weather-dependent sectors (70-100 exposure)
  if (name.includes('agriculture') || name.includes('farm') || name.includes('crop') ||
      name.includes('renewable') || name.includes('solar') || name.includes('wind energy')) {
    exposureScore += 80; // Direct weather dependency
  } else if (name.includes('utility') || name.includes('power') || name.includes('electric') ||
             name.includes('energy') && !name.includes('oil')) {
    exposureScore += 75; // High weather impact on operations
  } else if (name.includes('aviation') || name.includes('airline') || name.includes('airport')) {
    exposureScore += 70; // Flight operations highly weather-sensitive
  }

  // High weather exposure sectors (50-70 exposure)
  else if (name.includes('shipping') || name.includes('marine') || name.includes('logistics') ||
           name.includes('transport') && !name.includes('technology')) {
    exposureScore += 60; // Weather affects transportation
  } else if (name.includes('construction') || name.includes('infrastructure') ||
             name.includes('materials') || name.includes('concrete')) {
    exposureScore += 55; // Construction weather-dependent
  } else if (name.includes('chemical') || name.includes('specialty') || name.includes('industrial') ||
             symbol === 'DD' || symbol === 'CE' || symbol === 'LYB') {
    // DuPont (DD), Celanese (CE), LyondellBasell (LYB) - chemicals with weather-sensitive supply chains
    exposureScore += 50; // Industrial processes and supply chains
  }

  // Medium exposure - indirect weather impacts (30-50 exposure)
  else if (name.includes('retail') || name.includes('consumer') || name.includes('restaurant')) {
    exposureScore += 40; // Consumer behavior weather-dependent
  } else if (name.includes('insurance') || name.includes('property')) {
    exposureScore += 45; // Weather risk assessment critical
  } else if (name.includes('manufacturing') || name.includes('industrial')) {
    exposureScore += 35; // Supply chain weather exposure
  }

  // Tech/data companies - potential customers but lower direct exposure (20-40 exposure)
  else if (name.includes('technology') || name.includes('software') || name.includes('data') ||
           name.includes('telecom') || name.includes('connectivity') ||
           symbol === 'TEL' || symbol === 'ST') {
    // TE Connectivity (TEL), STMicroelectronics (ST) - tech companies that could use weather data
    exposureScore += 25; // Data buyers/analytics customers
  }

  // Size multiplier - larger companies have more complex weather exposure
  if (marketCapB > 50) exposureScore += 10; // Large companies have global operations
  else if (marketCapB > 20) exposureScore += 7;
  else if (marketCapB > 5) exposureScore += 5;

  // P/E ratio indicates growth/volatility - higher growth companies more weather-sensitive
  if (vendor.pe_ratio > 25) exposureScore += 5; // High growth companies more volatile
  else if (vendor.pe_ratio < 10 && vendor.pe_ratio > 0) exposureScore += 3; // Value companies may have traditional weather exposure

  // Final categorization based on comprehensive score
  if (exposureScore >= 70) {
    return { level: 'Critical', sectors: 'Core Target', color: 'text-red-700 bg-red-100' };
  } else if (exposureScore >= 55) {
    return { level: 'High', sectors: 'Priority Sector', color: 'text-red-600 bg-red-50' };
  } else if (exposureScore >= 40) {
    return { level: 'Medium', sectors: 'Strategic Value', color: 'text-amber-700 bg-amber-100' };
  } else if (exposureScore >= 25) {
    return { level: 'Data Buyer', sectors: 'Tech Partner', color: 'text-blue-700 bg-blue-100' };
  } else if (exposureScore >= 15) {
    return { level: 'Indirect', sectors: 'Future Prospect', color: 'text-indigo-600 bg-indigo-50' };
  } else {
    return { level: 'Minimal', sectors: 'Low Priority', color: 'text-slate-600 bg-slate-100' };
  }
}

export function getSalesOpportunity(vendor: VendorOverview): { priority: string; reason: string; color: string } {
  const contractReadiness = getContractReadiness(vendor);
  const weatherExposure = getWeatherExposure(vendor);

  // Extract numeric scores for advanced calculations
  const contractScore = extractContractScore(contractReadiness.score);
  const exposureLevel = weatherExposure.level;
  const marketCapB = vendor.market_cap / 1000000000;
  const ebitdaB = vendor.ebitda / 1000000000;

  // Calculate comprehensive opportunity score (0-100)
  let opportunityScore = 0;

  // Weather exposure impact (50% weight)
  switch (exposureLevel) {
    case 'Critical': opportunityScore += 50; break;
    case 'High': opportunityScore += 45; break;
    case 'Medium': opportunityScore += 35; break;
    case 'Data Buyer': opportunityScore += 30; break;
    case 'Indirect': opportunityScore += 20; break;
    default: opportunityScore += 10; break;
  }

  // Financial readiness impact (35% weight)
  opportunityScore += contractScore * 0.35;

  // Deal size potential (10% weight) - larger companies = bigger contracts
  if (marketCapB > 100) opportunityScore += 10;
  else if (marketCapB > 50) opportunityScore += 8;
  else if (marketCapB > 20) opportunityScore += 6;
  else if (marketCapB > 10) opportunityScore += 4;
  else if (marketCapB > 5) opportunityScore += 2;

  // Urgency factor (5% weight) - companies in transition or distress may need solutions faster
  if (vendor.pe_ratio === 0 && vendor.ebitda < 0) {
    opportunityScore += 5; // Distressed companies may need weather intelligence urgently
  } else if (vendor.pe_ratio > 40) {
    opportunityScore += 3; // High growth companies may be expanding and need new data
  }

  // Strategic multipliers for specific high-value scenarios
  if (exposureLevel === 'Critical' && contractScore >= 75) {
    opportunityScore *= 1.15; // 15% bonus for perfect fit prospects
  }
  if (marketCapB > 50 && (exposureLevel === 'High' || exposureLevel === 'Critical')) {
    opportunityScore *= 1.10; // 10% bonus for large weather-sensitive companies
  }

  // Final priority assignment with detailed reasoning
  if (opportunityScore >= 85) {
    return {
      priority: 'Platinum',
      reason: `${formatCurrency(vendor.market_cap)} ${exposureLevel.toLowerCase()} exposure`,
      color: 'text-purple-700 bg-purple-100'
    };
  } else if (opportunityScore >= 75) {
    return {
      priority: 'Hot',
      reason: `${contractReadiness.label} + ${exposureLevel} need`,
      color: 'text-red-700 bg-red-100'
    };
  } else if (opportunityScore >= 60) {
    return {
      priority: 'Warm',
      reason: `${contractReadiness.score} financials, ${exposureLevel.toLowerCase()} sector`,
      color: 'text-orange-700 bg-orange-100'
    };
  } else if (opportunityScore >= 45) {
    return {
      priority: 'Qualified',
      reason: `${ebitdaB > 1 ? 'Profitable' : 'Growing'} ${exposureLevel.toLowerCase()} prospect`,
      color: 'text-blue-700 bg-blue-100'
    };
  } else if (opportunityScore >= 30) {
    return {
      priority: 'Nurture',
      reason: `Future potential as ${exposureLevel.toLowerCase()} grows`,
      color: 'text-indigo-600 bg-indigo-100'
    };
  } else if (opportunityScore >= 20) {
    return {
      priority: 'Monitor',
      reason: 'Limited current fit',
      color: 'text-amber-600 bg-amber-50'
    };
  } else {
    return {
      priority: 'Cold',
      reason: 'Low priority - minimal weather exposure',
      color: 'text-slate-600 bg-slate-100'
    };
  }
}

// Helper function to extract numeric score from contract readiness grade
function extractContractScore(grade: string): number {
  switch (grade) {
    case 'A+': return 95;
    case 'A': return 85;
    case 'A-': return 75;
    case 'B+': return 65;
    case 'B': return 55;
    case 'B-': return 45;
    case 'C': return 25;
    default: return 35;
  }
}

// Financial Health Alerts & Monitoring
export interface FinancialAlert {
  id: string;
  type: 'critical' | 'warning' | 'opportunity' | 'info';
  category: 'debt' | 'valuation' | 'growth' | 'volatility' | 'profitability';
  title: string;
  message: string;
  severity: number; // 1-10 scale
  actionable: boolean;
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
}

export function getFinancialAlerts(vendor: VendorOverview): FinancialAlert[] {
  const alerts: FinancialAlert[] = [];

  // Critical Debt/Loss Concerns
  if (vendor.ebitda < 0) {
    alerts.push({
      id: `${vendor.symbol}-negative-ebitda`,
      type: 'critical',
      category: 'profitability',
      title: 'Negative EBITDA',
      message: `${vendor.symbol} shows negative earnings (${formatCurrency(vendor.ebitda)}). High financial risk.`,
      severity: 9,
      actionable: true,
      timeframe: 'immediate'
    });
  }

  // Extreme Valuation Warnings
  if (vendor.pe_ratio > 50 && vendor.pe_ratio > 0) {
    alerts.push({
      id: `${vendor.symbol}-extreme-pe`,
      type: 'warning',
      category: 'valuation',
      title: 'Extreme P/E Ratio',
      message: `${vendor.symbol} trading at ${formatNumber(vendor.pe_ratio, 1)}x P/E - significantly overvalued. Market expects exceptional growth.`,
      severity: 7,
      actionable: true,
      timeframe: 'short-term'
    });
  }

  // Growth Opportunities (Value Stocks)
  if (vendor.pe_ratio > 0 && vendor.pe_ratio < 15 && vendor.ebitda > 1000000000) {
    alerts.push({
      id: `${vendor.symbol}-value-opportunity`,
      type: 'opportunity',
      category: 'valuation',
      title: 'Value Investment Opportunity',
      message: `${vendor.symbol} trading at attractive ${formatNumber(vendor.pe_ratio, 1)}x P/E with strong EBITDA. Potential undervaluation.`,
      severity: 5,
      actionable: true,
      timeframe: 'medium-term'
    });
  }

  // Small Cap Risk Warning
  if (vendor.market_cap < 5000000000) {
    alerts.push({
      id: `${vendor.symbol}-small-cap-risk`,
      type: 'warning',
      category: 'volatility',
      title: 'Small Cap Volatility Risk',
      message: `${vendor.symbol} is a small-cap company (${formatCurrency(vendor.market_cap)}). Higher volatility and liquidity risk.`,
      severity: 6,
      actionable: false,
      timeframe: 'long-term'
    });
  }

  // Large Cap Stability
  if (vendor.market_cap > 50000000000 && vendor.ebitda > 5000000000) {
    alerts.push({
      id: `${vendor.symbol}-large-cap-stable`,
      type: 'info',
      category: 'growth',
      title: 'Large Cap Stability',
      message: `${vendor.symbol} is a large, established company with stable earnings. Lower risk, slower growth profile.`,
      severity: 3,
      actionable: false,
      timeframe: 'long-term'
    });
  }

  // Profitability Efficiency Alert
  if (vendor.ebitda > 0 && vendor.market_cap > 0) {
    const ebitdaYield = vendor.ebitda / vendor.market_cap;
    if (ebitdaYield > 0.12) {
      alerts.push({
        id: `${vendor.symbol}-high-efficiency`,
        type: 'opportunity',
        category: 'profitability',
        title: 'High Profitability Efficiency',
        message: `${vendor.symbol} generates ${formatNumber(ebitdaYield * 100, 1)}% EBITDA yield. Exceptional operational efficiency.`,
        severity: 4,
        actionable: true,
        timeframe: 'short-term'
      });
    }
  }

  // No P/E Data Alert
  if (vendor.pe_ratio === 0) {
    alerts.push({
      id: `${vendor.symbol}-no-pe-data`,
      type: 'warning',
      category: 'valuation',
      title: 'No Earnings Data Available',
      message: `${vendor.symbol} has no P/E ratio data. Company may have losses or incomplete financial reporting.`,
      severity: 6,
      actionable: true,
      timeframe: 'immediate'
    });
  }

  return alerts.sort((a, b) => b.severity - a.severity); // Sort by severity (highest first)
}

// Industry Benchmarking Data
export interface IndustryBenchmark {
  industry: string;
  sector: string;
  avgPeRatio: number;
  avgMarketCap: number; // in billions
  avgEbitdaMargin: number; // as percentage
  companies: number;
  volatilityIndex: number; // 1-10 scale
}

export const industryBenchmarks: Record<string, IndustryBenchmark> = {
  'technology': {
    industry: 'Technology Hardware',
    sector: 'Technology',
    avgPeRatio: 28.5,
    avgMarketCap: 45.2,
    avgEbitdaMargin: 18.5,
    companies: 156,
    volatilityIndex: 7
  },
  'semiconductors': {
    industry: 'Semiconductors',
    sector: 'Technology',
    avgPeRatio: 32.1,
    avgMarketCap: 52.8,
    avgEbitdaMargin: 22.3,
    companies: 89,
    volatilityIndex: 8
  },
  'chemicals': {
    industry: 'Specialty Chemicals',
    sector: 'Materials',
    avgPeRatio: 18.7,
    avgMarketCap: 28.4,
    avgEbitdaMargin: 16.8,
    companies: 124,
    volatilityIndex: 6
  },
  'diversified_chemicals': {
    industry: 'Diversified Chemicals',
    sector: 'Materials',
    avgPeRatio: 15.3,
    avgMarketCap: 35.6,
    avgEbitdaMargin: 14.2,
    companies: 67,
    volatilityIndex: 5
  }
};

export function getIndustryClassification(vendor: VendorOverview): string {
  const symbol = vendor.symbol.toUpperCase();
  const name = vendor.name.toLowerCase();

  // Technology/Semiconductor companies
  if (symbol === 'TEL' || symbol === 'ST' ||
      name.includes('technology') || name.includes('semiconductor') ||
      name.includes('connectivity') || name.includes('sensata')) {
    return symbol === 'ST' ? 'semiconductors' : 'technology';
  }

  // Chemical companies
  if (symbol === 'DD' || symbol === 'CE' || symbol === 'LYB' ||
      name.includes('chemical') || name.includes('dupont') ||
      name.includes('celanese') || name.includes('lyondell')) {
    return symbol === 'DD' ? 'diversified_chemicals' : 'chemicals';
  }

  return 'technology'; // Default fallback
}

export interface PeerComparison {
  vendor: VendorOverview;
  industry: IndustryBenchmark;
  pePercentile: number; // 0-100, where 100 = highest PE in industry
  marketCapPercentile: number;
  ebitdaMarginPercentile: number;
  overallRanking: 'top-quartile' | 'above-average' | 'below-average' | 'bottom-quartile';
  insights: string[];
}

export function getPeerComparison(vendor: VendorOverview): PeerComparison {
  const industryKey = getIndustryClassification(vendor);
  const industry = industryBenchmarks[industryKey];

  const marketCapB = vendor.market_cap / 1000000000;
  const ebitdaMargin = vendor.ebitda > 0 && vendor.market_cap > 0
    ? (vendor.ebitda / vendor.market_cap) * 100
    : 0;

  // Calculate percentiles (simplified - in real app would use historical data)
  const pePercentile = vendor.pe_ratio > 0
    ? Math.min(100, Math.max(0, (vendor.pe_ratio / industry.avgPeRatio) * 50))
    : 0;

  const marketCapPercentile = Math.min(100, Math.max(0, (marketCapB / industry.avgMarketCap) * 50));

  const ebitdaMarginPercentile = ebitdaMargin > 0
    ? Math.min(100, Math.max(0, (ebitdaMargin / industry.avgEbitdaMargin) * 50))
    : 0;

  // Overall ranking based on composite score
  const compositeScore = (pePercentile + marketCapPercentile + ebitdaMarginPercentile) / 3;
  let overallRanking: PeerComparison['overallRanking'];

  if (compositeScore >= 75) overallRanking = 'top-quartile';
  else if (compositeScore >= 50) overallRanking = 'above-average';
  else if (compositeScore >= 25) overallRanking = 'below-average';
  else overallRanking = 'bottom-quartile';

  // Generate insights
  const insights: string[] = [];

  if (vendor.pe_ratio > industry.avgPeRatio * 1.5) {
    insights.push(`Trading at ${formatNumber(vendor.pe_ratio / industry.avgPeRatio, 1)}x industry average P/E - premium valuation`);
  } else if (vendor.pe_ratio > 0 && vendor.pe_ratio < industry.avgPeRatio * 0.8) {
    insights.push(`Trading below industry average P/E - potential value opportunity`);
  }

  if (marketCapB > industry.avgMarketCap * 1.5) {
    insights.push(`Market cap ${formatNumber(marketCapB / industry.avgMarketCap, 1)}x larger than industry average - market leader`);
  }

  if (ebitdaMargin > industry.avgEbitdaMargin * 1.2) {
    insights.push(`EBITDA margin above industry average - operational excellence`);
  } else if (ebitdaMargin < industry.avgEbitdaMargin * 0.8 && ebitdaMargin > 0) {
    insights.push(`EBITDA margin below industry peers - efficiency opportunity`);
  }

  return {
    vendor,
    industry,
    pePercentile,
    marketCapPercentile,
    ebitdaMarginPercentile,
    overallRanking,
    insights
  };
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