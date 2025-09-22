import axios from 'axios';
import { 
  VendorOverview, 
  VendorIncomeStatement, 
  VendorDailySeries, 
  VendorSearchResponse 
} from '../types/vendor';
import { 
  mockVendorOverviews, 
  mockIncomeStatement, 
  mockDailySeries, 
  mockSearchResults 
} from './mockData';
// import { weatherImpactData } from './weatherFinanceData';

// API base URL - uses environment variable for production deployment
// Example: VITE_API_URL=https://windborne-api.onrender.com
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Global flag to control mock mode with localStorage persistence
let useMockData = localStorage.getItem('windborne-mock-mode') === 'true';

export const setMockMode = (enabled: boolean) => {
  useMockData = enabled;
  localStorage.setItem('windborne-mock-mode', enabled.toString());
  console.log(`💾 Mock mode ${enabled ? 'enabled' : 'disabled'} and saved to localStorage`);
};

export const getMockMode = () => useMockData;

export const vendorApi = {
  getOverview: (ticker: string): Promise<VendorOverview> => {
    if (useMockData) {
      if (import.meta.env.DEV) {
        console.log(`🎭 Mock mode: Fetching overview for ${ticker}`);
      }
      const mockData = mockVendorOverviews.find(v => v.symbol === ticker.toUpperCase());
      const result = mockData || mockVendorOverviews[0];
      return Promise.resolve(result);
    }
    return api.get(`/vendor/${ticker}/overview`).then(res => res.data);
  },
    
  getIncomeStatement: (ticker: string): Promise<VendorIncomeStatement> => {
    if (useMockData) {
      if (import.meta.env.DEV) {
        console.log(`🎭 Mock mode: Fetching income statement for ${ticker}`);
      }
      return Promise.resolve(mockIncomeStatement(ticker.toUpperCase()));
    }
    return api.get(`/vendor/${ticker}/income-statement`).then(res => res.data);
  },
    
  getDailySeries: (ticker: string): Promise<VendorDailySeries> => {
    if (useMockData) {
      if (import.meta.env.DEV) {
        console.log(`🎭 Mock mode: Fetching daily series for ${ticker}`);
      }
      return Promise.resolve(mockDailySeries(ticker.toUpperCase()));
    }
    return api.get(`/vendor/${ticker}/daily-series`).then(res => res.data);
  },
    
  searchVendors: (keywords: string): Promise<VendorSearchResponse> => {
    if (useMockData) {
      if (import.meta.env.DEV) {
        console.log(`🎭 Mock mode: Searching for "${keywords}"`);
      }
      return Promise.resolve(mockSearchResults(keywords));
    }
    return api.get(`/search/${keywords}`).then(res => res.data);
  },
};

export default api;