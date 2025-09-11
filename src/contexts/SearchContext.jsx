import React, { createContext, useContext, useState, useEffect } from 'react';
import { advertiserAPI } from '../services/api';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recommendedWebsites, setRecommendedWebsites] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    country: 'all',
    language: 'all',
    minDA: '',
    maxDA: '',
    linkType: 'all'
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 12
  });
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    countries: [],
    languages: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search websites
  const searchWebsites = async (query = '', page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        search: query || searchQuery,
        ...filters
      };
      
      const response = await advertiserAPI.browseWebsites(params);
      
      setSearchResults(response.data.data || []);
      setPagination(response.data.pagination || pagination);
      setFilterOptions(response.data.filters || filterOptions);
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to search websites';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get recommended websites
  const loadRecommendedWebsites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await advertiserAPI.browseWebsites({ 
        limit: 12,
        sortBy: 'metrics.domainAuthority',
        sortOrder: 'desc'
      });
      
      setRecommendedWebsites(response.data.data || []);
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load recommended websites';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get search suggestions
  const getSearchSuggestions = async (query) => {
    try {
      // In a real app, this would call an API endpoint
      // For now, we'll return mock suggestions
      if (!query || query.length < 2) return [];
      
      // Mock suggestions based on query
      const mockSuggestions = [
        { domain: 'techblog.com', category: 'Technology' },
        { domain: 'healthnews.org', category: 'Health' },
        { domain: 'fashiondaily.net', category: 'Fashion' },
        { domain: 'foodrecipes.co', category: 'Food' },
        { domain: 'travelguide.com', category: 'Travel' }
      ];
      
      return mockSuggestions.filter(suggestion => 
        suggestion.domain.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.category.toLowerCase().includes(query.toLowerCase())
      );
    } catch (err) {
      console.error('Failed to get search suggestions:', err);
      return [];
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: 'all',
      minPrice: '',
      maxPrice: '',
      country: 'all',
      language: 'all',
      minDA: '',
      maxDA: '',
      linkType: 'all'
    });
  };

  // Update sort
  const updateSort = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  // Change page
  const changePage = (newPage) => {
    setPagination(prev => ({ ...prev, current: newPage }));
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    searchQuery,
    searchResults,
    recommendedWebsites,
    filters,
    sortBy,
    sortOrder,
    pagination,
    filterOptions,
    loading,
    error,
    
    // Actions
    setSearchQuery,
    searchWebsites,
    loadRecommendedWebsites,
    getSearchSuggestions,
    updateFilters,
    resetFilters,
    updateSort,
    changePage,
    clearError
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};