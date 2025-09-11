import React, { createContext, useContext, useState, useEffect } from 'react';
import { paymentAPI } from '../services/api';

const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load payment methods
  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getPaymentMethods();
      setPaymentMethods(response.data.paymentMethods || []);
    } catch (err) {
      setError(err.message || 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  // Add payment method
  const addPaymentMethod = async (methodData) => {
    try {
      setLoading(true);
      const response = await paymentAPI.addPaymentMethod(methodData);
      setPaymentMethods(prev => [...prev, response.data.paymentMethod]);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to add payment method');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Set default payment method
  const setDefaultPaymentMethod = async (methodId) => {
    try {
      setLoading(true);
      await paymentAPI.setDefaultPaymentMethod(methodId);
      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          isDefault: method._id === methodId
        }))
      );
    } catch (err) {
      setError(err.message || 'Failed to set default payment method');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove payment method
  const removePaymentMethod = async (methodId) => {
    try {
      setLoading(true);
      await paymentAPI.removePaymentMethod(methodId);
      setPaymentMethods(prev => prev.filter(method => method._id !== methodId));
    } catch (err) {
      setError(err.message || 'Failed to remove payment method');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load transactions
  const loadTransactions = async (params = {}) => {
    try {
      setLoading(true);
      const response = await paymentAPI.getTransactions(params);
      setTransactions(response.data.transactions || []);
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Load currencies
  const loadCurrencies = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.adminGetCurrencies();
      setCurrencies(response.data.currencies || []);
    } catch (err) {
      setError(err.message || 'Failed to load currencies');
    } finally {
      setLoading(false);
    }
  };

  // Initiate payment
  const initiatePayment = async (paymentData) => {
    try {
      setLoading(true);
      const response = await paymentAPI.initiatePayment(paymentData);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to initiate payment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Release escrow
  const releaseEscrow = async (escrowId) => {
    try {
      setLoading(true);
      const response = await paymentAPI.releaseEscrow(escrowId);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to release escrow');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create dispute
  const createDispute = async (escrowId, disputeData) => {
    try {
      setLoading(true);
      const response = await paymentAPI.createDispute(escrowId, disputeData);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to create dispute');
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
    // State
    paymentMethods,
    transactions,
    currencies,
    loading,
    error,
    
    // Actions
    loadPaymentMethods,
    addPaymentMethod,
    setDefaultPaymentMethod,
    removePaymentMethod,
    loadTransactions,
    loadCurrencies,
    initiatePayment,
    releaseEscrow,
    createDispute,
    clearError
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};