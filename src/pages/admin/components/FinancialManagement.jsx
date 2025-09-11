import React, { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CreditCardIcon,
  BanknotesIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, ClockIcon } from 'lucide-react';

const FinancialManagement = () => {
  const [financialData, setFinancialData] = useState({});
  const [loading, setLoading] = useState(true);

  // Mock data for now
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setFinancialData({
        totalRevenue: 12500.75,
        pendingPayments: 3200.50,
        completedPayments: 9300.25,
        monthlyGrowth: 12.5,
        transactions: [
          {
            id: 1,
            type: 'credit',
            amount: 150.00,
            description: 'Order payment for example.com',
            date: '2023-05-15',
            status: 'completed'
          },
          {
            id: 2,
            type: 'debit',
            amount: 75.00,
            description: 'Publisher payment',
            date: '2023-05-14',
            status: 'completed'
          }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Financial Management</h2>
      
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold">${financialData.totalRevenue}</p>
            </div>
            <CurrencyDollarIcon className="h-10 w-10 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Pending Payments</p>
              <p className="text-2xl font-bold">${financialData.pendingPayments}</p>
            </div>
            <ClockIcon className="h-10 w-10 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Completed Payments</p>
              <p className="text-2xl font-bold">${financialData.completedPayments}</p>
            </div>
            <CheckCircleIcon className="h-10 w-10 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Monthly Growth</p>
              <p className="text-2xl font-bold">{financialData.monthlyGrowth}%</p>
            </div>
            <ArrowTrendingUpIcon className="h-10 w-10 text-yellow-200" />
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {financialData.transactions && financialData.transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.type === 'credit' ? '+' : '-'}${transaction.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialManagement;