import React, { useState, useEffect } from 'react';
import { usePayment } from '../../contexts/PaymentContext';
import {
  CreditCardIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const PaymentMethodManager = () => {
  const { 
    paymentMethods, 
    loadPaymentMethods, 
    addPaymentMethod, 
    setDefaultPaymentMethod, 
    removePaymentMethod,
    loading,
    error
  } = usePayment();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMethod, setNewMethod] = useState({
    type: 'credit_card',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: '',
    isDefault: false
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const handleAddMethod = async (e) => {
    e.preventDefault();
    
    try {
      // In a real implementation, this would tokenize the card with Stripe/PayPal
      // For now, we'll mock the payment method creation
      const methodData = {
        type: newMethod.type,
        isDefault: newMethod.isDefault,
        metadata: {
          last4: newMethod.cardNumber.slice(-4),
          brand: 'Visa', // Would be determined from card number
          expiryMonth: newMethod.expiryMonth,
          expiryYear: newMethod.expiryYear,
          holderName: newMethod.holderName
        }
      };
      
      await addPaymentMethod(methodData);
      setShowAddForm(false);
      setNewMethod({
        type: 'credit_card',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        holderName: '',
        isDefault: false
      });
    } catch (err) {
      console.error('Failed to add payment method:', err);
    }
  };

  const handleSetDefault = async (methodId) => {
    try {
      await setDefaultPaymentMethod(methodId);
    } catch (err) {
      console.error('Failed to set default payment method:', err);
    }
  };

  const handleRemove = async (methodId) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      try {
        await removePaymentMethod(methodId);
      } catch (err) {
        console.error('Failed to remove payment method:', err);
      }
    }
  };

  const getPaymentMethodIcon = (type) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCardIcon className="h-6 w-6 text-blue-600" />;
      case 'paypal':
        return <div className="bg-blue-100 rounded p-1">
          <span className="text-blue-800 font-bold text-xs">PP</span>
        </div>;
      default:
        return <CreditCardIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getPaymentMethodLabel = (type) => {
    switch (type) {
      case 'credit_card': return 'Credit Card';
      case 'debit_card': return 'Debit Card';
      case 'paypal': return 'PayPal';
      case 'bank_account': return 'Bank Account';
      case 'crypto_wallet': return 'Crypto Wallet';
      default: return 'Payment Method';
    }
  };

  if (loading && paymentMethods.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Payment Method
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        {showAddForm ? (
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Add New Payment Method</h4>
            <form onSubmit={handleAddMethod} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method Type</label>
                <select
                  value={newMethod.type}
                  onChange={(e) => setNewMethod({...newMethod, type: e.target.value})}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank_account">Bank Account</option>
                  <option value="crypto_wallet">Crypto Wallet</option>
                </select>
              </div>

              {(newMethod.type === 'credit_card' || newMethod.type === 'debit_card') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Card Number</label>
                    <input
                      type="text"
                      value={newMethod.cardNumber}
                      onChange={(e) => setNewMethod({...newMethod, cardNumber: e.target.value})}
                      placeholder="1234 5678 9012 3456"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expiry Month</label>
                      <input
                        type="text"
                        value={newMethod.expiryMonth}
                        onChange={(e) => setNewMethod({...newMethod, expiryMonth: e.target.value})}
                        placeholder="MM"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expiry Year</label>
                      <input
                        type="text"
                        value={newMethod.expiryYear}
                        onChange={(e) => setNewMethod({...newMethod, expiryYear: e.target.value})}
                        placeholder="YYYY"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cardholder Name</label>
                    <input
                      type="text"
                      value={newMethod.holderName}
                      onChange={(e) => setNewMethod({...newMethod, holderName: e.target.value})}
                      placeholder="John Doe"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex items-center">
                <input
                  id="default-method"
                  type="checkbox"
                  checked={newMethod.isDefault}
                  onChange={(e) => setNewMethod({...newMethod, isDefault: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="default-method" className="ml-2 block text-sm text-gray-900">
                  Set as default payment method
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Payment Method
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payment methods</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new payment method.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Payment Method
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {paymentMethods.map((method) => (
              <li key={method._id} className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getPaymentMethodIcon(method.type)}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {getPaymentMethodLabel(method.type)}
                        </p>
                        {method.isDefault && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {method.metadata?.brand} ending in {method.metadata?.last4}
                      </p>
                      <p className="text-sm text-gray-500">
                        Expires {method.metadata?.expiryMonth}/{method.metadata?.expiryYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefault(method._id)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => handleRemove(method._id)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodManager;