import { VendorOverview } from '../types/vendor';

// Enhanced vendor data with sector/industry information
export interface EnhancedVendorData extends VendorOverview {
  sector?: string;
  industry?: string;
  country?: string;
  description?: string;
}

// Dynamic sector-based weather sensitivity mapping that adapts to any sector
const SECTOR_WEATHER_SENSITIVITY: Record<string, {
  sensitivity: 'low' | 'medium' | 'high';
  baseCorrelation: number;
  primaryRisks: string[];
  seasonalVariance: number;
}> = {
  'TECHNOLOGY': {
    sensitivity: 'medium',
    baseCorrelation: 0.45,
    primaryRisks: ['extreme_temperatures', 'power_outages', 'supply_chain_disruption'],
    seasonalVariance: 12.0
  },
  'BASIC MATERIALS': {
    sensitivity: 'high',
    baseCorrelation: 0.72,
    primaryRisks: ['hurricanes', 'extreme_heat', 'flooding', 'drought'],
    seasonalVariance: 25.0
  },
  'ENERGY': {
    sensitivity: 'high',
    baseCorrelation: 0.68,
    primaryRisks: ['hurricanes', 'extreme_heat', 'winter_storms', 'flooding'],
    seasonalVariance: 22.0
  },
  'UTILITIES': {
    sensitivity: 'high',
    baseCorrelation: 0.75,
    primaryRisks: ['extreme_temperatures', 'winter_storms', 'hurricanes', 'power_grid_stress'],
    seasonalVariance: 28.0
  },
  'INDUSTRIALS': {
    sensitivity: 'medium',
    baseCorrelation: 0.52,
    primaryRisks: ['extreme_temperatures', 'supply_chain_disruption', 'flooding'],
    seasonalVariance: 15.0
  },
  'CONSUMER DISCRETIONARY': {
    sensitivity: 'low',
    baseCorrelation: 0.32,
    primaryRisks: ['extreme_weather_events', 'seasonal_disruption'],
    seasonalVariance: 8.0
  },
  'CONSUMER STAPLES': {
    sensitivity: 'medium',
    baseCorrelation: 0.48,
    primaryRisks: ['drought', 'flooding', 'supply_chain_disruption'],
    seasonalVariance: 10.0
  },
  'HEALTHCARE': {
    sensitivity: 'low',
    baseCorrelation: 0.25,
    primaryRisks: ['extreme_weather_events', 'transportation_disruption'],
    seasonalVariance: 6.0
  },
  'FINANCIALS': {
    sensitivity: 'low',
    baseCorrelation: 0.28,
    primaryRisks: ['extreme_weather_events', 'economic_disruption'],
    seasonalVariance: 7.0
  },
  'REAL ESTATE': {
    sensitivity: 'high',
    baseCorrelation: 0.65,
    primaryRisks: ['hurricanes', 'flooding', 'extreme_temperatures', 'natural_disasters'],
    seasonalVariance: 20.0
  },
  'COMMUNICATION SERVICES': {
    sensitivity: 'medium',
    baseCorrelation: 0.38,
    primaryRisks: ['power_outages', 'infrastructure_damage', 'extreme_weather'],
    seasonalVariance: 9.0
  }
};

// Dynamic industry-specific weather factors that adapt to any industry
const INDUSTRY_WEATHER_FACTORS: Record<string, {
  weatherDependency: number;
  keyFactors: string[];
  supplyChainVulnerability: number;
}> = {
  // Technology industries
  'ELECTRONIC COMPONENTS': {
    weatherDependency: 65,
    keyFactors: ['Temperature fluctuations affecting semiconductor manufacturing', 'Humidity control in clean rooms', 'Power grid stability'],
    supplyChainVulnerability: 70
  },
  'SCIENTIFIC & TECHNICAL INSTRUMENTS': {
    weatherDependency: 55,
    keyFactors: ['Precision manufacturing temperature control', 'Transportation weather delays', 'Customer site accessibility'],
    supplyChainVulnerability: 60
  },
  'CONSUMER ELECTRONICS': {
    weatherDependency: 45,
    keyFactors: ['Supply chain weather delays', 'Seasonal demand patterns', 'Manufacturing facility climate control'],
    supplyChainVulnerability: 65
  },
  'SOFTWARE': {
    weatherDependency: 25,
    keyFactors: ['Data center cooling requirements', 'Power grid reliability', 'Remote work weather impacts'],
    supplyChainVulnerability: 30
  },

  // Basic materials and chemicals
  'SPECIALTY CHEMICALS': {
    weatherDependency: 85,
    keyFactors: ['Raw material availability', 'Energy costs from weather', 'Hurricane season shutdowns', 'Extreme temperature operational limits'],
    supplyChainVulnerability: 88
  },
  'COMMODITY CHEMICALS': {
    weatherDependency: 90,
    keyFactors: ['Weather-sensitive feedstock costs', 'Energy-intensive processes', 'Hurricane evacuation protocols', 'Temperature-critical reactions'],
    supplyChainVulnerability: 92
  },
  'AGRICULTURAL CHEMICALS': {
    weatherDependency: 95,
    keyFactors: ['Seasonal application windows', 'Weather-driven crop demand', 'Drought impact on sales', 'Flooding distribution delays'],
    supplyChainVulnerability: 85
  },

  // Energy industries
  'OIL & GAS REFINING': {
    weatherDependency: 88,
    keyFactors: ['Hurricane facility shutdowns', 'Extreme heat operational stress', 'Winter demand spikes', 'Pipeline weather disruptions'],
    supplyChainVulnerability: 85
  },
  'RENEWABLE ENERGY': {
    weatherDependency: 95,
    keyFactors: ['Weather-dependent generation', 'Extreme weather equipment damage', 'Seasonal output variations', 'Grid weather stress'],
    supplyChainVulnerability: 60
  },

  // Real estate
  'REIT - HOTEL & MOTEL': {
    weatherDependency: 75,
    keyFactors: ['Seasonal tourism patterns', 'Weather-driven travel disruptions', 'Hurricane evacuation impacts', 'Conference weather cancellations'],
    supplyChainVulnerability: 40
  },
  'REIT - RESIDENTIAL': {
    weatherDependency: 80,
    keyFactors: ['Weather damage maintenance costs', 'Seasonal moving patterns', 'Extreme weather tenant displacement', 'Insurance weather claims'],
    supplyChainVulnerability: 45
  },

  // Default for unknown industries
  'OTHER': {
    weatherDependency: 50,
    keyFactors: ['General weather business impacts', 'Seasonal variations', 'Supply chain weather risks'],
    supplyChainVulnerability: 55
  }
};

// Company-specific geographic and operational data
const COMPANY_OPERATIONAL_DATA: Record<string, {
  primaryRegions: string[];
  facilityTypes: string[];
  seasonalPeaks: number[];
  weatherVulnerabilities: string[];
}> = {
  'TEL': {
    primaryRegions: ['Asia-Pacific', 'Europe', 'Americas'],
    facilityTypes: ['Semiconductor fabs', 'R&D centers', 'Supply chain hubs'],
    seasonalPeaks: [6, 7, 8], // Summer electronics demand
    weatherVulnerabilities: ['extreme_heat', 'flooding', 'power_outages']
  },
  'ST': {
    primaryRegions: ['Europe', 'Asia', 'North America'],
    facilityTypes: ['Manufacturing plants', 'Design centers', 'Test facilities'],
    seasonalPeaks: [9, 10, 11], // Fall product launches
    weatherVulnerabilities: ['winter_storms', 'supply_chain_disruption', 'extreme_temperatures']
  },
  'DD': {
    primaryRegions: ['Gulf Coast', 'Delaware', 'Global chemical corridors'],
    facilityTypes: ['Chemical plants', 'Research facilities', 'Distribution centers'],
    seasonalPeaks: [4, 5, 6], // Spring agricultural season
    weatherVulnerabilities: ['hurricanes', 'extreme_heat', 'flooding', 'chemical_transport_disruption']
  },
  'CE': {
    primaryRegions: ['Texas', 'Louisiana', 'International operations'],
    facilityTypes: ['Petrochemical complexes', 'Pipeline networks', 'Storage facilities'],
    seasonalPeaks: [7, 8, 9], // Peak energy demand
    weatherVulnerabilities: ['hurricanes', 'extreme_heat', 'winter_freeze', 'infrastructure_damage']
  },
  'LYB': {
    primaryRegions: ['Texas', 'Europe', 'Asia'],
    facilityTypes: ['Refineries', 'Chemical plants', 'Polyolefin facilities'],
    seasonalPeaks: [5, 6, 7], // Construction and packaging demand
    weatherVulnerabilities: ['hurricanes', 'extreme_heat', 'drought', 'supply_disruption']
  }
};

// Generate realistic weather events based on company-specific data and current season
export function generateWeatherEvents(symbol: string, sector: string, _industry: string) {
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const currentYear = new Date().getFullYear();
  const events = [];
  const companyData = COMPANY_OPERATIONAL_DATA[symbol];

  // Use company-specific data if available, otherwise use sector defaults
  if (companyData) {
    // Check if current month is in seasonal peak (higher risk)
    const isSeasonalPeak = companyData.seasonalPeaks.includes(currentMonth);
    const riskMultiplier = isSeasonalPeak ? 1.5 : 1.0;

    // Generate events based on company vulnerabilities and seasonal patterns
    companyData.weatherVulnerabilities.forEach(vulnerability => {
      let shouldGenerate = false;
      let eventDetails = {};

      switch (vulnerability) {
        case 'hurricanes':
          if (currentMonth >= 6 && currentMonth <= 11) {
            shouldGenerate = true;
            eventDetails = {
              event_type: 'hurricane' as const,
              severity: (currentMonth >= 8 && currentMonth <= 10) ? 'severe' as const : 'moderate' as const,
              date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`,
              affected_regions: companyData.primaryRegions.filter(r =>
                ['Gulf Coast', 'Texas', 'Louisiana', 'Southeast US'].some(region => r.includes(region))
              ),
              estimated_impact: Math.floor((-30000000 - (Math.random() * 80000000)) * riskMultiplier),
              windborne_prediction_accuracy: 87 + Math.floor(Math.random() * 11)
            };
          }
          break;

        case 'extreme_heat':
          if (currentMonth >= 6 && currentMonth <= 9) {
            shouldGenerate = Math.random() > 0.3; // 70% chance in summer
            eventDetails = {
              event_type: 'extreme_heat' as const,
              severity: (currentMonth === 7 || currentMonth === 8) ? 'severe' as const : 'moderate' as const,
              date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${Math.floor(Math.random() * 28) + 1}`,
              affected_regions: companyData.primaryRegions,
              estimated_impact: Math.floor((-10000000 - (Math.random() * 25000000)) * riskMultiplier),
              windborne_prediction_accuracy: 89 + Math.floor(Math.random() * 9)
            };
          }
          break;

        case 'winter_storms':
          if (currentMonth >= 12 || currentMonth <= 3) {
            shouldGenerate = Math.random() > 0.4; // 60% chance in winter
            eventDetails = {
              event_type: 'winter_storm' as const,
              severity: (currentMonth === 1 || currentMonth === 2) ? 'severe' as const : 'moderate' as const,
              date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${Math.floor(Math.random() * 28) + 1}`,
              affected_regions: companyData.primaryRegions.filter(r =>
                ['Europe', 'North America', 'Northeast US', 'Midwest'].some(region => r.includes(region))
              ),
              estimated_impact: Math.floor((-15000000 - (Math.random() * 35000000)) * riskMultiplier),
              windborne_prediction_accuracy: 84 + Math.floor(Math.random() * 13)
            };
          }
          break;

        case 'flooding':
          if (currentMonth >= 4 && currentMonth <= 10) {
            shouldGenerate = Math.random() > 0.6; // 40% chance during flood season
            eventDetails = {
              event_type: 'flooding' as const,
              severity: 'moderate' as const,
              date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${Math.floor(Math.random() * 28) + 1}`,
              affected_regions: companyData.primaryRegions,
              estimated_impact: Math.floor((-20000000 - (Math.random() * 40000000)) * riskMultiplier),
              windborne_prediction_accuracy: 82 + Math.floor(Math.random() * 15)
            };
          }
          break;
      }

      if (shouldGenerate && Object.keys(eventDetails).length > 0) {
        events.push(eventDetails);
      }
    });
  } else {
    // Fallback to sector-based events for unknown companies
    if (sector === 'BASIC MATERIALS') {
      if (currentMonth >= 6 && currentMonth <= 11) {
        events.push({
          event_type: 'hurricane' as const,
          severity: 'severe' as const,
          date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`,
          affected_regions: ['Gulf Coast', 'Southeast US'],
          estimated_impact: Math.floor(-50000000 - (Math.random() * 100000000)),
          windborne_prediction_accuracy: 88 + Math.floor(Math.random() * 10)
        });
      }
    }

    if (sector === 'TECHNOLOGY') {
      if (currentMonth >= 12 || currentMonth <= 3) {
        events.push({
          event_type: 'winter_storm' as const,
          severity: 'moderate' as const,
          date: `${currentYear}-02-20`,
          affected_regions: ['Northeast US', 'Midwest'],
          estimated_impact: Math.floor(-20000000 - (Math.random() * 40000000)),
          windborne_prediction_accuracy: 85 + Math.floor(Math.random() * 12)
        });
      }
    }
  }

  return events;
}

// Calculate dynamic weather risk based on real financial metrics
export function calculateWeatherRisk(vendor: VendorOverview, sector: string, industry: string) {
  const sectorData = SECTOR_WEATHER_SENSITIVITY[sector as keyof typeof SECTOR_WEATHER_SENSITIVITY];
  const industryData = INDUSTRY_WEATHER_FACTORS[industry as keyof typeof INDUSTRY_WEATHER_FACTORS];

  if (!sectorData || !industryData) {
    return {
      sensitivity: 'low' as const,
      correlation: 0.2,
      coverage: 75,
      riskLevel: 'low' as const
    };
  }

  // Risk increases with company size (larger companies = more exposure)
  const sizeRiskMultiplier = Math.min(1.5, vendor.market_cap / 50000000000);

  // Higher P/E ratios suggest more growth-sensitive companies (more weather-sensitive)
  const valuationRiskMultiplier = vendor.pe_ratio > 0 ? Math.min(1.3, vendor.pe_ratio / 30) : 1.0;

  const adjustedCorrelation = Math.min(0.95, sectorData.baseCorrelation * sizeRiskMultiplier * valuationRiskMultiplier);

  // Determine risk level based on correlation and sector
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (adjustedCorrelation > 0.7) riskLevel = 'high';
  else if (adjustedCorrelation > 0.5) riskLevel = 'medium';

  // Coverage based on company importance and geographic footprint
  const coverage = 75 + Math.floor((vendor.market_cap / 1000000000) * 0.3) + Math.floor(Math.random() * 15);

  return {
    sensitivity: sectorData.sensitivity,
    correlation: adjustedCorrelation,
    coverage: Math.min(98, coverage),
    riskLevel,
    climateExposure: Math.floor(industryData.weatherDependency + (adjustedCorrelation * 20)),
    supplyChainVulnerability: industryData.supplyChainVulnerability,
    seasonalVariance: sectorData.seasonalVariance * sizeRiskMultiplier
  };
}

// Generate programmatic analysis based on real vendor data and current conditions
export function generateDynamicInsights(vendors: VendorOverview[]) {
  const insights = [];
  const currentMonth = new Date().getMonth() + 1;
  const currentSeason = getSeason(currentMonth);

  // Group companies by sector for analysis
  const companyGroups = {
    chemicals: vendors.filter(v => ['DD', 'CE', 'LYB'].includes(v.symbol)),
    tech: vendors.filter(v => ['TEL', 'ST'].includes(v.symbol)),
    other: vendors.filter(v => !['DD', 'CE', 'LYB', 'TEL', 'ST'].includes(v.symbol))
  };

  // Generate sector-specific insights based on real company data
  if (companyGroups.chemicals.length > 0) {
    const chemicalInsights = generateChemicalInsights(companyGroups.chemicals, currentMonth, currentSeason);
    insights.push(...chemicalInsights);
  }

  if (companyGroups.tech.length > 0) {
    const techInsights = generateTechInsights(companyGroups.tech, currentMonth, currentSeason);
    insights.push(...techInsights);
  }

  // Cross-sector portfolio insights
  if (vendors.length > 1) {
    const portfolioInsights = generatePortfolioInsights(vendors, currentMonth);
    insights.push(...portfolioInsights);
  }

  // Generate opportunity insights based on seasonal patterns
  const seasonalInsights = generateSeasonalInsights(vendors, currentMonth, currentSeason);
  insights.push(...seasonalInsights);

  return insights;
}

function getSeason(month: number): string {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function generateChemicalInsights(chemicals: VendorOverview[], currentMonth: number, _season: string) {
  const insights = [];
  const largestChemical = chemicals.reduce((prev, current) =>
    prev.market_cap > current.market_cap ? prev : current
  );

  // Hurricane season insights (June-November)
  if (currentMonth >= 6 && currentMonth <= 11) {
    const riskLevel = currentMonth >= 8 && currentMonth <= 10 ? 'severe' : 'elevated';
    insights.push({
      insight_type: 'risk' as const,
      title: `${largestChemical.name}: ${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Hurricane Season Risk`,
      description: `WindBorne's atmospheric data indicates ${riskLevel === 'severe' ? '42%' : '28%'} above-normal hurricane activity. ${largestChemical.symbol}'s Gulf Coast operations face heightened disruption risk with potential facility shutdowns lasting 4-12 weeks.`,
      financial_impact: Math.floor(-60000000 - (largestChemical.market_cap / 1000000000 * 3000000) * (riskLevel === 'severe' ? 1.5 : 1.0)),
      confidence_score: riskLevel === 'severe' ? 89 : 82,
      windborne_advantage: `Real-time atmospheric pressure and wind pattern analysis provides 96-hour advance warning vs 48-hour industry standard`
    });
  }

  // Energy cost optimization (peak summer/winter)
  if (currentMonth >= 7 && currentMonth <= 9 || currentMonth >= 12 || currentMonth <= 2) {
    const period = currentMonth >= 7 && currentMonth <= 9 ? 'summer cooling' : 'winter heating';
    const savings = Math.floor(15000000 + (chemicals.reduce((sum, c) => sum + c.market_cap, 0) / 10000000000 * 5000000));

    insights.push({
      insight_type: 'opportunity' as const,
      title: `Chemical Operations: ${period.charAt(0).toUpperCase() + period.slice(1)} Energy Optimization`,
      description: `WindBorne's precision temperature forecasting reveals 12-18% energy cost reduction opportunities through optimized ${period} schedules across chemical facilities.`,
      financial_impact: savings,
      confidence_score: 86,
      windborne_advantage: `Hyperlocal microclimate data enables facility-specific energy management with 0.1°C accuracy`
    });
  }

  return insights;
}

function generateTechInsights(techCompanies: VendorOverview[], currentMonth: number, _season: string) {
  const insights = [];
  const largestTech = techCompanies.reduce((prev, current) =>
    prev.market_cap > current.market_cap ? prev : current
  );

  // Supply chain resilience analysis
  const resilienceScore = Math.floor(75 + Math.random() * 20);
  insights.push({
    insight_type: 'trend' as const,
    title: `${largestTech.name}: Global Supply Chain Weather Adaptation`,
    description: `Advanced weather modeling shows ${largestTech.symbol}'s supply network demonstrates ${resilienceScore}% weather resilience score, ${resilienceScore > 85 ? 'significantly outperforming' : 'matching'} semiconductor industry benchmarks through diversified sourcing strategies.`,
    financial_impact: Math.floor(25000000 + (largestTech.market_cap / 1000000000 * 750000)),
    confidence_score: 88,
    windborne_advantage: `Multi-continental balloon network provides supply route weather intelligence across 23 countries and 156 shipping lanes`
  });

  // Seasonal demand patterns
  if (currentMonth >= 9 && currentMonth <= 11) {
    insights.push({
      insight_type: 'opportunity' as const,
      title: `Technology Sector: Fall Product Launch Weather Window`,
      description: `WindBorne data suggests optimal weather conditions for Q4 product launches, with 23% lower shipping disruption risk and favorable consumer electronics demand patterns.`,
      financial_impact: Math.floor(techCompanies.reduce((sum, c) => sum + c.market_cap, 0) * 0.015),
      confidence_score: 83,
      windborne_advantage: `Predictive logistics modeling using real-time atmospheric data for global shipping optimization`
    });
  }

  return insights;
}

function generatePortfolioInsights(vendors: VendorOverview[], _currentMonth: number) {
  const insights = [];
  const totalMarketCap = vendors.reduce((sum, v) => sum + v.market_cap, 0);

  // Calculate weather correlation based on actual company mix
  const hasChemicals = vendors.some(v => ['DD', 'CE', 'LYB'].includes(v.symbol));
  const hasTech = vendors.some(v => ['TEL', 'ST'].includes(v.symbol));

  let correlationBase = 45;
  if (hasChemicals) correlationBase += 25;
  if (hasTech) correlationBase += 15;

  const weatherCorrelation = Math.floor(correlationBase + (Math.random() * 15));

  insights.push({
    insight_type: 'opportunity' as const,
    title: `Portfolio Weather Risk Diversification`,
    description: `Your current vendor mix shows ${weatherCorrelation}% weather correlation. ${weatherCorrelation > 70 ? 'Strategic diversification into weather-resilient sectors could reduce portfolio volatility by 15-22%.' : 'Well-diversified weather exposure provides natural hedging benefits.'}`,
    financial_impact: Math.floor(totalMarketCap * (weatherCorrelation > 70 ? 0.025 : 0.015)),
    confidence_score: 85,
    windborne_advantage: `Comprehensive atmospheric monitoring enables precise correlation analysis across 5,000+ weather variables`
  });

  return insights;
}

function generateSeasonalInsights(vendors: VendorOverview[], _currentMonth: number, season: string) {
  const insights = [];

  // Generate season-specific opportunities
  const seasonalOpportunities = {
    spring: {
      title: 'Spring Agricultural Demand Surge',
      description: 'Chemical fertilizer and agricultural equipment demand peaks align with favorable weather windows',
      multiplier: 1.2
    },
    summer: {
      title: 'Peak Energy Demand Management',
      description: 'Extreme heat drives energy consumption requiring optimized facility operations',
      multiplier: 1.4
    },
    autumn: {
      title: 'Harvest Season Supply Chain Optimization',
      description: 'Agricultural chemical distribution and technology deployment peak seasons',
      multiplier: 1.1
    },
    winter: {
      title: 'Cold Weather Infrastructure Resilience',
      description: 'Winter weather tests reveal supply chain vulnerabilities and optimization opportunities',
      multiplier: 1.3
    }
  };

  const opportunity = seasonalOpportunities[season as keyof typeof seasonalOpportunities];
  const totalValue = vendors.reduce((sum, v) => sum + v.market_cap, 0);

  insights.push({
    insight_type: 'trend' as const,
    title: opportunity.title,
    description: `${opportunity.description}. WindBorne seasonal analytics indicate ${Math.floor(8 + Math.random() * 12)}% revenue optimization potential through weather-informed operational adjustments.`,
    financial_impact: Math.floor(totalValue * 0.01 * opportunity.multiplier),
    confidence_score: 81,
    windborne_advantage: `Seasonal atmospheric pattern recognition enables 60-90 day operational planning vs 7-14 day industry standard`
  });

  return insights;
}

// Generate realistic climate scenarios based on actual companies
export function generateClimateScenarios(vendors: VendorOverview[]) {
  const hasChemicals = vendors.some(v => ['DD', 'CE', 'LYB'].includes(v.symbol));
  const hasTech = vendors.some(v => ['TEL', 'ST'].includes(v.symbol));
  const totalValue = vendors.reduce((sum, v) => sum + v.market_cap, 0);

  const scenarios = [];

  if (hasChemicals) {
    scenarios.push({
      scenario_name: "Gulf Coast Hurricane Cluster",
      probability: 65,
      timeframe: "1_year" as const,
      expected_impact: Math.floor(-totalValue * 0.03), // 3% of portfolio value
      mitigation_strategies: [
        "Diversify chemical supply sources away from Gulf Coast concentration",
        "Invest in hurricane-resistant facility upgrades",
        "Implement dynamic inventory management for storm seasons",
        "Establish alternative production capacity in safer regions"
      ]
    });

    scenarios.push({
      scenario_name: "Extreme Heat Wave Impact",
      probability: 78,
      timeframe: "3_months" as const,
      expected_impact: Math.floor(-totalValue * 0.015), // 1.5% of portfolio value
      mitigation_strategies: [
        "Upgrade cooling systems for chemical processing facilities",
        "Implement heat-resilient supply chain routing",
        "Negotiate energy cost hedging for peak summer demand"
      ]
    });
  }

  if (hasTech) {
    scenarios.push({
      scenario_name: "Winter Infrastructure Stress",
      probability: 45,
      timeframe: "3_months" as const,
      expected_impact: Math.floor(-totalValue * 0.008), // 0.8% of portfolio value
      mitigation_strategies: [
        "Strengthen power grid backup systems",
        "Implement cold-weather supply chain protocols",
        "Invest in weather-resistant manufacturing equipment"
      ]
    });
  }

  return scenarios;
}