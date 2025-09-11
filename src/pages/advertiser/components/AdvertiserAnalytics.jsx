import React, { useState, useEffect } from 'react';
import { advertiserAPI } from '../../../services/api';
import { 
  ChartBarIcon, 
  CursorArrowRaysIcon, 
  EyeIcon, 
  ArrowsRightLeftIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const AdvertiserAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await advertiserAPI.getOrderAnalytics({ period });
      if (response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bff747]"></div>
      </div>
    );
  }

  const data = analytics?.data || {
    summary: {
      avgOrderValue: 0,
      avgCompletionTime: 0,
      successRate: 0,
      totalOrders: 0
    },
    ordersByStatus: [],
    spendingTrend: [],
    performanceByWebsite: []
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg shadow p-6 border border-[#bff747]/30">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#bff747]">Analytics Dashboard</h2>
        <div className="flex items-center space-x-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-[#bff747]/30 rounded-md px-3 py-1 text-sm focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747]"
          >
            <option value="7d" className="bg-[#0c0c0c]">Last 7 days</option>
            <option value="30d" className="bg-[#0c0c0c]">Last 30 days</option>
            <option value="90d" className="bg-[#0c0c0c]">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#bff747]/20">
          <div className="flex items-center">
            <div className="p-2 bg-[#bff747]/20 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-[#bff747]" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-300">Total Spend</h3>
              <p className="text-2xl font-bold text-[#bff747]">
                {formatCurrency(data.summary.totalSpent || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#bff747]/20">
          <div className="flex items-center">
            <div className="p-2 bg-[#bff747]/20 rounded-lg">
              <ArrowsRightLeftIcon className="h-6 w-6 text-[#bff747]" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-300">Orders</h3>
              <p className="text-2xl font-bold text-[#bff747]">
                {data.summary.totalOrders || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#bff747]/20">
          <div className="flex items-center">
            <div className="p-2 bg-[#bff747]/20 rounded-lg">
              <EyeIcon className="h-6 w-6 text-[#bff747]" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-300">Avg. Value</h3>
              <p className="text-2xl font-bold text-[#bff747]">
                {formatCurrency(data.summary.avgOrderValue || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#bff747]/20">
          <div className="flex items-center">
            <div className="p-2 bg-[#bff747]/20 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-[#bff747]" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-300">Success Rate</h3>
              <p className="text-2xl font-bold text-[#bff747]">
                {data.summary.successRate || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] border border-[#bff747]/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-[#bff747] mb-4">Orders by Status</h3>
          <div className="space-y-4">
            {data.ordersByStatus && data.ordersByStatus.length > 0 ? (
              data.ordersByStatus.map((statusData, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">{statusData._id || 'Unknown'}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-[#2a2a2a] rounded-full h-2 mr-3">
                      <div 
                        className="bg-[#bff747] h-2 rounded-full" 
                        style={{ width: `${(statusData.count / data.summary.totalOrders) * 100 || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-[#bff747] w-10">{statusData.count || 0}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No data available</p>
            )}
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#bff747]/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-[#bff747] mb-4">Top Performing Websites</h3>
          <div className="space-y-4">
            {data.performanceByWebsite && data.performanceByWebsite.length > 0 ? (
              data.performanceByWebsite.slice(0, 5).map((website, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-300 truncate max-w-[120px]">{website.website || 'Unknown'}</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-[#bff747] mr-3">{website.successRate || 0}%</span>
                    <span className="text-sm text-gray-400">{formatCurrency(website.totalSpent || 0)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertiserAnalytics;