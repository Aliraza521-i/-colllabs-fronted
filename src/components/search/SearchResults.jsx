import React, { useState, useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import SearchBar from './SearchBar';
import WebsiteCard from '../websites/WebsiteCard';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowsUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const SearchResults = () => {
  const { 
    searchResults, 
    recommendedWebsites,
    pagination, 
    filterOptions,
    loading, 
    error,
    searchWebsites,
    loadRecommendedWebsites,
    filters,
    sortBy,
    sortOrder,
    updateSort,
    changePage
  } = useSearch();
  
  const [showRecommended, setShowRecommended] = useState(true);

  useEffect(() => {
    if (searchResults.length === 0) {
      loadRecommendedWebsites();
      setShowRecommended(true);
    }
  }, [searchResults.length, loadRecommendedWebsites]);

  const handleSort = (newSortBy) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    updateSort(newSortBy, newSortOrder);
    
    // Re-search with new sort
    searchWebsites('', pagination.current);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      changePage(newPage);
      searchWebsites('', newPage);
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) {
      return <ArrowsUpDownIcon className="h-4 w-4" />;
    }
    
    return sortOrder === 'asc' ? 
      <ArrowUpIcon className="h-4 w-4" /> : 
      <ArrowDownIcon className="h-4 w-4" />;
  };

  if (loading && searchResults.length === 0 && recommendedWebsites.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayWebsites = showRecommended ? recommendedWebsites : searchResults;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {showRecommended ? 'Recommended Websites' : 'Search Results'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {showRecommended 
            ? 'Discover websites tailored to your preferences' 
            : `Found ${pagination.total} websites matching your search`}
        </p>
      </div>

      <div className="mb-6">
        <SearchBar showFilters={true} />
      </div>

      {displayWebsites.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No websites found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      ) : (
        <>
          {/* Sort and Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowRecommended(true)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  showRecommended 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Recommended
              </button>
              <button
                onClick={() => setShowRecommended(false)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  !showRecommended 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Search Results
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {pagination.total} websites
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSort('domainAuthority')}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <span>Domain Authority</span>
                  {getSortIcon('domainAuthority')}
                </button>
                
                <button
                  onClick={() => handleSort('publishingPrice')}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <span>Price</span>
                  {getSortIcon('publishingPrice')}
                </button>
                
                <button
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <span>Newest</span>
                  {getSortIcon('createdAt')}
                </button>
              </div>
            </div>
          </div>

          {/* Website Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {displayWebsites.map((website) => (
              <WebsiteCard key={website._id} website={website} />
            ))}
          </div>

          {/* Pagination */}
          {!showRecommended && pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                    pagination.current === 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                  className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                    pagination.current === pagination.pages 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(pagination.current - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.current * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.current - 1)}
                      disabled={pagination.current === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                        pagination.current === 1 ? 'cursor-not-allowed' : ''
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Page numbers */}
                    {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                      const pageNum = Math.max(1, Math.min(
                        pagination.current - 2 + i,
                        pagination.pages - 4 + i
                      ));
                      
                      if (pageNum > pagination.pages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            pageNum === pagination.current
                              ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.current + 1)}
                      disabled={pagination.current === pagination.pages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                        pagination.current === pagination.pages ? 'cursor-not-allowed' : ''
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;