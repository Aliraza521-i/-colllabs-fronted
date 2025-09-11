import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuality } from '../../../contexts/QualityContext';
import { 
  DocumentCheckIcon, 
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const QualityCheckDetail = () => {
  const { qualityCheckId } = useParams();
  const navigate = useNavigate();
  const { 
    selectedQualityCheck, 
    loadQualityCheck, 
    startManualReview, 
    completeManualReview, 
    addComment,
    loading, 
    error 
  } = useQuality();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [comment, setComment] = useState('');
  const [reviewVerdict, setReviewVerdict] = useState('');
  const [reviewComments, setReviewComments] = useState('');

  useEffect(() => {
    if (qualityCheckId) {
      loadQualityCheck(qualityCheckId);
    }
  }, [qualityCheckId, loadQualityCheck]);

  const handleStartReview = async () => {
    try {
      await startManualReview(qualityCheckId);
    } catch (err) {
      console.error('Failed to start review:', err);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    try {
      await addComment(qualityCheckId, comment);
      setComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleCompleteReview = async () => {
    if (!reviewVerdict) return;
    
    try {
      await completeManualReview(qualityCheckId, {
        verdict: reviewVerdict,
        comments: reviewComments
      });
      
      // Reset form
      setReviewVerdict('');
      setReviewComments('');
    } catch (err) {
      console.error('Failed to complete review:', err);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Pending', color: 'bg-gray-900/30 text-gray-400 border border-gray-500/30' },
      in_progress: { text: 'In Progress', color: 'bg-blue-900/30 text-blue-400 border border-blue-500/30' },
      passed: { text: 'Passed', color: 'bg-green-900/30 text-green-400 border border-green-500/30' },
      failed: { text: 'Failed', color: 'bg-red-900/30 text-red-400 border border-red-500/30' },
      needs_revision: { text: 'Needs Revision', color: 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' },
      under_review: { text: 'Under Review', color: 'bg-purple-900/30 text-purple-400 border border-purple-500/30' }
    };

    const config = statusConfig[status] || { text: status, color: 'bg-gray-900/30 text-gray-400 border border-gray-500/30' };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { text: 'Low', color: 'bg-gray-900/30 text-gray-400 border border-gray-500/30' },
      medium: { text: 'Medium', color: 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' },
      high: { text: 'High', color: 'bg-orange-900/30 text-orange-400 border border-orange-500/30' },
      urgent: { text: 'Urgent', color: 'bg-red-900/30 text-red-400 border border-red-500/30' }
    };

    const config = priorityConfig[priority] || { text: priority, color: 'bg-gray-900/30 text-gray-400 border border-gray-500/30' };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading && !selectedQualityCheck) {
    return (
      <div className="bg-[#1a1a1a] shadow rounded-lg border border-[#bff747]/30">
        <div className="px-6 py-5 border-b border-[#bff747]/30">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/advertiser/quality')}
              className="inline-flex items-center text-sm text-gray-400 hover:text-[#bff747]"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Quality Checks
            </button>
            <div className="animate-pulse h-6 bg-[#2a2a2a] rounded w-48"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-[#2a2a2a] rounded w-1/3"></div>
            <div className="h-4 bg-[#2a2a2a] rounded w-1/2"></div>
            <div className="h-24 bg-[#2a2a2a] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a1a1a] shadow rounded-lg border border-[#bff747]/30">
        <div className="px-6 py-5 border-b border-[#bff747]/30">
          <button
            onClick={() => navigate('/advertiser/quality')}
            className="inline-flex items-center text-sm text-gray-400 hover:text-[#bff747]"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Quality Checks
          </button>
        </div>
        <div className="p-6">
          <div className="bg-red-900/30 border-l-4 border-red-500/30 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedQualityCheck) {
    return (
      <div className="bg-[#1a1a1a] shadow rounded-lg border border-[#bff747]/30">
        <div className="px-6 py-5 border-b border-[#bff747]/30">
          <button
            onClick={() => navigate('/advertiser/quality')}
            className="inline-flex items-center text-sm text-gray-400 hover:text-[#bff747]"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Quality Checks
          </button>
        </div>
        <div className="p-12 text-center">
          <DocumentCheckIcon className="mx-auto h-12 w-12 text-[#bff747]" />
          <h3 className="mt-2 text-sm font-medium text-[#bff747]">Quality check not found</h3>
          <p className="mt-1 text-sm text-gray-400">The requested quality check could not be found.</p>
        </div>
      </div>
    );
  }

  const check = selectedQualityCheck;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1a1a1a] shadow rounded-lg border border-[#bff747]/30">
        <div className="px-6 py-5 border-b border-[#bff747]/30">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/advertiser/quality')}
              className="inline-flex items-center text-sm text-gray-400 hover:text-[#bff747]"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Quality Checks
            </button>
            <div className="flex items-center">
              {getStatusBadge(check.status)}
              {getPriorityBadge(check.priority)}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#bff747]">
                Quality Check for Order #{check.orderId?._id?.toString().slice(-6) || 'N/A'}
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                Website: {check.websiteId?.name || 'N/A'}
              </p>
            </div>
            <div className="flex space-x-3">
              {check.status === 'pending' && (
                <button
                  onClick={handleStartReview}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-[#0c0c0c] bg-[#bff747] hover:bg-[#a8e035] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bff747]"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Start Review
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#2a2a2a] p-4 rounded-lg border border-[#bff747]/20">
              <h3 className="text-sm font-medium text-[#bff747]">Created</h3>
              <p className="mt-1 text-sm text-gray-300">
                {new Date(check.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="bg-[#2a2a2a] p-4 rounded-lg border border-[#bff747]/20">
              <h3 className="text-sm font-medium text-[#bff747]">Deadline</h3>
              <p className="mt-1 text-sm text-gray-300">
                {check.deadline ? new Date(check.deadline).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div className="bg-[#2a2a2a] p-4 rounded-lg border border-[#bff747]/20">
              <h3 className="text-sm font-medium text-[#bff747]">Reviewer</h3>
              <p className="mt-1 text-sm text-gray-300">
                {check.assignedTo ? `${check.assignedTo.firstName} ${check.assignedTo.lastName}` : 'Not assigned'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-[#1a1a1a] shadow rounded-lg border border-[#bff747]/30">
        <div className="border-b border-[#bff747]/30">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'overview'
                  ? 'border-[#bff747] text-[#bff747]'
                  : 'border-transparent text-gray-400 hover:text-[#bff747] hover:border-[#bff747]/30'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('automated')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'automated'
                  ? 'border-[#bff747] text-[#bff747]'
                  : 'border-transparent text-gray-400 hover:text-[#bff747] hover:border-[#bff747]/30'
              }`}
            >
              Automated Checks
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'manual'
                  ? 'border-[#bff747] text-[#bff747]'
                  : 'border-transparent text-gray-400 hover:text-[#bff747] hover:border-[#bff747]/30'
              }`}
            >
              Manual Review
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'comments'
                  ? 'border-[#bff747] text-[#bff747]'
                  : 'border-transparent text-gray-400 hover:text-[#bff747] hover:border-[#bff747]/30'
              }`}
            >
              Comments
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-[#bff747]">Quality Check Details</h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Order ID</h4>
                    <p className="mt-1 text-sm text-[#bff747]">
                      {check.orderId?._id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Website</h4>
                    <p className="mt-1 text-sm text-[#bff747]">
                      {check.websiteId?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Status</h4>
                    <p className="mt-1 text-sm text-[#bff747]">
                      {check.status}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Priority</h4>
                    <p className="mt-1 text-sm text-[#bff747]">
                      {check.priority}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-[#bff747]">Tags</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {check.tags?.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#bff747]/20 text-[#bff747] border border-[#bff747]/30">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'automated' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-[#bff747]">Automated Quality Checks</h3>
              
              {check.automatedChecks ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Plagiarism Check */}
                  <div className="border border-[#bff747]/30 rounded-lg p-4 bg-[#1a1a1a]">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-[#bff747]">Plagiarism Check</h4>
                      {check.automatedChecks.plagiarism?.passed ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">
                        Score: {check.automatedChecks.plagiarism?.score || 'N/A'}%
                      </p>
                      {check.automatedChecks.plagiarism?.sources?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-400">Sources:</p>
                          <ul className="mt-1 text-xs text-gray-400">
                            {check.automatedChecks.plagiarism.sources.map((source, index) => (
                              <li key={index}>{source.url} ({source.similarity}%)</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Grammar Check */}
                  <div className="border border-[#bff747]/30 rounded-lg p-4 bg-[#1a1a1a]">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-[#bff747]">Grammar Check</h4>
                      {check.automatedChecks.grammar?.passed ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">
                        Score: {check.automatedChecks.grammar?.score || 'N/A'}/100
                      </p>
                      <p className="text-sm text-gray-400">
                        Errors: {check.automatedChecks.grammar?.errors || 0}
                      </p>
                      <p className="text-sm text-gray-400">
                        Warnings: {check.automatedChecks.grammar?.warnings || 0}
                      </p>
                    </div>
                  </div>
                  
                  {/* SEO Check */}
                  <div className="border border-[#bff747]/30 rounded-lg p-4 bg-[#1a1a1a]">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-[#bff747]">SEO Check</h4>
                      {check.automatedChecks.seo?.passed ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">
                        Score: {check.automatedChecks.seo?.score || 'N/A'}/100
                      </p>
                    </div>
                  </div>
                  
                  {/* Links Check */}
                  <div className="border border-[#bff747]/30 rounded-lg p-4 bg-[#1a1a1a]">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-[#bff747]">Links Check</h4>
                      {check.automatedChecks.links?.passed ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">
                        Score: {check.automatedChecks.links?.score || 'N/A'}/100
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <DocumentCheckIcon className="mx-auto h-12 w-12 text-[#bff747]" />
                  <h3 className="mt-2 text-sm font-medium text-[#bff747]">No automated checks</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Automated checks have not been run for this quality check yet.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'manual' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-[#bff747]">Manual Review</h3>
              
              {check.manualReview ? (
                <div className="space-y-4">
                  <div className="border border-[#bff747]/30 rounded-lg p-4 bg-[#1a1a1a]">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-[#bff747]">Review Status</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        check.manualReview.status === 'completed' 
                          ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                          : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {check.manualReview.status}
                      </span>
                    </div>
                    
                    {check.manualReview.startedAt && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-400">
                          Started: {new Date(check.manualReview.startedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                    
                    {check.manualReview.completedAt && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-400">
                          Completed: {new Date(check.manualReview.completedAt).toLocaleString()}
                        </p>
                        <p className="mt-1 text-sm text-gray-400">
                          Verdict: 
                          <span className={`ml-1 ${
                            check.manualReview.verdict === 'approved' 
                              ? 'text-green-400' 
                              : check.manualReview.verdict === 'rejected' 
                                ? 'text-red-400' 
                                : 'text-yellow-400'
                          }`}>
                            {check.manualReview.verdict}
                          </span>
                        </p>
                        {check.manualReview.comments && (
                          <p className="mt-1 text-sm text-gray-400">
                            Comments: {check.manualReview.comments}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {check.manualReview.status !== 'completed' && (
                    <div className="border border-[#bff747]/30 rounded-lg p-4 bg-[#1a1a1a]">
                      <h4 className="font-medium text-[#bff747] mb-3">Complete Review</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300">Verdict</label>
                          <div className="mt-1 space-y-2">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="approved"
                                name="verdict"
                                value="approved"
                                checked={reviewVerdict === 'approved'}
                                onChange={(e) => setReviewVerdict(e.target.value)}
                                className="h-4 w-4 text-[#bff747] border-[#bff747]/30 focus:ring-[#bff747] bg-[#0c0c0c]"
                              />
                              <label htmlFor="approved" className="ml-2 block text-sm text-gray-300">
                                Approve
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="rejected"
                                name="verdict"
                                value="rejected"
                                checked={reviewVerdict === 'rejected'}
                                onChange={(e) => setReviewVerdict(e.target.value)}
                                className="h-4 w-4 text-[#bff747] border-[#bff747]/30 focus:ring-[#bff747] bg-[#0c0c0c]"
                              />
                              <label htmlFor="rejected" className="ml-2 block text-sm text-gray-300">
                                Reject
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="needs_revision"
                                name="verdict"
                                value="needs_revision"
                                checked={reviewVerdict === 'needs_revision'}
                                onChange={(e) => setReviewVerdict(e.target.value)}
                                className="h-4 w-4 text-[#bff747] border-[#bff747]/30 focus:ring-[#bff747] bg-[#0c0c0c]"
                              />
                              <label htmlFor="needs_revision" className="ml-2 block text-sm text-gray-300">
                                Request Revision
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="reviewComments" className="block text-sm font-medium text-gray-300">
                            Comments
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="reviewComments"
                              rows={3}
                              className="shadow-sm focus:ring-[#bff747] focus:border-[#bff747] block w-full sm:text-sm border border-[#bff747]/30 rounded-md p-2 bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                              placeholder="Add any additional comments..."
                              value={reviewComments}
                              onChange={(e) => setReviewComments(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <button
                            onClick={handleCompleteReview}
                            disabled={!reviewVerdict}
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-[#0c0c0c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bff747] ${
                              reviewVerdict
                                ? 'bg-[#bff747] hover:bg-[#a8e035]'
                                : 'bg-[#2a2a2a] cursor-not-allowed'
                            }`}
                          >
                            Complete Review
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DocumentCheckIcon className="mx-auto h-12 w-12 text-[#bff747]" />
                  <h3 className="mt-2 text-sm font-medium text-[#bff747]">No manual review</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    A manual review has not been started for this quality check yet.
                  </p>
                  {check.status === 'pending' && (
                    <div className="mt-6">
                      <button
                        onClick={handleStartReview}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-[#0c0c0c] bg-[#bff747] hover:bg-[#a8e035] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bff747]"
                      >
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        Start Manual Review
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'comments' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-[#bff747]">Comments</h3>
              
              <div className="space-y-4">
                {check.comments?.length > 0 ? (
                  check.comments.map((comment) => (
                    <div key={comment._id} className="border border-[#bff747]/30 rounded-lg p-4 bg-[#1a1a1a]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-[#bff747]/20 flex items-center justify-center">
                              <span className="text-xs font-medium text-[#bff747]">
                                {comment.reviewerId?.firstName?.charAt(0)}
                                {comment.reviewerId?.lastName?.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-[#bff747]">
                              {comment.reviewerId?.firstName} {comment.reviewerId?.lastName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-300">{comment.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-[#bff747]" />
                    <h3 className="mt-2 text-sm font-medium text-[#bff747]">No comments</h3>
                    <p className="mt-1 text-sm text-gray-400">
                      There are no comments on this quality check yet.
                    </p>
                  </div>
                )}
                
                <div className="border border-[#bff747]/30 rounded-lg p-4 bg-[#1a1a1a]">
                  <h4 className="font-medium text-[#bff747] mb-3">Add Comment</h4>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="comment" className="sr-only">Comment</label>
                      <textarea
                        id="comment"
                        rows={3}
                        className="shadow-sm focus:ring-[#bff747] focus:border-[#bff747] block w-full sm:text-sm border border-[#bff747]/30 rounded-md p-2 bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                        placeholder="Add your comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                    </div>
                    <div>
                      <button
                        onClick={handleAddComment}
                        disabled={!comment.trim()}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-[#0c0c0c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bff747] ${
                          comment.trim()
                            ? 'bg-[#bff747] hover:bg-[#a8e035]'
                            : 'bg-[#2a2a2a] cursor-not-allowed'
                        }`}
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                        Add Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QualityCheckDetail;