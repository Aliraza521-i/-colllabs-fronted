import React, { useState, useEffect } from 'react';
import { usePayment } from '../../contexts/PaymentContext';
import { useAuth } from '../../contexts/AuthContext';
import { paymentAPI } from '../../services/api';
import {
  CreditCardIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const PaymentProcessor = ({ order, onComplete, onCancel }) => {
  const { paymentMethods, loadPaymentMethods } = usePayment();
  const { user } = useAuth();
  
  const [selectedMethod, setSelectedMethod] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, error
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    try {
      setProcessing(true);
      setPaymentStatus('processing');
      setError('');

      const paymentData = {
        orderId: order._id,
        paymentMethod: selectedMethod,
        currency: currency
      };

      const response = await paymentAPI.initiatePayment(paymentData);
      
      setPaymentData(response.data);
      setPaymentStatus('success');
      
      // If there's an onComplete callback, call it
      if (onComplete) {
        setTimeout(() => onComplete(response.data), 2000);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Failed to process payment');
      setPaymentStatus('error');
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentMethodLabel = (type) => {
    switch (type) {
      case 'credit_card': return 'Credit Card';
      case 'debit_card': return 'Debit Card';
      case 'paypal': return 'PayPal';
      case 'bank_account': return 'Bank Transfer';
      case 'crypto_wallet': return 'Cryptocurrency';
      case 'wallet': return 'Platform Wallet';
      default: return 'Payment Method';
    }
  };

  const getCurrencySymbol = (code) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'CAD': 'C$',
      'AUD': 'A$',
      'BTC': '₿',
      'ETH': 'Ξ',
      'USDT': '₮'
    };
    return symbols[code] || code;
  };

  const convertAmount = (amount, fromCurrency, toCurrency) => {
    // Mock conversion - in real app this would call an API
    const rates = {
      'USD': 1,
      'EUR': 0.85,
      'GBP': 0.73,
      'CAD': 1.25,
      'AUD': 1.35,
      'BTC': 0.000023,
      'ETH': 0.00034,
      'USDT': 1
    };
    
    const usdAmount = amount / rates[fromCurrency];
    return usdAmount * rates[toCurrency];
  };

  const convertedAmount = convertAmount(order.totalAmount, 'USD', currency);

  if (paymentStatus === 'success') {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Payment Successful!</h3>
          <p className="mt-2 text-sm text-gray-500">
            Your payment of {getCurrencySymbol(currency)}{convertedAmount.toFixed(2)} {currency} has been processed.
          </p>
          <div className="mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Transaction ID: {paymentData?.payment?.transactionId}</p>
              <p className="text-sm text-gray-600 mt-1">
                Status: <span className="text-green-600 font-medium">Completed</span>
              </p>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => onComplete && onComplete(paymentData)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Payment for Order #{order._id?.slice(-6)}</h3>
      </div>
      
      <div className="p-6">
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Order Summary</h4>
              <p className="text-sm text-gray-500 mt-1">{order.websiteUrl}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                {getCurrencySymbol('USD')}{order.totalAmount.toFixed(2)} USD
              </p>
              {currency !== 'USD' && (
                <p className="text-sm text-gray-500">
                  {getCurrencySymbol(currency)}{convertedAmount.toFixed(2)} {currency}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Currency Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <div className="grid grid-cols-4 gap-2">
            {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'BTC', 'ETH', 'USDT'].map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => setCurrency(curr)}
                className={`py-2 px-3 text-sm font-medium rounded-md border ${
                  currency === curr
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            
            {paymentMethods.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No payment methods available</p>
                <button
                  type="button"
                  className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                  onClick={() => document.getElementById('payment-methods-tab').click()}
                >
                  Add a payment method
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method._id}
                    className={`relative rounded-lg border p-4 cursor-pointer ${
                      selectedMethod === method.type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedMethod(method.type)}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment-method"
                        value={method.type}
                        checked={selectedMethod === method.type}
                        onChange={() => setSelectedMethod(method.type)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3 flex items-center">
                        <span className="block text-sm font-medium text-gray-700">
                          {getPaymentMethodLabel(method.type)}
                        </span>
                        {method.isDefault && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-7 mt-1">
                      <p className="text-sm text-gray-500">
                        {method.metadata?.brand} ending in {method.metadata?.last4}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Platform Wallet Option */}
                <div
                  className={`relative rounded-lg border p-4 cursor-pointer ${
                    selectedMethod === 'wallet'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedMethod('wallet')}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="payment-method"
                      value="wallet"
                      checked={selectedMethod === 'wallet'}
                      onChange={() => setSelectedMethod('wallet')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3 flex items-center">
                      <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="block text-sm font-medium text-gray-700">
                        Platform Wallet
                      </span>
                    </div>
                  </div>
                  <div className="ml-7 mt-1">
                    <p className="text-sm text-gray-500">
                      Balance: $0.00 (Add funds to use this option)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex">
              <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Secure Payment</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Your payment is protected by our escrow system. Funds are held securely until order completion.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={processing || !selectedMethod}
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${getCurrencySymbol(currency)}${convertedAmount.toFixed(2)}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentProcessor;