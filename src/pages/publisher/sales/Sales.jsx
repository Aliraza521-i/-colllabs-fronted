import React, { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { orderAPI } from '../../../services/api';

const Sales = () => {
  const [salesData, setSalesData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Order Status');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderAPI.getPublisherOrders();
      
      if (response.data && response.data.ok) {
        // Transform API data to match component structure
        const transformedData = response.data.data.map((order, index) => ({
          id: order._id,
          site: order.websiteId?.domain || 'N/A',
          orderDate: new Date(order.createdAt).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          orderId: order.orderId || 'N/A',
          client: `${order.advertiserId?.firstName || ''} ${order.advertiserId?.lastName || ''}`.trim() || 'N/A',
          reviews: 43, // This would need to come from a different API endpoint
          articleUrl: order.targetUrl || '#',
          status: formatStatus(order.status),
          price: order.publisherEarnings || order.totalPrice || 0,
          bonus: order.rushOrder ? (order.totalPrice * 0.2) : 0 // Example bonus calculation
        }));
        setSalesData(transformedData);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setError('Failed to load sales data. Please try again later.');
      // Fallback to empty array
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      'pending': 'New Request',
      'approved': 'Approved',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'delivered': 'Delivered',
      'revision_requested': 'Under Review',
      'rejected': 'Rejected',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const handleSubmitLink = async (id) => {
    try {
      // In a real implementation, this would call the appropriate API endpoint
      console.log(`Submitting link for order ${id}`);
      // For now, we'll just show an alert
      alert(`Would submit link for order ${id}`);
      // Refresh data after submission
      // fetchSalesData();
    } catch (error) {
      console.error('Error submitting link:', error);
      alert('Failed to submit link. Please try again.');
    }
  };

  const handleReject = async (id) => {
    try {
      // In a real implementation, this would call the appropriate API endpoint
      console.log(`Rejecting order ${id}`);
      // For now, we'll just show an alert
      alert(`Would reject order ${id}`);
      // Refresh data after rejection
      // fetchSalesData();
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order. Please try again.');
    }
  };

  const handleSubmitFeedback = async (id) => {
    try {
      // In a real implementation, this would call the appropriate API endpoint
      console.log(`Submitting feedback for order ${id}`);
      // For now, we'll just show an alert
      alert(`Would submit feedback for order ${id}`);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  const getActionButton = (item) => {
    if (item.status === 'Completed' || item.status === 'Delivered') {
      return (
        <button
          onClick={() => handleSubmitFeedback(item.id)}
          className="px-4 py-1.5 text-sm border border-[#bff747] text-[#bff747] rounded-md hover:bg-[#bff747] hover:text-[#0c0c0c] transition-colors font-medium w-full"
        >
          Submit Feedback
        </button>
      );
    }
    return (
      <button
        onClick={() => handleSubmitLink(item.id)}
        className="px-4 py-1.5 text-sm bg-[#bff747] text-[#0c0c0c] rounded-md hover:bg-[#a8e035] transition-colors font-medium w-full"
      >
        Submit Link
      </button>
    );
  };

  const filteredData = salesData.filter(item =>
    (item.client && item.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.orderId && item.orderId.includes(searchTerm)) ||
    (item.site && item.site.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bff747] mx-auto mb-4"></div>
          <p className="text-[#bff747]">Loading sales data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-900/30 border border-red-500 text-red-400 px-4 py-3 rounded mb-4">
            <p className="font-medium">Error loading sales data</p>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={fetchSalesData}
            className="bg-[#bff747] text-[#0c0c0c] px-4 py-2 rounded hover:bg-[#bff747]/80 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-2.5 w-full bg-[#1a1a1a] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bff747] focus:border-[#bff747] text-white placeholder-gray-400"
            />
            <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
          </div>
          
          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-[#1a1a1a] border border-[#333] rounded-md px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#bff747] focus:border-[#bff747] text-white w-full"
            >
              <option className="bg-[#1a1a1a]">Order Status</option>
              <option className="bg-[#1a1a1a]">New Request</option>
              <option className="bg-[#1a1a1a]">In Progress</option>
              <option className="bg-[#1a1a1a]">Completed</option>
              <option className="bg-[#1a1a1a]">Under Review</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden">
          {/* Table Header - Hidden on mobile */}
          <div className="hidden md:block bg-[#2a2a2a] border-b border-[#333] px-4 md:px-6 py-4">
            <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-[#bff747] uppercase tracking-wider">
              <div className="col-span-2">YOUR SITE</div>
              <div className="col-span-2">ORDER DATE/ID</div>
              <div className="col-span-1">TASKS</div>
              <div className="col-span-2">CLIENT</div>
              <div className="col-span-2">ARTICLE URL</div>
              <div className="col-span-1">STATUS</div>
              <div className="col-span-1">PRICE</div>
              <div className="col-span-1">ACTIONS</div>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden">
            {filteredData.map((item) => (
              <div key={item.id} className="border-b border-[#333] p-4 hover:bg-[#2a2a2a]">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-6 bg-[#bff747] rounded-sm flex items-center justify-center mr-3 flex-shrink-0">
                      <div className="w-3 h-2 bg-[#0c0c0c] rounded-sm"></div>
                    </div>
                    <span className="text-sm text-white font-medium truncate">{item.site}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    item.status === 'Completed' || item.status === 'Delivered'
                      ? 'bg-green-900 text-green-300' 
                      : item.status === 'New Request' || item.status === 'Approved'
                        ? 'bg-blue-900 text-blue-300' 
                        : 'bg-yellow-900 text-yellow-300'
                  }`}>
                    {item.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-xs text-gray-400">Order Date</div>
                    <div className="text-sm text-white">{item.orderDate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Order ID</div>
                    <div className="text-sm text-white">#{item.orderId}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Client</div>
                    <div className="text-sm text-white font-medium">{item.client}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Reviews</div>
                    <div className="text-sm text-white">{item.reviews}</div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-xs text-gray-400">Article URL</div>
                  <a href={item.articleUrl} className="text-sm text-[#bff747] hover:underline truncate block">
                    {item.articleUrl}
                  </a>
                </div>
                
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="text-xs text-gray-400">Price</div>
                    <div className="text-sm text-white font-semibold">${item.price}</div>
                    {item.bonus > 0 && (
                      <div className="text-xs text-green-400">+ ${item.bonus.toFixed(2)}</div>
                    )}
                  </div>
                  <button className="text-xs text-[#bff747] hover:text-[#a8e035] underline">
                    View Details
                  </button>
                </div>
                
                <div className="flex flex-col gap-2">
                  {getActionButton(item)}
                  <button
                    onClick={() => handleReject(item.id)}
                    className="px-4 py-1.5 text-sm border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 hover:border-gray-500 transition-colors font-medium w-full"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            {filteredData.map((item, index) => (
              <div key={item.id} className={`border-b border-[#333] px-4 md:px-6 py-4 hover:bg-[#2a2a2a] ${index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#222]'}`}>
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Site */}
                  <div className="col-span-2 flex items-center">
                    <div className="w-8 h-6 bg-[#bff747] rounded-sm flex items-center justify-center mr-3 flex-shrink-0">
                      <div className="w-3 h-2 bg-[#0c0c0c] rounded-sm"></div>
                    </div>
                    <span className="text-sm text-white truncate">{item.site}</span>
                  </div>

                  {/* Order Date/ID */}
                  <div className="col-span-2">
                    <div className="text-sm text-white">{item.orderDate}</div>
                    <div className="text-sm text-gray-400">ID: {item.orderId}</div>
                  </div>

                  {/* Tasks */}
                  <div className="col-span-1">
                    <button className="text-sm text-[#bff747] hover:text-[#a8e035] underline">
                      View Details
                    </button>
                  </div>

                  {/* Client */}
                  <div className="col-span-2">
                    <div className="text-sm text-white font-medium">{item.client}</div>
                    <div className="text-sm text-gray-400">{item.reviews} Reviews</div>
                  </div>

                  {/* Article URL */}
                  <div className="col-span-2">
                    <a href={item.articleUrl} className="text-sm text-[#bff747] truncate block hover:underline">
                      {item.articleUrl}
                    </a>
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      item.status === 'Completed' || item.status === 'Delivered'
                        ? 'bg-green-900 text-green-300' 
                        : item.status === 'New Request' || item.status === 'Approved'
                          ? 'bg-blue-900 text-blue-300' 
                          : 'bg-yellow-900 text-yellow-300'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="col-span-1">
                    <div className="text-sm text-white font-semibold">${item.price.toFixed(2)}</div>
                    {item.bonus > 0 && (
                      <div className="text-sm text-green-400">+ ${item.bonus.toFixed(2)}</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex flex-col space-y-2">
                    {getActionButton(item)}
                    <button
                      onClick={() => handleReject(item.id)}
                      className="px-4 py-1.5 text-sm border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 hover:border-gray-500 transition-colors font-medium"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No sales data found
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;