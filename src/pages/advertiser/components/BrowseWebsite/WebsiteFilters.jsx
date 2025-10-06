import React from 'react';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  CogIcon
} from '@heroicons/react/24/outline';

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
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-[#bff747] text-[#0c0c0c] rounded-md hover:bg-[#a8e035] whitespace-nowrap"
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
              className="p-2 bg-[#2a2a2a] border border-[#bff747]/30 rounded-md hover:bg-[#3a3a3a] text-[#bff747]"
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
              className="px-4 py-2 bg-[#bff747] text-[#0c0c0c] rounded-md hover:bg-[#a8e035] font-medium whitespace-nowrap"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters - Collapsible */}
      {showFilters && (
        <div className="mt-6 pt-6 border-t border-[#bff747]/30">
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
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-2">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-400 hover:text-[#bff747]"
              >
                Clear All Filters
              </button>
            </div>
            <div className="text-sm text-gray-400">
              {websites.length} websites found
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteFilters;