import React, { useState, useEffect } from 'react';
import {
  GlobeAltIcon,
  MagnifyingGlassIcon,
  StarIcon,
  ChartBarIcon,
  EyeIcon,
  ShoppingCartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { advertiserAPI } from '../../../services/api';
import { useCart } from '../../../contexts/CartContext';
import WebsiteList from './WebsiteList';
import WebsiteFilters from './WebsiteFilters';
import TableSettingsModal from './TableSettingsModal';

const WebsiteBrowsing = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter options from backend
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    countries: [],
    languages: []
  });
  
  // Filters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    minDA: searchParams.get('minDA') || '',
    maxDA: searchParams.get('maxDA') || '',
    minDR: searchParams.get('minDR') || '',
    maxDR: searchParams.get('maxDR') || '',
    minPA: searchParams.get('minPA') || '',
    maxPA: searchParams.get('maxPA') || '',
    minSS: searchParams.get('minSS') || '',
    maxSS: searchParams.get('maxSS') || '',
    minAS: searchParams.get('minAS') || '',
    maxAS: searchParams.get('maxAS') || '',
    minTF: searchParams.get('minTF') || '',
    maxTF: searchParams.get('maxTF') || '',
    minCF: searchParams.get('minCF') || '',
    maxCF: searchParams.get('maxCF') || '',
    minUR: searchParams.get('minUR') || '',
    maxUR: searchParams.get('maxUR') || '',
    minDomainAge: searchParams.get('minDomainAge') || '',
    maxDomainAge: searchParams.get('maxDomainAge') || '',
    minAhrefsTraffic: searchParams.get('minAhrefsTraffic') || '',
    maxAhrefsTraffic: searchParams.get('maxAhrefsTraffic') || '',
    minSemrushTraffic: searchParams.get('minSemrushTraffic') || '',
    maxSemrushTraffic: searchParams.get('maxSemrushTraffic') || '',
    minMonthlyTraffic: searchParams.get('minMonthlyTraffic') || '',
    maxMonthlyTraffic: searchParams.get('maxMonthlyTraffic') || '',
    minAhrefsKeywords: searchParams.get('minAhrefsKeywords') || '',
    maxAhrefsKeywords: searchParams.get('maxAhrefsKeywords') || '',
    minSemrushKeywords: searchParams.get('minSemrushKeywords') || '',
    maxSemrushKeywords: searchParams.get('maxSemrushKeywords') || '',
    minAhrefsReferringDomains: searchParams.get('minAhrefsReferringDomains') || '',
    maxAhrefsReferringDomains: searchParams.get('maxAhrefsReferringDomains') || '',
    minSemrushReferringDomains: searchParams.get('minSemrushReferringDomains') || '',
    maxSemrushReferringDomains: searchParams.get('maxSemrushReferringDomains') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    country: searchParams.get('country') || 'all',
    language: searchParams.get('language') || 'all',
    linkType: searchParams.get('linkType') || 'all',
    sortBy: searchParams.get('sortBy') || 'relevance'
  });

  // New state to track applied filters
  const [appliedFilters, setAppliedFilters] = useState({ ...filters });
  const [showFilters, setShowFilters] = useState(false);
  
  // Project selection state
  const [projects, setProjects] = useState([
    { id: 1, name: 'Tech Blog Project' },
    { id: 2, name: 'Marketing Campaign' },
    { id: 3, name: 'Product Review Site' }
  ]);
  const [selectedProject, setSelectedProject] = useState('');
  
  // Table settings state
  const [showTableSettings, setShowTableSettings] = useState(false);
  const [tableSettings, setTableSettings] = useState(() => {
    // Load saved settings from localStorage or use defaults
    const savedSettings = localStorage.getItem('advertiserTableSettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        // If parsing fails, use defaults
        return {
          domain: true,
          categories: true,
          country: true,
          language: true,
          price: true,
          da: true,
          dr: true,
          ahrefsTraffic: true,
          semrushTraffic: true,
          sensitiveCategories: true,
          linkType: true,
          actions: true
        };
      }
    }
    // Default settings
    return {
      domain: true,
      categories: true,
      country: true,
      language: true,
      price: true,
      da: true,
      dr: true,
      ahrefsTraffic: true,
      semrushTraffic: true,
      sensitiveCategories: true,
      linkType: true,
      actions: true
    };
  });

  const websitesPerPage = 12;

  useEffect(() => {
    fetchWebsites();
  }, [currentPage, appliedFilters]);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: websitesPerPage,
        ...appliedFilters
      };

      // Handle sortBy parameter specifically
      if (params.sortBy === 'price_asc') {
        params.sortBy = 'publishingPrice';
        params.sortOrder = 'asc';
      } else if (params.sortBy === 'price_desc') {
        params.sortBy = 'publishingPrice';
        params.sortOrder = 'desc';
      } else if (params.sortBy === 'metrics.domainAuthority') {
        params.sortOrder = 'desc';
      }

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === 'all' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      console.log('Sending browse websites request with params:', params);

      const response = await advertiserAPI.browseWebsites(params);
      console.log('Received browse websites response:', response);
      
      if (response.data) {
        // Fix: Use the correct response structure from backend
        setWebsites(response.data.data || []);
        // Fix: Use the correct pagination structure
        setTotalPages(response.data.pagination?.pages || 1);
        
        // Update filter options from backend response
        if (response.data.filters) {
          setFilterOptions({
            categories: response.data.filters.categories || [],
            countries: response.data.filters.countries || [],
            languages: response.data.filters.languages || []
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch websites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    // Add validation for SEO metrics
    if (key.startsWith('min') || key.startsWith('max')) {
      // Validate SEO metrics ranges (0-100)
      if (key.includes('DA') || key.includes('DR') || key.includes('PA') || 
          key.includes('SS') || key.includes('AS') || key.includes('TF') || 
          key.includes('CF') || key.includes('UR')) {
        if (value !== '') {
          const numValue = parseFloat(value);
          if (numValue < 0) value = '0';
          if (numValue > 100) value = '100';
        }
      }
      // Validate Domain Age specifically (0-100 years)
      else if (key.includes('DomainAge')) {
        if (value !== '') {
          const numValue = parseFloat(value);
          if (numValue < 0) value = '0';
          if (numValue > 100) value = '100';
        }
      }
      // Validate other traffic/keyword metrics (no specific range limit mentioned)
      else if (key.includes('Ahrefs') || key.includes('Semrush') ||
               key.includes('Monthly') || key.includes('Keywords') || 
               key.includes('Referring')) {
        if (value !== '') {
          const numValue = parseFloat(value);
          if (numValue < 0) value = '0';
        }
      }
    }
    
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // Note: We don't update appliedFilters here, only on search button click
  };

  // New function to apply filters
  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    setCurrentPage(1);
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all') {
        newSearchParams.set(key, filters[key]);
      }
    });
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      minDA: '',
      maxDA: '',
      minDR: '',
      maxDR: '',
      minPA: '',
      maxPA: '',
      minSS: '',
      maxSS: '',
      minAS: '',
      maxAS: '',
      minTF: '',
      maxTF: '',
      minCF: '',
      maxCF: '',
      minUR: '',
      maxUR: '',
      minDomainAge: '',
      maxDomainAge: '',
      minAhrefsTraffic: '',
      maxAhrefsTraffic: '',
      minSemrushTraffic: '',
      maxSemrushTraffic: '',
      minMonthlyTraffic: '',
      maxMonthlyTraffic: '',
      minAhrefsKeywords: '',
      maxAhrefsKeywords: '',
      minSemrushKeywords: '',
      maxSemrushKeywords: '',
      minAhrefsReferringDomains: '',
      maxAhrefsReferringDomains: '',
      minSemrushReferringDomains: '',
      maxSemrushReferringDomains: '',
      minPrice: '',
      maxPrice: '',
      country: 'all',
      language: 'all',
      linkType: 'all',
      sortBy: 'relevance'
    });
    setAppliedFilters({
      search: '',
      category: 'all',
      minDA: '',
      maxDA: '',
      minDR: '',
      maxDR: '',
      minPA: '',
      maxPA: '',
      minSS: '',
      maxSS: '',
      minAS: '',
      maxAS: '',
      minTF: '',
      maxTF: '',
      minCF: '',
      maxCF: '',
      minUR: '',
      maxUR: '',
      minDomainAge: '',
      maxDomainAge: '',
      minAhrefsTraffic: '',
      maxAhrefsTraffic: '',
      minSemrushTraffic: '',
      maxSemrushTraffic: '',
      minMonthlyTraffic: '',
      maxMonthlyTraffic: '',
      minAhrefsKeywords: '',
      maxAhrefsKeywords: '',
      minSemrushKeywords: '',
      maxSemrushKeywords: '',
      minAhrefsReferringDomains: '',
      maxAhrefsReferringDomains: '',
      minSemrushReferringDomains: '',
      maxSemrushReferringDomains: '',
      minPrice: '',
      maxPrice: '',
      country: 'all',
      language: 'all',
      linkType: 'all',
      sortBy: 'relevance'
    });
    setSearchParams({});
    setCurrentPage(1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getQualityScore = (website) => {
    const da = website.metrics?.domainAuthority || website.metrics?.da || 0;
    const traffic = website.metrics?.monthlyTraffic || 0;
    const responseTime = website.avgResponseTime || 48;
    
    let score = 0;
    if (da >= 50) score += 30;
    else if (da >= 30) score += 20;
    else if (da >= 20) score += 10;
    
    if (traffic >= 100000) score += 30;
    else if (traffic >= 50000) score += 20;
    else if (traffic >= 10000) score += 10;
    
    if (responseTime <= 24) score += 25;
    else if (responseTime <= 48) score += 15;
    else if (responseTime <= 72) score += 5;
    
    score += Math.min(15, website.completedOrders || 0);
    
    return Math.min(100, score);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Render 5-star rating component
  const renderRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              className={`h-3 w-3 ${
                star <= fullStars
                  ? 'text-[#bff747] fill-current'
                  : hasHalfStar && star === fullStars + 1
                  ? 'text-[#bff747]'
                  : 'text-gray-600'
              }`}
            />
          ))}
        </div>
        <span className="ml-1 text-xs text-gray-400">
          {rating ? rating.toFixed(1) : '0.0'}
        </span>
      </div>
    );
  };

  // Format large numbers with commas
  const formatNumber = (num) => {
    return num ? num.toLocaleString() : 'N/A';
  };

  const handleAddToCart = (website) => {
    // Create cart item object with proper fallbacks
    const cartItem = {
      id: website._id || Date.now().toString(),
      websiteId: website._id || Date.now().toString(),
      websiteName: website.domain || website.url || 'Unknown Website',
      websiteUrl: website.url || '#',
      advertisingRequirements: website.advertisingRequirements || 'Not specified',
      price: website.publishingPrice || 0,
      category: website.category || website.Category || "General",
      traffic: website.metrics?.ahrefsTraffic ? `${website.metrics.ahrefsTraffic.toLocaleString()}/month` : 'N/A',
      image: website.domain ? `https://logo.clearbit.com/${website.domain}` : 'https://placehold.co/100x100?text=No+Image'
    };
    
    // Add to cart
    addToCart(cartItem);
    
    // Show confirmation
    alert(`${cartItem.websiteName} added to cart!`);
  };

  // Handle table settings change
  const handleTableSettingsChange = (setting) => {
    return (e) => {
      // Prevent the event from bubbling up to the modal container
      e.stopPropagation();
      console.log('Changing setting:', setting);
      console.log('Current value:', tableSettings[setting]);
      setTableSettings(prev => {
        const newSettings = {
          ...prev,
          [setting]: !prev[setting]
        };
        console.log('New settings:', newSettings);
        return newSettings;
      });
    };
  };

  // Save table settings
  const saveTableSettings = () => {
    // In a real app, you would save these settings to localStorage or backend
    console.log('Saving table settings:', tableSettings);
    localStorage.setItem('advertiserTableSettings', JSON.stringify(tableSettings));
    setShowTableSettings(false);
  };

  // Reset to default settings
  const resetTableSettings = () => {
    const defaultSettings = {
      domain: true,
      categories: true,
      country: true,
      language: true,
      price: true,
      da: true,
      dr: true,
      ahrefsTraffic: true,
      semrushTraffic: true,
      sensitiveCategories: true,
      linkType: true,
      actions: true
    };
    setTableSettings(defaultSettings);
    console.log('Reset to default settings:', defaultSettings);
  };

  if (loading && websites.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bff747]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WebsiteFilters 
        filters={filters}
        filterOptions={filterOptions}
        handleFilterChange={handleFilterChange}
        applyFilters={applyFilters}
        clearFilters={clearFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        setShowTableSettings={setShowTableSettings}
        websites={websites}
        projects={projects}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
      />

      <TableSettingsModal 
        showTableSettings={showTableSettings}
        setShowTableSettings={setShowTableSettings}
        tableSettings={tableSettings}
        handleTableSettingsChange={handleTableSettingsChange}
        saveTableSettings={saveTableSettings}
        resetTableSettings={resetTableSettings}
      />

      <WebsiteList 
        websites={websites}
        tableSettings={tableSettings}
        formatPrice={formatPrice}
        formatNumber={formatNumber}
        renderRating={renderRating}
      />

      {/* Empty State */}
      {websites.length === 0 && !loading && (
        <div className="text-center py-12 bg-[#1a1a1a] rounded-lg border border-[#bff747]/30">
          <GlobeAltIcon className="mx-auto h-12 w-12 text-[#bff747]" />
          <h3 className="mt-2 text-sm font-medium text-[#bff747]">No websites found</h3>
          <p className="mt-1 text-sm text-gray-400">
            Try adjusting your search criteria or filters
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[#0c0c0c] bg-[#bff747] hover:bg-[#a8e035]"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-[#1a1a1a] px-4 py-3 flex items-center justify-between border border-[#bff747]/30 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-[#bff747]/30 text-sm font-medium rounded-md text-[#bff747] bg-[#0c0c0c] hover:bg-[#2a2a2a] disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-[#bff747]/30 text-sm font-medium rounded-md text-[#bff747] bg-[#0c0c0c] hover:bg-[#2a2a2a] disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-400">
                Showing page <span className="font-medium text-[#bff747]">{currentPage}</span> of{' '}
                <span className="font-medium text-[#bff747]">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#bff747]/30 bg-[#0c0c0c] text-sm font-medium text-[#bff747] hover:bg-[#2a2a2a] disabled:opacity-50"
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
                          ? 'z-10 bg-[#bff747]/20 border-[#bff747] text-[#bff747]'
                          : 'bg-[#0c0c0c] border-[#bff747]/30 text-[#bff747] hover:bg-[#2a2a2a]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#bff747]/30 bg-[#0c0c0c] text-sm font-medium text-[#bff747] hover:bg-[#2a2a2a] disabled:opacity-50"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteBrowsing;