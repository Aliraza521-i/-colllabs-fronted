import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, RefreshCw } from 'lucide-react';
import { orderAPI } from '../../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

const Sales = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [salesData, setSalesData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Order Status');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPublisherModal, setShowPublisherModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Check if there's an order ID in the URL to highlight
  const urlParams = new URLSearchParams(location.search);
  const highlightedOrderId = urlParams.get('orderId');

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
        const transformedData = response.data.data.map((order, index) => {
          const articleType = order.contentRequirements?.needsCopywriting ? 'publisher' : 'own';
          console.log('Order:', order.orderId, 'needsCopywriting:', order.contentRequirements?.needsCopywriting, 'articleType:', articleType);
          
          return {
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
            bonus: order.rushOrder ? (order.totalPrice * 0.2) : 0, // Example bonus calculation
            // Added fields for article type detection
            articleType: articleType, // 'publisher' or 'own'
            articleData: order.articleData || null, // Data for "Choose My Own Article"
            advertiserName: `${order.advertiserId?.firstName || ''} ${order.advertiserId?.lastName || ''}`.trim() || 'N/A',
            advertiserRating: order.advertiserId?.rating || 4.5,
            advertiserReviewCount: order.advertiserId?.reviewCount || 24,
            project: order.project || 'Tech Blog Project',
            anchorText: order.contentRequirements?.anchorText || '',
            targetUrl: order.contentRequirements?.targetUrl || '',
            articleRequirements: order.contentRequirements?.additionalInstructions || '',
            isHighlighted: order._id === highlightedOrderId
          }
        });
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
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchSalesData();
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
    const link = prompt('Please enter the published link:');
    if (!link) return;
    
    try {
      const response = await orderAPI.submitOrder(id, { publishedUrl: link });
      if (response.data && response.data.ok) {
        // Refresh the data to show updated status
        fetchSalesData();
      } else {
        throw new Error(response.data?.message || 'Failed to submit link');
      }
    } catch (error) {
      console.error('Error submitting link:', error);
      alert('Failed to submit link. Please try again.');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Please provide a reason for rejecting this order:');
    if (!reason) return;
    
    try {
      const response = await orderAPI.rejectOrder(id, { rejectionReason: reason });
      if (response.data && response.data.ok) {
        // Refresh the data to show updated status
        fetchSalesData();
      } else {
        throw new Error(response.data?.message || 'Failed to reject order');
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order. Please try again.');
    }
  };

  const handleSubmitFeedback = async (id) => {
    const feedback = prompt('Please provide your feedback for this order:');
    if (!feedback) return;
    
    try {
      // Submit feedback as a message using the existing orderAPI
      const response = await orderAPI.addMessage(id, { 
        message: `Feedback from publisher: ${feedback}`,
        messageType: 'feedback'
      });
      
      if (response.data && response.data.ok) {
        alert('Feedback submitted successfully!');
        // Refresh data after submission
        fetchSalesData();
      } else {
        throw new Error(response.data?.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  // Handle "View Details" button click
  const handleViewDetails = async (item) => {
    console.log('View Details clicked for item:', item);
    console.log('Article type:', item.articleType);
    
    // Rule 1: If advertiser selected "Want publisher to write Article", open popup
    if (item.articleType === 'publisher') {
      console.log('Opening publisher modal');
      setSelectedOrder(item);
      setShowPublisherModal(true);
    } 
    // Rule 2: If advertiser selected "Write my own article", navigate to article page
    else if (item.articleType === 'own') {
      console.log('Navigating to article page');
      // Navigate to the article page with the order data
      navigate('/publisher/sales/article', { state: { articleData: item.articleData, orderId: item.orderId } });
    }
  };

  const getActionButton = (item) => {
    // For pending orders, show Accept/Reject buttons
    // Map formatted status back to raw status for comparison
    const statusMap = {
      'New Request': 'pending',
      'Approved': 'approved',
      'In Progress': 'in_progress',
      'Completed': 'completed',
      'Delivered': 'delivered',
      'Under Review': 'revision_requested',
      'Rejected': 'rejected',
      'Cancelled': 'cancelled'
    };
    
    const rawStatus = statusMap[item.status] || item.status;
    
    // For pending orders, show Accept/Reject buttons
    if (rawStatus === 'pending') {
      return (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleAcceptOrder(item.id)}
            className="px-4 py-1.5 text-sm bg-[#bff747] text-[#0c0c0c] rounded-md hover:bg-[#a8e035] transition-colors font-medium w-full"
          >
            Accept
          </button>
          <button
            onClick={() => handleRejectOrder(item.id)}
            className="px-4 py-1.5 text-sm border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 hover:border-gray-500 transition-colors font-medium w-full"
          >
            Reject
          </button>
        </div>
      );
    }
    
    // For approved/in progress orders, show Submit Link/Reject buttons
    if (rawStatus === 'approved' || rawStatus === 'in_progress') {
      return (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleSubmitLink(item.id)}
            className="px-4 py-1.5 text-sm bg-[#bff747] text-[#0c0c0c] rounded-md hover:bg-[#a8e035] transition-colors font-medium w-full"
          >
            Submit Link
          </button>
          <button
            onClick={() => handleRejectOrder(item.id)}
            className="px-4 py-1.5 text-sm border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 hover:border-gray-500 transition-colors font-medium w-full"
          >
            Reject
          </button>
        </div>
      );
    }
    
    // For completed/delivered orders, show Submit Feedback button
    if (rawStatus === 'completed' || rawStatus === 'delivered') {
      return (
        <button
          onClick={() => handleSubmitFeedback(item.id)}
          className="px-4 py-1.5 text-sm border border-[#bff747] text-[#bff747] rounded-md hover:bg-[#bff747] hover:text-[#0c0c0c] transition-colors font-medium w-full"
        >
          Submit Feedback
        </button>
      );
    }
    
    // Default case
    return (
      <button
        onClick={() => handleSubmitLink(item.id)}
        className="px-4 py-1.5 text-sm bg-[#bff747] text-[#0c0c0c] rounded-md hover:bg-[#a8e035] transition-colors font-medium w-full"
      >
        Submit Link
      </button>
    );
  };

  // Handle order acceptance
  const handleAcceptOrder = async (orderId) => {
    try {
      const response = await orderAPI.approveOrder(orderId, {});
      if (response.data && response.data.ok) {
        // Refresh the data to show updated status
        fetchSalesData();
      } else {
        throw new Error(response.data?.message || 'Failed to accept order');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Failed to accept order. Please try again.');
    }
  };

  // Handle order rejection
  const handleRejectOrder = async (orderId) => {
    const reason = prompt('Please provide a reason for rejecting this order:');
    if (!reason) return;
    
    try {
      const response = await orderAPI.rejectOrder(orderId, { rejectionReason: reason });
      if (response.data && response.data.ok) {
        // Refresh the data to show updated status
        fetchSalesData();
      } else {
        throw new Error(response.data?.message || 'Failed to reject order');
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order. Please try again.');
    }
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
          <h1 className="text-2xl font-bold text-[#bff747]">Sales</h1>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
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
            
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center justify-center px-4 py-2.5 bg-[#1a1a1a] border border-[#333] rounded-md text-white hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
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
              <div 
                key={item.id} 
                className={`border-b border-[#333] p-4 hover:bg-[#2a2a2a] ${item.isHighlighted ? 'bg-blue-900/20 border-blue-500/30' : ''}`}
              >
                {item.isHighlighted && (
                  <div className="bg-blue-900/30 text-blue-400 text-xs px-2 py-1 rounded mb-2 inline-block">
                    New Order
                  </div>
                )}
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
                
                <div className="mb-3">
                  <div className="text-xs text-gray-400">Article Type</div>
                  <div className="text-sm text-white">
                    {item.articleType === 'own' ? 'Advertiser Provided' : 'Publisher Written'}
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="text-xs text-gray-400">Price</div>
                    <div className="text-sm text-white font-semibold">${item.price}</div>
                    {item.bonus > 0 && (
                      <div className="text-xs text-green-400">+ ${item.bonus.toFixed(2)}</div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleViewDetails(item)}
                    className="text-xs text-[#bff747] hover:text-[#a8e035] underline"
                  >
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
              <div 
                key={item.id} 
                className={`border-b border-[#333] px-4 md:px-6 py-4 hover:bg-[#2a2a2a] ${index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#222]'} ${item.isHighlighted ? 'bg-blue-900/20 border-blue-500/30' : ''}`}
              >
                {item.isHighlighted && (
                  <div className="bg-blue-900/30 text-blue-400 text-xs px-2 py-1 rounded mb-2 inline-block">
                    New Order
                  </div>
                )}
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
                    <button 
                      onClick={() => handleViewDetails(item)}
                      className="text-sm text-[#bff747] hover:text-[#a8e035] underline"
                    >
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

      {/* Publisher Article Modal */}
      {showPublisherModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-lg border border-[#bff747]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-[#bff747]/30 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[#bff747]">Publisher Article Details</h2>
              <button 
                onClick={() => {
                  setShowPublisherModal(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h3 className="font-medium text-blue-400 mb-2">Advertiser Information</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="bg-[#bff747] w-12 h-12 rounded-full flex items-center justify-center text-[#0c0c0c] font-bold">
                      {selectedOrder.advertiserName.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white">{selectedOrder.advertiserName}</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(selectedOrder.advertiserRating) ? 'text-[#bff747]' : 'text-gray-600'}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-300">
                        {selectedOrder.advertiserRating} ({selectedOrder.advertiserReviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-[#bff747] mb-4">Project Information</h3>
                <div className="bg-[#2d2d2d] border border-[#bff747]/30 rounded-md p-4">
                  <p className="text-white font-medium">{selectedOrder.project}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Anchor Text
                  </label>
                  <div className="bg-[#2d2d2d] border border-[#bff747]/30 rounded-md p-3 text-white">
                    {selectedOrder.anchorText}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target URL
                  </label>
                  <div className="bg-[#2d2d2d] border border-[#bff747]/30 rounded-md p-3 text-white">
                    {selectedOrder.targetUrl}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Article Requirements
                  </label>
                  <div className="bg-[#2d2d2d] border border-[#bff747]/30 rounded-md p-3 text-white whitespace-pre-wrap">
                    {selectedOrder.articleRequirements}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    setShowPublisherModal(false);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 bg-[#bff747] text-[#0c0c0c] font-medium rounded-md hover:bg-[#a8e035] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;