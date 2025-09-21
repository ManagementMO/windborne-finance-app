import axios from 'axios';
import { 
  VendorOverview, 
  VendorIncomeStatement, 
  VendorDailySeries, 
  VendorSearchResponse 
} from '../types/vendor';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  timeout: 10000,
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

export const vendorApi = {
  getOverview: (ticker: string): Promise<VendorOverview> =>
    api.get(`/vendor/${ticker}/overview`).then(res => res.data),
    
  getIncomeStatement: (ticker: string): Promise<VendorIncomeStatement> =>
    api.get(`/vendor/${ticker}/income-statement`).then(res => res.data),
    
  getDailySeries: (ticker: string): Promise<VendorDailySeries> =>
    api.get(`/vendor/${ticker}/daily-series`).then(res => res.data),
    
  searchVendors: (keywords: string): Promise<VendorSearchResponse> =>
    api.get(`/search/${keywords}`).then(res => res.data),
};

export default api;