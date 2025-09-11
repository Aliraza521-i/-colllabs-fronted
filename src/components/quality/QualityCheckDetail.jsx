import React, { useState, useEffect } from 'react';
import { useQuality } from '../../contexts/QualityContext';
import { 
  DocumentCheckIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  UserIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow, format } from 'date-fns';

const QualityCheckDetail = ({ qualityCheckId, onBack }) => {
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

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Pending', color: 'bg-gray-100 text-gray-800' },
      in_progress: { text: 'In Progress', color: 'bg-blue-100 text-blue-800' },
      passed: { text: 'Passed', color: 'bg-green-100 text-green-800' },
      failed: { text: 'Failed', color: 'bg-red-100 text-red-800' },
      needs_revision: { text: 'Needs Revision', color: 'bg-yellow-100 text-yellow-800' },
      under_review: { text: 'Under Review', color: 'bg-purple-100 text-purple-800' }
    };

    const config = statusConfig[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { text: 'Low', color: 'bg-gray-100 text-gray-800' },
      medium: { text: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
      high: { text: 'High', color: 'bg-orange-100 text-orange-800' },
      urgent: { text: 'Urgent', color: 'bg-red-100 text-red-800' }
    };

    const config = priorityConfig[priority] || { text: priority, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading && !selectedQualityCheck) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Quality Checks
            </button>
            <div className="animate-pulse h-6 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-24 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <button
            onClick={onBack}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Quality Checks
          </button>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedQualityCheck) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <button
            onClick={onBack}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Quality Checks
          </button>
        </div>
        <div className="p-12 text-center">
          <DocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Quality check not found</h3>
          <p className="mt-1 text-sm text-gray-500">The requested quality check could not be found.</p>
        </div>
      </div>
    );
  }

  const check = selectedQualityCheck;

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Quality Checks
          </button>
          <div className="flex items-center space-x-3">
            {getStatusBadge(check.status)}
            {getPriorityBadge(check.priority)}
          </div>
        </div>
        
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Quality Check for Order #{check.orderId?._id?.toString().slice(-6) || 'N/A'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Website: {check.websiteId?.url || 'N/A'}
          </p>
        </div>
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {[
            { key: 'overview', label: 'Overview', icon: DocumentCheckIcon },
            { key: 'automated', label: 'Automated Checks', icon: ClockIcon },
            { key: 'manual', label: 'Manual Review', icon: UserIcon },
            { key: 'comments', label: 'Comments', icon: ChatBubbleLeftRightIcon },
            { key: 'revisions', label: 'Revisions', icon: ArrowPathIcon }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-sm font-medium text-gray-900">{formatTime(check.createdAt)}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Deadline</p>
                <p className="text-sm font-medium text-gray-900">{formatTime(check.deadline)}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Assigned To</p>
                <p className="text-sm font-medium text-gray-900">
                  {check.assignedTo ? `${check.assignedTo.firstName} ${check.assignedTo.lastName}` : 'Unassigned'}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Reviewer</p>
                <p className="text-sm font-medium text-gray-900">
                  {check.reviewerId ? `${check.reviewerId.firstName} ${check.reviewerId.lastName}` : 'None'}
                </p>
              </div>
            </div>
            
            {check.status === 'pending' && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Ready for Review</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      This quality check is ready to be assigned to a reviewer.
                    </p>
                  </div>
                  <button
                    onClick={handleStartReview}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Start Review
                  </button>
                </div>
              </div>
            )}
            
            {check.tags && check.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900">Tags</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {check.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'automated' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plagiarism Check */}
              <div className={`border rounded-lg p-4 ${check.automatedChecks?.plagiarism?.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Plagiarism Check</h3>
                  {check.automatedChecks?.plagiarism?.passed ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {check.automatedChecks?.plagiarism?.score || 0}%
                  </p>
                  <p className="text-sm text-gray-500">
                    {check.automatedChecks?.plagiarism?.passed ? 'Passed threshold' : 'Failed threshold'}
                  </p>
                </div>
                {check.automatedChecks?.plagiarism?.sources?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500">Sources Found</p>
                    <ul className="mt-1 space-y-1">
                      {check.automatedChecks.plagiarism.sources.map((source, index) => (
                        <li key={index} className="text-xs text-gray-600">
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {source.url}
                          </a>
                          <span className="ml-2">({source.similarity}%)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Grammar Check */}
              <div className={`border rounded-lg p-4 ${check.automatedChecks?.grammar?.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Grammar Check</h3>
                  {check.automatedChecks?.grammar?.passed ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {check.automatedChecks?.grammar?.score || 0}%
                  </p>
                  <p className="text-sm text-gray-500">
                    {check.automatedChecks?.grammar?.errors || 0} errors, 
                    {check.automatedChecks?.grammar?.warnings || 0} warnings
                  </p>
                </div>
              </div>
              
              {/* SEO Check */}
              <div className={`border rounded-lg p-4 ${check.automatedChecks?.seo?.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">SEO Check</h3>
                  {check.automatedChecks?.seo?.passed ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {check.automatedChecks?.seo?.readability?.score || 0}%
                  </p>
                  <p className="text-sm text-gray-500">
                    Readability: {check.automatedChecks?.seo?.readability?.gradeLevel || 'N/A'}
                  </p>
                </div>
              </div>
              
              {/* Links Check */}
              <div className={`border rounded-lg p-4 ${check.automatedChecks?.links?.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Links Check</h3>
                  {check.automatedChecks?.links?.passed ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    {check.automatedChecks?.links?.internalLinks || 0} internal links
                  </p>
                  <p className="text-sm text-gray-600">
                    {check.automatedChecks?.links?.externalLinks || 0} external links
                  </p>
                  <p className="text-sm text-gray-600">
                    {check.automatedChecks?.links?.brokenLinks?.length || 0} broken links
                  </p>
                </div>
              </div>
            </div>
            
            {/* Content Quality */}
            <div className={`border rounded-lg p-4 ${check.automatedChecks?.contentQuality?.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Content Quality</h3>
                {check.automatedChecks?.contentQuality?.passed ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Word Count</p>
                  <p className="text-lg font-bold text-gray-900">
                    {check.automatedChecks?.contentQuality?.wordCount || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Unique Words</p>
                  <p className="text-lg font-bold text-gray-900">
                    {check.automatedChecks?.contentQuality?.uniqueWords || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sentence Variety</p>
                  <p className="text-lg font-bold text-gray-900">
                    {check.automatedChecks?.contentQuality?.sentenceVariety || 0}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Paragraph Structure</p>
                  <p className="text-lg font-bold text-gray-900">
                    {check.automatedChecks?.contentQuality?.paragraphStructure || 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'manual' && (
          <div className="space-y-6">
            {check.status === 'in_progress' && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-800">Review in Progress</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Manual review started on {formatTime(check.manualReview?.reviewStartedAt)}.
                </p>
              </div>
            )}
            
            {check.manualReview?.finalVerdict && (
              <div className={`rounded-lg p-4 ${
                check.manualReview.finalVerdict === 'approved' ? 'bg-green-50 border border-green-200' :
                check.manualReview.finalVerdict === 'rejected' ? 'bg-red-50 border border-red-200' :
                'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center">
                  {check.manualReview.finalVerdict === 'approved' ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  ) : check.manualReview.finalVerdict === 'rejected' ? (
                    <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  )}
                  <h3 className="text-sm font-medium ${
                    check.manualReview.finalVerdict === 'approved' ? 'text-green-800' :
                    check.manualReview.finalVerdict === 'rejected' ? 'text-red-800' :
                    'text-yellow-800'
                  }">
                    {check.manualReview.finalVerdict === 'approved' ? 'Approved' :
                     check.manualReview.finalVerdict === 'rejected' ? 'Rejected' :
                     'Needs Revision'}
                  </h3>
                </div>
                {check.manualReview.finalComments && (
                  <p className="text-sm mt-2 ${
                    check.manualReview.finalVerdict === 'approved' ? 'text-green-700' :
                    check.manualReview.finalVerdict === 'rejected' ? 'text-red-700' :
                    'text-yellow-700'
                  }">
                    {check.manualReview.finalComments}
                  </p>
                )}
                <p className="text-xs mt-2 ${
                  check.manualReview.finalVerdict === 'approved' ? 'text-green-600' :
                  check.manualReview.finalVerdict === 'rejected' ? 'text-red-600' :
                  'text-yellow-600'
                }">
                  Completed on {formatTime(check.manualReview.reviewCompletedAt)}
                </p>
              </div>
            )}
            
            {check.status === 'in_progress' && !check.manualReview?.finalVerdict && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900">Complete Manual Review</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Verdict</label>
                    <div className="mt-1 grid grid-cols-3 gap-3">
                      {[
                        { value: 'approved', label: 'Approve', color: 'green' },
                        { value: 'needs_revision', label: 'Needs Revision', color: 'yellow' },
                        { value: 'rejected', label: 'Reject', color: 'red' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setReviewVerdict(option.value)}
                          className={`py-2 px-3 border rounded-md text-sm font-medium ${
                            reviewVerdict === option.value
                              ? `bg-${option.color}-100 border-${option.color}-500 text-${option.color}-700`
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Comments</label>
                    <textarea
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Add any additional comments about your review..."
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleCompleteReview}
                      disabled={!reviewVerdict}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      Complete Review
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'comments' && (
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900">Add Comment</h3>
              <div className="mt-4 flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Add a comment..."
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handleAddComment}
                      disabled={!comment.trim()}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {check.manualReview?.comments?.length > 0 ? (
                check.manualReview.comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            {comment.reviewerId ? `${comment.reviewerId.firstName} ${comment.reviewerId.lastName}` : 'Reviewer'}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No comments yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Be the first to add a comment.</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'revisions' && (
          <div className="space-y-6">
            {check.revisionHistory?.length > 0 ? (
              <div className="space-y-4">
                {check.revisionHistory.map((revision) => (
                  <div key={revision._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        Revision #{revision.revisionNumber}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {revision.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Submitted by {revision.submittedBy ? `${revision.submittedBy.firstName} ${revision.submittedBy.lastName}` : 'Unknown'} on {formatTime(revision.submittedAt)}
                    </p>
                    <div className="mt-3 bg-gray-50 rounded p-3">
                      <p className="text-sm text-gray-700">{revision.changes}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ArrowPathIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No revisions yet</h3>
                <p className="mt-1 text-sm text-gray-500">No revisions have been submitted for this quality check.</p>
              </div>
            )}
            
            {check.manualReview?.revisionsRequested && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Revision requested.</strong> Please submit your revisions using the publisher dashboard.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QualityCheckDetail;