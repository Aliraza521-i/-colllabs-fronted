import React, { useState, useEffect, useRef } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  AdjustmentsHorizontalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const SearchBar = ({ onSearch, showFilters = true, placeholder = "Search websites..." }) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    searchWebsites, 
    getSearchSuggestions,
    filters,
    updateFilters,
    resetFilters
  } = useSearch();
  
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get search suggestions
  useEffect(() => {
    const getSuggestions = async () => {
      if (searchQuery.length >= 2) {
        const results = await getSearchSuggestions(searchQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      getSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, getSearchSuggestions]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    
    try {
      await searchWebsites(searchQuery, 1);
      if (onSearch) onSearch(searchQuery);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.domain);
    setShowSuggestions(false);
    
    // Trigger search with suggestion
    setTimeout(() => {
      searchWebsites(suggestion.domain, 1);
      if (onSearch) onSearch(suggestion.domain);
    }, 100);
  };

  const handleFilterChange = (filterName, value) => {
    updateFilters({ [filterName]: value });
  };

  const handleApplyFilters = async () => {
    setShowFiltersPanel(false);
    try {
      await searchWebsites(searchQuery, 1);
    } catch (err) {
      console.error('Search with filters failed:', err);
    }
  };

  const handleResetFilters = () => {
    resetFilters();
    setShowFiltersPanel(false);
    searchWebsites(searchQuery, 1);
  };

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        <div className="flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              onFocus={() => searchQuery.length >= 2 && setSuggestions([]) && setShowSuggestions(true)}
            />
          </div>
          
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Search
          </button>
          
          {showFilters && (
            <button
              type="button"
              onClick={() => setShowFiltersPanel(true)}
              className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md overflow-hidden"
        >
          <div className="py-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="font-medium">{suggestion.domain}</div>
                <div className="text-gray-500">{suggestion.category}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFiltersPanel && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div 
                className="absolute inset-0 bg-gray-500 opacity-75"
                onClick={() => setShowFiltersPanel(false)}
              ></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Filter Websites
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => setShowFiltersPanel(false)}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="all">All Categories</option>
                      <option value="Technology">Technology</option>
                      <option value="Health">Health</option>
                      <option value="Finance">Finance</option>
                      <option value="Travel">Travel</option>
                      <option value="Food">Food</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Min Price ($)</label>
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Max Price ($)</label>
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Min DA</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={filters.minDA}
                        onChange={(e) => handleFilterChange('minDA', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Max DA</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={filters.maxDA}
                        onChange={(e) => handleFilterChange('maxDA', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <select
                      value={filters.country}
                      onChange={(e) => handleFilterChange('country', e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="all">All Countries</option>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Language</label>
                    <select
                      value={filters.language}
                      onChange={(e) => handleFilterChange('language', e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="all">All Languages</option>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Link Type</label>
                    <select
                      value={filters.linkType}
                      onChange={(e) => handleFilterChange('linkType', e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="all">All Link Types</option>
                      <option value="dofollow">Dofollow</option>
                      <option value="nofollow">Nofollow</option>
                      <option value="guest_post">Guest Post</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowFiltersPanel(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;