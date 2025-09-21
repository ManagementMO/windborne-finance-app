import { WeatherImpactData, WeatherFinanceInsight, ClimateScenario } from '../types/weather-finance';

// Validate weather data integrity
const validateWeatherData = (data: WeatherImpactData[]): WeatherImpactData[] => {
  return data.filter(item => {
    return item.symbol && 
           item.company_name && 
           typeof item.revenue_correlation === 'number' &&
           item.revenue_correlation >= -1 && 
           item.revenue_correlation <= 1 &&
           item.balloon_coverage_score >= 0 &&
           item.balloon_coverage_score <= 100;
  });
};

// Raw weather-financial intelligence data
const rawWeatherImpactData: WeatherImpactData[] = [
  {
    symbol: "TEL",
    company_name: "TE Connectivity Ltd",
    sector: "utilities",
    weather_sensitivity: "high",
    revenue_correlation: 0.65,
    balloon_coverage_score: 88,
    recent_weather_events: [
      {
        event_type: "winter_storm",
        severity: "severe",
        date: "2024-01-15",
        affected_regions: ["Northeast US", "Great Lakes"],
        estimated_impact: -45000000,
        windborne_prediction_accuracy: 94
      },
      {
        event_type: "extreme_heat",
        severity: "moderate", 
        date: "2024-08-22",
        affected_regions: ["Southwest US"],
        estimated_impact: 12000000,
        windborne_prediction_accuracy: 91
      }
    ],
    risk_metrics: {
      next_30_days_risk: "medium",
      climate_trend_exposure: 72,
      supply_chain_vulnerability: 68,
      seasonal_revenue_variance: 15.2
    },
    seasonal_patterns: [
      {
        quarter: "Q1",
        typical_revenue_change: -8.5,
        weather_dependency: 85,
        key_weather_factors: ["Winter storms", "Ice formation", "Temperature fluctuations"]
      },
      {
        quarter: "Q2", 
        typical_revenue_change: 12.3,
        weather_dependency: 45,
        key_weather_factors: ["Spring maintenance demand"]
      },
      {
        quarter: "Q3",
        typical_revenue_change: 18.7,
        weather_dependency: 75,
        key_weather_factors: ["Extreme heat", "Hurricane season prep"]
      },
      {
        quarter: "Q4",
        typical_revenue_change: -5.2,
        weather_dependency: 60,
        key_weather_factors: ["Storm preparation", "Grid winterization"]
      }
    ]
  },
  {
    symbol: "DD",
    company_name: "DuPont de Nemours Inc",
    sector: "agriculture",
    weather_sensitivity: "high",
    revenue_correlation: 0.78,
    balloon_coverage_score: 92,
    recent_weather_events: [
      {
        event_type: "drought",
        severity: "severe",
        date: "2024-07-10",
        affected_regions: ["Midwest US", "Great Plains"],
        estimated_impact: -125000000,
        windborne_prediction_accuracy: 96
      },
      {
        event_type: "flooding",
        severity: "moderate",
        date: "2024-09-05",
        affected_regions: ["Mississippi Valley"],
        estimated_impact: -35000000,
        windborne_prediction_accuracy: 89
      }
    ],
    risk_metrics: {
      next_30_days_risk: "high",
      climate_trend_exposure: 89,
      supply_chain_vulnerability: 75,
      seasonal_revenue_variance: 28.5
    },
    seasonal_patterns: [
      {
        quarter: "Q1",
        typical_revenue_change: -15.2,
        weather_dependency: 90,
        key_weather_factors: ["Planting season prep", "Soil conditions", "Late frost risk"]
      },
      {
        quarter: "Q2",
        typical_revenue_change: 35.7,
        weather_dependency: 95,
        key_weather_factors: ["Growing season", "Rainfall patterns", "Temperature stability"]
      },
      {
        quarter: "Q3",
        typical_revenue_change: 42.1,
        weather_dependency: 88,
        key_weather_factors: ["Drought conditions", "Heat stress", "Harvest timing"]
      },
      {
        quarter: "Q4",
        typical_revenue_change: -18.9,
        weather_dependency: 45,
        key_weather_factors: ["Post-harvest", "Storage conditions"]
      }
    ]
  },
  {
    symbol: "LYB",
    company_name: "LyondellBasell Industries N.V.",
    sector: "energy",
    weather_sensitivity: "medium",
    revenue_correlation: 0.42,
    balloon_coverage_score: 85,
    recent_weather_events: [
      {
        event_type: "hurricane",
        severity: "severe",
        date: "2024-08-28",
        affected_regions: ["Gulf Coast"],
        estimated_impact: -85000000,
        windborne_prediction_accuracy: 93
      }
    ],
    risk_metrics: {
      next_30_days_risk: "low",
      climate_trend_exposure: 58,
      supply_chain_vulnerability: 82,
      seasonal_revenue_variance: 12.8
    },
    seasonal_patterns: [
      {
        quarter: "Q1",
        typical_revenue_change: -5.1,
        weather_dependency: 35,
        key_weather_factors: ["Winter energy demand"]
      },
      {
        quarter: "Q2",
        typical_revenue_change: 8.3,
        weather_dependency: 25,
        key_weather_factors: ["Maintenance season"]
      },
      {
        quarter: "Q3",
        typical_revenue_change: 15.2,
        weather_dependency: 70,
        key_weather_factors: ["Hurricane season", "Extreme weather shutdowns"]
      },
      {
        quarter: "Q4",
        typical_revenue_change: 3.8,
        weather_dependency: 40,
        key_weather_factors: ["Winter operations"]
      }
    ]
  }
];

// Export validated weather data
export const weatherImpactData = validateWeatherData(rawWeatherImpactData);

export const weatherFinanceInsights: WeatherFinanceInsight[] = [
  {
    insight_type: "opportunity",
    title: "DuPont: Early Drought Warning Advantage",
    description: "WindBorne's balloon network detected soil moisture anomalies 45 days before traditional models, suggesting strong Q3 demand for drought-resistant seeds.",
    financial_impact: 78000000,
    confidence_score: 87,
    windborne_advantage: "Real-time soil moisture data from 200+ balloons provides 3-6 week advantage over satellite imagery"
  },
  {
    insight_type: "risk",
    title: "TE Connectivity: Winter Storm Cluster Risk",
    description: "Advanced atmospheric patterns suggest 40% higher probability of severe winter storms affecting Northeast grid infrastructure.",
    financial_impact: -125000000,
    confidence_score: 82,
    windborne_advantage: "Stratospheric balloon data reveals storm formation patterns invisible to ground-based models"
  },
  {
    insight_type: "trend", 
    title: "Energy Sector: Microclimate Revenue Impact",
    description: "WindBorne data reveals how local weather variations create 12-15% revenue swings in energy companies, enabling precision hedging strategies.",
    financial_impact: 45000000,
    confidence_score: 91,
    windborne_advantage: "Dense balloon coverage provides hyperlocal weather data at 10km resolution vs 25km industry standard"
  },
  {
    insight_type: "opportunity",
    title: "Insurance Premium Optimization",
    description: "Companies with high WindBorne coverage scores show 23% lower weather-related claims, suggesting potential for premium reductions.",
    financial_impact: 156000000,
    confidence_score: 94,
    windborne_advantage: "Continuous atmospheric monitoring enables proactive risk mitigation vs reactive claim processing"
  }
];

export const climateScenarios: ClimateScenario[] = [
  {
    scenario_name: "La Niña Winter Pattern",
    probability: 75,
    timeframe: "3_months",
    expected_impact: -95000000,
    mitigation_strategies: [
      "Increase utility infrastructure hedging",
      "Accelerate renewable energy storage deployment",
      "Enhanced supply chain cold weather protocols"
    ]
  },
  {
    scenario_name: "Atlantic Hurricane Hyperactivity",
    probability: 65,
    timeframe: "1_year", 
    expected_impact: -280000000,
    mitigation_strategies: [
      "Gulf Coast facility hardening investments",
      "Diversified supply chain routing",
      "Enhanced early warning systems integration"
    ]
  },
  {
    scenario_name: "Midwest Mega-Drought Extension", 
    probability: 45,
    timeframe: "1_year",
    expected_impact: -520000000,
    mitigation_strategies: [
      "Water-efficient technology deployment",
      "Drought-resistant crop varieties",
      "Regional agricultural diversification"
    ]
  }
];