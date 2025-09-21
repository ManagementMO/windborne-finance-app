import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, Database } from 'lucide-react';
import axios from 'axios';
import { setMockMode } from '../../lib/api';
import { useMockMode } from '../../hooks/useMockMode';

const healthApi = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 5000,
});

export function ApiHealthCheck() {
  const queryClient = useQueryClient();
  const isMockMode = useMockMode();
  
  const { isLoading, isError } = useQuery({
    queryKey: ['apiHealth'],
    queryFn: () => healthApi.get('/').then(res => res.data),
    retry: 1,
    throwOnError: false,
    refetchInterval: 30000, // Check every 30 seconds
    enabled: !isMockMode, // Don't check API health in mock mode
  });

  const handleToggleMockMode = async () => {
    const newMockMode = !isMockMode;
    console.log(`🔄 Toggling mock mode: ${isMockMode} → ${newMockMode}`);
    
    setMockMode(newMockMode);
    
    // Clear all query cache to force refetch with new mode
    await queryClient.invalidateQueries();
    queryClient.clear();
    
    // Small delay to ensure state propagation
    setTimeout(() => {
      console.log(`✅ Mock mode toggled successfully`);
    }, 200);
  };

  if (isLoading && !isMockMode) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-slate-500 text-sm">
          <Clock className="h-4 w-4 mr-2" />
          Checking API...
        </div>
        <button
          onClick={handleToggleMockMode}
          className="px-3 py-1 text-xs bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors"
        >
          Use Mock Data
        </button>
      </div>
    );
  }

  if (isError && !isMockMode) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-red-500 text-sm">
          <XCircle className="h-4 w-4 mr-2" />
          API Offline
        </div>
        <button
          onClick={handleToggleMockMode}
          className="px-3 py-1 text-xs bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors"
        >
          Use Mock Data
        </button>
      </div>
    );
  }

  if (isMockMode) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-amber-600 text-sm font-medium">
          <Database className="h-4 w-4 mr-2" />
          Mock Data Active
        </div>
        <button
          onClick={handleToggleMockMode}
          className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors font-medium"
        >
          Switch to Live API
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center text-green-500 text-sm font-medium">
        <CheckCircle className="h-4 w-4 mr-2" />
        API Connected
      </div>
      <button
        onClick={handleToggleMockMode}
        className="px-3 py-1 text-xs bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors font-medium"
      >
        Use Mock Data
      </button>
    </div>
  );
}