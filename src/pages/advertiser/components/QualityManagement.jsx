import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuality } from '../../../contexts/QualityContext';
import { 
  DocumentCheckIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const QualityManagement = () => {
  const navigate = useNavigate();
  const { 
    qualityChecks, 
    loadQualityChecks, 
    loading, 
    error 
  } = useQuality();
  
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('-1'); // Keep as string

  useEffect(() => {
    loadQualityChecks({ 
      status: filter !== 'all' ? filter : undefined,
      sortBy,
      sortOrder // This is already a string, which is correct
    });
  }, [filter, sortBy, sortOrder, loadQualityChecks]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Pending', class: 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' },
      in_progress: { text: 'In Progress', class: 'bg-blue-900/30 text-blue-400 border border-blue-500/30' },
      passed: { text: 'Passed', class: 'bg-green-900/30 text-green-400 border border-green-500/30' },
      failed: { text: 'Failed', class: 'bg-red-900/30 text-red-400 border border-red-500/30' },
      needs_revision: { text: 'Needs Revision', class: 'bg-orange-900/30 text-orange-400 border border-orange-500/30' },
      under_review: { text: 'Under Review', class: 'bg-purple-900/30 text-purple-400 border border-purple-500/30' }
    };

    const config = statusConfig[status] || { text: status, class: 'bg-gray-900/30 text-gray-400 border border-gray-500/30' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { text: 'Low', class: 'bg-gray-900/30 text-gray-400 border border-gray-500/30' },
      medium: { text: 'Medium', class: 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' },
      high: { text: 'High', class: 'bg-orange-900/30 text-orange-400 border border-orange-500/30' },
      urgent: { text: 'Urgent', class: 'bg-red-900/30 text-red-400 border border-red-500/30' }
    };

    const config = priorityConfig[priority] || { text: priority, class: 'bg-gray-900/30 text-gray-400 border border-gray-500/30' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const filteredQualityChecks = qualityChecks.filter(check => {
    if (!searchTerm) return true;
    
    const orderId = check.orderId?._id?.toString() || '';
    const websiteName = check.websiteId?.name?.toLowerCase() || '';
    
    return orderId.includes(searchTerm) || 
           websiteName.includes(searchTerm.toLowerCase());
  });

  if (loading && qualityChecks.length === 0) {
    return (
      <div className="bg-[#1a1a1a] shadow rounded-lg border border-[#bff747]/30">
        <div className="px-6 py-5 border-b border-[#bff747]/30">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-[#bff747]">Quality Checks</h3>
            <div className="animate-pulse h-4 bg-[#2a2a2a] rounded w-24"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-[#2a2a2a] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1a1a1a] shadow rounded-lg border border-[#bff747]/30">
        <div className="px-6 py-5 border-b border-[#bff747]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DocumentCheckIcon className="h-6 w-6 text-[#bff747] mr-2" />
              <h3 className="text-lg font-medium text-[#bff747]">Quality Checks</h3>
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-[#0c0c0c] bg-[#bff747] hover:bg-[#a8e035] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bff747]">
              <PlusIcon className="h-4 w-4 mr-2" />
              New Quality Check
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="p-6 border-b border-[#bff747]/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-[#bff747]/30 rounded-md leading-5 bg-[#0c0c0c] text-[#bff747] placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#bff747] focus:border-[#bff747] sm:text-sm"
                placeholder="Search by order ID or website..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-[#bff747]/30 focus:outline-none focus:ring-[#bff747] focus:border-[#bff747] sm:text-sm rounded-md bg-[#0c0c0c] text-[#bff747]"
            >
              <option value="all" className="bg-[#0c0c0c]">All Statuses</option>
              <option value="pending" className="bg-[#0c0c0c]">Pending</option>
              <option value="in_progress" className="bg-[#0c0c0c]">In Progress</option>
              <option value="passed" className="bg-[#0c0c0c]">Passed</option>
              <option value="failed" className="bg-[#0c0c0c]">Failed</option>
              <option value="needs_revision" className="bg-[#0c0c0c]">Needs Revision</option>
              <option value="under_review" className="bg-[#0c0c0c]">Under Review</option>
            </select>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order); // Keep as string
                }}
                className="block w-full pl-10 pr-3 py-2 border border-[#bff747]/30 rounded-md leading-5 bg-[#0c0c0c] text-[#bff747] placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#bff747] focus:border-[#bff747] sm:text-sm"
              >
                <option value="createdAt--1" className="bg-[#0c0c0c]">Newest First</option>
                <option value="createdAt-1" className="bg-[#0c0c0c]">Oldest First</option>
                <option value="priority--1" className="bg-[#0c0c0c]">Priority (High to Low)</option>
                <option value="priority-1" className="bg-[#0c0c0c]">Priority (Low to High)</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500/30 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Quality Checks List */}
        <div className="divide-y divide-[#bff747]/30">
          {filteredQualityChecks.length === 0 ? (
            <div className="p-12 text-center">
              <DocumentCheckIcon className="mx-auto h-12 w-12 text-[#bff747]" />
              <h3 className="mt-2 text-sm font-medium text-[#bff747]">No quality checks</h3>
              <p className="mt-1 text-sm text-gray-400">
                {searchTerm || filter !== 'all' 
                  ? 'No quality checks match your search criteria.' 
                  : 'There are no quality checks at the moment.'}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-[#0c0c0c] bg-[#bff747] hover:bg-[#a8e035] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bff747]"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Create Quality Check
                </button>
              </div>
            </div>
          ) : (
            filteredQualityChecks.map((check) => (
              <div 
                key={check._id} 
                className="p-6 hover:bg-[#2a2a2a] cursor-pointer"
                onClick={() => navigate(`/advertiser/quality/${check._id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-[#bff747]">
                        Order #{check.orderId?._id?.toString().slice(-6) || 'N/A'}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(check.status)}
                        {getPriorityBadge(check.priority)}
                      </div>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      <div>
                        <span className="font-medium">Website:</span> {check.websiteId?.name || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {new Date(check.createdAt).toLocaleDateString()}
                      </div>
                      {check.deadline && (
                        <div>
                          <span className="font-medium">Deadline:</span> {new Date(check.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 flex items-center text-sm">
                      <div className="flex items-center">
                        <span className="text-gray-400">Tags:</span>
                        <div className="ml-2 flex flex-wrap gap-1">
                          {check.tags?.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#2a2a2a] text-[#bff747] border border-[#bff747]/30">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    <button 
                      className="inline-flex items-center px-3 py-1 border border-[#bff747]/30 shadow-sm text-sm font-medium rounded-md text-[#bff747] bg-[#0c0c0c] hover:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bff747]"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/advertiser/quality/${check._id}`);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default QualityManagement;