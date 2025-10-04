import React, { useState, useEffect } from 'react';
import {
  GlobeAltIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  // ExternalLinkIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../../services/api';

const WebsiteApproval = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('submitted');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [bulkSelection, setBulkSelection] = useState([]);

  const websitesPerPage = 15;

  useEffect(() => {
    fetchWebsites();
  }, [currentPage, statusFilter, categoryFilter, searchTerm]);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingWebsites({
        page: currentPage,
        limit: websitesPerPage,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        sortBy: 'createdAt',
        search: searchTerm || undefined
      });

      console.log('Websites API Response:', response);
      
      if (response.data && response.data.ok) {
        setWebsites(response.data.data || []);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        console.log('API response not ok or missing data');
        setWebsites([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to fetch websites:', error);
      setWebsites([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleWebsiteAction = async (websiteId, action, data = {}) => {
    try {
      setActionLoading(true);
      let response;

      switch (action) {
        case 'approve':
          response = await adminAPI.approveWebsite(websiteId, data);
          break;
        case 'reject':
          response = await adminAPI.rejectWebsite(websiteId, data);
          break;
        case 'pause':
          response = await adminAPI.pauseWebsite(websiteId);
          break;
        case 'delete':
          response = await adminAPI.deleteWebsite(websiteId);
          break;
        case 'edit':
          // For edit action, we just update the website status to indicate it needs re-moderation
          response = await adminAPI.reviewWebsite(websiteId, { 
            ...data, 
            status: 'submitted',
            needsReModeration: true 
          });
          break;
        default:
          return;
      }

      if (response.data) {
        fetchWebsites();
        setShowModal(false);
        setSelectedWebsite(null);
      }
    } catch (error) {
      console.error(`Failed to ${action} website:`, error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (bulkSelection.length === 0) return;

    try {
      setActionLoading(true);
      const promises = bulkSelection.map(websiteId => {
        switch (action) {
          case 'approve':
            return adminAPI.approveWebsite(websiteId, {});
          case 'reject':
            return adminAPI.rejectWebsite(websiteId, { reason: 'Bulk rejection' });
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      fetchWebsites();
      setBulkSelection([]);
    } catch (error) {
      console.error(`Failed to perform bulk ${action}:`, error);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleBulkSelection = (websiteId) => {
    setBulkSelection(prev =>
      prev.includes(websiteId)
        ? prev.filter(id => id !== websiteId)
        : [...prev, websiteId]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = websites.map(w => w._id);
    setBulkSelection(prev =>
      prev.length === visibleIds.length ? [] : visibleIds
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      paused: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800'
    };

    const icons = {
      pending: <ClockIcon className="h-3 w-3" />,
      approved: <CheckCircleIcon className="h-3 w-3" />,
      rejected: <XCircleIcon className="h-3 w-3" />,
      paused: <ClockIcon className="h-3 w-3" />,
      submitted: <ClockIcon className="h-3 w-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${badges[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && websites.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website Approval</h1>
          <p className="text-gray-600">Review and approve submitted websites from publishers</p>
        </div>
        <div className="flex space-x-3">
          {bulkSelection.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('approve')}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Approve Selected ({bulkSelection.length})
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Reject Selected ({bulkSelection.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search websites..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter - Updated to match backend logic */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted (Pending Review)</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="under_review">Under Review</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <GlobeAltIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Categories</option>
              <option value="General">General</option>
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
              <option value="Health">Health</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Finance">Finance</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Education">Education</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center">
            <button
              onClick={selectAllVisible}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
            >
              {bulkSelection.length === websites.length && websites.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
      </div>

      {/* Websites Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {websites.map((website) => (
          <div key={website._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={bulkSelection.includes(website._id)}
                    onChange={() => toggleBulkSelection(website._id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {website.domain}
                  </h3>
                </div>
                {getStatusBadge(website.status)}
              </div>
              
              <div className="mt-2">
                <p className="text-sm text-gray-600 truncate">
                  {website.siteDescription}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <ChartBarIcon className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">DA/DR</p>
                  <p className="text-sm font-semibold">{website.metrics?.domainAuthority || website.metrics?.da || 'N/A'}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="text-sm font-semibold">{formatPrice(website.publishingPrice)}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Category:</span>
                  <span className="text-xs font-medium capitalize">
                    {website.allCategories && website.allCategories.length > 0 
                      ? website.allCategories.join(', ') 
                      : (website.category || "General")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Language:</span>
                  <span className="text-xs font-medium">{website.mainLanguage}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Link Type:</span>
                  <span className="text-xs font-medium capitalize">{website.linkType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Submitted:</span>
                  <span className="text-xs font-medium">{formatDate(website.createdAt)}</span>
                </div>
              </div>

              {/* Publisher Info */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {website.publisher?.firstName?.[0]}{website.publisher?.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">
                      {website.publisher?.firstName} {website.publisher?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{website.publisher?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedWebsite(website);
                    setShowModal(true);
                  }}
                  className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <EyeIcon className="h-4 w-4 inline mr-1" />
                  Review
                </button>
                
                <a
                  href={`https://${website.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  {/* <ExternalLinkIcon className="h-4 w-4" /> */}
                </a>

                {/* Updated condition to match the actual status */}
                {website.status === 'submitted' && (
                  <>
                    <button
                      onClick={() => handleWebsiteAction(website._id, 'approve')}
                      disabled={actionLoading}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleWebsiteAction(website._id, 'reject', { reason: 'Quality standards not met' })}
                      disabled={actionLoading}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircleIcon className="h-4 w-4" />
                    </button>
                  </>
                )}
                
                {/* Add edit button for approved websites */}
                {website.status === 'approved' && (
                  <button
                    onClick={() => handleWebsiteAction(website._id, 'edit', { reason: 'Needs re-moderation' })}
                    disabled={actionLoading}
                    className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                  >
                    <span className="text-xs">Edit</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {websites.length === 0 && !loading && (
        <div className="text-center py-12">
          <GlobeAltIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No websites found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search criteria' : 'No websites match the current filters'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Website Review Modal */}
      {showModal && selectedWebsite && (
        <WebsiteReviewModal
          website={selectedWebsite}
          onClose={() => {
            setShowModal(false);
            setSelectedWebsite(null);
          }}
          onAction={handleWebsiteAction}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

// Website Review Modal Component
const WebsiteReviewModal = ({ website, onClose, onAction, loading }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [verificationSettings, setVerificationSettings] = useState({
    disableGoogleAnalytics: website.disableGoogleAnalytics || false,
    disableGoogleSearchConsole: website.disableGoogleSearchConsole || false,
    disableHtmlFile: website.disableHtmlFile || false
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Sample data for charts
  const trafficData = [
    { month: 'Nov 2023', value: 500 },
    { month: 'Dec 2023', value: 450 },
    { month: 'Jan 2024', value: 380 },
    { month: 'Feb 2024', value: 420 },
    { month: 'Mar 2024', value: 180 },
    { month: 'Apr 2024', value: 190 },
    { month: 'May 2024', value: 250 },
    { month: 'Jun 2024', value: 350 },
    { month: 'Jul 2024', value: 400 },
    { month: 'Aug 2024', value: 350 },
    { month: 'Sep 2024', value: 300 },
    { month: 'Oct 2024', value: 500 }
  ];

  const visibilityData = [
    { month: 'Jan', value: 0.1 },
    { month: 'Feb', value: 0.2 },
    { month: 'Mar', value: 0.4 },
    { month: 'Apr', value: 0.7 },
    { month: 'May', value: 0.6 },
    { month: 'Jun', value: 0.5 },
    { month: 'Jul', value: 0.7 },
    { month: 'Aug', value: 0.95 },
    { month: 'Sep', value: 0.7 },
    { month: 'Oct', value: 0.5 },
    { month: 'Nov', value: 0.4 },
    { month: 'Dec', value: 0.4 }
  ];

  const handleApprove = () => {
    onAction(website._id, 'approve');
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    onAction(website._id, 'reject', { reason: rejectionReason });
  };

  const handleVerificationSettingsChange = (setting, value) => {
    setVerificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const saveVerificationSettings = async () => {
    try {
      setSettingsLoading(true);
      const response = await adminAPI.updateWebsiteVerificationSettings(website._id, verificationSettings);
      if (response.ok) {
        // Update the website object with new settings
        website.disableGoogleAnalytics = verificationSettings.disableGoogleAnalytics;
        website.disableGoogleSearchConsole = verificationSettings.disableGoogleSearchConsole;
        website.disableHtmlFile = verificationSettings.disableHtmlFile;
        alert('Verification settings updated successfully');
      }
    } catch (error) {
      console.error('Failed to update verification settings:', error);
      alert('Failed to update verification settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Metrics Card Component
  const MetricsCard = ({ logo, metrics }) => (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
      <div className="flex items-center justify-center min-w-[80px]">
        <div className="text-blue-600 font-bold text-lg">{logo}</div>
      </div>
      <div className="flex-1 flex items-center justify-around gap-3 flex-wrap">
        {metrics.map((metric, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="text-blue-600 font-bold text-sm mb-1">{metric.title}</div>
            <div className="text-gray-800 text-sm">{metric.value}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // Action Button Component
  const ActionButton = ({ icon: Icon, text, onClick, className }) => (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white border-none hover:bg-blue-700 transition-colors ${className || ''}`}
    >
      <Icon size={16} />
      <span>{text}</span>
    </button>
  );

  // Testimonial Card Component
  const TestimonialCard = ({ rating, text }) => (
    <div className="rounded-lg border border-red-400 p-5">
      <div className="text-red-400 mb-2 text-lg">
        {'★'.repeat(rating)}
      </div>
      <div className="text-gray-800 text-base font-bold">
        {text}
      </div>
    </div>
  );

  // Icons
  const ExternalLink = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  );

  const Tag = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2H2v10l9 9 11-11V2z"></path>
    </svg>
  );

  const Check = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  const X = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  const Pause = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    </svg>
  );

  const BarChart3 = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18"></path>
      <path d="M18 17V9"></path>
      <path d="M13 17V5"></path>
      <path d="M8 17v-3"></path>
    </svg>
  );

  const Menu = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Review Website: {website.domain}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <X size={20} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8">
                {['details', 'metrics', 'verification'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="max-h-[70vh] overflow-y-auto">
              {activeTab === 'details' && (
                <div className="min-h-screen bg-gray-50 font-sans">
                  <div className="flex min-h-screen w-full overflow-x-hidden relative">
                    {/* Main content */}
                    <main className="flex-1 bg-gray-50 min-h-screen w-full transition-all duration-300 overflow-hidden">
                      <div className="p-4 xl:p-6">
                        <h1 className="text-blue-600 text-lg mb-5 font-medium">Websites</h1>

                        <div className="relative p-4 xl:p-5 shadow-xl rounded-2xl bg-white">
                          {/* Close button */}
                          <button 
                            onClick={onClose}
                            className="absolute top-3 right-3 w-4 h-4 cursor-pointer"
                          >
                            <X size={16} />
                          </button>

                          {/* Website details section */}
                          <div className="my-5 flex gap-3 shadow-md p-4 rounded-xl justify-between bg-white flex-col lg:flex-row">
                            <div className="w-full lg:w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4 lg:mb-0">
                              <div className="text-gray-400 text-sm">Website Image</div>
                            </div>
                            
                            <div className="flex flex-col gap-3 flex-1">
                              <div className="flex items-center gap-3 text-gray-800">
                                <h1 className="text-lg md:text-xl font-medium">{website.domain}</h1>
                                <a
                                  href={`https://${website.domain}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <ExternalLink size={18} className="cursor-pointer" />
                                </a>
                              </div>
                              <p className="text-sm text-gray-700">
                                {website.siteDescription || "No description available"}
                              </p>
                              <div className="flex items-center gap-3 text-gray-800">
                                <Tag size={18} />
                                <h3 className="text-lg font-normal">Category: <span className="text-sm capitalize">{website.category || "Not specified"}</span></h3>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-2">
                                <h3 className="text-blue-600 text-base font-normal">Website Price:</h3>
                                <span className="text-lg text-red-500">${website.publishingPrice || 0}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-red-500 text-sm font-normal">Dedicated Topic Price</h3>
                                <p className="text-red-500">+ $70</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-blue-600/40 text-sm font-normal">Copywriting Price:</h3>
                                <p className="text-red-500">$150</p>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3">
                              <ActionButton icon={Check} text="Accept" onClick={handleApprove} />
                              <ActionButton icon={X} text="Reject" onClick={() => setShowRejectionForm(true)} />
                              <ActionButton icon={Pause} text="Freeze" onClick={() => console.log('Freeze website')} />
                            </div>
                          </div>

                          {/* Info cards */}
                          <div className="flex gap-4 mb-5 flex-wrap">
                            <div className="bg-white rounded-lg border border-gray-200 p-5 flex-1 min-w-[200px]">
                              <div className="text-sm text-gray-800 mb-4">Country, Language</div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-5 bg-red-400 rounded"></div>
                                <div>{website.country || "Not specified"}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-5 bg-red-400 rounded"></div>
                                <div>{website.mainLanguage || "Not specified"}</div>
                              </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-5 flex-1 min-w-[200px]">
                              <div className="text-sm text-gray-800 mb-4">Links</div>
                              <div className="text-xs text-gray-800 mb-2">4 Links max/post</div>
                              <div className="text-xs text-gray-800 mb-2">"Sponsored" indicated: No</div>
                              <div className="text-xs text-gray-800">Follow / No Follow / Sponsored</div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 p-5 flex-1 min-w-[200px]">
                              <div className="text-sm text-gray-800 mb-4">Places of publication/Images</div>
                              <div className="text-xs text-gray-800 mb-2">Publishes in the main page: Yes</div>
                              <div className="text-xs text-gray-800 mb-2">Publishes in related categories: Yes</div>
                              <div className="text-xs text-gray-800">Maximum number of images: 1</div>
                            </div>
                          </div>

                          {/* SEO Metrics title */}
                          <div className="flex items-center my-5 text-blue-600 font-bold text-lg bg-white">
                            <BarChart3 size={18} className="mr-3" />
                            SEO Metrics
                          </div>

                          {/* Metrics cards */}
                          <div className="space-y-4 mb-5">
                            <MetricsCard 
                              logo="MOZ" 
                              metrics={[
                                { title: 'DA', value: website.metrics?.domainAuthority || 'N/A' },
                                { title: 'DR', value: website.metrics?.referringDomains || 'N/A' },
                                { title: 'PA', value: website.metrics?.pageAuthority || 'N/A' },
                                { title: 'Moz Links', value: website.metrics?.externalLinks || 'N/A' },
                                { title: 'Moz Ranks', value: website.metrics?.mozRank || 'N/A' },
                                { title: 'Traffic', value: website.metrics?.organicTraffic || 'N/A' }
                              ]}
                            />

                            <MetricsCard 
                              logo="AHREFS" 
                              metrics={[
                                { title: 'DA', value: website.metrics?.ahrefsDA || 'N/A' },
                                { title: 'DR', value: website.metrics?.ahrefsDR || 'N/A' },
                                { title: 'BL', value: website.metrics?.backlinks || 'N/A' },
                                { title: 'OBL', value: website.metrics?.referringDomains || 'N/A' },
                                { title: 'Organic Traffic', value: website.metrics?.organicTraffic || 'N/A' },
                                { title: 'Keywords', value: website.metrics?.keywords || 'N/A' }
                              ]}
                            />

                            <MetricsCard 
                              logo="SISTRIX" 
                              metrics={[
                                { title: 'CF', value: website.metrics?.cf || 'N/A' },
                                { title: 'TF', value: website.metrics?.tf || 'N/A' },
                                { title: 'Majestic Links', value: website.metrics?.majesticLinks || 'N/A' },
                                { title: 'Majestic RD', value: website.metrics?.majesticRD || 'N/A' }
                              ]}
                            />

                            <MetricsCard 
                              logo="MAJESTIC" 
                              metrics={[
                                { title: 'Visibility Index', value: website.metrics?.visibilityIndex || 'N/A' }
                              ]}
                            />
                          </div>

                          {/* Traffic Chart */}
                          <div className="bg-white rounded-lg border border-red-400 p-5 mb-8">
                            <div className="text-red-500 text-lg mb-4 font-medium">Organic Website Traffic</div>
                            <div className="w-full h-80">
                              <div className="w-full h-80">
                                {/* Simple chart representation */}
                                <div className="flex items-end h-64 gap-1 border-l border-b border-gray-300 p-4">
                                  {trafficData.map((item, index) => (
                                    <div key={index} className="flex flex-col items-center flex-1">
                                      <div 
                                        className="w-full bg-red-500 rounded-t hover:bg-red-600 transition-colors"
                                        style={{ height: `${(item.value / 600) * 100}%` }}
                                      ></div>
                                      <div className="text-xs mt-2 text-gray-600 transform -rotate-45 origin-left">
                                        {item.month}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Visibility Chart */}
                          <div className="bg-white rounded-lg border border-red-400 p-5 mb-8">
                            <div className="text-red-500 text-lg mb-4 font-medium">Visibility Index</div>
                            <div className="w-full h-80">
                              <div className="w-full h-80">
                                {/* Simple chart representation */}
                                <div className="flex items-end h-64 gap-1 border-l border-b border-gray-300 p-4">
                                  {visibilityData.map((item, index) => (
                                    <div key={index} className="flex flex-col items-center flex-1">
                                      <div 
                                        className="w-full bg-red-500 rounded-t hover:bg-red-600 transition-colors"
                                        style={{ height: `${item.value * 100}%` }}
                                      ></div>
                                      <div className="text-xs mt-2 text-gray-600 transform -rotate-45 origin-left">
                                        {item.month}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Testimonials */}
                          <div className="mb-8">
                            <h2 className="text-blue-600 text-lg mb-5 font-medium">Based on reviews</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <TestimonialCard rating={5} text="Super service. (testimonial 1)" />
                              <TestimonialCard rating={5} text="Super service. (testimonial 2)" />
                              <TestimonialCard rating={5} text="Super service. (testimonial 3)" />
                              <TestimonialCard rating={5} text="Super service. (testimonial 4)" />
                            </div>
                          </div>

                          {/* Bottom action buttons */}
                          <div className="flex justify-end items-end flex-col sm:flex-row gap-3 mt-5">
                            <ActionButton icon={Check} text="Accept" onClick={handleApprove} />
                            <ActionButton icon={X} text="Reject" onClick={() => setShowRejectionForm(true)} />
                            <ActionButton icon={Pause} text="Freeze" onClick={() => console.log('Freeze website')} />
                          </div>
                        </div>
                      </div>
                    </main>
                  </div>
                </div>
              )}

              {activeTab === 'metrics' && (
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Website Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Domain Authority</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {website.metrics?.domainAuthority || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Page Authority</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {website.metrics?.pageAuthority || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Referring Domains</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {website.metrics?.referringDomains || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Organic Traffic</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {website.metrics?.organicTraffic || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'verification' && (
                <div className="space-y-4 p-4">
                  <h4 className="text-md font-medium text-gray-900">Verification Method Settings</h4>
                  <p className="text-sm text-gray-500">
                    Configure which verification methods are available for this website. 
                    Disable methods that should not be available to the publisher.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div>
                        <label className="text-sm font-medium text-gray-900">Google Analytics</label>
                        <p className="text-xs text-gray-500">Verify through Google Analytics account</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          checked={!verificationSettings.disableGoogleAnalytics}
                          onChange={(e) => handleVerificationSettingsChange('disableGoogleAnalytics', !e.target.checked)}
                          className="sr-only"
                          id="google-analytics-toggle"
                        />
                        <label
                          htmlFor="google-analytics-toggle"
                          className={`block h-6 w-10 rounded-full cursor-pointer ${
                            !verificationSettings.disableGoogleAnalytics ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                              !verificationSettings.disableGoogleAnalytics ? 'transform translate-x-4' : ''
                            }`}
                          ></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div>
                        <label className="text-sm font-medium text-gray-900">Google Search Console</label>
                        <p className="text-xs text-gray-500">Verify through Google Search Console</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          checked={!verificationSettings.disableGoogleSearchConsole}
                          onChange={(e) => handleVerificationSettingsChange('disableGoogleSearchConsole', !e.target.checked)}
                          className="sr-only"
                          id="search-console-toggle"
                        />
                        <label
                          htmlFor="search-console-toggle"
                          className={`block h-6 w-10 rounded-full cursor-pointer ${
                            !verificationSettings.disableGoogleSearchConsole ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                              !verificationSettings.disableGoogleSearchConsole ? 'transform translate-x-4' : ''
                            }`}
                          ></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div>
                        <label className="text-sm font-medium text-gray-900">HTML File Upload</label>
                        <p className="text-xs text-gray-500">Verify by uploading an HTML file</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          checked={!verificationSettings.disableHtmlFile}
                          onChange={(e) => handleVerificationSettingsChange('disableHtmlFile', !e.target.checked)}
                          className="sr-only"
                          id="html-file-toggle"
                        />
                        <label
                          htmlFor="html-file-toggle"
                          className={`block h-6 w-10 rounded-full cursor-pointer ${
                            !verificationSettings.disableHtmlFile ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                              !verificationSettings.disableHtmlFile ? 'transform translate-x-4' : ''
                            }`}
                          ></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={saveVerificationSettings}
                      disabled={settingsLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                    >
                      {settingsLoading ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Rejection Form */}
            {showRejectionForm && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <label className="block text-sm font-medium text-red-700 mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full border border-red-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Please provide a detailed reason for rejecting this website..."
                />
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => setShowRejectionForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={loading || !rejectionReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <div className="flex space-x-3">
              {website.status === 'submitted' && (
                <>
                  {!showRejectionForm && (
                    <>
                      <button
                        onClick={handleApprove}
                        disabled={loading}
                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 disabled:opacity-50 sm:text-sm"
                      >
                        Approve Website
                      </button>
                      <button
                        onClick={() => setShowRejectionForm(true)}
                        disabled={loading}
                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 disabled:opacity-50 sm:text-sm"
                      >
                        Reject Website
                      </button>
                    </>
                  )}
                </>
              )}
              
              {/* Add edit button for approved websites in the modal */}
              {website.status === 'approved' && (
                <button
                  onClick={() => handleWebsiteAction(website._id, 'edit', { reason: 'Needs re-moderation' })}
                  disabled={loading}
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 disabled:opacity-50 sm:text-sm"
                >
                  Request Edit
                </button>
              )}
              
              <button
                onClick={onClose}
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteApproval;