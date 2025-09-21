export interface WeatherImpactData {
  symbol: string;
  company_name: string;
  sector: 'agriculture' | 'energy' | 'transportation' | 'insurance' | 'retail' | 'construction' | 'utilities';
  weather_sensitivity: 'high' | 'medium' | 'low';
  recent_weather_events: WeatherEvent[];
  revenue_correlation: number; // -1 to 1, correlation with weather
  balloon_coverage_score: number; // 0-100, how well WindBorne covers their regions
  risk_metrics: WeatherRiskMetrics;
  seasonal_patterns: SeasonalPattern[];
}

export interface WeatherEvent {
  event_type: 'hurricane' | 'drought' | 'extreme_heat' | 'flooding' | 'winter_storm' | 'wildfire';
  severity: 'minor' | 'moderate' | 'severe' | 'catastrophic';
  date: string;
  affected_regions: string[];
  estimated_impact: number; // USD impact
  windborne_prediction_accuracy: number; // 0-100
}

export interface WeatherRiskMetrics {
  next_30_days_risk: 'low' | 'medium' | 'high';
  climate_trend_exposure: number; // 0-100
  supply_chain_vulnerability: number; // 0-100
  seasonal_revenue_variance: number; // percentage
}

export interface SeasonalPattern {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  typical_revenue_change: number; // percentage
  weather_dependency: number; // 0-100
  key_weather_factors: string[];
}

export interface WeatherFinanceInsight {
  insight_type: 'opportunity' | 'risk' | 'trend';
  title: string;
  description: string;
  financial_impact: number;
  confidence_score: number; // 0-100
  windborne_advantage: string; // How WindBorne's data provides unique insight
}

export interface ClimateScenario {
  scenario_name: string;
  probability: number; // 0-100
  timeframe: '1_month' | '3_months' | '1_year';
  expected_impact: number; // USD
  mitigation_strategies: string[];
}