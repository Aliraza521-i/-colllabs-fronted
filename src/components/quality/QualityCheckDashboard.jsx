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
  TagIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow, format } from 'date-fns';

const QualityCheckDashboard = () => {
  const { 
    qualityChecks, 
    loadQualityChecks, 
    loading, 
    error 
  } = useQuality();
  
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('-1'); // Changed to string

  useEffect(() => {
    loadQualityChecks({ 
      status: filter !== 'all' ? filter : undefined,
      sortBy,
      sortOrder // This will now be a string
    });
  }, [filter, sortBy, sortOrder, loadQualityChecks]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'needs_revision':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'in_progress':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <DocumentCheckIcon className="h-5 w-5 text-gray-500" />;
    }
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{config.text}</span>
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  if (loading && qualityChecks.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Quality Checks</h3>
            <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <DocumentCheckIcon className="h-6 w-6 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Quality Checks</h3>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {qualityChecks.length} total
            </span>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-1 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="needs_revision">Needs Revision</option>
              <option value="under_review">Under Review</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full pl-3 pr-10 py-1 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            >
              <option value="createdAt">Date</option>
              <option value="priority">Priority</option>
              <option value="deadline">Deadline</option>
            </select>
            
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)} // Keep as string
              className="block w-full pl-3 pr-10 py-1 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            >
              <option value="-1">Descending</option>
              <option value="1">Ascending</option>
            </select>
          </div>
        </div>
      </div>
      
      {error && (
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
      )}
      
      <div className="divide-y divide-gray-200">
        {qualityChecks.length === 0 ? (
          <div className="p-12 text-center">
            <DocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No quality checks</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? 'There are no quality checks at the moment.' 
                : `There are no ${filter.replace('_', ' ')} quality checks.`}
            </p>
          </div>
        ) : (
          qualityChecks.map((check) => (
            <div key={check._id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      Order #{check.orderId?._id?.toString().slice(-6) || 'N/A'}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(check.status)}
                      {getPriorityBadge(check.priority)}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-1" />
                      <span>{check.assignedTo?.firstName || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>Created {formatTime(check.createdAt)}</span>
                    </div>
                    {check.deadline && (
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>Due {formatTime(check.deadline)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex items-center text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-500">Website:</span>
                      <span className="ml-1 font-medium">{check.websiteId?.name || 'N/A'}</span>
                    </div>
                    {check.tags && check.tags.length > 0 && (
                      <div className="ml-4 flex items-center">
                        <TagIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <div className="flex flex-wrap gap-1">
                          {check.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {tag}
                            </span>
                          ))}
                          {check.tags.length > 2 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              +{check.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QualityCheckDashboard;