import React, { useState, useCallback } from 'react';
import { Grid, BarChart3, Settings, Filter, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onRefreshData?: () => void;
  onToggleFilters?: () => void;
  onBackToClassic?: () => void;
  showFilters?: boolean;
}

export function DashboardLayout({
  children,
  onRefreshData,
  onToggleFilters,
  onBackToClassic,
  showFilters = false
}: DashboardLayoutProps) {
  const [isConfigMode, setIsConfigMode] = useState(false);

  const handleConfigMode = useCallback(() => {
    setIsConfigMode(!isConfigMode);
  }, [isConfigMode]);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {onBackToClassic && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToClassic}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Classic
              </Button>
            )}
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-slate-800">Analytics Dashboard</span>
          </div>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFilters}
              className={showFilters ? 'bg-blue-50 text-blue-600' : ''}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
            <Button variant="ghost" size="sm" onClick={onRefreshData}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={isConfigMode ? 'primary' : 'ghost'}
            size="sm"
            onClick={handleConfigMode}
          >
            <Settings className="h-4 w-4 mr-1" />
            {isConfigMode ? 'Exit Config' : 'Configure'}
          </Button>
        </div>
      </div>

      {/* Main Dashboard Area */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Filters Panel (collapsible) */}
          {showFilters && (
            <div className="w-80 bg-white border-r border-slate-200 p-4 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Date Range</h3>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm">
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Last year</option>
                    <option>All time</option>
                  </select>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Metrics</h3>
                  <div className="space-y-2">
                    {['Market Cap', 'Revenue', 'P/E Ratio', 'EBITDA', 'Weather Impact'].map(metric => (
                      <label key={metric} className="flex items-center text-sm">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        {metric}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Sectors</h3>
                  <div className="space-y-2">
                    {['Technology', 'Healthcare', 'Finance', 'Energy', 'Manufacturing'].map(sector => (
                      <label key={sector} className="flex items-center text-sm">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        {sector}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto">
            {isConfigMode && (
              <div className="bg-blue-50 border-b border-blue-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Grid className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Dashboard Configuration Mode</span>
                  </div>
                  <span className="text-xs text-blue-600">Drag and resize widgets to customize your layout</span>
                </div>
              </div>
            )}
            <div className={`p-4 ${isConfigMode ? 'bg-slate-50' : ''}`}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}