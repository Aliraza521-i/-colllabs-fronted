import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletAPI } from '../../../services/api';
import { 
  CurrencyDollarIcon, 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

const WalletManagement = ({ onBalanceUpdate }) => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      // Fetch balance
      const balanceResponse = await walletAPI.getBalance();
      if (balanceResponse.data) {
        setBalance(balanceResponse.data.balance || 0);
        if (onBalanceUpdate) {
          onBalanceUpdate();
        }
      }
      
      // Fetch transactions
      const transactionsResponse = await walletAPI.getTransactions();
      if (transactionsResponse.data) {
        setTransactions(transactionsResponse.data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async (amount) => {
    try {
      const response = await walletAPI.addFunds(amount);
      if (response.data) {
        setBalance(response.data.balance);
        fetchWalletData(); // Refresh transactions
        alert(`Successfully added $${amount} to your wallet!`);
      }
    } catch (error) {
      console.error('Failed to add funds:', error);
      alert('Failed to add funds. Please try again.');
    }
  };

  const handleQuickAdd = (amount) => {
    handleAddFunds(amount);
  };

  const handleCustomAdd = () => {
    const customAmount = parseFloat(amount);
    if (customAmount && customAmount > 0) {
      handleAddFunds(customAmount);
      setAmount('');
    } else {
      alert('Please enter a valid amount.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bff747]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] rounded-lg shadow p-6 border border-[#bff747]/30">
      <h2 className="text-2xl font-bold text-[#bff747] mb-6">Wallet Management</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-lg p-6 border border-[#bff747]/30">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-[#bff747]">Available Balance</h3>
                <p className="text-4xl font-bold text-[#bff747]">{formatCurrency(balance)}</p>
                <p className="mt-2 text-gray-400">Funds available for campaigns</p>
              </div>
              <CurrencyDollarIcon className="h-12 w-12 text-[#bff747] opacity-30" />
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-[#bff747] mb-4">Add Funds</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[50, 100, 250].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleQuickAdd(amount)}
                  className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#bff747] font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center border border-[#bff747]/30"
                >
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  ${amount}
                </button>
              ))}
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                  className="flex-1 border border-[#bff747]/30 rounded-lg px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                />
                <button
                  onClick={handleCustomAdd}
                  className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#bff747] font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center border border-[#bff747]/30"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-[#bff747] mb-4">Recent Transactions</h3>
          {transactions.length === 0 ? (
            <div className="bg-[#2a2a2a] rounded-lg p-6 text-center border border-[#bff747]/30">
              <p className="text-gray-400">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.slice(0, 10).map((transaction, index) => (
                <div key={index} className="border border-[#bff747]/30 rounded-lg p-4 bg-[#2a2a2a]">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {transaction.type === 'deposit' ? (
                        <ArrowDownTrayIcon className="h-5 w-5 text-green-400 mr-2" />
                      ) : (
                        <ArrowUpTrayIcon className="h-5 w-5 text-red-400 mr-2" />
                      )}
                      <div>
                        <p className="font-medium text-[#bff747]">
                          {transaction.description || 'Transaction'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletManagement;