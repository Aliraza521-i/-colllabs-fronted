import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FAQ from './FAQ';
import { orderAPI, handleApiError } from '../../../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    orderRequests: [],
    approvedRequests: [],
    completedRequests: [],
    improvementRequests: [],
    rejectedRequests: [],
    totalEarnings: 0,
    thisMonthEarnings: 0,
    statistics: {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      successRate: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data on component mount
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const response = await orderAPI.getDashboard();
      
      // Check if response is successful
      if (response.status === 200 && response.data && response.data.ok) {
        // Even if there are no orders, we should still show the dashboard
        const data = response.data.data;
        setDashboardData({
          orderRequests: data.orderRequests || [],
          approvedRequests: data.approvedRequests || [],
          completedRequests: data.completedRequests || [],
          improvementRequests: data.improvementRequests || [],
          rejectedRequests: data.rejectedRequests || [],
          totalEarnings: data.totalEarnings || 0,
          thisMonthEarnings: data.thisMonthEarnings || 0,
          statistics: {
            totalOrders: data.statistics?.totalOrders || 0,
            pendingOrders: data.statistics?.pendingOrders || 0,
            completedOrders: data.statistics?.completedOrders || 0,
            successRate: data.statistics?.successRate || 0
          }
        });
      } else {
        // Handle case where response is not successful but not necessarily an error
        setDashboardData({
          orderRequests: [],
          approvedRequests: [],
          completedRequests: [],
          improvementRequests: [],
          rejectedRequests: [],
          totalEarnings: 0,
          thisMonthEarnings: 0,
          statistics: {
            totalOrders: 0,
            pendingOrders: 0,
            completedOrders: 0,
            successRate: 0
          }
        });
      }
    } catch (err) {
      setError(handleApiError(err));
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Expose fetchDashboardData to be called from other components
  useEffect(() => {
    window.refreshPublisherDashboard = fetchDashboardData;
    return () => {
      // Clean up the global function when component unmounts
      delete window.refreshPublisherDashboard;
    };
  }, [fetchDashboardData]);

  const handleViewDetails = (orderId) => {
    // Navigate to order details page
    if (orderId) {
      navigate(`/publisher/sales/${orderId}`);
    }
  };

  const handleSeeAll = (category) => {
    // Navigate to sales page with filter for specific category
    switch(category) {
      case 'requests':
        navigate('/publisher/sales?status=pending');
        break;
      case 'approved':
        navigate('/publisher/sales?status=approved');
        break;
      case 'completed':
        navigate('/publisher/sales?status=completed');
        break;
      case 'improvement':
        navigate('/publisher/sales?status=revision_requested');
        break;
      case 'rejected':
        navigate('/publisher/sales?status=rejected');
        break;
      default:
        navigate('/publisher/sales');
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bff747] mx-auto mb-4"></div>
          <p className="text-[#bff747]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-900/30 border border-red-500 text-red-400 px-4 py-3 rounded mb-4">
            <p className="font-medium">Error loading dashboard</p>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="bg-[#bff747] text-[#0c0c0c] px-4 py-2 rounded hover:bg-[#bff747]/80 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const RequestCard = ({ title, bgColor, data, showExpired = false, category }) => {
    // Show a message when there are no requests in this category
    if (data.length === 0) {
      return (
        <div className={`${bgColor} rounded-xl p-4 w-full border border-[#bff747]/30 shadow-xl`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-[#bff747]">
              {title}
            </h2>
            <button 
              onClick={() => handleSeeAll(category)}
              className="text-[#bff747] hover:text-white text-sm"
            >
              See all
            </button>
          </div>
          <div className="text-center py-8 text-gray-400">
            <p>No {title.toLowerCase()} at this time</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`${bgColor} rounded-xl p-4 w-full border border-[#bff747]/30 shadow-xl`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-[#bff747]">
            {title}
          </h2>
          <button 
            onClick={() => handleSeeAll(category)}
            className="text-[#bff747] hover:text-white text-sm"
          >
            See all
          </button>
        </div>

        {/* Table Header - Made responsive */}
        <div className="grid grid-cols-5 gap-2 pb-2 border-b border-[#bff747]/30 mb-3 hidden sm:grid">
          <div className="text-sm font-medium text-[#bff747]">Order ID</div>
          <div className="text-sm font-medium text-[#bff747]">Website</div>
          <div className="text-sm font-medium text-[#bff747]">Due Date</div>
          <div className="text-sm font-medium text-[#bff747]">Price</div>
          <div></div>
        </div>

        {/* Table Rows - Made responsive */}
        <div className="space-y-4">
          {data.slice(0, 5).map((request, index) => (
            <div key={index} className="py-2 border-b border-[#bff747]/10 last:border-b-0">
              {/* Mobile view */}
              <div className="sm:hidden">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-sm font-medium text-[#bff747]">Order ID: {request.orderId || request._id}</div>
                    <div className="text-xs text-gray-400">{request.website?.domain || request.website || 'N/A'}</div>
                  </div>
                  <button 
                    onClick={() => handleViewDetails(request._id)}
                    className="text-[#bff747] hover:text-white text-sm underline"
                  >
                    View
                  </button>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="text-gray-300">
                    <div>{formatDate(request.deadline || request.createdAt)}</div>
                    {showExpired && request.expired && (
                      <div className="text-red-400 text-xs mt-1">{request.expired}</div>
                    )}
                  </div>
                  <div className="text-gray-300 flex items-center gap-1">
                    <span>${request.publisherEarnings || request.totalPrice || 0}</span>
                    {request.bonus && (
                      <span className="text-[#bff747] text-xs">
                        {request.bonus}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Desktop view */}
              <div className="hidden sm:grid grid-cols-5 gap-4 py-2 border-b border-[#bff747]/10 last:border-b-0">
                <div className="text-gray-300 text-sm">
                  {request.orderId || request._id || 'N/A'}
                </div>
                <div className="text-gray-300 text-sm">
                  {request.website?.domain || request.website || 'N/A'}
                </div>
                <div className="text-gray-300 text-sm">
                  <div>{formatDate(request.deadline || request.createdAt)}</div>
                  {showExpired && request.expired && (
                    <div className="text-red-400 text-xs mt-1">{request.expired}</div>
                  )}
                </div>
                <div className="text-gray-300 text-sm flex items-center gap-1">
                  <span>${request.publisherEarnings || request.totalPrice || 0}</span>
                  {request.bonus && (
                    <span className="text-[#bff747] text-xs">
                      {request.bonus}
                    </span>
                  )}
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={() => handleViewDetails(request._id)}
                    className="text-[#bff747] hover:text-white text-sm underline"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* See More Button */}
        {data.length > 5 && (
          <div className="flex justify-center mt-6">
            <button 
              onClick={() => handleSeeAll(category)}
              className="text-[#bff747] hover:text-white font-medium flex items-center gap-2 text-sm"
            >
              See more
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Dashboard Header with Refresh */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#bff747]">Publisher Dashboard</h1>
          <button 
            onClick={refreshData}
            className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#bff747] px-4 py-2 rounded-lg border border-[#bff747]/30 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        {/* First Row - 2 Cards - Made responsive */}
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="w-full md:w-1/2">
            <RequestCard 
              title="Order Requests" 
              bgColor="bg-[#0c0c0c]" 
              data={dashboardData.orderRequests}
              showExpired={true}
              category="requests"
            />
          </div>
          <div className="w-full md:w-1/2">
            <RequestCard 
              title="Approved Requests" 
              bgColor="bg-[#0c0c0c]" 
              data={dashboardData.approvedRequests}
              showExpired={true}
              category="approved"
            />
          </div>
        </div>

        {/* Second Row - 2 Cards - Made responsive */}
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="w-full md:w-1/2">
            <RequestCard 
              title="Completed Requests" 
              bgColor="bg-[#0c0c0c]" 
              data={dashboardData.completedRequests}
              category="completed"
            />
          </div>
          <div className="w-full md:w-1/2">
            <RequestCard 
              title="Improvement Requests" 
              bgColor="bg-[#0c0c0c]" 
              data={dashboardData.improvementRequests}
              category="improvement"
            />
          </div>
        </div>

        {/* Third Row - 1 Card Centered - Made responsive */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-full max-w-md">
            <RequestCard 
              title="Rejected Requests" 
              bgColor="bg-[#0c0c0c]" 
              data={dashboardData.rejectedRequests}
              category="rejected"
            />
          </div>
        </div>

        {/* Statistics Cards - Made responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4 mb-4 sm:mb-6">
          <div 
            onClick={() => navigate('/publisher/earnings')}
            className="bg-[#0c0c0c] p-4 sm:p-6 rounded-xl border border-[#bff747]/30 shadow-lg cursor-pointer hover:bg-[#1a1a1a] transition-colors"
          >
            <h3 className="text-base sm:text-lg font-semibold text-[#bff747] mb-2">Total Earnings</h3>
            <p className="text-xl sm:text-2xl font-bold text-[#bff747]">${dashboardData.totalEarnings.toFixed(2)}</p>
          </div>
          <div 
            onClick={() => navigate('/publisher/earnings')}
            className="bg-[#0c0c0c] p-4 sm:p-6 rounded-xl border border-[#bff747]/30 shadow-lg cursor-pointer hover:bg-[#1a1a1a] transition-colors"
          >
            <h3 className="text-base sm:text-lg font-semibold text-[#bff747] mb-2">This Month</h3>
            <p className="text-xl sm:text-2xl font-bold text-[#bff747]">${dashboardData.thisMonthEarnings.toFixed(2)}</p>
          </div>
          <div 
            onClick={() => navigate('/publisher/sales')}
            className="bg-[#0c0c0c] p-4 sm:p-6 rounded-xl border border-[#bff747]/30 shadow-lg cursor-pointer hover:bg-[#1a1a1a] transition-colors"
          >
            <h3 className="text-base sm:text-lg font-semibold text-[#bff747] mb-2">Total Orders</h3>
            <p className="text-xl sm:text-2xl font-bold text-[#bff747]">{dashboardData.statistics.totalOrders}</p>
          </div>
          <div 
            onClick={() => navigate('/publisher/analytics')}
            className="bg-[#0c0c0c] p-4 sm:p-6 rounded-xl border border-[#bff747]/30 shadow-lg cursor-pointer hover:bg-[#1a1a1a] transition-colors"
          >
            <h3 className="text-base sm:text-lg font-semibold text-[#bff747] mb-2">Success Rate</h3>
            <p className="text-xl sm:text-2xl font-bold text-[#bff747]">{dashboardData.statistics.successRate}%</p>
          </div>
        </div>
      </div>
      <FAQ/>
    </div>
  );
};

export default Home;