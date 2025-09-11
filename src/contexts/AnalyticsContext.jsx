import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  adminAPI, 
  advertiserAPI, 
  walletAPI, 
  paymentAPI, 
  qualityAPI, 
  notificationAPI,
  chatAPI
} from '../services/api';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children, userRole }) => {
  const [analyticsData, setAnalyticsData] = useState({
    admin: null,
    advertiser: null,
    publisher: null,
    payment: null,
    quality: null,
    notifications: null,
    chat: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load analytics based on user role
  const loadAnalytics = async (role = userRole, params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      let data = {};
      
      switch (role) {
        case 'admin':
          const [adminData, paymentData, qualityData, notificationData] = await Promise.all([
            adminAPI.getAnalytics(params),
            paymentAPI.adminGetPaymentAnalytics(params),
            qualityAPI.getQualityAnalytics(params),
            notificationAPI.adminGetAnalytics(params)
          ]);
          
          data = {
            admin: adminData.data,
            payment: paymentData.data,
            quality: qualityData.data,
            notifications: notificationData.data
          };
          break;
          
        case 'advertiser':
          const [advertiserData, advertiserPaymentData] = await Promise.all([
            advertiserAPI.getAnalytics(params),
            walletAPI.getEarningsAnalytics()
          ]);
          
          data = {
            advertiser: advertiserData.data,
            payment: advertiserPaymentData.data
          };
          break;
          
        case 'publisher':
          const [publisherData, publisherPaymentData] = await Promise.all([
            walletAPI.getEarningsAnalytics(),
            paymentAPI.adminGetPaymentAnalytics(params)
          ]);
          
          data = {
            publisher: publisherData.data,
            payment: publisherPaymentData.data
          };
          break;
          
        default:
          throw new Error('Unsupported user role for analytics');
      }
      
      setAnalyticsData(prev => ({ ...prev, ...data }));
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load analytics data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    analyticsData,
    loading,
    error,
    loadAnalytics,
    clearError
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};