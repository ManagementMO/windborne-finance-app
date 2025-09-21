import { useState, useMemo } from 'react';
import { TrendingUp, AlertTriangle, Target, Zap, Wind } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { weatherImpactData, weatherFinanceInsights, climateScenarios } from '../../lib/weatherFinanceData';
import { formatCurrency, formatNumber } from '../../lib/utils';
// import { WeatherImpactData, WeatherFinanceInsight } from '../../types/weather-finance';

interface WeatherFinanceInsightsProps {
  activeVendors: string[];
}

export function WeatherFinanceInsights({ activeVendors }: WeatherFinanceInsightsProps) {
  const [selectedTab, setSelectedTab] = useState<'impact' | 'insights' | 'scenarios'>('impact');

  // Filter data for active vendors (memoized for performance)
  const relevantWeatherData = useMemo(() => 
    weatherImpactData.filter(data => activeVendors.includes(data.symbol)),
    [activeVendors]
  );

  // Early return if no relevant data
  if (relevantWeatherData.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Wind className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-blue-900">
              WindBorne Weather-Finance Intelligence
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Wind className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Weather Intelligence Ready
            </h3>
            <p className="text-blue-700">
              Add vendors to see comprehensive weather-finance analysis powered by WindBorne's balloon network.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getWeatherSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'risk': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'trend': return <Target className="h-4 w-4 text-blue-600" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  // Memoize expensive calculations
  const { totalWeatherImpact, averageBalloonCoverage } = useMemo(() => {
    const totalImpact = relevantWeatherData.reduce((sum, data) => {
      return sum + data.recent_weather_events.reduce((eventSum, event) => eventSum + event.estimated_impact, 0);
    }, 0);

    const avgCoverage = relevantWeatherData.length > 0 
      ? relevantWeatherData.reduce((sum, data) => sum + data.balloon_coverage_score, 0) / relevantWeatherData.length 
      : 0;

    return {
      totalWeatherImpact: totalImpact,
      averageBalloonCoverage: avgCoverage
    };
  }, [relevantWeatherData]);

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Wind className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-blue-900">
              WindBorne Weather-Finance Intelligence
            </CardTitle>
          </div>
          <Badge variant="info" className="bg-blue-100 text-blue-800">
            🎈 Powered by {Math.floor(averageBalloonCoverage)}% Balloon Coverage
          </Badge>
        </div>
        
        <div className="flex space-x-2 mt-4" role="tablist" aria-label="Weather Finance Analysis Tabs">
          <Button
            variant={selectedTab === 'impact' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedTab('impact')}
            role="tab"
            aria-selected={selectedTab === 'impact'}
            aria-controls="weather-impact-panel"
          >
            Weather Impact
          </Button>
          <Button
            variant={selectedTab === 'insights' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedTab('insights')}
            role="tab"
            aria-selected={selectedTab === 'insights'}
            aria-controls="ai-insights-panel"
          >
            AI Insights
          </Button>
          <Button
            variant={selectedTab === 'scenarios' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedTab('scenarios')}
            role="tab"
            aria-selected={selectedTab === 'scenarios'}
            aria-controls="climate-scenarios-panel"
          >
            Climate Scenarios
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-blue-600 uppercase tracking-wider font-medium">Total Weather Impact</p>
            <p className={`text-lg font-bold ${totalWeatherImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalWeatherImpact)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-blue-600 uppercase tracking-wider font-medium">WindBorne Coverage</p>
            <p className="text-lg font-bold text-blue-600">
              {formatNumber(averageBalloonCoverage, 0)}%
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-blue-600 uppercase tracking-wider font-medium">High-Risk Companies</p>
            <p className="text-lg font-bold text-amber-600">
              {relevantWeatherData.filter(d => d.risk_metrics.next_30_days_risk === 'high').length}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        {selectedTab === 'impact' && (
          <div className="space-y-4" role="tabpanel" id="weather-impact-panel" aria-labelledby="impact-tab">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Weather Impact Analysis</h3>
            {relevantWeatherData.map((data) => (
              <div key={data.symbol} className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-800">{data.company_name}</h4>
                    <p className="text-sm text-slate-600">{data.symbol} • {data.sector}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant={getWeatherSensitivityColor(data.weather_sensitivity)}>
                      {data.weather_sensitivity} sensitivity
                    </Badge>
                    <Badge variant={getRiskColor(data.risk_metrics.next_30_days_risk)}>
                      {data.risk_metrics.next_30_days_risk} risk
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500">Revenue Correlation</p>
                    <p className="font-medium">{formatNumber(data.revenue_correlation * 100, 0)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Balloon Coverage</p>
                    <p className="font-medium text-blue-600">{data.balloon_coverage_score}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Climate Exposure</p>
                    <p className="font-medium">{data.risk_metrics.climate_trend_exposure}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Seasonal Variance</p>
                    <p className="font-medium">{formatNumber(data.risk_metrics.seasonal_revenue_variance, 1)}%</p>
                  </div>
                </div>

                {data.recent_weather_events.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Recent Weather Events:</p>
                    <div className="space-y-2">
                      {data.recent_weather_events.slice(0, 2).map((event, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm bg-slate-50 rounded p-2">
                          <div>
                            <span className="font-medium capitalize">{event.event_type.replace('_', ' ')}</span>
                            <span className="text-slate-500 ml-2">• {event.severity}</span>
                          </div>
                          <div className="text-right">
                            <div className={`font-medium ${event.estimated_impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(event.estimated_impact)}
                            </div>
                            <div className="text-xs text-blue-600">
                              {event.windborne_prediction_accuracy}% accuracy
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'insights' && (
          <div className="space-y-4" role="tabpanel" id="ai-insights-panel" aria-labelledby="insights-tab">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">AI-Powered Financial Insights</h3>
            {weatherFinanceInsights.map((insight, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">{getInsightIcon(insight.insight_type)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-slate-800">{insight.title}</h4>
                      <div className="text-right">
                        <div className={`font-bold ${insight.financial_impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(insight.financial_impact)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {insight.confidence_score}% confidence
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{insight.description}</p>
                    <div className="bg-blue-50 rounded p-3">
                      <p className="text-xs text-blue-700 font-medium mb-1">WindBorne Advantage:</p>
                      <p className="text-xs text-blue-600">{insight.windborne_advantage}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'scenarios' && (
          <div className="space-y-4" role="tabpanel" id="climate-scenarios-panel" aria-labelledby="scenarios-tab">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Climate Risk Scenarios</h3>
            {climateScenarios.map((scenario, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-800">{scenario.scenario_name}</h4>
                    <p className="text-sm text-slate-600">{scenario.timeframe.replace('_', ' ')} outlook</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">
                      {formatCurrency(scenario.expected_impact)}
                    </div>
                    <div className="text-sm text-slate-500">
                      {scenario.probability}% probability
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Mitigation Strategies:</p>
                  <ul className="space-y-1">
                    {scenario.mitigation_strategies.map((strategy, strategyIdx) => (
                      <li key={strategyIdx} className="text-sm text-slate-600 flex items-center">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                        {strategy}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}