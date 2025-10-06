import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  UsersIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [loading, setLoading] = useState(true);

  // Mock data for now
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData({
        totalUsers: 1242,
        totalWebsites: 856,
        totalOrders: 342,
        totalRevenue: 12500.75,
        userGrowth: 12.5,
        websiteGrowth: 8.3,
        orderGrowth: 15.2,
        revenueGrowth: 10.7
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics Dashboard</h2>
      
      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold">{analyticsData.totalUsers}</p>
              <p className="text-xs mt-1">
                <ArrowTrendingUpIcon className="inline h-3 w-3" />
                {analyticsData.userGrowth}% from last month
              </p>
            </div>
            <UsersIcon className="h-10 w-10 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total Websites</p>
              <p className="text-2xl font-bold">{analyticsData.totalWebsites}</p>
              <p className="text-xs mt-1">
                <ArrowTrendingUpIcon className="inline h-3 w-3" />
                {analyticsData.websiteGrowth}% from last month
              </p>
            </div>
            <GlobeAltIcon className="h-10 w-10 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total Orders</p>
              <p className="text-2xl font-bold">{analyticsData.totalOrders}</p>
              <p className="text-xs mt-1">
                <ArrowTrendingUpIcon className="inline h-3 w-3" />
                {analyticsData.orderGrowth}% from last month
              </p>
            </div>
            <DocumentTextIcon className="h-10 w-10 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold">${analyticsData.totalRevenue}</p>
              <p className="text-xs mt-1">
                <ArrowTrendingUpIcon className="inline h-3 w-3" />
                {analyticsData.revenueGrowth}% from last month
              </p>
            </div>
            <CurrencyDollarIcon className="h-10 w-10 text-yellow-200" />
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">User Growth</h3>
          <div className="h-64 flex items-center justify-center">
            <ChartBarIcon className="h-16 w-16 text-gray-400" />
            <span className="ml-4 text-gray-500">Chart visualization would go here</span>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center">
            <ChartBarIcon className="h-16 w-16 text-gray-400" />
            <span className="ml-4 text-gray-500">Chart visualization would go here</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;