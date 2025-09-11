import React, { useState, useEffect } from 'react';
import { Heart, Pause, Edit, Trash2, CheckCircle, Clock, XCircle, Search, ChevronDown, Filter, Plus, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { websiteAPI } from '../../../services/api';

const Websites = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [websiteToDelete, setWebsiteToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [sortBy, setSortBy] = useState('last_event');
  const navigate = useNavigate();

  // Custom styles for animation
  const customStyles = `
    @keyframes popIn {
      0% {
        opacity: 0;
        transform: scale(0.9) translateY(10px);
      }
      70% {
        transform: scale(1.02);
      }
      100% {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    .animate-pop-in {
      animation: popIn 0.3s cubic-bezier(0.26, 0.53, 0.74, 1.48) forwards;
    }
  `;

  // Close status filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const statusFilterElement = document.getElementById('status-filter');
      if (statusFilterElement && !statusFilterElement.contains(event.target)) {
        setShowStatusFilter(false);
      }
    };

    if (showStatusFilter) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusFilter]);

  useEffect(() => {
    fetchUserWebsites();
  }, [currentPage, selectedStatuses, sortBy, searchQuery]);

  const fetchUserWebsites = async () => {
    try {
      setLoading(true);
      
      // Prepare filter parameters
      const params = {
        page: currentPage,
        limit: limit,
        sort: sortBy
      };
      
      // Add status filter if any is selected
      if (selectedStatuses.length > 0) {
        // Only use the first selected status for exclusive filtering
        const selectedStatus = selectedStatuses[0];
        
        // Map frontend filter names to backend status values
        let statusFilter;
        switch (selectedStatus) {
          case 'active':
            statusFilter = 'approved';
            break;
          case 'in_moderation':
            // For in_moderation, we need to filter by both verificationStatus and status
            // This will be handled on the backend
            statusFilter = 'in_moderation';
            break;
          case 'draft':
            statusFilter = 'draft';
            break;
          case 'rejected':
            statusFilter = 'rejected';
            break;
          case 'paused':
            statusFilter = 'paused';
            break;
          case 'blocked':
            statusFilter = 'blocked';
            break;
          case 'problem_sites':
            // For problem sites, use the special filter
            statusFilter = 'problem_sites';
            break;
          default:
            statusFilter = selectedStatus;
        }
        
        params.statuses = statusFilter;
      }
      
      // Add search query if any
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      const response = await websiteAPI.getUserWebsites(params);
      
      if (response.data && response.data.ok) {
        console.log("Fetched websites:", response.data.data);
        setWebsites(response.data.data);
        
        // Set pagination data from the response
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.pages || 1);
        }
      } else {
        setError(response.data?.message || 'Failed to fetch websites');
      }
    } catch (err) {
      setError('Failed to fetch websites');
      console.error('Error fetching websites:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to count websites by status
  const getCountByStatus = (filterStatus) => {
    // For now, we'll return 0 for all counts except the ones we're currently filtering by
    // In a real implementation, this would make API calls to get actual counts
    if (filterStatus === 'problem_sites') {
      // Return a placeholder count for problem sites
      return 3; // This matches the count shown in the UI
    }
    
    // For other statuses, return a placeholder count
    return websites.filter(website => {
      // Map frontend filter names to actual website status values
      switch (filterStatus) {
        case 'active':
          return website.status === 'approved';
        case 'in_moderation':
          return website.verificationStatus === 'verified' && website.status === 'submitted';
        case 'paused':
          return website.status === 'paused';
        case 'rejected':
          return website.status === 'rejected';
        case 'draft':
          return website.status === 'draft';
        case 'blocked':
          return website.status === 'blocked';
        default:
          return website.status === filterStatus;
      }
    }).length;
  };

  const handleDeleteWebsite = async () => {
    if (!websiteToDelete) return;
    
    try {
      setDeleteLoading(true);
      const response = await websiteAPI.deleteWebsite(websiteToDelete._id);
      
      if (response.data && response.data.ok) {
        // Remove the deleted website from the list
        setWebsites(websites.filter(w => w._id !== websiteToDelete._id));
        setShowDeleteModal(false);
        setWebsiteToDelete(null);
        
        // If the current page is now empty and it's not the first page, go to the previous page
        if (websites.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          // Refresh the list to get updated data
          fetchUserWebsites();
        }
      } else {
        throw new Error(response.data?.message || 'Failed to delete website');
      }
    } catch (err) {
      console.error('Error deleting website:', err);
      alert(`Failed to delete website: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusColor = (status, verificationStatus) => {
    // Special case for websites that are verified but waiting for moderation
    if (verificationStatus === "verified" && status === "submitted") {
      return "bg-[#0c0c0c] border border-[#bff747]/30";
    }
    
    switch (status) {
      case "approved":
        return "bg-[#0c0c0c] border border-[#bff747]/30";
      case "submitted":
        return "bg-[#0c0c0c] border border-[#bff747]/30";
      case "rejected":
        return "bg-[#0c0c0c] border border-[#bff747]/30";
      case "draft":
        return "bg-[#0c0c0c] border border-[#bff747]/30";
      default:
        return "bg-[#0c0c0c]";
    }
  };

  const getStatusBadge = (status, verificationStatus) => {
    // Special case for websites that are verified but waiting for moderation
    if (verificationStatus === "verified" && status === "submitted") {
      return (
        <div className="flex items-center space-x-1 text-[#bff747]">
          <Clock size={16} />
          <span className="text-sm font-medium">For Moderation</span>
        </div>
      );
    }
    
    const badges = {
      approved: { text: 'Approved', icon: <CheckCircle size={16} />, color: 'text-[#bff747]' },
      submitted: { text: 'Under Review', icon: <Clock size={16} />, color: 'text-[#bff747]' },
      rejected: { text: 'Rejected', icon: <XCircle size={16} />, color: 'text-red-400' },
      draft: { text: 'Draft', icon: <Clock size={16} />, color: 'text-yellow-400' }
    };
    
    const badge = badges[status] || { text: status, icon: <Clock size={16} />, color: 'text-gray-400' };
    
    return (
      <div className={`flex items-center space-x-1 ${badge.color}`}>
        {badge.icon}
        <span className="text-sm font-medium">{badge.text}</span>
      </div>
    );
  };

  const getActionButtons = (website) => {
    // If website is verified but awaiting moderation, show only text
    if (website.verificationStatus === "verified" && website.status === "submitted") {
      return [
        { icon: <Clock size={16} />, text: "In Moderation", bg: "bg-[#bff747]", disabled: true }
      ];
    }
    
    // If website is approved, it's in the advertiser section and should have limited actions
    if (website.status === "approved") {
      return [
        { icon: <CheckCircle size={16} />, text: "Approved", bg: "bg-[#bff747]", disabled: true },
        { icon: <Edit size={16} />, text: "View Details", bg: "bg-[#bff747]", action: "view" },
        { icon: <Trash2 size={16} />, text: "Delete", bg: "bg-red-500", action: "delete" }
      ];
    }
    
    // If website is rejected, show rejection reason
    if (website.status === "rejected") {
      return [
        { icon: <XCircle size={16} />, text: "Rejected", bg: "bg-red-500", disabled: true },
        { icon: <Edit size={16} />, text: "View Details", bg: "bg-[#bff747]", action: "view" },
        { icon: <Edit size={16} />, text: "Reverify", bg: "bg-[#bff747]", action: "resubmit" },
        { icon: <Trash2 size={16} />, text: "Delete", bg: "bg-red-500", action: "delete" }
      ];
    }
    
    // For draft websites (not yet verified)
    if (website.status === "draft") {
      return [
        { icon: <CheckCircle size={16} />, text: "Verification", bg: "bg-[#bff747]", action: "complete" },
        { icon: <Trash2 size={16} />, text: "Delete", bg: "bg-red-500", action: "delete" }
      ];
    }
    
    // For other statuses (verified but not submitted for moderation)
    return [
      { icon: <Heart size={16} />, text: "Active", bg: "bg-[#bff747]", action: "view" },
      { icon: <Pause size={16} />, text: "Pause", bg: "bg-[#bff747]", action: "pause" },
      { icon: <CheckCircle size={16} />, text: "Reverify", bg: "bg-[#bff747]", action: "resubmit" },
      { icon: <Trash2 size={16} />, text: "Delete", bg: "bg-red-500", action: "delete" }
    ];
  };

  if (loading) {
    return (
      <div className="p-6 bg-[#0c0c0c] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bff747]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-[#0c0c0c] min-h-screen">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={fetchUserWebsites}
            className="mt-4 bg-[#bff747] text-[#0c0c0c] px-4 py-2 rounded-lg hover:bg-[#bff747]/80 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Mobile filter panel component
  const MobileFilterPanel = () => (
    <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'} lg:hidden`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)}></div>
      <div className="relative flex flex-col w-4/5 max-w-sm h-full bg-[#0c0c0c] border-r border-[#bff747]/30 shadow-xl">
        <div className="flex items-center justify-between h-16 bg-[#0c0c0c] border-b border-[#bff747]/30 px-4">
          <span className="text-[#bff747] font-bold text-lg">Filters</span>
          <button
            onClick={() => setShowMobileFilters(false)}
            className="p-2 rounded-md text-[#bff747] hover:bg-[#1a1a1a]"
          >
            <XCircle size={24} />
          </button>
        </div>
        <div className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-[#bff747] font-medium mb-3">Search</h3>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#bff747]" />
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-2.5 border border-[#bff747]/30 rounded-lg text-[#bff747] bg-[#0c0c0c] focus:outline-none focus:ring-2 focus:ring-[#bff747] focus:border-transparent"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-[#bff747] font-medium mb-3">Status</h3>
            <div className="space-y-2">
              <label className="flex items-center p-2 hover:bg-[#bff747]/10 rounded cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={selectedStatuses.includes('active')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // When selecting a new filter, clear previous selections
                      setSelectedStatuses(['active']);
                    } else {
                      setSelectedStatuses([]);
                    }
                  }}
                />
                <span className="text-[#bff747]">Active ({getCountByStatus('active')})</span>
              </label>
              
              <label className="flex items-center p-2 hover:bg-[#bff747]/10 rounded cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={selectedStatuses.includes('in_moderation')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // When selecting a new filter, clear previous selections
                      setSelectedStatuses(['in_moderation']);
                    } else {
                      setSelectedStatuses([]);
                    }
                  }}
                />
                <span className="text-[#bff747]">In Moderation ({getCountByStatus('in_moderation')})</span>
              </label>
              
              <label className="flex items-center p-2 hover:bg-[#bff747]/10 rounded cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={selectedStatuses.includes('paused')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // When selecting a new filter, clear previous selections
                      setSelectedStatuses(['paused']);
                    } else {
                      setSelectedStatuses([]);
                    }
                  }}
                />
                <span className="text-[#bff747]">On pause ({getCountByStatus('paused')})</span>
              </label>
              
              <label className="flex items-center p-2 hover:bg-[#bff747]/10 rounded cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={selectedStatuses.includes('rejected')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // When selecting a new filter, clear previous selections
                      setSelectedStatuses(['rejected']);
                    } else {
                      setSelectedStatuses([]);
                    }
                  }}
                />
                <span className="text-[#bff747]">Rejected ({getCountByStatus('rejected')})</span>
              </label>
              
              <label className="flex items-center p-2 hover:bg-[#bff747]/10 rounded cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={selectedStatuses.includes('draft')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // When selecting a new filter, clear previous selections
                      setSelectedStatuses(['draft']);
                    } else {
                      setSelectedStatuses([]);
                    }
                  }}
                />
                <span className="text-[#bff747]">Drafts ({getCountByStatus('draft')})</span>
              </label>
              
              <label className="flex items-center p-2 hover:bg-[#bff747]/10 rounded cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={selectedStatuses.includes('blocked')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // When selecting a new filter, clear previous selections
                      setSelectedStatuses(['blocked']);
                    } else {
                      setSelectedStatuses([]);
                    }
                  }}
                />
                <span className="text-[#bff747]">Blocked ({getCountByStatus('blocked')})</span>
              </label>
              
              <label className="flex items-center p-2 hover:bg-[#bff747]/10 rounded cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={selectedStatuses.includes('problem_sites')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // When selecting a new filter, clear previous selections
                      setSelectedStatuses(['problem_sites']);
                    } else {
                      setSelectedStatuses([]);
                    }
                  }}
                />
                <span className="text-[#bff747]">Problem Sites ({getCountByStatus('problem_sites')})</span>
              </label>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-[#bff747] font-medium mb-3">Sort By</h3>
            <div className="space-y-2">
              <button 
                className={`w-full text-left px-3 py-2 rounded ${sortBy === 'last_event' ? 'bg-[#bff747]/20 text-[#bff747]' : 'text-gray-400 hover:bg-[#bff747]/10'}`}
                onClick={() => setSortBy('last_event')}
              >
                by the last event
              </button>
              <button 
                className={`w-full text-left px-3 py-2 rounded ${sortBy === 'creation_date' ? 'bg-[#bff747]/20 text-[#bff747]' : 'text-gray-400 hover:bg-[#bff747]/10'}`}
                onClick={() => setSortBy('creation_date')}
              >
                by creation date
              </button>
              <button 
                className={`w-full text-left px-3 py-2 rounded ${sortBy === 'problem_sites' ? 'bg-[#bff747]/20 text-[#bff747]' : 'text-gray-400 hover:bg-[#bff747]/10'}`}
                onClick={() => setSortBy('problem_sites')}
              >
                problem sites <span className="bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs">3</span>
              </button>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-[#bff747]/30">
          <button 
            className="w-full bg-[#bff747] text-[#0c0c0c] px-4 py-2 rounded-lg hover:bg-[#bff747]/80 font-medium"
            onClick={() => setShowMobileFilters(false)}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );

  // Mobile website card component
  const MobileWebsiteCard = ({ website }) => (
    <div className={`rounded-lg shadow mb-4 p-4 ${getStatusColor(website.status, website.verificationStatus)}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="font-medium text-[#bff747] text-lg">{website.domain}</div>
        <div className="flex items-center space-x-2">
          <div className={`w-4 h-4 ${website.verificationStatus === 'verified' ? 'bg-[#bff747]' : 'bg-gray-600'} rounded-full flex items-center justify-center`}>
            <CheckCircle size={12} className={website.verificationStatus === 'verified' ? 'text-[#0c0c0c]' : 'text-gray-400'} />
          </div>
        </div>
      </div>
      
      <div className="mb-3">
        {getStatusBadge(website.status, website.verificationStatus)}
        {website.status === 'rejected' && website.reviewNotes && (
          <div className="text-xs text-red-400 bg-red-900/30 p-2 rounded border border-red-500/30 mt-2">
            Rejection reason: {website.reviewNotes}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-sm">
          <span className="text-gray-400">Category:</span> {website.category}
        </div>
        <div className="text-sm">
          <span className="text-gray-400">Language:</span> {website.mainLanguage}
        </div>
        <div className="text-sm">
          <span className="text-gray-400">Publishing:</span> ${website.publishingPrice}
        </div>
        <div className="text-sm">
          <span className="text-gray-400">Copywriting:</span> ${website.copywritingPrice}
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex text-yellow-400">{'★'.repeat(5)}</div>
        <span className="text-sm text-gray-400">20 Reviews</span>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm">
          <span className="text-gray-400">Earned:</span> $0.00
        </div>
        <div className="text-sm">
          <span className="text-gray-400">Orders:</span> 0
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {getActionButtons(website).map((action, idx) => (
          <button
            key={idx}
            className={`flex items-center px-3 py-2 rounded text-sm font-medium ${
              action.disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'cursor-pointer hover:opacity-90'
            }`}
            style={{ backgroundColor: action.bg.replace('bg-', '') }}
            onClick={() => {
              if (!action.action || action.disabled) return;
              
              switch (action.action) {
                case 'complete':
                  // Navigate to verification page for completing setup
                  navigate('/publisher/confirmOwnership', {
                    state: {
                      websiteUrl: website.domain,
                      websiteId: website._id,
                      existed: true
                    }
                  });
                  break;
                case 'resubmit':
                  // Navigate to verification page for reverification
                  navigate('/publisher/confirmOwnership', {
                    state: {
                      websiteUrl: website.domain,
                      websiteId: website._id,
                      existed: true
                    }
                  });
                  break;
                case 'view':
                  // Navigate to website details page
                  navigate('/publisher/website-details', {
                    state: {
                      website: website
                    }
                  });
                  break;
                case 'delete':
                  // Open delete confirmation modal
                  setWebsiteToDelete(website);
                  setShowDeleteModal(true);
                  break;
                case 'pause':
                  // Handle pause action
                  console.log('Pause website:', website._id);
                  break;
                default:
                  console.log('Unknown action:', action.action);
              }
            }}
            disabled={action.disabled}
          >
            {action.icon}
            <span className="ml-2">{action.text}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 bg-[#0c0c0c] min-h-screen">
      <style>{customStyles}</style>
      
      {/* Mobile filter panel */}
      <MobileFilterPanel />
      
      {/* Filter and Search Section - Responsive */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Mobile filter button */}
          <button 
            className="lg:hidden px-4 py-2 border rounded-lg flex items-center gap-2 bg-[#0c0c0c] border-[#bff747]/30 text-[#bff747] hover:bg-[#bff747]/10"
            onClick={() => setShowMobileFilters(true)}
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>
          
          {/* Desktop status filter */}
          <div className="hidden lg:relative lg:block" id="status-filter">
            <button 
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
                selectedStatuses.length > 0 
                  ? 'bg-[#bff747]/20 border-[#bff747] text-[#bff747]' 
                  : 'bg-[#0c0c0c] border-[#bff747]/30 text-[#bff747] hover:bg-[#bff747]/10'
              }`}
              onClick={() => setShowStatusFilter(!showStatusFilter)}
            >
              <Filter size={16} />
              <span>{selectedStatuses.length > 0 ? `${selectedStatuses.length} selected` : 'All statuses'}</span>
              <ChevronDown size={16} />
            </button>
            
            {showStatusFilter && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-[#0c0c0c] rounded-lg shadow-lg border border-[#bff747]/30 z-30">
                <div className="p-2 border-b border-[#bff747]/30">
                  <div className="relative">
                    <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#bff747]" />
                    <input 
                      type="text" 
                      className="w-full pl-8 pr-2 py-2 border border-[#bff747]/30 rounded-lg text-[#bff747] bg-[#0c0c0c] focus:outline-none focus:ring-2 focus:ring-[#bff747] focus:border-transparent"
                      placeholder="Search by name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="p-2 max-h-60 overflow-y-auto">
                  <label className="flex items-center p-2 hover:bg-[#bff747]/10 rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={selectedStatuses.includes('active')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // When selecting a new filter, clear previous selections
                          setSelectedStatuses(['active']);
                        } else {
                          setSelectedStatuses([]);
                        }
                      }}
                    />
                    <span className="text-[#bff747]">Active ({getCountByStatus('active')})</span>
                  </label>
                  
                  <label className="flex items-center p-2 hover:bg-[#bff747]/10 rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={selectedStatuses.includes('in_moderation')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // When selecting a new filter, clear previous selections
                          setSelectedStatuses(['in_moderation']);
                        } else {
                          setSelectedStatuses([]);
                        }
                      }}
                    />
                    <span className="text-[#bff747]">In Moderation ({getCountByStatus('in_moderation')})</span>
                  </label>
                  
                  <label className="flex items-center p-2 hover:bg-[#bff747]/10 rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={selectedStatuses.includes('paused')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // When selecting a new filter, clear previous selections
                          setSelectedStatuses(['paused']);
                        } else {
                          setSelectedStatuses([]);
                        }
                      }}
                    />
                    <span className="text-[#bff747]">On pause ({getCountByStatus('paused')})</span>
                  </label>
                  
                  <label className="flex items-center p-2 hover:bg-[#bff747]/10 rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={selectedStatuses.includes('rejected')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // When selecting a new filter, clear previous selections
                          setSelectedStatuses(['rejected']);
                        } else {
                          setSelectedStatuses([]);
                        }
                      }}
                    />
                    <span className="text-[#bff747]">Rejected ({getCountByStatus('rejected')})</span>
                  </label>
                  
                  <label className="flex items-center p-2 hover:bg-[#bff747]/10 rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={selectedStatuses.includes('draft')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // When selecting a new filter, clear previous selections
                          setSelectedStatuses(['draft']);
                        } else {
                          setSelectedStatuses([]);
                        }
                      }}
                    />
                    <span className="text-[#bff747]">Drafts ({getCountByStatus('draft')})</span>
                  </label>
                  
                  <label className="flex items-center p-2 hover:bg-[#bff747]/10 rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={selectedStatuses.includes('blocked')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // When selecting a new filter, clear previous selections
                          setSelectedStatuses(['blocked']);
                        } else {
                          setSelectedStatuses([]);
                        }
                      }}
                    />
                    <span className="text-[#bff747]">Blocked ({getCountByStatus('blocked')})</span>
                  </label>
                  
                  <label className="flex items-center p-2 hover:bg-[#bff747]/10 rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-2"
                      checked={selectedStatuses.includes('problem_sites')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // When selecting a new filter, clear previous selections
                          setSelectedStatuses(['problem_sites']);
                        } else {
                          setSelectedStatuses([]);
                        }
                      }}
                    />
                    <span className="text-[#bff747]">Problem Sites ({getCountByStatus('problem_sites')})</span>
                  </label>
                </div>
              </div>
            )}
          </div>
          
          {/* Sort Options - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <span className="text-[#bff747]">Sort:</span>
            <button 
              className={`px-3 py-1 rounded ${sortBy === 'last_event' ? 'text-[#bff747] font-medium' : 'text-gray-400'}`}
              onClick={() => setSortBy('last_event')}
            >
              by the last event
            </button>
            <button 
              className={`px-3 py-1 rounded ${sortBy === 'creation_date' ? 'text-[#bff747] font-medium' : 'text-gray-400'}`}
              onClick={() => setSortBy('creation_date')}
            >
              by creation date
            </button>
            <button 
              className={`px-3 py-1 rounded ${sortBy === 'problem_sites' ? 'text-[#bff747] font-medium' : 'text-gray-400'}`}
              onClick={() => setSortBy('problem_sites')}
            >
              problem sites <span className="bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs">3</span>
            </button>
          </div>
        </div>
        
        {/* Add Website Button */}
        <button 
          className="bg-[#bff747] text-[#0c0c0c] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#bff747]/80 font-medium whitespace-nowrap"
          onClick={() => window.location.href = '/publisher/addweb'}
        >
          <Plus size={16} className="hidden sm:block" />
          <span>Add a website</span>
        </button>
      </div>

      {/* Main Search Box - Responsive */}
      <div className="mb-6 lg:hidden">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#bff747]" />
          <input 
            type="text" 
            className="w-full pl-10 pr-4 py-2.5 border border-[#bff747]/30 rounded-lg text-[#bff747] bg-[#0c0c0c] focus:outline-none focus:ring-2 focus:ring-[#bff747] focus:border-transparent"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:bg-[#bff747] text-[#0c0c0c] rounded-lg mb-4">
        <div className="grid grid-cols-6 gap-4 px-6 py-4 text-sm font-medium">
          <div>Name</div>
          <div>Status & Details</div>
          <div>Pricing</div>
          <div>Verification</div>
          <div>Finances</div>
          <div>Actions</div>
        </div>
      </div>

      {/* Content - Responsive */}
      <div className="space-y-4">
        {/* Mobile view - card layout */}
        <div className="lg:hidden">
          {websites.map((website) => (
            <MobileWebsiteCard key={website._id} website={website} />
          ))}
        </div>
        
        {/* Desktop view - table layout */}
        <div className="hidden lg:block">
          {websites.map((website) => (
            <div 
              key={website._id} 
              className={`grid grid-cols-6 gap-4 px-6 py-6 rounded-lg shadow mb-4 ${getStatusColor(website.status, website.verificationStatus)}`}
            >
              {/* Name Column */}
              <div className="space-y-2">
                <div className="font-medium text-[#bff747]">{website.domain}</div>
                <div className="flex items-center space-x-2">
                  <div className="flex text-yellow-400">{'★'.repeat(5)}</div>
                  <span className="text-sm text-gray-400">20 Reviews</span>
                </div>
                <div className="flex items-center space-x-2 ">
                  <div className={`w-4 h-4 ${website.verificationStatus === 'verified' ? 'bg-[#bff747]' : 'bg-gray-600'} rounded-full flex items-center justify-center`}>
                    <CheckCircle size={12} className={website.verificationStatus === 'verified' ? 'text-[#0c0c0c]' : 'text-gray-400'} />
                  </div>
                  <span className="text-sm text-gray-400">{website.verificationStatus}</span>
                </div>
              </div>

              {/* Status & Details Column */}
              <div className="space-y-2">
                {getStatusBadge(website.status, website.verificationStatus)}
                {website.status === 'rejected' && website.reviewNotes && (
                  <div className="text-xs text-red-400 bg-red-900/30 p-2 rounded border border-red-500/30">
                    Rejection reason: {website.reviewNotes}
                  </div>
                )}
                <div className="text-sm text-gray-300">
                  <span className="font-medium">Category:</span> {website.category}
                </div>
                <div className="text-sm text-gray-300">
                  <span className="font-medium">Language:</span> {website.mainLanguage}
                </div>
              </div>

              {/* Pricing Column */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Publishing</span>
                  <span className="text-sm font-medium text-[#bff747]">${website.publishingPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Copywriting</span>
                  <span className="text-sm font-medium text-[#bff747]">${website.copywritingPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Link Type</span>
                  <span className="text-sm font-medium text-[#bff747]">{website.linkType}</span>
                </div>
              </div>

              {/* Verification Column */}
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    // Navigate to website details page
                    navigate('/publisher/website-details', {
                      state: {
                        website: website
                      }
                    });
                  }}
                  className="w-full text-left"
                >
                  <div className="text-[#bff747] font-medium hover:text-white cursor-pointer flex items-center">
                    View Details
                    <ExternalLink size={14} className="ml-1" />
                  </div>
                </button>
              </div>

              {/* Finances Column */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Earned</span>
                  <span className="text-sm font-medium text-[#bff747]">$0.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Expected</span>
                  <span className="text-sm font-medium text-gray-400">$0.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Orders</span>
                  <span className="text-sm font-medium text-[#bff747]">0</span>
                </div>
              </div>

              {/* Actions Column */}
              <div className="space-y-2">
                {getActionButtons(website).map((action, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center space-x-3 ${action.action && !action.disabled ? 'cursor-pointer' : ''}`}
                    onClick={() => {
                      if (!action.action || action.disabled) return;
                      
                      switch (action.action) {
                        case 'complete':
                          // Navigate to verification page for completing setup
                          navigate('/publisher/confirmOwnership', {
                            state: {
                              websiteUrl: website.domain,
                              websiteId: website._id,
                              existed: true
                            }
                          });
                          break;
                        case 'resubmit':
                          // Navigate to verification page for reverification
                          navigate('/publisher/confirmOwnership', {
                            state: {
                              websiteUrl: website.domain,
                              websiteId: website._id,
                              existed: true
                            }
                          });
                          break;
                        case 'view':
                          // Navigate to website details page
                          navigate('/publisher/website-details', {
                            state: {
                              website: website
                            }
                          });
                          break;
                        case 'delete':
                          // Open delete confirmation modal
                          setWebsiteToDelete(website);
                          setShowDeleteModal(true);
                          break;
                        case 'pause':
                          // Handle pause action
                          console.log('Pause website:', website._id);
                          break;
                        default:
                          console.log('Unknown action:', action.action);
                      }
                    }}
                  >
                    <div className={`${action.bg} text-[#0c0c0c] p-2 rounded flex items-center justify-center ${action.disabled ? 'opacity-50' : ''}`}>
                      {action.icon}
                    </div>
                    <span className={`text-sm font-medium ${
                      website.status === 'under-review' ? 'text-white' : 'text-gray-300'
                    } ${action.disabled ? 'opacity-50' : ''}`}>
                      {action.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {websites.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">You haven't added any websites yet.</p>
          <button 
            className="mt-4 bg-[#bff747] text-[#0c0c0c] px-4 py-2 rounded-lg hover:bg-[#bff747]/80 font-medium"
            onClick={() => window.location.href = '/publisher/addweb'}
          >
            Add Your First Website
          </button>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-end mt-6">
        <div className="flex space-x-1">
          {/* Previous Page Button */}
          <button 
            onClick={() => {
              if (currentPage > 1) {
                setCurrentPage(currentPage - 1);
              }
            }}
            disabled={currentPage === 1}
            className={`w-8 h-8 rounded text-sm font-medium flex items-center justify-center ${
              currentPage === 1 
                ? 'text-gray-600 cursor-not-allowed' 
                : 'text-[#bff747] hover:text-white bg-[#0c0c0c] border border-[#bff747]/30'
            }`}
          >
            ←
          </button>
          
          {totalPages <= 7 ? (
            // If 7 or fewer pages, show all pages
            Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => {
                  setCurrentPage(page);
                }}
                className={`w-8 h-8 rounded text-sm font-medium ${
                  page === currentPage 
                    ? 'bg-[#bff747] text-[#0c0c0c]' 
                    : 'bg-[#0c0c0c] text-[#bff747] border border-[#bff747]/30 hover:bg-[#bff747]/10'
                }`}
              >
                {page}
              </button>
            ))
          ) : (
            // If more than 7 pages, show first, current, and last pages with ellipsis
            <>
              {/* First page */}
              <button
                onClick={() => {
                  setCurrentPage(1);
                }}
                className={`w-8 h-8 rounded text-sm font-medium ${
                  currentPage === 1 
                    ? 'bg-[#bff747] text-[#0c0c0c]' 
                    : 'bg-[#0c0c0c] text-[#bff747] border border-[#bff747]/30 hover:bg-[#bff747]/10'
                }`}
              >
                1
              </button>
              
              {/* Ellipsis if current page is more than 3 */}
              {currentPage > 3 && (
                <span className="text-gray-400 px-2 flex items-center">...</span>
              )}
              
              {/* Pages around current page */}
              {Array.from({ length: 3 }, (_, i) => currentPage - 1 + i)
                .filter(page => page > 1 && page < totalPages)
                .map(page => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                    }}
                    className={`w-8 h-8 rounded text-sm font-medium ${
                      page === currentPage 
                        ? 'bg-[#bff747] text-[#0c0c0c]' 
                        : 'bg-[#0c0c0c] text-[#bff747] border border-[#bff747]/30 hover:bg-[#bff747]/10'
                    }`}
                  >
                    {page}
                  </button>
                ))
              }
              
              {/* Ellipsis if current page is less than totalPages - 2 */}
              {currentPage < totalPages - 2 && (
                <span className="text-gray-400 px-2 flex items-center">...</span>
              )}
              
              {/* Last page */}
              <button
                onClick={() => {
                  setCurrentPage(totalPages);
                }}
                className={`w-8 h-8 rounded text-sm font-medium ${
                  currentPage === totalPages 
                    ? 'bg-[#bff747] text-[#0c0c0c]' 
                    : 'bg-[#0c0c0c] text-[#bff747] border border-[#bff747]/30 hover:bg-[#bff747]/10'
                }`}
              >
                {totalPages}
              </button>
            </>
          )}
          
          {/* Next Page Button */}
          <button 
            onClick={() => {
              if (currentPage < totalPages) {
                setCurrentPage(currentPage + 1);
              }
            }}
            disabled={currentPage === totalPages}
            className={`w-8 h-8 rounded text-sm font-medium flex items-center justify-center ${
              currentPage === totalPages 
                ? 'text-gray-600 cursor-not-allowed' 
                : 'text-[#bff747] hover:text-white bg-[#0c0c0c] border border-[#bff747]/30'
            }`}
          >
            →
          </button>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/70">
          <div 
            className="bg-[#0c0c0c] border border-[#bff747]/30 rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all duration-300 animate-pop-in"
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-[#bff747]">Are you sure you want to remove the {websiteToDelete?.domain}?</h3>
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setWebsiteToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-200"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            <p className="text-gray-300 mb-4">Removal is irreversible. We recommend using the functions:</p>
            
            <div className="bg-[#0c0c0c] border border-[#bff747]/30 rounded-xl p-4 mb-4">
              <div className="flex items-start mb-3">
                <div className="text-xl mr-2 text-[#bff747]">❝</div>
                <div>
                  <p className="text-gray-300 font-medium mb-2">"Pause"— the {websiteToDelete?.domain} will be hidden from the catalog and inaccessible to advertisers, but you can activate it at any time without re-moderation. It is convenient to use at the time of vacation.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-xl mr-2 text-[#bff747]">🗃️</div>
                <div>
                  <p className="text-gray-300 font-medium">"Archive"— the channel will be transferred to the inactive status and moved down in the "My channels" section. It is convenient to use if you have decided for a long time not to take orders on the site.</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setWebsiteToDelete(null);
                }}
                className="px-6 py-2 rounded-full bg-[#0c0c0c] text-[#bff747] border border-[#bff747]/30 hover:bg-[#bff747]/10 font-medium"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteWebsite}
                className="px-6 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 font-medium"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Websites;