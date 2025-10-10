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
  
  // Debug component re-rendering
  // console.log('WebsiteFilters component re-rendered');
  // console.log('Filter options:', filterOptions);
  
  // Process categories to handle comma-separated values
  // Add safety check for filterOptions
  const safeFilterOptions = filterOptions || { categories: [], countries: [], languages: [] };
  
  const processedCategories = (safeFilterOptions.categories || []).reduce((acc, category) => {
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
  const countries = ['all', ...safeFilterOptions.countries || []];
  const languages = ['all', ...safeFilterOptions.languages || []];
  
  // Debug the final arrays
  // console.log('Final categories array:', categories);
  // console.log('Final countries array:', countries);
  // console.log('Final languages array:', languages);

  // State for dropdown visibility
  const [showCategoryDropdown, setShowCategoryDropdown] = React.useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = React.useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = React.useState(false);
  
  // State for selected filters
  const [selectedCategories, setSelectedCategories] = React.useState(['all']);
  const [selectedCountries, setSelectedCountries] = React.useState(['all']);
  const [selectedLanguages, setSelectedLanguages] = React.useState(['all']);
  
  // Initialize selected filters based on incoming filters
  React.useEffect(() => {
    // Initialize categories
    if (filters.category) {
      const categoryValues = filters.category.split(',').filter(Boolean);
      if (categoryValues.length > 0) {
        setSelectedCategories(categoryValues);
      } else {
        setSelectedCategories(['all']);
      }
    } else {
      setSelectedCategories(['all']);
    }
    
    // Initialize countries
    if (filters.country) {
      const countryValues = filters.country.split(',').filter(Boolean);
      if (countryValues.length > 0) {
        setSelectedCountries(countryValues);
      } else {
        setSelectedCountries(['all']);
      }
    } else {
      setSelectedCountries(['all']);
    }
    
    // Initialize languages
    if (filters.language) {
      const languageValues = filters.language.split(',').filter(Boolean);
      if (languageValues.length > 0) {
        setSelectedLanguages(languageValues);
      } else {
        setSelectedLanguages(['all']);
      }
    } else {
      setSelectedLanguages(['all']);
    }
  }, [filters.category, filters.country, filters.language]); // Run when filters change
  
  // Debug dropdown states
  // React.useEffect(() => {
  //   console.log('Show category dropdown:', showCategoryDropdown);
  // }, [showCategoryDropdown]);
  
  // React.useEffect(() => {
  //   console.log('Show country dropdown:', showCountryDropdown);
  // }, [showCountryDropdown]);
  
  // React.useEffect(() => {
  //   console.log('Show language dropdown:', showLanguageDropdown);
  // }, [showLanguageDropdown]);

  // State for search filters
  const [categorySearch, setCategorySearch] = React.useState('');
  const [countrySearch, setCountrySearch] = React.useState('');
  const [languageSearch, setLanguageSearch] = React.useState('');
  
  // Create a custom search function
  const searchCategories = (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return categories.slice(0, 5);
    }
    
    const lowerSearch = searchTerm.toLowerCase();
    return categories.filter(cat => 
      cat === 'all' || cat.toLowerCase().includes(lowerSearch)
    ).slice(0, 5);
  };
  
  const searchCountries = (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return countries.slice(0, 5);
    }
    
    const lowerSearch = searchTerm.toLowerCase();
    return countries.filter(country => 
      country === 'all' || country.toLowerCase().includes(lowerSearch)
    ).slice(0, 5);
  };
  
  const searchLanguages = (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return languages.slice(0, 5);
    }
    
    const lowerSearch = searchTerm.toLowerCase();
    return languages.filter(lang => 
      lang === 'all' || lang.toLowerCase().includes(lowerSearch)
    ).slice(0, 5);
  };
  
  // Filter the options based on search terms
  const filteredCategories = searchCategories(categorySearch);
  const filteredCountries = searchCountries(countrySearch);
  const filteredLanguages = searchLanguages(languageSearch);
  
 
  // Handle removing a selected item
  const removeSelectedItem = (type, item) => {
    if (type === 'category') {
      const newSelection = selectedCategories.filter(cat => cat !== item);
      // If no items selected, default to "all"
      const finalSelection = newSelection.length > 0 ? newSelection : ['all'];
      setSelectedCategories(finalSelection);
    } else if (type === 'country') {
      const newSelection = selectedCountries.filter(country => country !== item);
      // If no items selected, default to "all"
      const finalSelection = newSelection.length > 0 ? newSelection : ['all'];
      setSelectedCountries(finalSelection);
    } else if (type === 'language') {
      const newSelection = selectedLanguages.filter(lang => lang !== item);
      // If no items selected, default to "all"
      const finalSelection = newSelection.length > 0 ? newSelection : ['all'];
      setSelectedLanguages(finalSelection);
    }
  };

  // Handle selecting an item from dropdown
  const selectItem = (type, item) => {
    if (type === 'category') {
      let newSelection = [...selectedCategories];
      
      // If selecting "all", clear other selections
      if (item === 'all') {
        newSelection = ['all'];
      } else {
        // If "all" is already selected, remove it
        if (newSelection.includes('all')) {
          newSelection = newSelection.filter(i => i !== 'all');
        }
        
        // Add item if under limit and not already selected
        if (newSelection.length < 3 && !newSelection.includes(item)) {
          newSelection.push(item);
        }
      }
      
      setSelectedCategories(newSelection);
      setShowCategoryDropdown(false);
      setCategorySearch('');
    } else if (type === 'country') {
      let newSelection = [...selectedCountries];
      
      // If selecting "all", clear other selections
      if (item === 'all') {
        newSelection = ['all'];
      } else {
        // If "all" is already selected, remove it
        if (newSelection.includes('all')) {
          newSelection = newSelection.filter(i => i !== 'all');
        }
        
        // Add item if under limit and not already selected
        if (newSelection.length < 3 && !newSelection.includes(item)) {
          newSelection.push(item);
        }
      }
      
      setSelectedCountries(newSelection);
      setShowCountryDropdown(false);
      setCountrySearch('');
    } else if (type === 'language') {
      let newSelection = [...selectedLanguages];
      
      // If selecting "all", clear other selections
      if (item === 'all') {
        newSelection = ['all'];
      } else {
        // If "all" is already selected, remove it
        if (newSelection.includes('all')) {
          newSelection = newSelection.filter(i => i !== 'all');
        }
        
        // Add item if under limit and not already selected
        if (newSelection.length < 3 && !newSelection.includes(item)) {
          newSelection.push(item);
        }
      }
      
      setSelectedLanguages(newSelection);
      setShowLanguageDropdown(false);
      setLanguageSearch('');
    }
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCategoryDropdown || showCountryDropdown || showLanguageDropdown) {
        // Check if click was outside the dropdown areas
        const categoryDropdown = document.getElementById('category-dropdown');
        const countryDropdown = document.getElementById('country-dropdown');
        const languageDropdown = document.getElementById('language-dropdown');
        
        // Also check if click was on the dropdown trigger
        const categoryTrigger = event.target.closest('[data-dropdown-trigger="category"]');
        const countryTrigger = event.target.closest('[data-dropdown-trigger="country"]');
        const languageTrigger = event.target.closest('[data-dropdown-trigger="language"]');
        
        if (showCategoryDropdown && categoryDropdown && !categoryDropdown.contains(event.target) && !categoryTrigger) {
          setShowCategoryDropdown(false);
        }
        if (showCountryDropdown && countryDropdown && !countryDropdown.contains(event.target) && !countryTrigger) {
          setShowCountryDropdown(false);
        }
        if (showLanguageDropdown && languageDropdown && !languageDropdown.contains(event.target) && !languageTrigger) {
          setShowLanguageDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown, showCountryDropdown, showLanguageDropdown]);

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
    { id: 'price', label: 'Price Range ($)', minKey: 'minPrice', maxKey: 'maxPrice' },
    { id: 'tf', label: 'Trust Flow (0-100)', minKey: 'minTF', maxKey: 'maxTF' },
    { id: 'cf', label: 'Citation Flow (0-100)', minKey: 'minCF', maxKey: 'maxCF' },
    { id: 'ur', label: 'URL Rating (0-100)', minKey: 'minUR', maxKey: 'maxUR' },
    { id: 'semrushTraffic', label: 'SEMrush Traffic', minKey: 'minSemrushTraffic', maxKey: 'maxSemrushTraffic' },
    { id: 'semrushKeywords', label: 'SEMrush Keywords', minKey: 'minSemrushKeywords', maxKey: 'maxSemrushKeywords' },
    { id: 'semrushReferring', label: 'SEMrush Referring Domains', minKey: 'minSemrushReferringDomains', maxKey: 'maxSemrushReferringDomains' },
  ];

  // Add validation for numeric inputs
  const handleNumericChange = (key, value) => {
    // Allow only numbers and empty values
    if (value === '' || /^[0-9]*$/.test(value)) {
      handleFilterChange(key, value);
    }
  };

  // Update the handleFilterChange function to handle multi-select
  const updateFilters = () => {
    // Update category filter
    const categoryValue = selectedCategories.includes('all') || selectedCategories.length === 0 
      ? '' 
      : selectedCategories.filter(cat => cat !== 'all').join(',');
    handleFilterChange('category', categoryValue);
    
    // Update country filter
    const countryValue = selectedCountries.includes('all') || selectedCountries.length === 0 
      ? '' 
      : selectedCountries.filter(country => country !== 'all').join(',');
    handleFilterChange('country', countryValue);
    
    // Update language filter
    const languageValue = selectedLanguages.includes('all') || selectedLanguages.length === 0 
      ? '' 
      : selectedLanguages.filter(lang => lang !== 'all').join(',');
    handleFilterChange('language', languageValue);
    
    // Close all dropdowns
    setShowCategoryDropdown(false);
    setShowCountryDropdown(false);
    setShowLanguageDropdown(false);
  };

  // Debug useEffect to monitor filter changes (can be removed in production)
  // React.useEffect(() => {
  //   console.log('Current filter states:');
  //   console.log('Selected Categories:', selectedCategories);
  //   console.log('Selected Countries:', selectedCountries);
  //   console.log('Selected Languages:', selectedLanguages);
  // }, [selectedCategories, selectedCountries, selectedLanguages]);

  // Debug useEffect to monitor filter changes (can be removed in production)
  // React.useEffect(() => {
  //   console.log('Selected Categories:', selectedCategories);
  //   console.log('Selected Countries:', selectedCountries);
  //   console.log('Selected Languages:', selectedLanguages);
  // }, [selectedCategories, selectedCountries, selectedLanguages]);

  // Reset filters to initial state
  const resetFilters = () => {
    setSelectedCategories(['all']);
    setSelectedCountries(['all']);
    setSelectedLanguages(['all']);
    // Also reset search filters
    setCategorySearch('');
    setCountrySearch('');
    setLanguageSearch('');
    // Close any open dropdowns
    setShowCategoryDropdown(false);
    setShowCountryDropdown(false);
    setShowLanguageDropdown(false);
  };

  // Clear all filters
  const handleClearFilters = () => {
    resetFilters();
    clearFilters();
  };

  // Apply filters and close modal
  const handleApplyFilters = () => {
    updateFilters();
    applyFilters();
    setShowFilters(false);
  };

  // Handle cancel action
  const handleCancel = () => {
    // Reset to previous filter values
    const categoryValues = filters.category && filters.category !== '' ? filters.category.split(',').filter(Boolean) : ['all'];
    const countryValues = filters.country && filters.country !== '' ? filters.country.split(',').filter(Boolean) : ['all'];
    const languageValues = filters.language && filters.language !== '' ? filters.language.split(',').filter(Boolean) : ['all'];
    
    setSelectedCategories(categoryValues);
    setSelectedCountries(countryValues);
    setSelectedLanguages(languageValues);
    setShowFilters(false);
    // Close any open dropdowns
    setShowCategoryDropdown(false);
    setShowCountryDropdown(false);
    setShowLanguageDropdown(false);
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
      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#bff747]/30">
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
                className="flex items-center px-4 py-2 bg-[#bff747] text-[#0c0c0c] rounded-md hover:bg-[#a8e035] whitespace-nowrap transition-all duration-200 transform hover:scale-105"
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
                onClick={() => {
                  // Update filters before applying
                  const categoryValue = selectedCategories.includes('all') || selectedCategories.length === 0 
                    ? '' 
                    : selectedCategories.filter(cat => cat !== 'all').join(',');
                  handleFilterChange('category', categoryValue);
                  
                  const countryValue = selectedCountries.includes('all') || selectedCountries.length === 0 
                    ? '' 
                    : selectedCountries.filter(country => country !== 'all').join(',');
                  handleFilterChange('country', countryValue);
                  
                  const languageValue = selectedLanguages.includes('all') || selectedLanguages.length === 0 
                    ? '' 
                    : selectedLanguages.filter(lang => lang !== 'all').join(',');
                  handleFilterChange('language', languageValue);
                  
                  // Then apply filters
                  applyFilters();
                }}
                className="px-4 py-2 bg-[#bff747] text-[#0c0c0c] rounded-md hover:bg-[#a8e035] font-medium whitespace-nowrap transition-all duration-200 transform hover:scale-105"
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
    <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#bff747]/30">
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
              className="flex items-center px-4 py-2 bg-[#bff747] text-[#0c0c0c] rounded-md hover:bg-[#a8e035] whitespace-nowrap transition-all duration-200 transform hover:scale-105"
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
              onClick={() => {
                updateFilters();
                applyFilters();
              }}
              className="px-4 py-2 bg-[#bff747] text-[#0c0c0c] rounded-md hover:bg-[#a8e035] font-medium whitespace-nowrap transition-all duration-200 transform hover:scale-105"
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
            className="inline-block align-bottom bg-gradient-to-br from-[#1a1a1a] to-[#0c0c0c] rounded-3xl text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full border border-[#bff747]/30 relative animate-fade-in-up"
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
                {/* SEO Metrics Filter - Enhanced Card */}
                <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] p-6 rounded-2xl border border-[#bff747]/20 transition-all duration-300 hover:border-[#bff747]/40 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#bff747]/50 to-[#bff747]/10"></div>
                  <div className="flex items-center space-x-3 mb-5">
                    <div className="w-3 h-3 rounded-full bg-[#bff747] animate-pulse"></div>
                    <h4 className="text-xl font-bold text-[#bff747]">SEO Metrics & Basic Information</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* CATEGORY */}
                    <div className="relative z-50">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedCategories.filter(cat => cat !== 'all').map(cat => (
                          <div key={cat} className="flex items-center bg-[#bff747]/20 text-[#bff747] px-3 py-1 rounded-full text-sm">
                            <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                            <button
                              onClick={() => removeSelectedItem('category', cat)}
                              className="ml-2 text-[#bff747] hover:text-white focus:outline-none"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      <div
                        data-dropdown-trigger="category"
                        className="w-full border border-[#bff747]/30 rounded-xl px-4 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500 transition-all duration-200 hover:border-[#bff747]/50 cursor-pointer flex justify-between items-center"
                        onClick={() => {
                          setShowCategoryDropdown(!showCategoryDropdown);
                          if (!showCategoryDropdown) {
                            setShowCountryDropdown(false);
                            setShowLanguageDropdown(false);
                          }
                        }}
                      >
                        <span className="text-gray-400">
                          {selectedCategories.length > 0 && selectedCategories[0] !== 'all'
                            ? `${selectedCategories.length} selected`
                            : 'Select categories'}
                        </span>
                        <ChevronDownIcon className="h-4 w-4 text-[#bff747]" />
                      </div>

                      {showCategoryDropdown && (
                        <div
                          id="category-dropdown"
                          className="absolute top-full mt-1 w-full bg-[#1a1a1a] border border-[#bff747]/30 rounded-xl shadow-lg z-50"
                        >
                          <div className="p-2">
                            <input
                              type="text"
                              placeholder="Search categories..."
                              className="w-full border border-[#bff747]/30 rounded-xl px-4 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500 transition-all duration-200 hover:border-[#bff747]/50 mb-2"
                              value={categorySearch}
                              onChange={(e) => {
                                setCategorySearch(e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-[#bff747]/30 scrollbar-track-[#1a1a1a] scrollbar-thumb-rounded-full">
                              {filteredCategories.map(cat => (
                                <div
                                  key={cat}
                                  className="flex items-center py-2 px-3 hover:bg-[#2a2a2a] cursor-pointer border-b border-[#2a2a2a] last:border-b-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectItem('category', cat);
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(cat)}
                                    onChange={() => {}}
                                    className="h-4 w-4 text-[#bff747] focus:ring-[#bff747] border-[#bff747]/30 rounded bg-[#2a2a2a] cursor-pointer"
                                  />
                                  <label className="ml-3 text-sm text-gray-300 cursor-pointer">
                                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-2 text-xs text-gray-400">
                        Selected: {selectedCategories.filter(cat => cat !== 'all').length}/3 (Select up to 3)
                      </div>
                    </div>

                    {/* COUNTRY */}
                    <div className="relative z-40">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedCountries.filter(c => c !== 'all').map(c => (
                          <div key={c} className="flex items-center bg-[#bff747]/20 text-[#bff747] px-3 py-1 rounded-full text-sm">
                            <span>{c}</span>
                            <button
                              onClick={() => removeSelectedItem('country', c)}
                              className="ml-2 text-[#bff747] hover:text-white focus:outline-none"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      <div
                        data-dropdown-trigger="country"
                        className="w-full border border-[#bff747]/30 rounded-xl px-4 py-2 bg-[#0c0c0c] text-[#bff747] placeholder-gray-500 hover:border-[#bff747]/50 cursor-pointer flex justify-between items-center"
                        onClick={() => {
                          setShowCountryDropdown(!showCountryDropdown);
                          if (!showCountryDropdown) {
                            setShowCategoryDropdown(false);
                            setShowLanguageDropdown(false);
                          }
                        }}
                      >
                        <span className="text-gray-400">
                          {selectedCountries.length > 0 && selectedCountries[0] !== 'all'
                            ? `${selectedCountries.length} selected`
                            : 'Select countries'}
                        </span>
                        <ChevronDownIcon className="h-4 w-4 text-[#bff747]" />
                      </div>

                      {showCountryDropdown && (
                        <div
                          id="country-dropdown"
                          className="absolute top-full mt-1 w-full bg-[#1a1a1a] border border-[#bff747]/30 rounded-xl shadow-lg z-40"
                        >
                          <div className="p-2">
                            <input
                              type="text"
                              placeholder="Search countries..."
                              className="w-full border border-[#bff747]/30 rounded-xl px-4 py-2 bg-[#0c0c0c] text-[#bff747] mb-2"
                              value={countrySearch}
                              onChange={(e) => {
                                setCountrySearch(e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-[#bff747]/30">
                              {filteredCountries.map(c => (
                                <div
                                  key={c}
                                  className="flex items-center py-2 px-3 hover:bg-[#2a2a2a] cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectItem('country', c);
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedCountries.includes(c)}
                                    readOnly
                                    className="h-4 w-4 text-[#bff747] border-[#bff747]/30 bg-[#2a2a2a]"
                                  />
                                  <label className="ml-3 text-sm text-gray-300">{c}</label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-400">
                        Selected: {selectedCountries.filter(c => c !== 'all').length}/3 (Select up to 3)
                      </div>
                    </div>

                    {/* LANGUAGE */}
                    <div className="relative z-30">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedLanguages.filter(l => l !== 'all').map(l => (
                          <div key={l} className="flex items-center bg-[#bff747]/20 text-[#bff747] px-3 py-1 rounded-full text-sm">
                            <span>{l}</span>
                            <button
                              onClick={() => removeSelectedItem('language', l)}
                              className="ml-2 text-[#bff747] hover:text-white focus:outline-none"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      <div
                        data-dropdown-trigger="language"
                        className="w-full border border-[#bff747]/30 rounded-xl px-4 py-2 bg-[#0c0c0c] text-[#bff747] hover:border-[#bff747]/50 cursor-pointer flex justify-between items-center"
                        onClick={() => {
                          setShowLanguageDropdown(!showLanguageDropdown);
                          if (!showLanguageDropdown) {
                            setShowCategoryDropdown(false);
                            setShowCountryDropdown(false);
                          }
                        }}
                      >
                        <span className="text-gray-400">
                          {selectedLanguages.length > 0 && selectedLanguages[0] !== 'all'
                            ? `${selectedLanguages.length} selected`
                            : 'Select languages'}
                        </span>
                        <ChevronDownIcon className="h-4 w-4 text-[#bff747]" />
                      </div>

                      {showLanguageDropdown && (
                        <div
                          id="language-dropdown"
                          className="absolute top-full mt-1 w-full bg-[#1a1a1a] border border-[#bff747]/30 rounded-xl shadow-lg z-30"
                        >
                          <div className="p-2">
                            <input
                              type="text"
                              placeholder="Search languages..."
                              className="w-full border border-[#bff747]/30 rounded-xl px-4 py-2 bg-[#0c0c0c] text-[#bff747] mb-2"
                              value={languageSearch}
                              onChange={(e) => {
                                setLanguageSearch(e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-[#bff747]/30">
                              {filteredLanguages.map(l => (
                                <div
                                  key={l}
                                  className="flex items-center py-2 px-3 hover:bg-[#2a2a2a] cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectItem('language', l);
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedLanguages.includes(l)}
                                    readOnly
                                    className="h-4 w-4 text-[#bff747] border-[#bff747]/30 bg-[#2a2a2a]"
                                  />
                                  <label className="ml-3 text-sm text-gray-300">{l}</label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-400">
                        Selected: {selectedLanguages.filter(l => l !== 'all').length}/3 (Select up to 3)
                      </div>
                    </div>

                    {/* SEO Filters */}
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
                              placeholder={filter.id === 'ss' ? '17' : filter.id === 'price' ? '10000' : filter.id.includes('domainAge') ? '100' : '100'}
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
                    onClick={handleClearFilters}
                    className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-200 font-medium backdrop-blur-sm"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-5 py-2.5 border border-[#bff747]/30 text-[#bff747] rounded-xl hover:bg-[#3a3a3a] transition-all duration-200 font-medium backdrop-blur-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#bff747] to-[#a8e035] text-[#0c0c0c] font-bold rounded-xl hover:from-[#a8e035] hover:to-[#bff747] transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 backdrop-blur-sm"
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