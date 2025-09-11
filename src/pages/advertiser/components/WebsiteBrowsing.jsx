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

const WebsiteBrowsing = () => {
  const navigate = useNavigate();
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
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    country: searchParams.get('country') || 'all',
    language: searchParams.get('language') || 'all',
    linkType: searchParams.get('linkType') || 'all',
    sortBy: searchParams.get('sortBy') || 'relevance'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  const websitesPerPage = 12;

  useEffect(() => {
    fetchWebsites();
    fetchFavorites();
  }, [currentPage, filters]);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: websitesPerPage,
        ...filters
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
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] && newFilters[key] !== 'all') {
        newSearchParams.set(key, newFilters[key]);
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

  const categories = ['all', ...filterOptions.categories];
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
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-3 py-2 border border-[#bff747]/30 rounded-md text-sm font-medium text-[#bff747] hover:bg-[#2a2a2a]"
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
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
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.minDA}
                  onChange={(e) => handleFilterChange('minDA', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.maxDA}
                  onChange={(e) => handleFilterChange('maxDA', e.target.value)}
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
            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-[#bff747]"
            >
              Clear All Filters
            </button>
            <div className="text-sm text-gray-400">
              {websites.length} websites found
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((website) => (
            <WebsiteCard
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
      ) : (
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
      )}

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

// Website Card Component
const WebsiteCard = ({ website, isFavorite, onToggleFavorite, onViewDetails, onPlaceOrder, qualityScore }) => {
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

  return (
    <div className="bg-[#1a1a1a] rounded-lg shadow-sm border border-[#bff747]/30 overflow-hidden hover:shadow-md transition-shadow">
      
      {/* Header */}
      <div className="p-4 border-b border-[#bff747]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GlobeAltIcon className="h-5 w-5 text-[#bff747]" />
            <h3 className="text-lg font-medium text-[#bff747] truncate">
              {website.domain}
            </h3>
          </div>
          <button
            onClick={onToggleFavorite}
            className="p-1 rounded-full hover:bg-[#2a2a2a]"
          >
            {isFavorite ? (
              <HeartSolidIcon className="h-5 w-5 text-red-400" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-300 line-clamp-2">
            {website.siteDescription}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-[#2a2a2a] rounded border border-[#bff747]/20">
            <ChartBarIcon className="h-4 w-4 text-[#bff747] mx-auto mb-1" />
            <p className="text-xs text-gray-400">DA</p>
            <p className="text-sm font-semibold text-[#bff747]">{website.metrics?.domainAuthority || website.metrics?.da || 'N/A'}</p>
          </div>
          <div className="text-center p-2 bg-[#2a2a2a] rounded border border-[#bff747]/20">
            <ClockIcon className="h-4 w-4 text-[#bff747] mx-auto mb-1" />
            <p className="text-xs text-gray-400">Response</p>
            <p className="text-sm font-semibold text-[#bff747]">{website.avgResponseTime || 48}h</p>
          </div>
          <div className="text-center p-2 bg-[#2a2a2a] rounded border border-[#bff747]/20">
            <StarIcon className="h-4 w-4 text-[#bff747] mx-auto mb-1" />
            <p className="text-xs text-gray-400">Quality</p>
            <p className={`text-sm font-semibold ${getScoreColor(qualityScore)}`}>
              {qualityScore}%
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Category:</span>
            <span className="text-xs font-medium capitalize text-[#bff747]">{website.category}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Country:</span>
            <span className="text-xs font-medium text-[#bff747]">{website.country}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Link Type:</span>
            <span className="text-xs font-medium capitalize text-[#bff747]">{website.linkType}</span>
          </div>
        </div>

        {/* Price */}
        <div className="pt-2 border-t border-[#bff747]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-[#bff747]">
                {formatPrice(website.publishingPrice)}
              </p>
              {website.copywritingPrice && (
                <p className="text-xs text-gray-400">
                  +{formatPrice(website.copywritingPrice)} writing
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onViewDetails}
                className="px-3 py-1 text-sm bg-[#2a2a2a] text-[#bff747] rounded hover:bg-[#3a3a3a] border border-[#bff747]/30"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
              <button
                onClick={onPlaceOrder}
                className="px-3 py-1 text-sm bg-[#bff747] text-[#0c0c0c] rounded hover:bg-[#a8e035]"
              >
                Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Website List Item Component
const WebsiteListItem = ({ website, isFavorite, onToggleFavorite, onViewDetails, onPlaceOrder, qualityScore }) => {
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

  return (
    <div className="p-6 hover:bg-[#2a2a2a]">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <GlobeAltIcon className="h-6 w-6 text-[#bff747]" />
            <div>
              <h3 className="text-lg font-medium text-[#bff747]">{website.domain}</h3>
              <p className="text-sm text-gray-300">{website.siteDescription}</p>
            </div>
          </div>
          
          <div className="mt-3 flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <ChartBarIcon className="h-4 w-4 text-[#bff747]" />
              <span className="text-sm text-gray-400">DA: {website.metrics?.domainAuthority || website.metrics?.da || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-4 w-4 text-[#bff747]" />
              <span className="text-sm text-gray-400">{website.avgResponseTime || 48}h response</span>
            </div>
            <div className="flex items-center space-x-1">
              <StarIcon className="h-4 w-4 text-[#bff747]" />
              <span className={`text-sm font-medium ${getScoreColor(qualityScore)}`}>
                {qualityScore}% quality
              </span>
            </div>
            <span className="text-sm text-gray-400 capitalize">{website.category}</span>
            <span className="text-sm text-gray-400">{website.country}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-lg font-bold text-[#bff747]">
              {formatPrice(website.publishingPrice)}
            </p>
            {website.copywritingPrice && (
              <p className="text-sm text-gray-400">
                +{formatPrice(website.copywritingPrice)} writing
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleFavorite}
              className="p-2 rounded-full hover:bg-[#2a2a2a]"
            >
              {isFavorite ? (
                <HeartSolidIcon className="h-5 w-5 text-red-400" />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
            <button
              onClick={onViewDetails}
              className="px-4 py-2 text-sm bg-[#2a2a2a] text-[#bff747] rounded hover:bg-[#3a3a3a] border border-[#bff747]/30"
            >
              View Details
            </button>
            <button
              onClick={onPlaceOrder}
              className="px-4 py-2 text-sm bg-[#bff747] text-[#0c0c0c] rounded hover:bg-[#a8e035]"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteBrowsing;