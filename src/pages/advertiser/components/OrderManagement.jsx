import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { advertiserAPI } from '../../../services/api';

const OrderManagement = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Parse sortBy and sortOrder from URL params
  const sortByParam = searchParams.get('sortBy') || 'createdAt';
  const sortOrderParam = searchParams.get('sortOrder') || 'desc';
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    dateRange: searchParams.get('dateRange') || 'all',
    sortBy: sortByParam,
    sortOrder: sortOrderParam
  });

  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({});

  const ordersPerPage = 20;

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: ordersPerPage,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === 'all') {
          delete params[key];
        }
      });

      const response = await advertiserAPI.getOrders(params);
      if (response.data) {
        setOrders(response.data.data || []);
        setTotalPages(response.data.pagination?.pages || 1);
        // Stats are not returned by this endpoint, so we'll leave it as is
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError(error.message || 'Failed to load orders. Please try again later.');
      setOrders([]); // Clear orders on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshOrders = async () => {
    setRefreshing(true);
    await fetchOrders();
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] && newFilters[key] !== 'all') {
        newSearchParams.set(key, newFilters[key]);
      }
    });
    setSearchParams(newSearchParams);
  };

  const handleOrderAction = async (orderId, action) => {
    try {
      let response;
      
      switch (action) {
        case 'approve':
          response = await advertiserAPI.approveContent(orderId);
          break;
        case 'cancel':
          response = await advertiserAPI.cancelOrder(orderId);
          break;
        case 'request_revision':
          // This would open a modal for revision details
          navigate(`/advertiser/orders/${orderId}?action=revision`);
          return;
        default:
          return;
      }

      if (response.data) {
        fetchOrders();
      }
    } catch (error) {
      console.error(`Failed to ${action} order:`, error);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedOrders.length === 0) return;

    try {
      setLoading(true);
      
      switch (action) {
        case 'cancel':
          // Cancel each selected order individually
          const cancelPromises = selectedOrders.map(orderId => 
            advertiserAPI.cancelOrder(orderId)
          );
          
          try {
            await Promise.all(cancelPromises);
            console.log(`Successfully cancelled ${selectedOrders.length} orders`);
          } catch (error) {
            console.error('Some orders failed to cancel:', error);
          }
          break;
          
        case 'export':
          // For export, we'll create a CSV download
          exportOrdersToCSV();
          break;
          
        default:
          console.warn(`Unknown bulk action: ${action}`);
          return;
      }
      
      // Refresh the orders list
      fetchOrders();
      setSelectedOrders([]);
    } catch (error) {
      console.error(`Failed to perform bulk ${action}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const exportOrdersToCSV = () => {
    // Create CSV content from selected orders
    const selectedOrderData = orders.filter(order => 
      selectedOrders.includes(order._id)
    );
    
    if (selectedOrderData.length === 0) return;
    
    // CSV header
    const csvHeader = [
      'Order ID',
      'Title',
      'Website',
      'Status',
      'Amount',
      'Word Count',
      'Deadline',
      'Created At'
    ].join(',') + '\n';
    
    // CSV rows
    const csvRows = selectedOrderData.map(order => [
      `"${order.orderId || ''}"`,
      `"${order.title || ''}"`,
      `"${order.website?.domain || ''}"`,
      `"${order.status || ''}"`,
      `"${order.totalAmount || 0}"`,
      `"${order.wordCount || 0}"`,
      `"${order.deadline ? new Date(order.deadline).toISOString() : ''}"`,
      `"${order.createdAt ? new Date(order.createdAt).toISOString() : ''}"`
    ].join(',')).join('\n');
    
    // Combine header and rows
    const csvContent = csvHeader + csvRows;
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-export-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order._id));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30', icon: ClockIcon, text: 'Pending' },
      accepted: { class: 'bg-blue-900/30 text-blue-400 border border-blue-500/30', icon: CheckCircleIcon, text: 'Accepted' },
      in_progress: { class: 'bg-purple-900/30 text-purple-400 border border-purple-500/30', icon: ClockIcon, text: 'In Progress' },
      content_submitted: { class: 'bg-green-900/30 text-green-400 border border-green-500/30', icon: DocumentTextIcon, text: 'Content Submitted' },
      revision_requested: { class: 'bg-orange-900/30 text-orange-400 border border-orange-500/30', icon: ExclamationTriangleIcon, text: 'Revision Requested' },
      completed: { class: 'bg-green-900/30 text-green-400 border border-green-500/30', icon: CheckCircleIcon, text: 'Completed' },
      cancelled: { class: 'bg-red-900/30 text-red-400 border border-red-500/30', icon: XCircleIcon, text: 'Cancelled' }
    };

    const badge = badges[status] || badges.pending;
    const IconComponent = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${badge.class}`}>
        <IconComponent className="h-3 w-3" />
        {badge.text}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    if (urgency === 'rush') {
      return <span className="text-xs bg-orange-900/30 text-orange-400 px-2 py-1 rounded-full border border-orange-500/30">Rush</span>;
    }
    if (urgency === 'express') {
      return <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded-full border border-red-500/30">Express</span>;
    }
    return null;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bff747]"></div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg shadow p-6 border border-[#bff747]/30">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/30">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-[#bff747]">Error Loading Orders</h3>
          <p className="mt-1 text-sm text-gray-400">{error}</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={fetchOrders}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-[#0c0c0c] bg-[#bff747] hover:bg-[#a8e035] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bff747]"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#bff747]">My Orders</h1>
          <p className="text-gray-400">Track and manage your guest post orders</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={refreshOrders}
            disabled={refreshing}
            className="flex items-center px-3 py-2 bg-[#1a1a1a] border border-[#bff747]/30 text-[#bff747] rounded-md hover:bg-[#2a2a2a] disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/advertiser/browse')}
            className="px-4 py-2 bg-[#bff747] text-[#0c0c0c] rounded-md hover:bg-[#a8e035]"
          >
            Place New Order
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#1a1a1a] rounded-lg shadow p-6 border border-[#bff747]/30">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-[#bff747]/20">
              <DocumentTextIcon className="h-6 w-6 text-[#bff747]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Orders</p>
              <p className="text-2xl font-semibold text-[#bff747]">{stats.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg shadow p-6 border border-[#bff747]/30">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-[#bff747]/20">
              <CheckCircleIcon className="h-6 w-6 text-[#bff747]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Completed</p>
              <p className="text-2xl font-semibold text-[#bff747]">{stats.completed || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg shadow p-6 border border-[#bff747]/30">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-[#bff747]/20">
              <ClockIcon className="h-6 w-6 text-[#bff747]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">In Progress</p>
              <p className="text-2xl font-semibold text-[#bff747]">{stats.inProgress || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg shadow p-6 border border-[#bff747]/30">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-[#bff747]/20">
              <CurrencyDollarIcon className="h-6 w-6 text-[#bff747]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Spent</p>
              <p className="text-2xl font-semibold text-[#bff747]">
                {formatPrice(stats.totalSpent || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1a1a1a] rounded-lg shadow p-6 border border-[#bff747]/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-[#bff747]">Filter Orders</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-[#bff747] hover:text-[#a8e035]"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 w-full border border-[#bff747]/30 rounded-md focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747]"
            >
              <option value="all" className="bg-[#0c0c0c]">All Status</option>
              <option value="pending" className="bg-[#0c0c0c]">Pending</option>
              <option value="accepted" className="bg-[#0c0c0c]">Accepted</option>
              <option value="in_progress" className="bg-[#0c0c0c]">In Progress</option>
              <option value="content_submitted" className="bg-[#0c0c0c]">Content Submitted</option>
              <option value="revision_requested" className="bg-[#0c0c0c]">Revision Requested</option>
              <option value="completed" className="bg-[#0c0c0c]">Completed</option>
              <option value="cancelled" className="bg-[#0c0c0c]">Cancelled</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747]"
            >
              <option value="all" className="bg-[#0c0c0c]">All time</option>
              <option value="7d" className="bg-[#0c0c0c]">Last 7 days</option>
              <option value="30d" className="bg-[#0c0c0c]">Last 30 days</option>
              <option value="90d" className="bg-[#0c0c0c]">Last 90 days</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={`${filters.sortBy}:${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split(':');
                setFilters(prev => ({
                  ...prev,
                  sortBy,
                  sortOrder
                }));
                setCurrentPage(1);
                
                // Update URL params
                const newFilters = { ...filters, sortBy, sortOrder };
                const newSearchParams = new URLSearchParams();
                Object.keys(newFilters).forEach(key => {
                  if (newFilters[key] && newFilters[key] !== 'all') {
                    newSearchParams.set(key, newFilters[key]);
                  }
                });
                setSearchParams(newSearchParams);
              }}
              className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747]"
            >
              <option value="createdAt:desc" className="bg-[#0c0c0c]">Newest First</option>
              <option value="createdAt:asc" className="bg-[#0c0c0c]">Oldest First</option>
              <option value="deadline:asc" className="bg-[#0c0c0c]">Deadline (Urgent First)</option>
              <option value="totalPrice:desc" className="bg-[#0c0c0c]">Highest Amount</option>
              <option value="totalPrice:asc" className="bg-[#0c0c0c]">Lowest Amount</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[#bff747]/30">
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  setFilters({
                    search: '',
                    status: 'all',
                    dateRange: '30d',
                    sortBy: 'created_desc'
                  });
                  setSearchParams({});
                }}
                className="text-sm text-gray-400 hover:text-[#bff747]"
              >
                Clear All Filters
              </button>
              <div className="text-sm text-gray-400">
                {orders.length} orders found
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-400">
              {selectedOrders.length} orders selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('cancel')}
                className="px-3 py-1 text-sm bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 border border-red-500/30"
              >
                Cancel Selected
              </button>
              <button
                onClick={() => handleBulkAction('export')}
                className="px-3 py-1 text-sm bg-[#2a2a2a] text-[#bff747] rounded hover:bg-[#3a3a3a] border border-[#bff747]/30"
              >
                Export Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-[#1a1a1a] rounded-lg shadow overflow-hidden border border-[#bff747]/30">
        <div className="px-6 py-4 border-b border-[#bff747]/30">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-[#bff747]">Orders</h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedOrders.length === orders.length && orders.length > 0}
                onChange={selectAllOrders}
                className="h-4 w-4 text-[#bff747] focus:ring-[#bff747] border-[#bff747]/30 rounded bg-[#0c0c0c]"
              />
              <label className="text-sm text-gray-300">Select All</label>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#bff747]/30">
            <thead className="bg-[#2a2a2a]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider">
                  Select
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider">
                  Quality Check
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#1a1a1a] divide-y divide-[#bff747]/30">
              {orders.map((order) => {
                const daysUntilDeadline = getDaysUntilDeadline(order.deadline);
                
                return (
                  <tr key={order._id} className="hover:bg-[#2a2a2a]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => toggleOrderSelection(order._id)}
                        className="h-4 w-4 text-[#bff747] focus:ring-[#bff747] border-[#bff747]/30 rounded bg-[#0c0c0c]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <DocumentTextIcon className="h-8 w-8 text-[#bff747]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium text-[#bff747] truncate">
                            {order.title}
                          </h4>
                          <p className="text-sm text-gray-400">{order.website?.domain}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-400">
                              #{order.orderId}
                            </span>
                            {getUrgencyBadge(order.urgency)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.qualityCheck ? (
                        <div className="flex items-center">
                          {order.qualityCheck.status === 'passed' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-500/30">
                              Passed
                            </span>
                          )}
                          {order.qualityCheck.status === 'failed' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-500/30">
                              Failed
                            </span>
                          )}
                          {order.qualityCheck.status === 'needs_revision' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400 border border-yellow-500/30">
                              Needs Revision
                            </span>
                          )}
                          {order.qualityCheck.status === 'in_progress' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-500/30">
                              In Progress
                            </span>
                          )}
                          {order.qualityCheck.status === 'pending' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-900/30 text-gray-400 border border-gray-500/30">
                              Pending
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Not started</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#bff747]">
                        {formatDate(order.deadline)}
                      </div>
                      <div className={`text-xs ${
                        daysUntilDeadline < 0 ? 'text-red-400' :
                        daysUntilDeadline <= 2 ? 'text-orange-400' :
                        'text-gray-400'
                      }`}>
                        {daysUntilDeadline < 0 ? `${Math.abs(daysUntilDeadline)} days overdue` :
                         daysUntilDeadline === 0 ? 'Due today' :
                         `${daysUntilDeadline} days left`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#bff747]">
                        {formatPrice(order.totalAmount)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {order.wordCount} words
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/advertiser/orders/${order._id}`)}
                          className="text-[#bff747] hover:text-[#a8e035]"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        
                        {order.status === 'content_submitted' && (
                          <>
                            <button
                              onClick={() => handleOrderAction(order._id, 'approve')}
                              className="text-green-400 hover:text-green-300"
                              title="Approve Content"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOrderAction(order._id, 'request_revision')}
                              className="text-orange-400 hover:text-orange-300"
                              title="Request Revision"
                            >
                              <ExclamationTriangleIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        {['pending', 'accepted'].includes(order.status) && (
                          <button
                            onClick={() => handleOrderAction(order._id, 'cancel')}
                            className="text-red-400 hover:text-red-300"
                            title="Cancel Order"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => navigate(`/advertiser/orders/${order._id}/chat`)}
                          className="text-purple-400 hover:text-purple-300"
                          title="Chat with Publisher"
                        >
                          <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {orders.length === 0 && !loading && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-[#bff747]" />
            <h3 className="mt-2 text-sm font-medium text-[#bff747]">No orders found</h3>
            <p className="mt-1 text-sm text-gray-400">
              {filters.search || filters.status !== 'all' ? 
                'Try adjusting your search criteria' : 
                'Get started by placing your first order. Browse websites and place orders to see them here.'
              }
            </p>
            <button
              onClick={() => navigate('/advertiser/browse')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[#0c0c0c] bg-[#bff747] hover:bg-[#a8e035]"
            >
  Browse Websites & Place Orders
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-[#1a1a1a] px-4 py-3 flex items-center justify-between border border-[#bff747]/30 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-[#bff747]/30 text-sm font-medium rounded-md text-[#bff747] bg-[#0c0c0c] hover:bg-[#2a2a2a] disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-[#bff747]/30 text-sm font-medium rounded-md text-[#bff747] bg-[#0c0c0c] hover:bg-[#2a2a2a] disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-400">
                Showing page <span className="font-medium text-[#bff747]">{currentPage}</span> of{' '}
                <span className="font-medium text-[#bff747]">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#bff747]/30 bg-[#0c0c0c] text-sm font-medium text-[#bff747] hover:bg-[#2a2a2a] disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                
                {/* Improved pagination that shows all pages or a range around current page */}
                {(() => {
                  const pageButtons = [];
                  const maxVisiblePages = 5;
                  
                  // Calculate start and end page numbers to display
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  
                  // Adjust startPage if we're near the end
                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }
                  
                  // Add first page and ellipsis if needed
                  if (startPage > 1) {
                    pageButtons.push(
                      <button
                        key={1}
                        onClick={() => setCurrentPage(1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-[#bff747]/30 text-sm font-medium ${
                          currentPage === 1
                            ? 'z-10 bg-[#bff747]/20 border-[#bff747] text-[#bff747]'
                            : 'bg-[#0c0c0c] border-[#bff747]/30 text-[#bff747] hover:bg-[#2a2a2a]'
                        }`}
                      >
                        1
                      </button>
                    );
                    
                    if (startPage > 2) {
                      pageButtons.push(
                        <span
                          key="start-ellipsis"
                          className="relative inline-flex items-center px-4 py-2 border border-[#bff747]/30 bg-[#0c0c0c] text-sm font-medium text-[#bff747]"
                        >
                          ...
                        </span>
                      );
                    }
                  }
                  
                  // Add page buttons for the visible range
                  for (let i = startPage; i <= endPage; i++) {
                    pageButtons.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`relative inline-flex items-center px-4 py-2 border border-[#bff747]/30 text-sm font-medium ${
                          currentPage === i
                            ? 'z-10 bg-[#bff747]/20 border-[#bff747] text-[#bff747]'
                            : 'bg-[#0c0c0c] border-[#bff747]/30 text-[#bff747] hover:bg-[#2a2a2a]'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  
                  // Add last page and ellipsis if needed
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pageButtons.push(
                        <span
                          key="end-ellipsis"
                          className="relative inline-flex items-center px-4 py-2 border border-[#bff747]/30 bg-[#0c0c0c] text-sm font-medium text-[#bff747]"
                        >
                          ...
                        </span>
                      );
                    }
                    
                    pageButtons.push(
                      <button
                        key={totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        className={`relative inline-flex items-center px-4 py-2 border border-[#bff747]/30 text-sm font-medium ${
                          currentPage === totalPages
                            ? 'z-10 bg-[#bff747]/20 border-[#bff747] text-[#bff747]'
                            : 'bg-[#0c0c0c] border-[#bff747]/30 text-[#bff747] hover:bg-[#2a2a2a]'
                        }`}
                      >
                        {totalPages}
                      </button>
                    );
                  }
                  
                  return pageButtons;
                })()}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#bff747]/30 bg-[#0c0c0c] text-sm font-medium text-[#bff747] hover:bg-[#2a2a2a] disabled:opacity-50"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;