import React from 'react';
import { 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  ChartBarIcon, 
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  WalletIcon
} from '@heroicons/react/24/outline';

const AdvertiserDashboardHome = ({ data, refreshData }) => {
  // Use actual data or empty defaults
  const dashboardData = data || {
    summary: {
      activeOrders: 0,
      completedOrders: 0,
      totalSpent: 0,
      availableWebsites: 0,
      walletBalance: 0
    },
    recentOrders: [],
    campaignPerformance: [],
    quickStats: {
      successRate: 0,
      averageOrderValue: 0
    }
  };

  // Ensure all required properties exist
  const safeDashboardData = {
    summary: {
      activeOrders: dashboardData.summary?.activeOrders || 0,
      completedOrders: dashboardData.summary?.completedOrders || 0,
      totalSpent: dashboardData.summary?.totalSpent || 0,
      availableWebsites: dashboardData.summary?.availableWebsites || 0,
      walletBalance: dashboardData.summary?.walletBalance || 0
    },
    recentOrders: Array.isArray(dashboardData.recentOrders) ? dashboardData.recentOrders : [],
    campaignPerformance: Array.isArray(dashboardData.campaignPerformance) ? dashboardData.campaignPerformance : [],
    quickStats: {
      successRate: dashboardData.quickStats?.successRate || 0,
      averageOrderValue: dashboardData.quickStats?.averageOrderValue || 0
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num || 0;
  };

  // Stats cards data
  const stats = [
    {
      name: 'Active Orders',
      value: safeDashboardData.summary.activeOrders,
      icon: ShoppingBagIcon,
      color: 'bg-[#bff747]',
    },
    {
      name: 'Completed Orders',
      value: safeDashboardData.summary.completedOrders,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Total Spent',
      value: formatCurrency(safeDashboardData.summary.totalSpent),
      icon: CurrencyDollarIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Available Websites',
      value: formatNumber(safeDashboardData.summary.availableWebsites),
      icon: GlobeAltIcon,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-[#1a1a1a] rounded-lg border border-[#bff747]/30 p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="h-6 w-6 text-[#0c0c0c]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">{stat.name}</p>
                <p className="text-2xl font-semibold text-[#bff747]">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1a1a] rounded-lg border border-[#bff747]/30 p-6">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="h-8 w-8 text-[#bff747]" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Success Rate</p>
              <p className="text-2xl font-semibold text-[#bff747]">
                {safeDashboardData.quickStats.successRate}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#1a1a1a] rounded-lg border border-[#bff747]/30 p-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-[#bff747]" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Avg. Order Value</p>
              <p className="text-2xl font-semibold text-[#bff747]">
                {formatCurrency(safeDashboardData.quickStats.averageOrderValue)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#1a1a1a] rounded-lg border border-[#bff747]/30 p-6">
          <div className="flex items-center">
            <WalletIcon className="h-8 w-8 text-[#bff747]" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Wallet Balance</p>
              <p className="text-2xl font-semibold text-[#bff747]">
                {formatCurrency(safeDashboardData.summary.walletBalance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-[#1a1a1a] rounded-lg border border-[#bff747]/30">
        <div className="px-6 py-4 border-b border-[#bff747]/30">
          <h3 className="text-lg font-medium text-[#bff747]">Recent Orders</h3>
        </div>
        <div className="p-6">
          {safeDashboardData.recentOrders.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No recent orders to display</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#bff747]/30">
                <thead className="bg-[#2a2a2a]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider">
                      Website
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider">
                      Deadline
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#1a1a1a] divide-y divide-[#bff747]/30">
                  {safeDashboardData.recentOrders.map((order, index) => (
                    <tr key={index} className="hover:bg-[#2a2a2a]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {order.orderId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {order.website || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.status === 'delivered' ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 
                            order.status === 'in_progress' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' : 
                            order.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' : 
                            'bg-gray-900/30 text-gray-400 border border-gray-500/30'}`}>
                          {order.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatCurrency(order.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {order.deadline ? new Date(order.deadline).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvertiserDashboardHome;