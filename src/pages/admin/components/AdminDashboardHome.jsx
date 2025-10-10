import React, { useState, useEffect, useCallback } from 'react';
import {
  UsersIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ClockIcon,
  EyeIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
} from 'chart.js';
import { adminAPI } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
);

const AdminDashboardHome = ({ data, refreshData }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await adminAPI.getUsers({
        page: 1,
        limit: 10, // Show only first 10 users on dashboard
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }, { signal: controller.signal });
      
      clearTimeout(timeoutId);
      
      console.log('Users API Response:', response);
      
      if (response.data && response.data.ok) {
        console.log('Users Data:', response.data.data);
        setUsers(response.data.data); // Access the data array correctly
      } else {
        console.log('API response not ok or missing data');
        setUsersError('Failed to load users data');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsersError(error.message || 'Failed to fetch users');
      // Don't set users to empty array on error to preserve existing data
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // If data is still loading, show loading spinner
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Extract key metrics from the data structure
  const keyMetrics = data.keyMetrics || {};
  const recentActivity = data.recentActivity || {};
  const pendingActions = keyMetrics.pendingActions || {};

  const stats = [
    {
      name: 'Total Users',
      value: keyMetrics.totalUsers?.value || 0,
      change: keyMetrics.totalUsers?.growth || 0,
      changeType: (keyMetrics.totalUsers?.growth || 0) >= 0 ? 'increase' : 'decrease',
      icon: UsersIcon,
      color: 'blue'
    },
    {
      name: 'Active Orders',
      value: keyMetrics.orders?.active || 0,
      change: keyMetrics.orders?.growth || 0,
      changeType: (keyMetrics.orders?.growth || 0) >= 0 ? 'increase' : 'decrease',
      icon: DocumentTextIcon,
      color: 'green'
    },
    {
      name: 'Monthly Revenue',
      value: `$${(keyMetrics.revenue?.monthly || 0).toLocaleString()}`,
      change: keyMetrics.revenue?.growth || 0,
      changeType: (keyMetrics.revenue?.growth || 0) >= 0 ? 'increase' : 'decrease',
      icon: CurrencyDollarIcon,
      color: 'purple'
    },
    {
      name: 'Approved Websites',
      value: keyMetrics.websites?.approved || 0,
      change: 0, // We don't have growth data for websites
      changeType: 'increase',
      icon: GlobeAltIcon,
      color: 'orange'
    }
  ];

  // Chart configurations
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 19000, 15000, 18000, 22000, 25000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  };

  const orderStatusData = {
    labels: ['Pending', 'In Progress', 'Completed', 'Disputed'],
    datasets: [
      {
        data: [
          keyMetrics.orders?.active || 0,
          0, // In Progress
          keyMetrics.orders?.completed || 0,
          0  // Disputed
        ],
        backgroundColor: [
          '#FCD34D',
          '#60A5FA', 
          '#34D399',
          '#F87171'
        ]
      }
    ]
  };

  const userTypeData = {
    labels: ['Publishers', 'Advertisers'],
    datasets: [
      {
        label: 'Users',
        data: [
          keyMetrics.totalUsers?.publishers || 0,
          keyMetrics.totalUsers?.advertisers || 0
        ],
        backgroundColor: ['#8B5CF6', '#06B6D4']
      }
    ]
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registration':
        return '👤';
      case 'website_submission':
        return '🌐';
      case 'order_placed':
        return '📄';
      case 'payment_received':
        return '💰';
      case 'dispute_raised':
        return '⚠️';
      default:
        return '📋';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getUserStatusBadge = (user) => {
    if (user.isSuspended) {
      return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Suspended</span>;
    }
    if (!user.isEmailVerified) {
      return <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Unverified</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Active</span>;
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      publisher: 'bg-blue-100 text-blue-800',
      advertiser: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[role]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const handleUserAction = async (userId, action) => {
    try {
      let response;
      switch (action) {
        case 'suspend':
          response = await adminAPI.suspendUser(userId, 'Admin action');
          break;
        case 'activate':
          response = await adminAPI.activateUser(userId);
          break;
        default:
          return;
      }
      
      if (response.ok) {
        fetchUsers(); // Refresh the user list
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={() => {
              setLoading(true);
              Promise.all([
                refreshData(),
                fetchUsers()
              ]).finally(() => setLoading(false));
            }}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
            {stat.change !== 0 && (
              <div className="mt-4 flex items-center">
                {stat.changeType === 'increase' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                )}
                <span className={`ml-1 text-sm font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(stat.change)}%
                </span>
                <span className="ml-1 text-sm text-gray-500">from last month</span>
              </div>
            )}
          </div>
        ))}
      </div>

     

    

      {/* User Management Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
          <button
            onClick={() => navigate('/admin/users')}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            View All Users
          </button>
        </div>
        <div className="overflow-x-auto">
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Websites
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getUserStatusBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.stats?.websites || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.stats?.orders || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${user.stats?.balance?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${user.stats?.totalEarnings?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/admin/users/${user._id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          
                          {user.isSuspended ? (
                            <button
                              onClick={() => handleUserAction(user._id, 'activate')}
                              className="text-green-600 hover:text-green-900"
                              title="Activate User"
                            >
                              <LockOpenIcon className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(user._id, 'suspend')}
                              className="text-red-600 hover:text-red-900"
                              title="Suspend User"
                            >
                              <LockClosedIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {(recentActivity.newUsers || []).slice(0, 5).map((user, index) => (
            <div key={index} className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-xl">{getActivityIcon('user_registration')}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  Registered as {user.role} • {formatTime(user.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;