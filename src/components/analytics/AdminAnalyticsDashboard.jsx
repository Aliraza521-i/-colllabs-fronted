import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import AnalyticsChart from './AnalyticsChart';
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const AdminAnalyticsDashboard = () => {
  const { analyticsData, loading, error, loadAnalytics } = useAnalytics();
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    loadAnalytics('admin', { period });
  }, [period, loadAnalytics]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getKpiData = () => {
    if (!analyticsData.admin) return [];
    
    const adminData = analyticsData.admin.data;
    const paymentData = analyticsData.payment?.data;
    
    return [
      {
        title: 'Total Users',
        value: adminData?.totalUsers || 0,
        change: '+12%',
        changeType: 'positive',
        icon: UsersIcon,
        color: 'bg-blue-500'
      },
      {
        title: 'Total Revenue',
        value: formatCurrency(paymentData?.totalRevenue || 0),
        change: '+8%',
        changeType: 'positive',
        icon: CurrencyDollarIcon,
        color: 'bg-green-500'
      },
      {
        title: 'Total Orders',
        value: adminData?.totalOrders || 0,
        change: '+5%',
        changeType: 'positive',
        icon: ShoppingBagIcon,
        color: 'bg-purple-500'
      },
      {
        title: 'Conversion Rate',
        value: `${adminData?.conversionRate || 0}%`,
        change: '-2%',
        changeType: 'negative',
        icon: ChartBarIcon,
        color: 'bg-yellow-500'
      }
    ];
  };

  const getUserGrowthData = () => {
    if (!analyticsData.admin?.data?.userGrowth) return null;
    
    const userGrowth = analyticsData.admin.data.userGrowth;
    
    // Group data by date
    const groupedData = {};
    userGrowth.forEach(item => {
      if (!groupedData[item._id.date]) {
        groupedData[item._id.date] = { publishers: 0, advertisers: 0 };
      }
      
      if (item._id.role === 'publisher') {
        groupedData[item._id.date].publishers = item.count;
      } else if (item._id.role === 'advertiser') {
        groupedData[item._id.date].advertisers = item.count;
      }
    });
    
    const dates = Object.keys(groupedData).sort();
    const publisherData = dates.map(date => groupedData[date].publishers);
    const advertiserData = dates.map(date => groupedData[date].advertisers);
    
    return {
      labels: dates,
      datasets: [
        {
          label: 'Publishers',
          data: publisherData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Advertisers',
          data: advertiserData,
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: 'rgba(147, 51, 234, 0.5)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  const getOrderMetricsData = () => {
    if (!analyticsData.admin?.data?.orderMetrics) return null;
    
    const orderMetrics = analyticsData.admin.data.orderMetrics;
    
    const labels = orderMetrics.map(item => item._id.charAt(0).toUpperCase() + item._id.slice(1));
    const data = orderMetrics.map(item => item.count);
    
    return {
      labels,
      datasets: [
        {
          label: 'Orders',
          data,
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(147, 51, 234, 0.8)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(34, 197, 94)',
            'rgb(251, 191, 36)',
            'rgb(239, 68, 68)',
            'rgb(147, 51, 234)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  const getConversionRateData = () => {
    if (!analyticsData.admin?.data?.conversionRates) return null;
    
    const conversionRates = analyticsData.admin.data.conversionRates;
    
    const labels = conversionRates.map(item => item._id);
    const data = conversionRates.map(item => item.conversionRate || 0);
    
    return {
      labels,
      datasets: [
        {
          label: 'Conversion Rate (%)',
          data,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  const kpiData = getKpiData();
  const userGrowthData = getUserGrowthData();
  const orderMetricsData = getOrderMetricsData();
  const conversionRateData = getConversionRateData();

  if (loading && !analyticsData.admin) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading analytics: {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex space-x-2">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {kpiData.map((kpi, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${kpi.color} p-3 rounded-lg`}>
                <kpi.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className={`flex items-center ${kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.changeType === 'positive' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4" />
                )}
                <span className="text-sm font-medium ml-1">{kpi.change}</span>
                <span className="text-sm text-gray-500 ml-1">from last period</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {userGrowthData && (
          <div className="lg:col-span-2">
            <AnalyticsChart 
              type="line"
              data={userGrowthData}
              title="User Growth"
              height="400px"
            />
          </div>
        )}
        
        {orderMetricsData && (
          <AnalyticsChart 
            type="pie"
            data={orderMetricsData}
            title="Order Distribution by Status"
          />
        )}
        
        {conversionRateData && (
          <AnalyticsChart 
            type="line"
            data={conversionRateData}
            title="Conversion Rate Over Time"
          />
        )}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Health</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Uptime</span>
                <span className="text-sm font-medium text-gray-900">99.9%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '99.9%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Response Time</span>
                <span className="text-sm font-medium text-gray-900">120ms</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Active Connections</span>
                <span className="text-sm font-medium text-gray-900">1,248</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <UsersIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">New user registered</p>
                <p className="text-sm text-gray-500">John Doe registered as an advertiser</p>
                <p className="text-xs text-gray-400">2 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Payment received</p>
                <p className="text-sm text-gray-500">Order #ORD-7842 payment confirmed</p>
                <p className="text-xs text-gray-400">15 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <ShoppingBagIcon className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Order completed</p>
                <p className="text-sm text-gray-500">Order #ORD-7839 marked as delivered</p>
                <p className="text-xs text-gray-400">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;