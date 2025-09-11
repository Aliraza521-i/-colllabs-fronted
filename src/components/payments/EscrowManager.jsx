import React, { useState } from 'react';
import { usePayment } from '../../contexts/PaymentContext';
import { paymentAPI } from '../../services/api';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const EscrowManager = ({ escrow, order, onActionComplete }) => {
  const { releaseEscrow, createDispute } = usePayment();
  
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeData, setDisputeData] = useState({
    reason: '',
    description: '',
    evidence: []
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleReleaseFunds = async () => {
    if (!window.confirm('Are you sure you want to release funds to the publisher? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessing(true);
      setError('');
      
      const response = await releaseEscrow(escrow._id);
      setSuccess('Funds released successfully!');
      
      if (onActionComplete) {
        setTimeout(() => onActionComplete('released'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to release funds');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateDispute = async (e) => {
    e.preventDefault();
    
    if (!disputeData.reason || !disputeData.description) {
      setError('Please provide both reason and description for the dispute');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      
      const response = await createDispute(escrow._id, disputeData);
      setSuccess('Dispute created successfully!');
      setShowDisputeForm(false);
      
      if (onActionComplete) {
        setTimeout(() => onActionComplete('disputed'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create dispute');
    } finally {
      setProcessing(false);
    }
  };

  const getEscrowStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      funded: { text: 'Funded', color: 'bg-blue-100 text-blue-800' },
      released: { text: 'Released', color: 'bg-green-100 text-green-800' },
      disputed: { text: 'Disputed', color: 'bg-red-100 text-red-800' },
      refunded: { text: 'Refunded', color: 'bg-purple-100 text-purple-800' },
      cancelled: { text: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
      auto_release_eligible: { text: 'Auto-Release Eligible', color: 'bg-indigo-100 text-indigo-800' }
    };

    const config = statusConfig[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getDaysUntilAutoRelease = () => {
    if (!escrow.autoReleaseDate) return null;
    
    const releaseDate = new Date(escrow.autoReleaseDate);
    const now = new Date();
    const diffTime = releaseDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const daysUntilRelease = getDaysUntilAutoRelease();

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Escrow Management</h3>
          {getEscrowStatusBadge(escrow.status)}
        </div>
      </div>
      
      <div className="p-6">
        {/* Escrow Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="text-lg font-bold text-gray-900">${escrow.amount.toFixed(2)} {escrow.currency}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="text-lg font-bold text-gray-900">#{order._id?.slice(-6)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Platform Fee</p>
              <p className="text-lg font-bold text-gray-900">${escrow.platformCommission?.toFixed(2) || '0.00'} {escrow.currency}</p>
            </div>
          </div>
        </div>

        {/* Auto-release Information */}
        {daysUntilRelease !== null && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Auto-Release in {daysUntilRelease} days
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Funds will be automatically released to the publisher on {new Date(escrow.autoReleaseDate).toLocaleDateString()} 
                  unless disputed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Escrow Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleReleaseFunds}
            disabled={processing || escrow.status !== 'funded'}
            className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 ${
              escrow.status === 'funded'
                ? 'border-green-500 bg-green-50 hover:bg-green-100'
                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
            }`}
          >
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <span className="mt-2 text-sm font-medium text-gray-900">Release Funds</span>
            <p className="mt-1 text-xs text-gray-500 text-center">
              Release funds to the publisher
            </p>
          </button>
          
          <button
            onClick={() => setShowDisputeForm(true)}
            disabled={processing || escrow.status === 'released' || escrow.status === 'refunded'}
            className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 ${
              escrow.status !== 'released' && escrow.status !== 'refunded'
                ? 'border-red-500 bg-red-50 hover:bg-red-100'
                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
            }`}
          >
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            <span className="mt-2 text-sm font-medium text-gray-900">Dispute Order</span>
            <p className="mt-1 text-xs text-gray-500 text-center">
              Report issues with this order
            </p>
          </button>
        </div>

        {/* Dispute Form */}
        {showDisputeForm && (
          <div className="bg-red-50 rounded-lg p-6 mb-6">
            <h4 className="text-md font-medium text-red-800 mb-4">Create Dispute</h4>
            <form onSubmit={handleCreateDispute}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-red-700 mb-2">Reason for Dispute</label>
                <select
                  value={disputeData.reason}
                  onChange={(e) => setDisputeData({...disputeData, reason: e.target.value})}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="quality_issues">Quality Issues</option>
                  <option value="not_delivered">Not Delivered</option>
                  <option value="plagiarism">Plagiarism</option>
                  <option value="guidelines_violation">Guidelines Violation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-red-700 mb-2">Description</label>
                <textarea
                  value={disputeData.description}
                  onChange={(e) => setDisputeData({...disputeData, description: e.target.value})}
                  rows={4}
                  className="mt-1 block w-full border border-red-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Please provide detailed information about the issue..."
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-red-700 mb-2">Evidence (Optional)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-red-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-red-400" />
                    <div className="flex text-sm text-red-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500">
                        <span>Upload evidence</span>
                        <input type="file" className="sr-only" multiple />
                      </label>
                    </div>
                    <p className="text-xs text-red-500">
                      PNG, JPG, PDF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 rounded-md bg-red-100 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="mb-4 rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Success</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>{success}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {processing ? 'Creating Dispute...' : 'Submit Dispute'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDisputeForm(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Success Message */}
        {success && !showDisputeForm && (
          <div className="rounded-md bg-green-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>{success}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && !showDisputeForm && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Escrow Terms */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Escrow Terms</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span>Funds are held securely until order completion</span>
            </li>
            <li className="flex items-start">
              <ClockIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
              <span>Auto-release after {escrow.terms?.autoReleaseHours || 72} hours if no dispute</span>
            </li>
            <li className="flex items-start">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
              <span>Disputes are resolved by our support team within 48 hours</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EscrowManager;