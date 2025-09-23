import { useState } from 'react';
import { AlertTriangle, TrendingUp, Info, Clock } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { VendorOverview } from '../../types/vendor';
import { getFinancialAlerts, FinancialAlert } from '../../lib/utils';

interface FinancialHealthAlertsProps {
  vendors: VendorOverview[];
}

const AlertIcon = ({ type }: { type: FinancialAlert['type'] }) => {
  switch (type) {
    case 'critical':
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    case 'opportunity':
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case 'info':
      return <Info className="h-4 w-4 text-blue-600" />;
    default:
      return <Info className="h-4 w-4 text-slate-600" />;
  }
};

const AlertTypeColors = {
  critical: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  opportunity: 'bg-green-50 border-green-200 text-green-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
};


export function FinancialHealthAlerts({ vendors }: FinancialHealthAlertsProps) {
  const [filterType, setFilterType] = useState<'all' | FinancialAlert['type']>('all');
  const [showActionableOnly, setShowActionableOnly] = useState(false);

  // Collect all alerts from all vendors
  const allAlerts = vendors.flatMap(vendor =>
    getFinancialAlerts(vendor).map(alert => ({
      ...alert,
      vendorSymbol: vendor.symbol,
      vendorName: vendor.name
    }))
  );

  // Filter alerts
  const filteredAlerts = allAlerts.filter(alert => {
    if (filterType !== 'all' && alert.type !== filterType) return false;
    if (showActionableOnly && !alert.actionable) return false;
    return true;
  });

  // Group alerts by severity
  const criticalAlerts = filteredAlerts.filter(a => a.severity >= 8);
  const highAlerts = filteredAlerts.filter(a => a.severity >= 6 && a.severity < 8);
  const mediumAlerts = filteredAlerts.filter(a => a.severity >= 4 && a.severity < 6);
  const lowAlerts = filteredAlerts.filter(a => a.severity < 4);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Financial Health Alerts
            <Badge variant="error" className="ml-2">
              {filteredAlerts.length} Active
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={showActionableOnly ? "primary" : "outline"}
              size="sm"
              onClick={() => setShowActionableOnly(!showActionableOnly)}
              className="text-xs"
            >
              Actionable Only
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mt-4">
          {(['all', 'critical', 'warning', 'opportunity', 'info'] as const).map(type => (
            <Button
              key={type}
              variant={filterType === type ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterType(type)}
              className="text-xs capitalize"
            >
              {type === 'all' ? 'All' : type}
              <span className="ml-1 text-xs">
                ({type === 'all' ? allAlerts.length : allAlerts.filter(a => a.type === type).length})
              </span>
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Critical ({criticalAlerts.length})
              </h4>
              <div className="space-y-2">
                {criticalAlerts.map((alert, index) => (
                  <div
                    key={`${alert.id}-${index}`}
                    className={`p-3 rounded-lg border ${AlertTypeColors[alert.type]}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertIcon type={alert.type} />
                          <span className="font-medium text-sm">{alert.vendorSymbol}</span>
                          <Badge variant="info" className="text-xs">
                            {alert.category}
                          </Badge>
                          {alert.actionable && (
                            <Badge variant="warning" className="text-xs">
                              Action Required
                            </Badge>
                          )}
                        </div>
                        <h5 className="font-semibold text-sm mb-1">{alert.title}</h5>
                        <p className="text-sm mb-2">{alert.message}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.timeframe}
                          </span>
                          <span>Severity: {alert.severity}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* High Priority Alerts */}
          {highAlerts.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                High Priority ({highAlerts.length})
              </h4>
              <div className="space-y-2">
                {highAlerts.map((alert, index) => (
                  <div
                    key={`${alert.id}-${index}`}
                    className={`p-3 rounded-lg border ${AlertTypeColors[alert.type]}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <AlertIcon type={alert.type} />
                      <span className="font-medium text-sm">{alert.vendorSymbol}</span>
                      <span className="text-xs text-slate-600">{alert.title}</span>
                      {alert.actionable && (
                        <Badge variant="warning" className="text-xs ml-auto">
                          Actionable
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-700">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medium & Low Priority (Collapsed) */}
          {(mediumAlerts.length > 0 || lowAlerts.length > 0) && (
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-2">
                Other Alerts ({mediumAlerts.length + lowAlerts.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[...mediumAlerts, ...lowAlerts].map((alert, index) => (
                  <div
                    key={`${alert.id}-${index}`}
                    className="p-2 rounded border border-slate-200 bg-slate-50"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{alert.vendorSymbol}</span>
                      <Badge
                        variant={alert.type === 'critical' ? 'error' : alert.type === 'opportunity' ? 'success' : alert.type}
                        className="text-xs"
                      >
                        {alert.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{alert.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredAlerts.length === 0 && (
            <div className="text-center py-8">
              <div className="text-green-600 mb-2">
                <TrendingUp className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                All Clear!
              </h3>
              <p className="text-slate-600">
                No financial health alerts match your current filters.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default FinancialHealthAlerts;