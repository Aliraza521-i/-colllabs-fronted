import React from 'react';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  CogIcon,
  XMarkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

// Add custom animations
const style = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.3s ease-out forwards;
  }
`;

const WebsiteFilters = ({ 
  filters, 
  filterOptions,
  handleFilterChange, 
  applyFilters, 
  clearFilters, 
  showFilters, 
  setShowFilters,
  setShowTableSettings,
  websites,
  projects,
  selectedProject,
  setSelectedProject
}) => {
  // Inject custom styles
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = style;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
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

  // Group filters into sections for better organization
  const seoFilters = [
    { id: 'da', label: 'Domain Authority (0-100)', minKey: 'minDA', maxKey: 'maxDA' },
    { id: 'dr', label: 'Domain Rating (0-100)', minKey: 'minDR', maxKey: 'maxDR' },
    { id: 'pa', label: 'Page Authority (0-100)', minKey: 'minPA', maxKey: 'maxPA' },
    { id: 'ss', label: 'Spam Score (0-17)', minKey: 'minSS', maxKey: 'maxSS' },
    { id: 'domainAge', label: 'Domain Age (Years)', minKey: 'minDomainAge', maxKey: 'maxDomainAge' },
    { id: 'ahrefsTraffic', label: 'Ahrefs Traffic', minKey: 'minAhrefsTraffic', maxKey: 'maxAhrefsTraffic' },
    { id: 'ahrefsKeywords', label: 'Ahrefs Keywords', minKey: 'minAhrefsKeywords', maxKey: 'maxAhrefsKeywords' },
    { id: 'ahrefsReferring', label: 'Ahrefs Referring Domains', minKey: 'minAhrefsReferringDomains', maxKey: 'maxAhrefsReferringDomains' },
  ];

  const trafficFilters = [
    { id: 'semrushTraffic', label: 'SEMrush Traffic', minKey: 'minSemrushTraffic', maxKey: 'maxSemrushTraffic' },
    { id: 'semrushKeywords', label: 'SEMrush Keywords', minKey: 'minSemrushKeywords', maxKey: 'maxSemrushKeywords' },
    { id: 'semrushReferring', label: 'SEMrush Referring Domains', minKey: 'minSemrushReferringDomains', maxKey: 'maxSemrushReferringDomains' },
  ];

  const authorityFilters = [
    { id: 'tf', label: 'Trust Flow (0-100)', minKey: 'minTF', maxKey: 'maxTF' },
    { id: 'cf', label: 'Citation Flow (0-100)', minKey: 'minCF', maxKey: 'maxCF' },
    { id: 'ur', label: 'URL Rating (0-100)', minKey: 'minUR', maxKey: 'maxUR' },
  ];

  // Add validation for numeric inputs
  const handleNumericChange = (key, value) => {
    // Allow only numbers and empty values
    if (value === '' || /^[0-9]*$/.test(value)) {
      handleFilterChange(key, value);
    }
  };

  // Handle click outside to close modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowFilters(false);
    }
  };

  // Prevent event propagation
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  if (!showFilters) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg shadow p-6 border border-[#bff747]/30">
        {/* Header Section - Search, Project Selector, and Controls */}
        <div className="space-y-4">
          {/* First Row - Search and Project Selector */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Bar - Takes full width on mobile, expands on larger screens */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by niche, keywords, domain..."
                  className="pl-10 pr-4 py-2 w-full border border-[#bff747]/30 rounded-md focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                />
              </div>
            </div>
            
            {/* Project Selector */}
            <div className="flex items-center space-x-3 min-w-[200px]">
              <span className="text-gray-300 whitespace-nowrap">Project:</span>
              <div className="relative flex-1">
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] appearance-none pr-8"
                >
                  <option value="" className="bg-[#0c0c0c]">Select a project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id} className="bg-[#0c0c0c]">
                      {project.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#bff747]" />
              </div>
            </div>
          </div>
          
          {/* Second Row - Filters, Sort, and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
            {/* Left Side - Filter Button */}
            <div className="flex">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center px-4 py-2 bg-[#bff747] text-[#0c0c0c] rounded-md hover:bg-[#a8e035] whitespace-nowrap transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-[#bff747]/30"
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
            
            {/* Right Side - Sort, Table Settings, and Apply Button */}
            <div className="flex items-center space-x-3">
              {/* Table Settings Button */}
              <button
                onClick={() => setShowTableSettings(true)}
                className="p-2 bg-[#2a2a2a] border border-[#bff747]/30 rounded-md hover:bg-[#3a3a3a] text-[#bff747] transition-colors duration-200"
                title="Table Settings"
              >
                <CogIcon className="h-5 w-5" />
              </button>
              
              {/* Sort Dropdown */}
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
              
              {/* Apply Button */}
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-[#bff747] text-[#0c0c0c] rounded-md hover:bg-[#a8e035] font-medium whitespace-nowrap transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-[#bff747]/30"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] rounded-lg shadow p-6 border border-[#bff747]/30">
      {/* Header Section - Search, Project Selector, and Controls */}
      <div className="space-y-4">
        {/* First Row - Search and Project Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Bar - Takes full width on mobile, expands on larger screens */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by niche, keywords, domain..."
                className="pl-10 pr-4 py-2 w-full border border-[#bff747]/30 rounded-md focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
          </div>
          
          {/* Project Selector */}
          <div className="flex items-center space-x-3 min-w-[200px]">
            <span className="text-gray-300 whitespace-nowrap">Project:</span>
            <div className="relative flex-1">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] appearance-none pr-8"
              >
                <option value="" className="bg-[#0c0c0c]">Select a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id} className="bg-[#0c0c0c]">
                    {project.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#bff747]" />
            </div>
          </div>
        </div>
        
        {/* Second Row - Filters, Sort, and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          {/* Left Side - Filter Button */}
          <div className="flex">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center px-4 py-2 bg-[#bff747] text-[#0c0c0c] rounded-md hover:bg-[#a8e035] whitespace-nowrap transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-[#bff747]/30"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
          
          {/* Right Side - Sort, Table Settings, and Apply Button */}
          <div className="flex items-center space-x-3">
            {/* Table Settings Button */}
            <button
              onClick={() => setShowTableSettings(true)}
              className="p-2 bg-[#2a2a2a] border border-[#bff747]/30 rounded-md hover:bg-[#3a3a3a] text-[#bff747] transition-colors duration-200"
              title="Table Settings"
            >
              <CogIcon className="h-5 w-5" />
            </button>
            
            {/* Sort Dropdown */}
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
            
            {/* Apply Button */}
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-[#bff747] text-[#0c0c0c] rounded-md hover:bg-[#a8e035] font-medium whitespace-nowrap transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-[#bff747]/30"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters - Unique Popup Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay with gradient */}
          <div 
            className="fixed inset-0 bg-black/70 transition-opacity"
            aria-hidden="true"
            onClick={handleOverlayClick}
          ></div>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          {/* Unique Modal panel with enhanced styling */}
          <div 
            className="inline-block align-bottom bg-gradient-to-br from-[#1a1a1a] to-[#0c0c0c] rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full border border-[#bff747]/30 relative animate-fade-in-up"
            onClick={handleModalClick}
          >
            {/* Decorative corner elements */}
            <div className="absolute top-0 left-0 w-24 h-24">
              <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-[#bff747]/30 rounded-tl-2xl"></div>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24">
              <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-[#bff747]/30 rounded-tr-2xl"></div>
            </div>
            <div className="absolute bottom-0 left-0 w-24 h-24">
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-[#bff747]/30 rounded-bl-2xl"></div>
            </div>
            <div className="absolute bottom-0 right-0 w-24 h-24">
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-[#bff747]/30 rounded-br-2xl"></div>
            </div>
            {/* Enhanced header with decorative elements */}
            <div className="px-6 py-5 border-b border-[#bff747]/20 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#bff747]/20 to-[#bff747]/5">
                    <FunnelIcon className="h-7 w-7 text-[#bff747]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#bff747] tracking-tight">
                      Advanced Filters
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">Refine your website search with precision</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-gray-400 hover:text-[#bff747] focus:outline-none bg-[#2a2a2a]/50 hover:bg-[#2a2a2a] rounded-full p-3 transition-all duration-200 backdrop-blur-sm"
                  onClick={() => setShowFilters(false)}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Progress indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2a2a2a]">
                <div className="h-full bg-gradient-to-r from-[#bff747] to-[#a8e035] w-1/3"></div>
              </div>
            </div>
            
            {/* Scrollable content area */}
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#bff747]/30 scrollbar-track-[#1a1a1a] scrollbar-thumb-rounded-full">
              <div className="flex flex-col gap-6">
                {/* Category Filter - Enhanced Card */}
                <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] p-6 rounded-2xl border border-[#bff747]/20 shadow-lg hover:border-[#bff747]/40 transition-all duration-300 hover:shadow-[#bff747]/10 hover:shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#bff747]/50 to-[#bff747]/10"></div>
                  <div className="flex items-center space-x-3 mb-5">
                    <div className="w-3 h-3 rounded-full bg-[#bff747] animate-pulse"></div>
                    <h4 className="text-xl font-bold text-[#bff747]">Basic Information</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                      <div className="relative">
                        <select
                          value={filters.category}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          className="w-full border border-[#bff747]/30 rounded-xl px-4 py-3 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] appearance-none pr-10 transition-all duration-200 hover:border-[#bff747]/50 focus:ring-2 focus:ring-[#bff747]/30"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat} className="bg-[#0c0c0c]">
                              {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <ChevronDownIcon className="h-5 w-5 text-[#bff747]" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                      <div className="relative">
                        <select
                          value={filters.country}
                          onChange={(e) => handleFilterChange('country', e.target.value)}
                          className="w-full border border-[#bff747]/30 rounded-xl px-4 py-3 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] appearance-none pr-10 transition-all duration-200 hover:border-[#bff747]/50 focus:ring-2 focus:ring-[#bff747]/30"
                        >
                          {countries.map(country => (
                            <option key={country} value={country} className="bg-[#0c0c0c]">
                              {country === 'all' ? 'All Countries' : country}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <ChevronDownIcon className="h-5 w-5 text-[#bff747]" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                      <div className="relative">
                        <select
                          value={filters.language}
                          onChange={(e) => handleFilterChange('language', e.target.value)}
                          className="w-full border border-[#bff747]/30 rounded-xl px-4 py-3 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] appearance-none pr-10 transition-all duration-200 hover:border-[#bff747]/50 focus:ring-2 focus:ring-[#bff747]/30"
                        >
                          {languages.map(lang => (
                            <option key={lang} value={lang} className="bg-[#0c0c0c]">
                              {lang === 'all' ? 'All Languages' : lang}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <ChevronDownIcon className="h-5 w-5 text-[#bff747]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEO Metrics Filter - Enhanced Card */}
                <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] p-6 rounded-2xl border border-[#bff747]/20 shadow-lg hover:border-[#bff747]/40 transition-all duration-300 hover:shadow-[#bff747]/10 hover:shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#bff747]/50 to-[#bff747]/10"></div>
                  <div className="flex items-center space-x-3 mb-5">
                    <div className="w-3 h-3 rounded-full bg-[#bff747] animate-pulse"></div>
                    <h4 className="text-xl font-bold text-[#bff747]">SEO Metrics</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {seoFilters.map(filter => (
                      <div key={filter.id}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{filter.label}</label>
                        <div className="flex space-x-3">
                          <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-[#bff747]/70 text-sm">Min</span>
                            </div>
                            <input
                              type="text"
                              placeholder="0"
                              className="w-full border border-[#bff747]/30 rounded-xl px-4 py-3 pl-12 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500 transition-all duration-200 hover:border-[#bff747]/50 focus:ring-2 focus:ring-[#bff747]/30"
                              value={filters[filter.minKey] || ''}
                              onChange={(e) => handleNumericChange(filter.minKey, e.target.value)}
                            />
                          </div>
                          <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-[#bff747]/70 text-sm">Max</span>
                            </div>
                            <input
                              type="text"
                              placeholder={filter.id === 'ss' ? '17' : filter.id.includes('domainAge') ? '100' : '100'}
                              className="w-full border border-[#bff747]/30 rounded-xl px-4 py-3 pl-12 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500 transition-all duration-200 hover:border-[#bff747]/50 focus:ring-2 focus:ring-[#bff747]/30"
                              value={filters[filter.maxKey] || ''}
                              onChange={(e) => handleNumericChange(filter.maxKey, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Traffic Metrics Filter - Enhanced Card */}
                <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] p-6 rounded-2xl border border-[#bff747]/20 shadow-lg hover:border-[#bff747]/40 transition-all duration-300 hover:shadow-[#bff747]/10 hover:shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#bff747]/50 to-[#bff747]/10"></div>
                  <div className="flex items-center space-x-3 mb-5">
                    <div className="w-3 h-3 rounded-full bg-[#bff747] animate-pulse"></div>
                    <h4 className="text-xl font-bold text-[#bff747]">Traffic Metrics</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {trafficFilters.map(filter => (
                      <div key={filter.id}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{filter.label}</label>
                        <div className="flex space-x-3">
                          <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-[#bff747]/70 text-sm">Min</span>
                            </div>
                            <input
                              type="text"
                              placeholder="0"
                              className="w-full border border-[#bff747]/30 rounded-xl px-4 py-3 pl-12 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500 transition-all duration-200 hover:border-[#bff747]/50 focus:ring-2 focus:ring-[#bff747]/30"
                              value={filters[filter.minKey] || ''}
                              onChange={(e) => handleNumericChange(filter.minKey, e.target.value)}
                            />
                          </div>
                          <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-[#bff747]/70 text-sm">Max</span>
                            </div>
                            <input
                              type="text"
                              placeholder="1000000"
                              className="w-full border border-[#bff747]/30 rounded-xl px-4 py-3 pl-12 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500 transition-all duration-200 hover:border-[#bff747]/50 focus:ring-2 focus:ring-[#bff747]/30"
                              value={filters[filter.maxKey] || ''}
                              onChange={(e) => handleNumericChange(filter.maxKey, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Authority Metrics Filter - Enhanced Card */}
                <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] p-6 rounded-2xl border border-[#bff747]/20 shadow-lg hover:border-[#bff747]/40 transition-all duration-300 hover:shadow-[#bff747]/10 hover:shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#bff747]/50 to-[#bff747]/10"></div>
                  <div className="flex items-center space-x-3 mb-5">
                    <div className="w-3 h-3 rounded-full bg-[#bff747] animate-pulse"></div>
                    <h4 className="text-xl font-bold text-[#bff747]">Authority Metrics</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {authorityFilters.map(filter => (
                      <div key={filter.id}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{filter.label}</label>
                        <div className="flex space-x-3">
                          <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-[#bff747]/70 text-sm">Min</span>
                            </div>
                            <input
                              type="text"
                              placeholder="0"
                              className="w-full border border-[#bff747]/30 rounded-xl px-4 py-3 pl-12 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500 transition-all duration-200 hover:border-[#bff747]/50 focus:ring-2 focus:ring-[#bff747]/30"
                              value={filters[filter.minKey] || ''}
                              onChange={(e) => handleNumericChange(filter.minKey, e.target.value)}
                            />
                          </div>
                          <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-[#bff747]/70 text-sm">Max</span>
                            </div>
                            <input
                              type="text"
                              placeholder="100"
                              className="w-full border border-[#bff747]/30 rounded-xl px-4 py-3 pl-12 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500 transition-all duration-200 hover:border-[#bff747]/50 focus:ring-2 focus:ring-[#bff747]/30"
                              value={filters[filter.maxKey] || ''}
                              onChange={(e) => handleNumericChange(filter.maxKey, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter - Enhanced Card */}
                <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] p-6 rounded-2xl border border-[#bff747]/20 shadow-lg hover:border-[#bff747]/40 transition-all duration-300 hover:shadow-[#bff747]/10 hover:shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#bff747]/50 to-[#bff747]/10"></div>
                  <div className="flex items-center space-x-3 mb-5">
                    <div className="w-3 h-3 rounded-full bg-[#bff747] animate-pulse"></div>
                    <h4 className="text-xl font-bold text-[#bff747]">Price Range</h4>
                  </div>
                  <div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Price Range ($)</label>
                      <div className="flex space-x-3">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-[#bff747]/70 text-sm">Min</span>
                          </div>
                          <input
                            type="text"
                            placeholder="0"
                            className="w-full border border-[#bff747]/30 rounded-xl px-4 py-3 pl-12 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500 transition-all duration-200 hover:border-[#bff747]/50 focus:ring-2 focus:ring-[#bff747]/30"
                            value={filters.minPrice || ''}
                            onChange={(e) => handleNumericChange('minPrice', e.target.value)}
                          />
                        </div>
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-[#bff747]/70 text-sm">Max</span>
                          </div>
                          <input
                            type="text"
                            placeholder="10000"
                            className="w-full border border-[#bff747]/30 rounded-xl px-4 py-3 pl-12 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500 transition-all duration-200 hover:border-[#bff747]/50 focus:ring-2 focus:ring-[#bff747]/30"
                            value={filters.maxPrice || ''}
                            onChange={(e) => handleNumericChange('maxPrice', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced footer with better spacing and visual hierarchy */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border-t border-[#bff747]/20 relative">
              {/* Decorative wave */}
              <div className="absolute top-0 left-0 right-0 h-2 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-4 bg-[#bff747]/5 rounded-b-2xl"></div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-[#bff747] animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-3 h-3 rounded-full bg-[#bff747] animate-ping opacity-30"></div>
                  </div>
                  <span className="text-sm text-gray-300 font-medium">
                    <span className="font-bold text-[#bff747]">{websites.length}</span> websites found
                  </span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={clearFilters}
                    className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-200 font-medium backdrop-blur-sm"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-5 py-2.5 border border-[#bff747]/30 text-[#bff747] rounded-xl hover:bg-[#3a3a3a] transition-all duration-200 font-medium backdrop-blur-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      applyFilters();
                      setShowFilters(false);
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#bff747] to-[#a8e035] text-[#0c0c0c] font-bold rounded-xl hover:from-[#a8e035] hover:to-[#bff747] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#bff747]/30 flex items-center space-x-2 backdrop-blur-sm"
                  >
                    <span>Apply Filters</span>
                    <FunnelIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteFilters;