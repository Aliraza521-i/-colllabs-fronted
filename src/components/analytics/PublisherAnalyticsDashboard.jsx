import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import AnalyticsChart from './AnalyticsChart';
import { 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

const PublisherAnalyticsDashboard = () => {
  const { analyticsData, loading, error, loadAnalytics } = useAnalytics();
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    loadAnalytics('publisher', { period });
  }, [period, loadAnalytics]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getKpiData = () => {
    if (!analyticsData.publisher) return [];
    
    const publisherData = analyticsData.publisher.data;
    
    return [
      {
        title: 'Total Earnings',
        value: formatCurrency(publisherData?.totalEarnings || 0),
        change: '+12%',
        changeType: 'positive',
        icon: CurrencyDollarIcon,
        color: 'bg-green-500'
      },
      {
        title: 'Completed Orders',
        value: publisherData?.completedOrders || 0,
        change: '+7%',
        changeType: 'positive',
        icon: ShoppingBagIcon,
        color: 'bg-blue-500'
      },
      {
        title: 'Avg. Order Value',
        value: formatCurrency(publisherData?.averageOrderValue || 0),
        change: '+4%',
        changeType: 'positive',
        icon: BanknotesIcon,
        color: 'bg-purple-500'
      },
      {
        title: 'Success Rate',
        value: `${publisherData?.successRate || 0}%`,
        change: '-1%',
        changeType: 'negative',
        icon: ChartBarIcon,
        color: 'bg-yellow-500'
      }
    ];
  };

  const getEarningsTrendData = () => {
    if (!analyticsData.publisher?.data?.earningsTrend) return null;
    
    const earningsTrend = analyticsData.publisher.data.earningsTrend;
    
    const labels = earningsTrend.map(item => item._id);
    const earningsData = earningsTrend.map(item => item.earnings);
    const ordersData = earningsTrend.map(item => item.orders);
    
    return {
      labels,
      datasets: [
        {
          label: 'Earnings ($)',
          data: earningsData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'Orders',
          data: ordersData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    };
  };

  const getOrdersByStatusData = () => {
    if (!analyticsData.publisher?.data?.ordersByStatus) return null;
    
    const ordersByStatus = analyticsData.publisher.data.ordersByStatus;
    
    const labels = ordersByStatus.map(item => 
      item._id.charAt(0).toUpperCase() + item._id.slice(1).replace('_', ' ')
    );
    const data = ordersByStatus.map(item => item.count);
    
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

  const getTopWebsitesData = () => {
    if (!analyticsData.publisher?.data?.topWebsites) return null;
    
    const topWebsites = analyticsData.publisher.data.topWebsites.slice(0, 5);
    
    const labels = topWebsites.map(item => item.domain);
    const earningsData = topWebsites.map(item => item.totalEarnings);
    const ordersData = topWebsites.map(item => item.orders);
    
    return {
      labels,
      datasets: [
        {
          label: 'Earnings ($)',
          data: earningsData,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1
        },
        {
          label: 'Orders',
          data: ordersData,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        }
      ]
    };
  };

  const kpiData = getKpiData();
  const earningsTrendData = getEarningsTrendData();
  const ordersByStatusData = getOrdersByStatusData();
  const topWebsitesData = getTopWebsitesData();

  if (loading && !analyticsData.publisher) {
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
        <h1 className="text-2xl font-bold text-gray-900">Earnings Analytics</h1>
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
        {earningsTrendData && (
          <div className="lg:col-span-2">
            <AnalyticsChart 
              type="line"
              data={earningsTrendData}
              title="Earnings Trend"
              height="400px"
              options={{
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                      drawOnChartArea: false,
                    },
                  },
                }
              }}
            />
          </div>
        )}
        
        {ordersByStatusData && (
          <AnalyticsChart 
            type="doughnut"
            data={ordersByStatusData}
            title="Orders by Status"
          />
        )}
        
        {topWebsitesData && (
          <AnalyticsChart 
            type="bar"
            data={topWebsitesData}
            title="Top Performing Websites"
          />
        )}
      </div>

      {/* Earnings Table */}
      {analyticsData.publisher?.data?.topWebsites && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Website Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Website
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain Authority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.publisher.data.topWebsites.map((website, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {website.domain}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {website.domainAuthority}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {website.orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(website.totalEarnings)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {website.successRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Earnings Tips */}
      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-green-800 mb-2">Maximize Your Earnings</h3>
        <ul className="list-disc pl-5 space-y-2 text-green-700">
          <li>Your earnings are 8% above the platform average - great job!</li>
          <li>Websites with higher domain authority typically earn 25% more per order</li>
          <li>Responding to orders within 24 hours increases your acceptance rate by 30%</li>
          <li>Focus on websites in your niche expertise for better quality content</li>
        </ul>
      </div>
    </div>
  );
};

export default PublisherAnalyticsDashboard;