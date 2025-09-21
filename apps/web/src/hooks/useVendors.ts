// src/hooks/useVendors.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { VendorOverview } from '../types/vendors';

const VENDOR_TICKERS = ['TEL', 'ST', 'DD', 'CE', 'LYB'];

const fetchVendorOverview = async (ticker: string): Promise<VendorOverview> => {
const { data } = await apiClient.get(`/vendor/${ticker}/overview`);
return data;
};

export const useVendors = () => {
return useQuery({
    queryKey: ['vendors', VENDOR_TICKERS],
    queryFn: async () => {
    const vendorPromises = VENDOR_TICKERS.map(ticker => fetchVendorOverview(ticker));
    const results = await Promise.allSettled(vendorPromises);
    
      // Log errors for any rejected promises
    results.forEach(result => {
        if (result.status === 'rejected') {
        console.error(`Failed to fetch data for a ticker:`, result.reason);
        }
    });

      // Filter out rejected promises and return the data from fulfilled ones
    return results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<VendorOverview>).value);
    },
    // Optional: Refetch data every 5 minutes
    refetchInterval: 5 * 60 * 1000,
});
};