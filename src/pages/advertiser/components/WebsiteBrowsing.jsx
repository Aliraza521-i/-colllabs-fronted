import React, { useState, useEffect } from 'react';
import {
  GlobeAltIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  HeartIcon,
  StarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MapPinIcon,
  LanguageIcon,
  LinkIcon,
  EyeIcon,
  ShoppingCartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { advertiserAPI } from '../../../services/api';
import { useCart } from '../../../contexts/CartContext';

const WebsiteBrowsing = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState([]);
  
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
  // Removed viewMode state since we're only using list view

  const websitesPerPage = 12;

  useEffect(() => {
    fetchWebsites();
    fetchFavorites();
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

  const fetchFavorites = async () => {
    try {
      const response = await advertiserAPI.getFavorites();
      if (response.data) {
        // Fix: Use the correct response structure from backend
        setFavorites(response.data.favorites?.map(f => f._id) || []);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
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

  const toggleFavorite = async (websiteId) => {
    try {
      if (favorites.includes(websiteId)) {
        await advertiserAPI.removeFromFavorites(websiteId);
        setFavorites(prev => prev.filter(id => id !== websiteId));
      } else {
        await advertiserAPI.addToFavorites(websiteId);
        setFavorites(prev => [...prev, websiteId]);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
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

  // Process categories to handle comma-separated values
  const processedCategories = filterOptions.categories.reduce((acc, category) => {
    if (category && category.includes(',')) {
      // Split comma-separated categories
      const splitCategories = category.split(',').map(cat => cat.trim());
      return [...acc, ...splitCategories];
    }
    return [...acc, category];
  }, []).filter(Boolean);
  
  // Remove duplicates
  const uniqueCategories = [...new Set(processedCategories)];
  
  const categories = ['all', ...uniqueCategories.sort()];
  const countries = ['all', ...filterOptions.countries];
  const languages = ['all', ...filterOptions.languages];

  if (loading && websites.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bff747]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#bff747]">Browse Websites</h1>
          <p className="text-gray-400">Find the perfect websites for your guest posts</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Removed view mode toggle button since we only use list view */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-[#bff747] text-[#0c0c0c] rounded-md hover:bg-[#a8e035]"
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#1a1a1a] rounded-lg shadow p-6 border border-[#bff747]/30">
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by niche, keywords, domain..."
                className="pl-10 pr-4 py-2 w-full border border-[#bff747]/30 rounded-md focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-[#bff747] text-[#0c0c0c] rounded-md hover:bg-[#a8e035] font-medium"
            >
              Search
            </button>
            <div className="w-48">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747]"
              >
                <option value="relevance" className="bg-[#0c0c0c]">Most Relevant</option>
                <option value="metrics.domainAuthority" className="bg-[#0c0c0c]">Highest DA</option>
                <option value="price_asc" className="bg-[#0c0c0c]">Lowest Price</option>
                <option value="price_desc" className="bg-[#0c0c0c]">Highest Price</option>
                <option value="response_time" className="bg-[#0c0c0c]">Fastest Response</option>
                <option value="rating" className="bg-[#0c0c0c]">Best Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-[#1a1a1a] rounded-lg shadow p-6 border border-[#bff747]/30">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747]"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-[#0c0c0c]">
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* DA Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Domain Authority</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.minDA}
                  onChange={(e) => handleFilterChange('minDA', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.maxDA}
                  onChange={(e) => handleFilterChange('maxDA', e.target.value)}
                />
              </div>
            </div>

            {/* DR Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Domain Rating</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.minDR}
                  onChange={(e) => handleFilterChange('minDR', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.maxDR}
                  onChange={(e) => handleFilterChange('maxDR', e.target.value)}
                />
              </div>
            </div>

            {/* PA Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Page Authority</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.minPA}
                  onChange={(e) => handleFilterChange('minPA', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.maxPA}
                  onChange={(e) => handleFilterChange('maxPA', e.target.value)}
                />
              </div>
            </div>

            {/* SS Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Spam Score</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.minSS}
                  onChange={(e) => handleFilterChange('minSS', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.maxSS}
                  onChange={(e) => handleFilterChange('maxSS', e.target.value)}
                />
              </div>
            </div>

            {/* AS Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Alexa Score</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.minAS}
                  onChange={(e) => handleFilterChange('minAS', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.maxAS}
                  onChange={(e) => handleFilterChange('maxAS', e.target.value)}
                />
              </div>
            </div>

            {/* TF Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Trust Flow</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.minTF}
                  onChange={(e) => handleFilterChange('minTF', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.maxTF}
                  onChange={(e) => handleFilterChange('maxTF', e.target.value)}
                />
              </div>
            </div>

            {/* CF Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Citation Flow</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.minCF}
                  onChange={(e) => handleFilterChange('minCF', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.maxCF}
                  onChange={(e) => handleFilterChange('maxCF', e.target.value)}
                />
              </div>
            </div>

            {/* UR Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">URL Rating</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.minUR}
                  onChange={(e) => handleFilterChange('minUR', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.maxUR}
                  onChange={(e) => handleFilterChange('maxUR', e.target.value)}
                />
              </div>
            </div>

            {/* Domain Age Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Domain Age</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.minDomainAge}
                  onChange={(e) => handleFilterChange('minDomainAge', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.maxDomainAge}
                  onChange={(e) => handleFilterChange('maxDomainAge', e.target.value)}
                />
              </div>
            </div>

            {/* Ahrefs Traffic Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Ahrefs Traffic</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.minAhrefsTraffic}
                  onChange={(e) => handleFilterChange('minAhrefsTraffic', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.maxAhrefsTraffic}
                  onChange={(e) => handleFilterChange('maxAhrefsTraffic', e.target.value)}
                />
              </div>
            </div>

            {/* Semrush Traffic Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Semrush Traffic</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.minSemrushTraffic}
                  onChange={(e) => handleFilterChange('minSemrushTraffic', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.maxSemrushTraffic}
                  onChange={(e) => handleFilterChange('maxSemrushTraffic', e.target.value)}
                />
              </div>
            </div>

            {/* Monthly Traffic Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Monthly Traffic</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.minMonthlyTraffic}
                  onChange={(e) => handleFilterChange('minMonthlyTraffic', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.maxMonthlyTraffic}
                  onChange={(e) => handleFilterChange('maxMonthlyTraffic', e.target.value)}
                />
              </div>
            </div>

            {/* Ahrefs Keywords Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Ahrefs Keywords</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.minAhrefsKeywords}
                  onChange={(e) => handleFilterChange('minAhrefsKeywords', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.maxAhrefsKeywords}
                  onChange={(e) => handleFilterChange('maxAhrefsKeywords', e.target.value)}
                />
              </div>
            </div>

            {/* Semrush Keywords Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Semrush Keywords</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.minSemrushKeywords}
                  onChange={(e) => handleFilterChange('minSemrushKeywords', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.maxSemrushKeywords}
                  onChange={(e) => handleFilterChange('maxSemrushKeywords', e.target.value)}
                />
              </div>
            </div>

            {/* Ahrefs Referring Domains Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Ahrefs Referring Domains</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.minAhrefsReferringDomains}
                  onChange={(e) => handleFilterChange('minAhrefsReferringDomains', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.maxAhrefsReferringDomains}
                  onChange={(e) => handleFilterChange('maxAhrefsReferringDomains', e.target.value)}
                />
              </div>
            </div>

            {/* Semrush Referring Domains Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Semrush Referring Domains</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.minSemrushReferringDomains}
                  onChange={(e) => handleFilterChange('minSemrushReferringDomains', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.maxSemrushReferringDomains}
                  onChange={(e) => handleFilterChange('maxSemrushReferringDomains', e.target.value)}
                />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Price Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min $"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max $"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
              <select
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747]"
              >
                {countries.map(country => (
                  <option key={country} value={country} className="bg-[#0c0c0c]">
                    {country === 'all' ? 'All Countries' : country}
                  </option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Language</label>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747]"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang} className="bg-[#0c0c0c]">
                    {lang === 'all' ? 'All Languages' : lang}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Link Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Link Type</label>
              <select
                value={filters.linkType}
                onChange={(e) => handleFilterChange('linkType', e.target.value)}
                className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747]"
              >
                <option value="all" className="bg-[#0c0c0c]">All Types</option>
                <option value="dofollow" className="bg-[#0c0c0c]">Do-follow</option>
                <option value="nofollow" className="bg-[#0c0c0c]">No-follow</option>
                <option value="both" className="bg-[#0c0c0c]">Both</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-2">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-400 hover:text-[#bff747]"
              >
                Clear All Filters
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-1 bg-[#bff747] text-[#0c0c0c] rounded-md hover:bg-[#a8e035] text-sm font-medium"
              >
                Apply Filters
              </button>
            </div>
            <div className="text-sm text-gray-400">
              {websites.length} websites found
            </div>
          </div>
        </div>
      )}

      {/* Results - Only showing list view */}
      <div className="bg-[#1a1a1a] rounded-lg shadow overflow-hidden border border-[#bff747]/30">
        <div className="divide-y divide-[#bff747]/30">
          {websites.map((website) => (
            <WebsiteListItem
              key={website._id}
              website={website}
              isFavorite={favorites.includes(website._id)}
              onToggleFavorite={() => toggleFavorite(website._id)}
              onViewDetails={() => navigate(`/advertiser/browse/${website._id}`)}
              onPlaceOrder={() => navigate(`/advertiser/order/${website._id}`)}
              qualityScore={getQualityScore(website)}
            />
          ))}
        </div>
      </div>

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


// Website List Item Component
const WebsiteListItem = ({ website, isFavorite, onToggleFavorite, onViewDetails, onPlaceOrder, qualityScore }) => {
  const { addToCart } = useCart();
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
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
              className={`h-4 w-4 ${
                star <= fullStars
                  ? 'text-[#bff747] fill-current'
                  : hasHalfStar && star === fullStars + 1
                  ? 'text-[#bff747]'
                  : 'text-gray-600'
              }`}
            />
          ))}
        </div>
        <span className="ml-1 text-sm text-gray-400">
          {rating ? rating.toFixed(1) : '0.0'}
        </span>
      </div>
    );
  };

  // Format large numbers with commas
  const formatNumber = (num) => {
    return num ? num.toLocaleString() : 'N/A';
  };

  const handleAddToCart = () => {
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

  return (
    <div className="p-4 hover:bg-[#252525] border-b border-[#bff747]/10 last:border-b-0 transition-all">
      <div className="flex items-start justify-between">
        {/* Left Side - Website Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-[#bff747]/20 to-[#bff747]/5 p-3 rounded-lg flex-shrink-0">
              <GlobeAltIcon className="h-6 w-6 text-[#bff747]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center flex-wrap">
                <h3 className="text-lg font-bold text-[#bff747]">{website.domain || website.url || 'Unknown Website'}</h3>
                <span className="ml-2 text-xs text-gray-400">{website.url || ''}</span>
              </div>

              {/* Added category display below URL - With label and proper splitting */}
              <div className="mt-2">
                <span className="text-xs font-medium text-gray-300 mr-2">Categories:</span>
                <div className="flex flex-wrap gap-1">
                  {(() => {
                    // Handle different category formats
                    let categories = [];
                    if (website.allCategories && website.allCategories.length > 0) {
                      categories = website.allCategories;
                    } else if (website.category) {
                      // Split comma-separated categories
                      categories = website.category.includes(',') 
                        ? website.category.split(',').map(cat => cat.trim())
                        : [website.category];
                    } else {
                      categories = ["General"];
                    }
                    
                    return categories.map((cat, index) => (
                      <span 
                        key={index} 
                        className="text-xs bg-[#bff747]/20 text-[#bff747] px-2 py-0.5 rounded-full capitalize"
                      >
                        {cat}
                      </span>
                    ));
                  })()}
                </div>
              </div>
              
              {/* Language and Country Information */}
              <div className="flex flex-wrap gap-3 mt-2">
                {/* Language Display */}
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-300 mr-1">Language:</span>
                  {(website.mainLanguage || website.language || website.Language || website.lang || (website.metrics && website.metrics.language) || (website.metrics && website.metrics.Language)) ? (
                    <span className="text-xs bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded-full border border-blue-700/50">
                      {website.mainLanguage || website.language || website.Language || website.lang || (website.metrics && website.metrics.language) || (website.metrics && website.metrics.Language)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">Not specified</span>
                  )}
                </div>
                
                {/* Country Display */}
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-300 mr-1">Country:</span>
                  {(website.country || website.Country || website.cntry || (website.metrics && website.metrics.country) || (website.metrics && website.metrics.Country)) ? (
                    <span className="text-xs bg-green-900/40 text-green-300 px-2 py-0.5 rounded-full border border-green-700/50">
                      {website.country || website.Country || website.cntry || (website.metrics && website.metrics.country) || (website.metrics && website.metrics.Country)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">Not specified</span>
                  )}
                </div>
              </div>
              
              {/* Reorganized website details in requested order */}
              {website.acceptedSensitiveCategories && website.acceptedSensitiveCategories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  <span className="text-xs font-medium text-gray-300 mr-2">Sensitive Categories:</span>
                  <div className="flex flex-wrap gap-1">
                    {website.acceptedSensitiveCategories.slice(0, 3).map((category, index) => (
                      <span 
                        key={index} 
                        className="text-xs bg-gradient-to-r from-red-900/40 to-red-800/40 text-red-300 px-2 py-0.5 rounded-full border border-red-700/50"
                      >
                        {category.replace(/_/g, ' ') || category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Rating and Orders */}
              <div className="flex items-center mt-3 text-xs text-gray-400">
                <div className="flex items-center">
                  {renderRating(website.stats?.rating)}
                  <span className="mx-2 text-gray-600">•</span>
                  <div className="flex items-center">
                    <ShoppingCartIcon className="h-3 w-3 mr-1" />
                    <span>{website.stats?.completedOrders || 0} orders</span>
                  </div>
                </div>
              </div>
              
              {/* SEO Metrics Grid - Compact version */}
              <div className="mt-3 grid grid-cols-4 gap-1">
                {/* DA Metric */}
                <div className="text-center p-1.5 bg-[#252525] rounded border border-[#bff747]/10 hover:border-[#bff747]/30 transition-all">
                  <div className="flex justify-center">
                    <ChartBarIcon className="h-3 w-3 text-[#bff747]" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">DA</p>
                  <p className="text-xs font-bold text-[#bff747] mt-0.5">
                    {website.metrics?.domainAuthority || website.metrics?.da || 'N/A'}
                  </p>
                </div>
                
                {/* DR Metric */}
                <div className="text-center p-1.5 bg-[#252525] rounded border border-[#bff747]/10 hover:border-[#bff747]/30 transition-all">
                  <div className="flex justify-center">
                    <ChartBarIcon className="h-3 w-3 text-[#bff747]" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">DR</p>
                  <p className="text-xs font-bold text-[#bff747] mt-0.5">
                    {website.metrics?.dr || 'N/A'}
                  </p>
                </div>
                
                {/* Ahrefs Traffic */}
                <div className="text-center p-1.5 bg-[#252525] rounded border border-[#bff747]/10 hover:border-[#bff747]/30 transition-all">
                  <div className="flex justify-center">
                    <GlobeAltIcon className="h-3 w-3 text-[#bff747]" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Ahrefs</p>
                  <p className="text-xs font-bold text-[#bff747] mt-0.5">
                    {formatNumber(website.metrics?.ahrefsTraffic)}
                  </p>
                </div>
                
                {/* SEMrush Traffic */}
                <div className="text-center p-1.5 bg-[#252525] rounded border border-[#bff747]/10 hover:border-[#bff747]/30 transition-all">
                  <div className="flex justify-center">
                    <GlobeAltIcon className="h-3 w-3 text-[#bff747]" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">SEMrush</p>
                  <p className="text-xs font-bold text-[#bff747] mt-0.5">
                    {formatNumber(website.metrics?.semrushTraffic)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Actions and Price */}
        <div className="flex flex-col items-end space-y-3 ml-4 w-56 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleFavorite}
              className="p-1 rounded-full hover:bg-[#3a3a3a] transition-colors"
            >
              {isFavorite ? (
                <HeartSolidIcon className="h-4 w-4 text-red-500" />
              ) : (
                <HeartIcon className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          
          <div className="text-right w-full">
            <p className="text-xl font-bold text-[#bff747]">
              {formatPrice(website.publishingPrice || 0)}
            </p>
            {website.copywritingPrice > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                +{formatPrice(website.copywritingPrice)} for writing
              </p>
            )}
            {website.sensitiveContentExtraCharge > 0 && (
              <p className="text-xs text-red-400 mt-1">
                +{formatPrice(website.sensitiveContentExtraCharge)} for sensitive content
              </p>
            )}
          </div>
          
          <div className="flex flex-col space-y-1 w-full">
            <button
              onClick={onViewDetails}
              className="px-3 py-1.5 text-xs bg-[#2a2a2a] text-[#bff747] rounded-md hover:bg-[#3a3a3a] border border-[#bff747]/30 transition-all flex items-center justify-center font-medium"
            >
              <EyeIcon className="h-3 w-3 mr-1" />
              <span>View Details</span>
            </button>
            <button
              onClick={handleAddToCart}
              className="px-3 py-1.5 text-xs bg-[#1a1a1a] text-[#bff747] rounded-md hover:bg-[#2a2a2a] border border-[#bff747]/30 transition-all flex items-center justify-center font-medium"
            >
              <ShoppingCartIcon className="h-3 w-3 mr-1" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteBrowsing;

