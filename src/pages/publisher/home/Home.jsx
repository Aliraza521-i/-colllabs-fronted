import React, { useState, useEffect } from 'react';
import FAQ from './FAQ';
import { orderAPI, handleApiError } from '../../../services/api';

const Home = () => {
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
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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
  };

  const handleViewDetails = (orderId) => {
    // Navigate to order details page
    console.log('View details for order:', orderId);
    // You can implement navigation logic here
  };

  const formatDate = (dateString) => {
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

  // Show a message when there are no orders instead of an error
  const hasNoOrders = 
    dashboardData.orderRequests.length === 0 &&
    dashboardData.approvedRequests.length === 0 &&
    dashboardData.completedRequests.length === 0 &&
    dashboardData.improvementRequests.length === 0 &&
    dashboardData.rejectedRequests.length === 0;

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

  const RequestCard = ({ title, bgColor, data, showExpired = false }) => {
    // Show a message when there are no requests in this category
    if (data.length === 0) {
      return (
        <div className={`${bgColor} rounded-xl p-4 w-full border border-[#bff747]/30 shadow-xl`}>
          <h2 className="text-base font-semibold text-[#bff747] mb-4">
            {title}
          </h2>
          <div className="text-center py-8 text-gray-400">
            <p>No {title.toLowerCase()} at this time</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`${bgColor} rounded-xl p-4 w-full border border-[#bff747]/30 shadow-xl`}>
        <h2 className="text-base font-semibold text-[#bff747] mb-4">
          {title}
        </h2>

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
          {data.map((request, index) => (
            <div key={index} className="py-2 border-b border-[#bff747]/10 last:border-b-0">
              {/* Mobile view */}
              <div className="sm:hidden">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-sm font-medium text-[#bff747]">Order ID: {request.orderId}</div>
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
                  {request.orderId}
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
        <div className="flex justify-center mt-6">
          <button className="text-[#bff747] hover:text-white font-medium flex items-center gap-2 text-sm">
            See more
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-4">
      <div className="max-w-6xl mx-auto">
        {/* First Row - 2 Cards - Made responsive */}
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="w-full md:w-1/2">
            <RequestCard 
              title="Order Requests" 
              bgColor="bg-[#0c0c0c]" 
              data={dashboardData.orderRequests}
              showExpired={true}
            />
          </div>
          <div className="w-full md:w-1/2">
            <RequestCard 
              title="Approved Requests" 
              bgColor="bg-[#0c0c0c]" 
              data={dashboardData.approvedRequests}
              showExpired={true}
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
            />
          </div>
          <div className="w-full md:w-1/2">
            <RequestCard 
              title="Improvement Requests" 
              bgColor="bg-[#0c0c0c]" 
              data={dashboardData.improvementRequests}
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
            />
          </div>
        </div>

        {/* Statistics Cards - Made responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-[#0c0c0c] p-4 sm:p-6 rounded-xl border border-[#bff747]/30 shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold text-[#bff747] mb-2">Total Earnings</h3>
            <p className="text-xl sm:text-2xl font-bold text-[#bff747]">${dashboardData.totalEarnings}</p>
          </div>
          <div className="bg-[#0c0c0c] p-4 sm:p-6 rounded-xl border border-[#bff747]/30 shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold text-[#bff747] mb-2">This Month</h3>
            <p className="text-xl sm:text-2xl font-bold text-[#bff747]">${dashboardData.thisMonthEarnings}</p>
          </div>
          <div className="bg-[#0c0c0c] p-4 sm:p-6 rounded-xl border border-[#bff747]/30 shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold text-[#bff747] mb-2">Total Orders</h3>
            <p className="text-xl sm:text-2xl font-bold text-[#bff747]">{dashboardData.statistics.totalOrders}</p>
          </div>
          <div className="bg-[#0c0c0c] p-4 sm:p-6 rounded-xl border border-[#bff747]/30 shadow-lg">
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