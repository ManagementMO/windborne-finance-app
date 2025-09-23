import { useMemo } from 'react';
import { TrendingUp, Target, BarChart3, Award, Info, Zap } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { VendorOverview } from '../../types/vendor';
import { getPeerComparison, formatNumber, formatCurrency } from '../../lib/utils';

interface PeerComparisonProps {
  vendors: VendorOverview[];
}

const RankingColors = {
  'top-quartile': 'bg-green-100 text-green-800 border-green-200',
  'above-average': 'bg-blue-100 text-blue-800 border-blue-200',
  'below-average': 'bg-amber-100 text-amber-800 border-amber-200',
  'bottom-quartile': 'bg-red-100 text-red-800 border-red-200'
};

const RankingIcons = {
  'top-quartile': <Award className="h-4 w-4" />,
  'above-average': <TrendingUp className="h-4 w-4" />,
  'below-average': <Target className="h-4 w-4" />,
  'bottom-quartile': <BarChart3 className="h-4 w-4" />
};

function PercentileBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium">{formatNumber(value, 0)}th percentile</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            value >= 75 ? 'bg-green-500' :
            value >= 50 ? 'bg-blue-500' :
            value >= 25 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${Math.max(5, value)}%` }}
        />
      </div>
    </div>
  );
}

export function PeerComparison({ vendors }: PeerComparisonProps) {
  const peerComparisons = useMemo(() => {
    return vendors.map(vendor => getPeerComparison(vendor));
  }, [vendors]);

  // Group by industry
  const byIndustry = useMemo(() => {
    const groups: Record<string, typeof peerComparisons> = {};
    peerComparisons.forEach(comparison => {
      const industry = comparison.industry.industry;
      if (!groups[industry]) {
        groups[industry] = [];
      }
      groups[industry].push(comparison);
    });
    return groups;
  }, [peerComparisons]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Peer Comparison & Industry Benchmarking
          <Badge variant="info" className="ml-2">
            {Object.keys(byIndustry).length} Industries
          </Badge>
        </CardTitle>
        <p className="text-sm text-slate-600">
          Compare vendor performance against industry benchmarks and peer companies
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {Object.entries(byIndustry).map(([industryName, comparisons]) => {
            const industry = comparisons[0].industry;

            return (
              <div key={industryName} className="border rounded-lg p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-800">{industryName}</h3>
                    <p className="text-sm text-slate-600">
                      Sector: {industry.sector} • {industry.companies} companies tracked
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="info" className="mb-1">
                      Volatility: {industry.volatilityIndex}/10
                    </Badge>
                  </div>
                </div>

                {/* Industry Benchmarks */}
                <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-white rounded border">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Avg P/E Ratio</p>
                    <p className="text-lg font-bold text-slate-800">{formatNumber(industry.avgPeRatio, 1)}x</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Avg Market Cap</p>
                    <p className="text-lg font-bold text-slate-800">${formatNumber(industry.avgMarketCap, 1)}B</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Avg EBITDA Margin</p>
                    <p className="text-lg font-bold text-slate-800">{formatNumber(industry.avgEbitdaMargin, 1)}%</p>
                  </div>
                </div>

                {/* Company Comparisons */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {comparisons.map(comparison => (
                    <div key={comparison.vendor.symbol} className="bg-white rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-800">{comparison.vendor.symbol}</h4>
                          <p className="text-sm text-slate-600 truncate">{comparison.vendor.name}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full border text-xs font-medium ${RankingColors[comparison.overallRanking]}`}>
                          <div className="flex items-center gap-1">
                            {RankingIcons[comparison.overallRanking]}
                            {comparison.overallRanking.replace('-', ' ')}
                          </div>
                        </div>
                      </div>

                      {/* Current Metrics */}
                      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                        <div className="text-center">
                          <p className="text-slate-500">P/E Ratio</p>
                          <p className="font-semibold">
                            {comparison.vendor.pe_ratio > 0 ? formatNumber(comparison.vendor.pe_ratio, 1) : 'N/A'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-500">Market Cap</p>
                          <p className="font-semibold">{formatCurrency(comparison.vendor.market_cap)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-500">EBITDA</p>
                          <p className="font-semibold">{formatCurrency(comparison.vendor.ebitda)}</p>
                        </div>
                      </div>

                      {/* Percentile Rankings */}
                      <div className="space-y-2 mb-4">
                        {comparison.vendor.pe_ratio > 0 && (
                          <PercentileBar
                            value={comparison.pePercentile}
                            label="P/E Ratio vs Peers"
                          />
                        )}
                        <PercentileBar
                          value={comparison.marketCapPercentile}
                          label="Market Cap vs Peers"
                        />
                        {comparison.ebitdaMarginPercentile > 0 && (
                          <PercentileBar
                            value={comparison.ebitdaMarginPercentile}
                            label="EBITDA Margin vs Peers"
                          />
                        )}
                      </div>

                      {/* Key Insights */}
                      {comparison.insights.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            Key Insights
                          </h5>
                          <div className="space-y-1">
                            {comparison.insights.map((insight, index) => (
                              <p key={index} className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                                {insight}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Portfolio Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-blue-600 font-medium">Top Quartile</p>
              <p className="text-blue-800">
                {peerComparisons.filter(c => c.overallRanking === 'top-quartile').length} companies
              </p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Above Average</p>
              <p className="text-blue-800">
                {peerComparisons.filter(c => c.overallRanking === 'above-average').length} companies
              </p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Below Average</p>
              <p className="text-blue-800">
                {peerComparisons.filter(c => c.overallRanking === 'below-average').length} companies
              </p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Bottom Quartile</p>
              <p className="text-blue-800">
                {peerComparisons.filter(c => c.overallRanking === 'bottom-quartile').length} companies
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PeerComparison;