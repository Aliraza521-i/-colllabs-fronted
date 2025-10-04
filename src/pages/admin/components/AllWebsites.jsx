import React, { useState, useEffect, useRef } from 'react';
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
  PauseIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  TagIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../../services/api';
import { Chart } from 'chart.js/auto';

const AllWebsites = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const trafficChartRef = useRef(null);
  const visibilityChartRef = useRef(null);
  const trafficChartInstance = useRef(null);
  const visibilityChartInstance = useRef(null);

  const websitesPerPage = 15;

  useEffect(() => {
    fetchWebsites();
  }, [currentPage, statusFilter, categoryFilter, searchTerm]);

  useEffect(() => {
    if (showModal && selectedWebsite) {
      // Initialize charts when modal opens
      initializeCharts();
    }

    // Cleanup charts when modal closes
    return () => {
      if (trafficChartInstance.current) {
        trafficChartInstance.current.destroy();
        trafficChartInstance.current = null;
      }
      if (visibilityChartInstance.current) {
        visibilityChartInstance.current.destroy();
        visibilityChartInstance.current = null;
      }
    };
  }, [showModal, selectedWebsite]);

  const initializeCharts = () => {
    // Destroy existing charts if they exist
    if (trafficChartInstance.current) {
      trafficChartInstance.current.destroy();
    }
    if (visibilityChartInstance.current) {
      visibilityChartInstance.current.destroy();
    }

    // Traffic Chart Data
    const trafficMonths = [
      "November 2023", "December 2023", "January 2024", "February 2024",
      "March 2024", "April 2024", "May 2024", "June 2024",
      "July 2024", "August 2024", "September 2024", "October 2024"
    ];
    const trafficData = [500, 450, 380, 420, 180, 190, 250, 350, 400, 350, 300, 500];

    // Visibility Chart Data
    const visibilityMonths = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const visibilityData = [0.1, 0.2, 0.4, 0.7, 0.6, 0.5, 0.7, 0.95, 0.7, 0.5, 0.4, 0.4];

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      elements: {
        line: { tension: 0.4 },
        point: { radius: 0 }
      },
      scales: {
        x: {
          grid: { color: "#e0e0e0", drawBorder: false },
          ticks: { font: { size: 10 } }
        },
        y: {
          grid: { color: "#e0e0e0", drawBorder: false },
          beginAtZero: true
        }
      },
      plugins: { legend: { display: false } }
    };

    // Create Traffic Chart
    if (trafficChartRef.current) {
      const trafficCtx = trafficChartRef.current.getContext('2d');
      trafficChartInstance.current = new Chart(trafficCtx, {
        type: 'line',
        data: {
          labels: trafficMonths,
          datasets: [{
            data: trafficData,
            borderColor: '#e05d44',
            backgroundColor: 'rgba(224, 93, 68, 0.1)',
            borderWidth: 2,
            fill: false
          }]
        },
        options: {
          ...commonOptions,
          scales: {
            ...commonOptions.scales,
            y: { ...commonOptions.scales.y, max: 600, ticks: { stepSize: 100 } }
          }
        }
      });
    }

    // Create Visibility Chart
    if (visibilityChartRef.current) {
      const visibilityCtx = visibilityChartRef.current.getContext('2d');
      visibilityChartInstance.current = new Chart(visibilityCtx, {
        type: 'line',
        data: {
          labels: visibilityMonths,
          datasets: [{
            data: visibilityData,
            borderColor: '#e05d44',
            backgroundColor: 'rgba(224, 93, 68, 0.1)',
            borderWidth: 2,
            fill: false
          }]
        },
        options: {
          ...commonOptions,
          scales: {
            ...commonOptions.scales,
            y: { ...commonOptions.scales.y, max: 1.0, ticks: { stepSize: 0.1 } }
          }
        }
      });
    }
  };

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllWebsites({
        page: currentPage,
        limit: websitesPerPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: searchTerm || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (response.data && response.data.ok) {
        setWebsites(response.data.data || []);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
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

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      paused: 'bg-purple-100 text-purple-800',
      deleted: 'bg-gray-100 text-gray-800'
    };

    const icons = {
      draft: <ClockIcon className="h-3 w-3" />,
      submitted: <ClockIcon className="h-3 w-3" />,
      under_review: <ClockIcon className="h-3 w-3" />,
      approved: <CheckCircleIcon className="h-3 w-3" />,
      rejected: <XCircleIcon className="h-3 w-3" />,
      paused: <PauseIcon className="h-3 w-3" />,
      deleted: <TrashIcon className="h-3 w-3" />
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

  const ActionButton = ({ icon, text, variant = 'primary', onClick, disabled = false }) => {
    const baseClasses = "flex items-center gap-2 px-4 py-3 rounded-xl border-none text-white transition-colors duration-200";
    const variants = {
      primary: "bg-indigo-600 hover:bg-indigo-700",
      success: "bg-green-600 hover:bg-green-700",
      danger: "bg-red-600 hover:bg-red-700"
    };
    
    return (
      <button 
        className={`${baseClasses} ${variants[variant]}`} 
        onClick={onClick}
        disabled={disabled}
      >
        <span className="w-4 h-4">{icon}</span>
        <span>{text}</span>
      </button>
    );
  };

  const MetricCard = ({ logo, metrics }) => (
    <div className="w-full bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
      <div className="flex items-center justify-center flex-shrink-0">
        <img src={logo} alt="logo" className="w-full max-w-20 h-16 object-contain" />
      </div>
      <div className="flex-1 flex items-center justify-around gap-3 flex-wrap">
        {metrics.map((metric, index) => (
          <div key={index} className="flex flex-col items-center min-w-16">
            <div className="text-indigo-600 font-bold text-sm mb-1">{metric.title}</div>
            <div className="text-sm text-gray-800">{metric.value}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading && websites.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Detailed Website Modal Component with new design
  const WebsiteDetailModal = ({ website, onClose, onAction, actionLoading }) => {
    const [rejectionReason, setRejectionReason] = useState('');

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

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
                <div className="max-w-7xl mx-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-indigo-600 text-xl font-medium">Websites</h1>
                    <button 
                      onClick={onClose}
                      className="w-6 h-6 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-6 relative">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200 mb-6">
                      <nav className="-mb-px flex space-x-8">
                        {['details', 'publishing', 'pricing', 'seo', 'metrics'].map((tab) => (
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
                        <div className="space-y-6">
                          {/* Website Details */}
                          <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col lg:flex-row gap-4 justify-between">
                            <img 
                              src={`https://via.placeholder.com/300x200/4f46e5/ffffff?text=${website.domain}`} 
                              alt="website preview" 
                              className="w-full lg:w-80 h-48 object-cover rounded-lg flex-shrink-0"
                            />
                            
                            <div className="flex-1 flex flex-col gap-4">
                              <div className="flex items-center gap-3 text-gray-800">
                                <h2 className="text-xl font-semibold">{website.domain}</h2>
                                <a 
                                  href={`https://${website.domain}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-gray-500 hover:text-indigo-600"
                                >
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                  </svg>
                                </a>
                              </div>
                              
                              <p className="text-gray-600 text-sm leading-relaxed">
                                {website.siteDescription || "No description available"}
                              </p>
                              
                              <div className="flex items-center gap-3 text-gray-800">
                                <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                                  <line x1="7" y1="7" x2="7.01" y2="7" />
                                </svg>
                                <span className="text-lg">Category: 
                                  <span className="text-base text-gray-600">
                                    {website.allCategories && website.allCategories.length > 0 
                                      ? website.allCategories.join(', ') 
                                      : (website.category || "General")}
                                  </span>
                                </span>
                              </div>
                            </div>

                            {/* Pricing */}
                            <div className="flex flex-col gap-3 min-w-48">
                              <div className="flex items-center gap-2">
                                <span className="text-indigo-600 font-medium">Website Price:</span>
                                <span className="text-gray-400 line-through text-sm">{formatPrice(website.publishingPrice * 1.2)}</span>
                                <span className="text-orange-500 text-lg font-semibold">{formatPrice(website.publishingPrice)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Dedicated Topic Price</span>
                                <span className="text-orange-500 font-medium">+ {formatPrice(website.copywritingPrice)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-indigo-400">Copywriting Price:</span>
                                <span className="text-orange-500 font-medium">{formatPrice(website.copywritingPrice)}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 min-w-32">
                              <ActionButton 
                                icon="✓" 
                                text="Accept" 
                                variant="success"
                                onClick={handleApprove}
                                disabled={actionLoading}
                              />
                              <ActionButton 
                                icon="✕" 
                                text="Reject" 
                                variant="danger"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to reject this website?')) {
                                    handleReject();
                                  }
                                }}
                                disabled={actionLoading}
                              />
                              <ActionButton 
                                icon="❄" 
                                text="Freeze" 
                                variant="primary"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to pause this website?')) {
                                    onAction(website._id, 'pause');
                                  }
                                }}
                                disabled={actionLoading}
                              />
                            </div>
                          </div>

                          {/* Info Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          {/* Location Information */}
                          <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="text-gray-800 text-lg font-medium mb-4">Location Information</h3>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600 w-24">Country:</span>
                                <span className="text-gray-900">{website.country || "Not specified"}</span>
                              </div>
                              {website.region && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600 w-24">Region:</span>
                                  <span className="text-gray-900">{website.region}</span>
                                </div>
                              )}
                              {website.city && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600 w-24">City:</span>
                                  <span className="text-gray-900">{website.city}</span>
                                </div>
                              )}
                              {website.additionalCountries && website.additionalCountries.length > 0 && (
                                <div className="flex items-start gap-2">
                                  <span className="text-gray-600 w-24">Additional Countries:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {website.additionalCountries.map((country, index) => (
                                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                        {country}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Language Information */}
                          <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="text-gray-800 text-lg font-medium mb-4">Language Information</h3>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600 w-24">Main Language:</span>
                                <span className="text-gray-900">{website.mainLanguage || "Not specified"}</span>
                              </div>
                              {website.additionalLanguages && website.additionalLanguages.length > 0 && (
                                <div className="flex items-start gap-2">
                                  <span className="text-gray-600 w-24">Additional Languages:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {website.additionalLanguages.map((language, index) => (
                                      <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                        {language}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                          {/* Publisher Information */}
                          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                          <h3 className="text-gray-800 text-lg font-medium mb-4">Keywords</h3>
                          <div className="flex flex-wrap gap-2">
                            {website.keywords && website.keywords.length > 0 ? (
                              website.keywords.map((keyword, index) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                  {keyword}
                                </span>
                              ))
                            ) : (
                              <p className="text-gray-500">No keywords specified</p>
                            )}
                          </div>
                        </div>

                        {/* Publisher Information */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Publisher Information</h4>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {website.userId?.firstName?.[0]}{website.userId?.lastName?.[0]}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {website.userId?.firstName} {website.userId?.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{website.userId?.email}</p>
                            </div>
                          </div>
                        </div>
                        </div>
                      )}

                      {activeTab === 'publishing' && (
                      <div className="space-y-6">
                        {/* Publishing Requirements */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                          <h3 className="text-gray-800 text-lg font-medium mb-4">Publishing Requirements</h3>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-gray-700 font-medium mb-2">Advertising Requirements</h4>
                              <p className="text-gray-600 bg-gray-50 p-3 rounded">
                                {website.advertisingRequirements || "Not specified"}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-gray-700 font-medium mb-2">Publishing Sections</h4>
                              <p className="text-gray-600 bg-gray-50 p-3 rounded">
                                {website.publishingSections || "Not specified"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Link Information */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                          <h3 className="text-gray-800 text-lg font-medium mb-4">Link Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 w-32">Link Type:</span>
                              <span className="text-gray-900 font-medium">
                                {website.linkType === 'dofollow' ? 'Dofollow' : 'Nofollow'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 w-32">Number of Links:</span>
                              <span className="text-gray-900 font-medium">{website.numberOfLinks || 1}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 w-32">Publishing Formats:</span>
                              <div className="flex flex-wrap gap-1">
                                {website.publishingFormats && website.publishingFormats.length > 0 ? (
                                  website.publishingFormats.map((format, index) => (
                                    <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                      {format}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-gray-500">Not specified</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Sensitive Content */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                          <h3 className="text-gray-800 text-lg font-medium mb-4">Sensitive Content</h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 w-48">Accepted Sensitive Categories:</span>
                              <div className="flex flex-wrap gap-1">
                                {website.acceptedSensitiveCategories && website.acceptedSensitiveCategories.length > 0 ? (
                                  website.acceptedSensitiveCategories.map((category, index) => (
                                    <span key={index} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                      {category.replace(/_/g, ' ')}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-gray-500">None</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 w-48">Sensitive Content Extra Charge:</span>
                              <span className="text-gray-900 font-medium">
                                {website.sensitiveContentExtraCharge ? formatPrice(website.sensitiveContentExtraCharge) : 'None'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'pricing' && (
                      <div className="space-y-6">
                        {/* Pricing Information */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                          <h3 className="text-gray-800 text-lg font-medium mb-4">Pricing Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 w-48">Publishing Price:</span>
                              <span className="text-gray-900 font-medium text-lg text-green-600">
                                {formatPrice(website.publishingPrice)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 w-48">Copywriting Price:</span>
                              <span className="text-gray-900 font-medium text-lg text-green-600">
                                {formatPrice(website.copywritingPrice)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 w-48">Homepage Announcement Price:</span>
                              <span className="text-gray-900 font-medium text-lg text-green-600">
                                {website.homepageAnnouncementPrice ? formatPrice(website.homepageAnnouncementPrice) : 'Not available'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 w-48">Discount Percentage:</span>
                              <span className="text-gray-900 font-medium">
                                {website.discountPercentage || 0}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Additional Pricing */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                          <h3 className="text-gray-800 text-lg font-medium mb-4">Additional Pricing Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 w-48">Article Editing Percentage:</span>
                              <span className="text-gray-900 font-medium">
                                {website.articleEditingPercentage || 10}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'metrics' && (
                      <div className="space-y-6">
                        {/* Charts */}
                        <div className="space-y-8 mb-8">
                          <div className="bg-white rounded-xl border border-orange-500 p-6">
                            <h3 className="text-orange-600 text-lg font-medium mb-4">Organic Website Traffic</h3>
                            <div className="h-80 w-full">
                              <canvas ref={trafficChartRef}></canvas>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl border border-orange-500 p-6">
                            <h3 className="text-orange-600 text-lg font-medium mb-4">Visibility Index</h3>
                            <div className="h-80 w-full">
                              <canvas ref={visibilityChartRef}></canvas>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                      {activeTab === 'seo' && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="text-sm font-medium text-gray-500">Main Language</h4>
                              <p className="mt-1 text-sm text-gray-900">{website.mainLanguage || "Not specified"}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="text-sm font-medium text-gray-500">Country</h4>
                              <p className="mt-1 text-sm text-gray-900">{website.country || "Not specified"}</p>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h4 className="text-sm font-medium text-gray-500">Keywords</h4>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {website.keywords && website.keywords.length > 0 ? (
                                website.keywords.map((keyword, index) => (
                                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {keyword}
                                  </span>
                                ))
                              ) : (
                                <p className="text-sm text-gray-500">No keywords specified</p>
                              )}
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h4 className="text-sm font-medium text-gray-500">Advertising Requirements</h4>
                            <p className="mt-1 text-sm text-gray-900">{website.advertisingRequirements || "Not specified"}</p>
                          </div>

                          {/* SEO Metrics */}
                          <div className="flex items-center gap-3 mb-6">
                            <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <path d="M7 16l3-3 3 3 4-4" />
                            </svg>
                            <h2 className="text-indigo-600 text-lg font-bold">SEO Metrics</h2>
                          </div>

                          <div className="space-y-4 mb-8">
                            <MetricCard 
                              logo="https://via.placeholder.com/80x60/1976d2/ffffff?text=MOZ"
                              metrics={[
                                { title: "DA", value: website.metrics?.domainAuthority || "N/A" },
                                { title: "DR", value: "40" },
                                { title: "PA", value: "28" },
                                { title: "Moz Links", value: "0.239%" },
                                { title: "Moz Ranks", value: "750" },
                                { title: "Traffic", value: website.metrics?.monthlyTraffic ? website.metrics.monthlyTraffic.toLocaleString() : "N/A" }
                              ]}
                            />

                            <MetricCard 
                              logo="https://via.placeholder.com/80x60/ff5722/ffffff?text=AHREFS"
                              metrics={[
                                { title: "DA", value: "13" },
                                { title: "DR", value: website.metrics?.domainRating || "N/A" },
                                { title: "BL", value: "34" },
                                { title: "OBL", value: "10" },
                                { title: "Organic Traffic", value: website.metrics?.organicTraffic ? website.metrics.organicTraffic.toLocaleString() : "N/A" },
                                { title: "Keywords", value: website.metrics?.keywords || "N/A" }
                              ]}
                            />

                            <MetricCard 
                              logo="https://via.placeholder.com/80x60/9c27b0/ffffff?text=SISTRIX"
                              metrics={[
                                { title: "CF", value: "11" },
                                { title: "TF", value: "9" },
                                { title: "Majestic Links", value: "45" },
                                { title: "Majestic RD", value: "19" }
                              ]}
                            />

                            <MetricCard 
                              logo="https://via.placeholder.com/80x60/607d8b/ffffff?text=MAJESTIC"
                              metrics={[
                                { title: "Visibility Index", value: website.metrics?.visibilityIndex || "N/A" }
                              ]}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <div className="flex space-x-3">
                {website.status === 'submitted' && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 disabled:opacity-50 sm:text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to reject this website?')) {
                          handleReject();
                        }
                      }}
                      disabled={actionLoading}
                      className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 disabled:opacity-50 sm:text-sm"
                    >
                      Reject
                    </button>
                  </>
                )}
                
                {website.status === 'approved' && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to pause this website?')) {
                        onAction(website._id, 'pause');
                      }
                    }}
                    disabled={actionLoading}
                    className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 disabled:opacity-50 sm:text-sm"
                  >
                    Pause
                  </button>
                )}
                
                {(website.status === 'approved' || website.status === 'rejected' || website.status === 'paused') && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this website? This action cannot be undone.')) {
                        onAction(website._id, 'delete');
                      }
                    }}
                    disabled={actionLoading}
                    className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 disabled:opacity-50 sm:text-sm"
                  >
                    Delete
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Websites</h1>
          <p className="text-gray-600">Manage all websites with different statuses</p>
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

          {/* Status Filter */}
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
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="paused">Paused</option>
              <option value="deleted">Deleted</option>
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
        </div>
      </div>

      {/* Websites Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Website
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Publisher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {websites.map((website) => (
                <tr key={website._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{website.domain}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{website.siteDescription}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">
                          {website.userId?.firstName?.[0]}{website.userId?.lastName?.[0]}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {website.userId?.firstName} {website.userId?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{website.userId?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {website.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPrice(website.publishingPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(website.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(website.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedWebsite(website);
                          setShowModal(true);
                          setActiveTab('details');
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      
                      {website.status === 'submitted' && (
                        <>
                          <button
                            onClick={() => handleWebsiteAction(website._id, 'approve')}
                            disabled={actionLoading}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleWebsiteAction(website._id, 'reject', { reason: 'Quality standards not met' })}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      
                      {website.status === 'approved' && (
                        <button
                          onClick={() => handleWebsiteAction(website._id, 'pause')}
                          disabled={actionLoading}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Pause"
                        >
                          <PauseIcon className="h-5 w-5" />
                        </button>
                      )}
                      
                      {(website.status === 'approved' || website.status === 'rejected' || website.status === 'paused') && (
                        <button
                          onClick={() => handleWebsiteAction(website._id, 'delete')}
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
      </div>

      {/* Website Detail Modal */}
      {showModal && selectedWebsite && (
        <WebsiteDetailModal
          website={selectedWebsite}
          onClose={() => {
            setShowModal(false);
            setSelectedWebsite(null);
            setActiveTab('details');
          }}
          onAction={handleWebsiteAction}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default AllWebsites;