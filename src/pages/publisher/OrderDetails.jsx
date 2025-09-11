import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const OrderDetails = ({ order, onUpdate }) => {
  const navigate = useNavigate();
  const [revisionReason, setRevisionReason] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Order details not available</h3>
      </div>
    );
  }

  const handleApproveOrder = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.approveOrder(order._id, {});
      if (response.data) {
        onUpdate();
        alert('Order approved successfully!');
      }
    } catch (err) {
      setError('Failed to approve order. Please try again.');
      console.error('Error approving order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectOrder = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.rejectOrder(order._id, {
        rejectionReason: 'Order rejected by publisher'
      });
      if (response.data) {
        onUpdate();
        alert('Order rejected successfully!');
      }
    } catch (err) {
      setError('Failed to reject order. Please try again.');
      console.error('Error rejecting order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitContent = async () => {
    try {
      setLoading(true);
      // This would typically open a form to submit the content
      // For now, we'll just show an alert
      alert('Content submission form would open here');
    } catch (err) {
      setError('Failed to submit content. Please try again.');
      console.error('Error submitting content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.createOrderChat(order._id);
      if (response.data && response.data.ok) {
        // Navigate to the newly created chat
        navigate(`/publisher/messages?chatId=${response.data.data._id}`);
      } else {
        // If chat already exists or there's another issue, navigate to messages page
        navigate('/publisher/messages');
      }
    } catch (err) {
      setError('Failed to create chat. Please try again.');
      console.error('Error creating chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30', text: 'Pending' },
      approved: { class: 'bg-blue-900/30 text-blue-400 border border-blue-500/30', text: 'Approved' },
      in_progress: { class: 'bg-purple-900/30 text-purple-400 border border-purple-500/30', text: 'In Progress' },
      completed: { class: 'bg-indigo-900/30 text-indigo-400 border border-indigo-500/30', text: 'Content Submitted' },
      delivered: { class: 'bg-green-900/30 text-green-400 border border-green-500/30', text: 'Delivered' },
      revision_requested: { class: 'bg-orange-900/30 text-orange-400 border border-orange-500/30', text: 'Revision Requested' },
      disputed: { class: 'bg-red-900/30 text-red-400 border border-red-500/30', text: 'Disputed' },
      cancelled: { class: 'bg-gray-900/30 text-gray-400 border border-gray-500/30', text: 'Cancelled' },
      rejected: { class: 'bg-red-900/30 text-red-400 border border-red-500/30', text: 'Rejected' }
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
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

  return (
    <div className="bg-[#0c0c0c] rounded-lg shadow p-6 border border-[#bff747]/30">
      <div className="flex justify-between items-start mb-6 flex-col md:flex-row">
        <div className="mb-4 md:mb-0">
          <h2 className="text-2xl font-bold text-[#bff747]">Order #{order.orderId?.substring(0, 8)}</h2>
          <p className="text-gray-400 mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        {getStatusBadge(order.status)}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-md">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Order Details */}
          <div className="border border-[#bff747]/30 rounded-lg p-6 mb-6 bg-[#0c0c0c]">
            <h3 className="text-lg font-semibold text-[#bff747] mb-4">Order Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Website</p>
                <p className="font-medium text-gray-300">{order.websiteId?.domain || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Advertiser</p>
                <p className="font-medium text-gray-300">
                  {order.advertiserId?.firstName} {order.advertiserId?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Order Date</p>
                <p className="font-medium text-gray-300">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Deadline</p>
                <p className="font-medium text-gray-300">{formatDate(order.deadline)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Word Count</p>
                <p className="font-medium text-gray-300">{order.contentRequirements?.wordCount || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Link Type</p>
                <p className="font-medium text-gray-300 capitalize">{order.contentRequirements?.linkType || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Content Requirements */}
          <div className="border border-[#bff747]/30 rounded-lg p-6 mb-6 bg-[#0c0c0c]">
            <h3 className="text-lg font-semibold text-[#bff747] mb-4">Content Requirements</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Title</p>
                <p className="font-medium text-gray-300">{order.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Description</p>
                <p className="font-medium text-gray-300">{order.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Keywords</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {order.contentRequirements?.keywords?.map((keyword, index) => (
                    <span key={index} className="bg-[#bff747]/20 text-[#bff747] text-xs px-2 py-1 rounded">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Target URL</p>
                <p className="font-medium text-[#bff747]">{order.contentRequirements?.targetUrl}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Anchor Text</p>
                <p className="font-medium text-gray-300">{order.contentRequirements?.anchorText}</p>
              </div>
              {order.contentRequirements?.additionalInstructions && (
                <div>
                  <p className="text-sm text-gray-400">Additional Instructions</p>
                  <p className="font-medium text-gray-300">{order.contentRequirements.additionalInstructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border border-[#bff747]/30 rounded-lg p-6 bg-[#0c0c0c]">
            <h3 className="text-lg font-semibold text-[#bff747] mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              {order.status === 'pending' && (
                <>
                  <button
                    onClick={handleApproveOrder}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve Order
                  </button>
                  <button
                    onClick={handleRejectOrder}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject Order
                  </button>
                </>
              )}
              {order.status === 'approved' && (
                <button
                  onClick={handleSubmitContent}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Submit Content
                </button>
              )}
              {order.chatId ? (
                <button
                  onClick={() => navigate(`/publisher/messages?chatId=${order.chatId}`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                  Chat with Advertiser
                </button>
              ) : (
                <button
                  onClick={handleCreateChat}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                  Create Chat with Advertiser
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {/* Pricing Summary */}
          <div className="border border-[#bff747]/30 rounded-lg p-6 mb-6 bg-[#0c0c0c]">
            <h3 className="text-lg font-semibold text-[#bff747] mb-4">Pricing Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Base Price</span>
                <span className="font-medium text-gray-300">{formatPrice(order.basePrice)}</span>
              </div>
              {order.additionalCharges?.copywriting > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Copywriting</span>
                  <span className="font-medium text-gray-300">{formatPrice(order.additionalCharges.copywriting)}</span>
                </div>
              )}
              {order.additionalCharges?.rushOrder > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Rush Order</span>
                  <span className="font-medium text-gray-300">{formatPrice(order.additionalCharges.rushOrder)}</span>
                </div>
              )}
              {order.additionalCharges?.homepageAnnouncement > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Homepage Announcement</span>
                  <span className="font-medium text-gray-300">{formatPrice(order.additionalCharges.homepageAnnouncement)}</span>
                </div>
              )}
              {order.discount?.amount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount.amount)}</span>
                </div>
              )}
              <div className="border-t border-[#bff747]/30 pt-3 flex justify-between font-semibold">
                <span className="text-[#bff747]">Total</span>
                <span className="text-[#bff747]">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="border border-[#bff747]/30 rounded-lg p-6 bg-[#0c0c0c]">
            <h3 className="text-lg font-semibold text-[#bff747] mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircleIcon className="h-4 w-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-300">Order Placed</p>
                  <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              {order.status !== 'pending' && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <CheckCircleIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-300">Order Approved</p>
                    <p className="text-sm text-gray-400">{order.approvedAt ? formatDate(order.approvedAt) : 'N/A'}</p>
                  </div>
                </div>
              )}
              {order.status === 'completed' && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center">
                    <CheckCircleIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-300">Content Submitted</p>
                    <p className="text-sm text-gray-400">{order.submittedAt ? formatDate(order.submittedAt) : 'N/A'}</p>
                  </div>
                </div>
              )}
              {order.status === 'delivered' && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircleIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-300">Order Delivered</p>
                    <p className="text-sm text-gray-400">{order.deliveredAt ? formatDate(order.deliveredAt) : 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;