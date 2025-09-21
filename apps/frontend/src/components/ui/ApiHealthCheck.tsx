import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import axios from 'axios';

const healthApi = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 5000,
});

export function ApiHealthCheck() {
  const { isLoading, isError } = useQuery({
    queryKey: ['apiHealth'],
    queryFn: () => healthApi.get('/').then(res => res.data),
    retry: 1,
    throwOnError: false,
    refetchInterval: 30000, // Check every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center text-slate-500 text-sm">
        <Clock className="h-4 w-4 mr-2" />
        Checking API...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center text-red-500 text-sm">
        <XCircle className="h-4 w-4 mr-2" />
        API Offline
      </div>
    );
  }

  return (
    <div className="flex items-center text-green-500 text-sm">
      <CheckCircle className="h-4 w-4 mr-2" />
      API Connected
    </div>
  );
}