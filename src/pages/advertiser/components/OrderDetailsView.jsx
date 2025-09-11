import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { advertiserAPI } from '../../../services/api';
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

const OrderDetailsView = ({ order, onUpdate }) => {
  const navigate = useNavigate();
  const [revisionReason, setRevisionReason] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-[#bff747]">Order details not available</h3>
      </div>
    );
  }

  const handleApproveContent = async () => {
    try {
      setLoading(true);
      const response = await advertiserAPI.approveContent(order._id);
      if (response.data) {
        onUpdate();
        alert('Content approved successfully!');
      }
    } catch (err) {
      setError('Failed to approve content. Please try again.');
      console.error('Error approving content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRevision = async (e) => {
    e.preventDefault();
    if (!revisionReason.trim()) {
      setError('Please provide a reason for the revision request.');
      return;
    }

    try {
      setLoading(true);
      const response = await advertiserAPI.requestRevision(order._id, {
        revisionRequest: revisionReason
      });
      if (response.data) {
        onUpdate();
        setShowRevisionForm(false);
        setRevisionReason('');
        alert('Revision requested successfully!');
      }
    } catch (err) {
      setError('Failed to request revision. Please try again.');
      console.error('Error requesting revision:', err);
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
    <div className="bg-[#1a1a1a] rounded-lg shadow p-6 border border-[#bff747]/30">
      <div className="flex justify-between items-start mb-6">
        <div>
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
          <div className="border border-[#bff747]/30 rounded-lg p-6 mb-6 bg-[#1a1a1a]">
            <h3 className="text-lg font-semibold text-[#bff747] mb-4">Order Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Website</p>
                <p className="font-medium text-[#bff747]">{order.websiteId?.domain || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Publisher</p>
                <p className="font-medium text-[#bff747]">
                  {order.publisherId?.firstName} {order.publisherId?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Order Date</p>
                <p className="font-medium text-[#bff747]">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Deadline</p>
                <p className="font-medium text-[#bff747]">{formatDate(order.deadline)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Word Count</p>
                <p className="font-medium text-[#bff747]">{order.contentRequirements?.wordCount || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Link Type</p>
                <p className="font-medium text-[#bff747] capitalize">{order.contentRequirements?.linkType || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Content Requirements */}
          <div className="border border-[#bff747]/30 rounded-lg p-6 mb-6 bg-[#1a1a1a]">
            <h3 className="text-lg font-semibold text-[#bff747] mb-4">Content Requirements</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Title</p>
                <p className="font-medium text-[#bff747]">{order.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Description</p>
                <p className="font-medium text-[#bff747]">{order.description}</p>
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
                <p className="font-medium text-[#bff747]">{order.contentRequirements?.anchorText}</p>
              </div>
              {order.contentRequirements?.additionalInstructions && (
                <div>
                  <p className="text-sm text-gray-400">Additional Instructions</p>
                  <p className="font-medium text-[#bff747]">{order.contentRequirements.additionalInstructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Submitted Content */}
          {order.status === 'completed' && order.submittedContent && (
            <div className="border border-[#bff747]/30 rounded-lg p-6 mb-6 bg-[#1a1a1a]">
              <h3 className="text-lg font-semibold text-[#bff747] mb-4">Submitted Content</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Content</p>
                  <div className="mt-2 p-4 bg-[#2a2a2a] rounded-lg max-h-60 overflow-y-auto border border-[#bff747]/20">
                    <p className="whitespace-pre-wrap text-gray-300">{order.submittedContent.content}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Published URL</p>
                  <p className="font-medium text-[#bff747] mt-1">
                    <a href={order.submittedContent.publishedUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {order.submittedContent.publishedUrl}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Submitted At</p>
                  <p className="font-medium text-[#bff747]">{formatDate(order.submittedContent.submittedAt)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="border border-[#bff747]/30 rounded-lg p-6 bg-[#1a1a1a]">
            <h3 className="text-lg font-semibold text-[#bff747] mb-4">Pricing</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Base Price</span>
                <span className="font-medium text-[#bff747]">{formatPrice(order.basePrice)}</span>
              </div>
              {order.additionalCharges?.copywriting > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Copywriting</span>
                  <span className="font-medium text-[#bff747]">{formatPrice(order.additionalCharges.copywriting)}</span>
                </div>
              )}
              {order.additionalCharges?.rushOrder > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Rush Order Fee</span>
                  <span className="font-medium text-[#bff747]">{formatPrice(order.additionalCharges.rushOrder)}</span>
                </div>
              )}
              {order.additionalCharges?.premium > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Premium Fee</span>
                  <span className="font-medium text-[#bff747]">{formatPrice(order.additionalCharges.premium)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[#bff747]/30 pt-3">
                <span className="font-semibold text-[#bff747]">Total</span>
                <span className="font-bold text-lg text-[#bff747]">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Quality Check */}
          {order.qualityCheck && (
            <div className="border border-[#bff747]/30 rounded-lg p-6 mt-6 bg-[#1a1a1a]">
              <h3 className="text-lg font-semibold text-[#bff747] mb-4">Quality Check</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Status</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.qualityCheck.status === 'passed' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                    order.qualityCheck.status === 'failed' ? 'bg-red-900/30 text-red-400 border border-red-500/30' :
                    order.qualityCheck.status === 'needs_revision' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' :
                    order.qualityCheck.status === 'in_progress' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' :
                    'bg-gray-900/30 text-gray-400 border border-gray-500/30'
                  }`}>
                    {order.qualityCheck.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Priority</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.qualityCheck.priority === 'urgent' ? 'bg-red-900/30 text-red-400 border border-red-500/30' :
                    order.qualityCheck.priority === 'high' ? 'bg-orange-900/30 text-orange-400 border border-orange-500/30' :
                    order.qualityCheck.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' :
                    'bg-gray-900/30 text-gray-400 border border-gray-500/30'
                  }`}>
                    {order.qualityCheck.priority}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Created</span>
                  <span className="text-[#bff747]">{formatDate(order.qualityCheck.createdAt)}</span>
                </div>
                {order.qualityCheck.deadline && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Deadline</span>
                    <span className="text-[#bff747]">{formatDate(order.qualityCheck.deadline)}</span>
                  </div>
                )}
                {order.qualityCheck.assignedTo && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Reviewer</span>
                    <span className="text-[#bff747]">{order.qualityCheck.assignedTo.firstName} {order.qualityCheck.assignedTo.lastName}</span>
                  </div>
                )}
                <div className="pt-3">
                  <button
                    onClick={() => navigate(`/advertiser/quality/${order.qualityCheck._id}`)}
                    className="w-full bg-[#bff747] hover:bg-[#a8e035] text-[#0c0c0c] font-medium py-2 px-4 rounded-lg transition duration-200"
                  >
                    View Quality Check Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          {/* Actions */}
          <div className="border border-[#bff747]/30 rounded-lg p-6 mb-6 bg-[#1a1a1a]">
            <h3 className="text-lg font-semibold text-[#bff747] mb-4">Actions</h3>
            <div className="space-y-3">
              {order.status === 'completed' ? (
                <>
                  <button
                    onClick={handleApproveContent}
                    disabled={loading}
                    className="w-full bg-green-900/30 hover:bg-green-900/50 text-green-400 font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 border border-green-500/30"
                  >
                    {loading ? 'Approving...' : 'Approve Content'}
                  </button>
                  <button
                    onClick={() => setShowRevisionForm(true)}
                    disabled={loading}
                    className="w-full bg-orange-900/30 hover:bg-orange-900/50 text-orange-400 font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 border border-orange-500/30"
                  >
                    Request Revision
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate(`/advertiser/messages?orderId=${order._id}`)}
                    className="w-full bg-[#bff747] hover:bg-[#a8e035] text-[#0c0c0c] font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                    Message Publisher
                  </button>
                  <button
                    onClick={() => navigate(`/advertiser/orders/${order._id}/chat`)}
                    className="w-full bg-purple-900/30 hover:bg-purple-900/50 text-purple-400 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center border border-purple-500/30"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Order Chat
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Revision Form */}
          {showRevisionForm && (
            <div className="border border-[#bff747]/30 rounded-lg p-6 mb-6 bg-[#1a1a1a]">
              <h3 className="text-lg font-semibold text-[#bff747] mb-4">Request Revision</h3>
              <form onSubmit={handleRequestRevision}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason for Revision *
                  </label>
                  <textarea
                    value={revisionReason}
                    onChange={(e) => setRevisionReason(e.target.value)}
                    rows={4}
                    className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-white placeholder-gray-500"
                    placeholder="Please explain what needs to be revised..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading || !revisionReason.trim()}
                    className="flex-1 bg-orange-900/30 hover:bg-orange-900/50 text-orange-400 font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 border border-orange-500/30"
                  >
                    {loading ? 'Requesting...' : 'Submit Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRevisionForm(false)}
                    className="flex-1 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300 font-medium py-2 px-4 rounded-lg transition duration-200 border border-[#bff747]/30"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Publisher Information */}
          <div className="border border-[#bff747]/30 rounded-lg p-6 bg-[#1a1a1a]">
            <h3 className="text-lg font-semibold text-[#bff747] mb-4">Publisher Information</h3>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-[#2a2a2a] border-2 border-dashed border-[#bff747]/30 rounded-xl w-16 h-16 flex items-center justify-center">
                <span className="text-[#bff747] font-bold">
                  {order.publisherId?.firstName?.charAt(0)}
                  {order.publisherId?.lastName?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-[#bff747]">
                  {order.publisherId?.firstName} {order.publisherId?.lastName}
                </p>
                <p className="text-sm text-gray-400">{order.publisherId?.email}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/advertiser/messages?orderId=${order._id}`)}
              className="w-full bg-[#bff747]/20 hover:bg-[#bff747]/30 text-[#bff747] font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
              Message Publisher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsView;