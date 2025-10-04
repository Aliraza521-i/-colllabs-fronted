import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import countries from 'country-list';
import { websiteAPI } from '../../../../services/api';

// Custom Searchable Country Select Component using country-list package
const SearchableCountrySelect = ({ 
  value, 
  onChange, 
  placeholder,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  // Get all countries from the country-list package
  const allCountries = countries.getData().map(country => ({
    code: country.code,
    name: country.name
  }));

  // Filter countries based on search term
  const filteredCountries = allCountries.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSelect = (country) => {
    onChange(country);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={selectRef}>
      {/* Selected Value Display */}
      <div 
        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none appearance-none flex items-center justify-between cursor-pointer bg-[#0c0c0c] text-[#bff747] ${
          className.includes('border-red-500') 
            ? 'border-red-500' 
            : 'border-[#bff747]/30 focus:border-[#bff747]'
        } ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`text-sm sm:text-base ${value ? "text-[#bff747]" : "text-gray-400"}`}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 sm:w-5 h-4 sm:h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-[#0c0c0c] border border-[#bff747]/30 rounded-lg shadow-lg">
          {/* Search Input */}
          <div className="p-2 border-b border-[#bff747]/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#bff747]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search countries..."
                className="w-full pl-10 pr-4 py-2 border border-[#bff747]/30 rounded-lg focus:border-[#bff747] focus:outline-none bg-[#0c0c0c] text-[#bff747]"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Countries List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country, index) => (
                <div
                  key={country.code}
                  className={`px-3 sm:px-4 py-2 cursor-pointer hover:bg-[#bff747]/10 text-sm sm:text-base ${value === country.name ? 'bg-[#bff747]/20' : ''}`}
                  onClick={() => handleSelect(country.name)}
                >
                  {country.name}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-400">No countries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Custom Searchable Language Select Component
const SearchableLanguageSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={selectRef}>
      {/* Selected Value Display */}
      <div 
        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none appearance-none flex items-center justify-between cursor-pointer bg-[#0c0c0c] text-[#bff747] ${
          className.includes('border-red-500') 
            ? 'border-red-500' 
            : 'border-[#bff747]/30 focus:border-[#bff747]'
        } ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`text-sm sm:text-base ${value ? "text-[#bff747]" : "text-gray-400"}`}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 sm:w-5 h-4 sm:h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-[#0c0c0c] border border-[#bff747]/30 rounded-lg shadow-lg">
          {/* Search Input */}
          <div className="p-2 border-b border-[#bff747]/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#bff747]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search languages..."
                className="w-full pl-10 pr-4 py-2 border border-[#bff747]/30 rounded-lg focus:border-[#bff747] focus:outline-none bg-[#0c0c0c] text-[#bff747]"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={index}
                  className={`px-3 sm:px-4 py-2 cursor-pointer hover:bg-[#bff747]/10 text-sm sm:text-base ${value === option ? 'bg-[#bff747]/20' : ''}`}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-400">No languages found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Custom Checkbox Group Component for better handling of large lists
const CheckboxGroup = ({ 
  options, 
  selectedValues, 
  onChange, 
  maxSelections = 3,
  searchable = false,
  placeholder = "Search..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState(false);

  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show only first 5 options when not expanded
  const displayOptions = expanded ? filteredOptions : filteredOptions.slice(0, 5);

  const handleCheckboxChange = (option, checked) => {
    if (checked) {
      if (selectedValues.length < maxSelections) {
        onChange([...selectedValues, option]);
      }
    } else {
      onChange(selectedValues.filter(val => val !== option));
    }
  };

  return (
    <div className="border border-[#bff747]/30 rounded-lg p-2 bg-[#0c0c0c]">
      {/* Search Input */}
      {searchable && (
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#bff747]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-8 pr-4 py-2 border border-[#bff747]/30 rounded-lg focus:border-[#bff747] focus:outline-none bg-[#0c0c0c] text-[#bff747]"
          />
        </div>
      )}

      {/* Options */}
      <div className="max-h-40 overflow-y-auto">
        {displayOptions.map((option, index) => (
          <label key={index} className="flex items-center space-x-2 p-1">
            <input
              type="checkbox"
              checked={selectedValues.includes(option)}
              onChange={(e) => handleCheckboxChange(option, e.target.checked)}
              disabled={!selectedValues.includes(option) && selectedValues.length >= maxSelections}
              className="w-4 h-4 text-[#bff747] rounded focus:ring-[#bff747] bg-[#0c0c0c] border-[#bff747]/30"
            />
            <span className="text-xs sm:text-sm text-gray-300">{option}</span>
          </label>
        ))}
      </div>

      {/* Expand/Collapse Button */}
      {filteredOptions.length > 5 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-[#bff747] text-sm font-medium hover:text-[#bff747]/80"
        >
          {expanded ? 'Show Less' : `Show More (${filteredOptions.length})`}
        </button>
      )}
    </div>
  );
};

const DescriptionPricePage = () => {
  const [formData, setFormData] = useState({
    websiteName: '',
    placementRequirement: '',
    publicationSection: '',
    country: '',
    language: '',
    maxAmount: '4',
    linksAdmitted: 'Follow',
    categories: [],
    keywords: '',
    sensitiveTopics: [],
    sponsorshipNotification: 'Always',
    normalPrice: '30',
    sensitiveTopicPrice: '30',
    copywritingPrice: '30',
    homepageAnnouncementPrice: '0',
    discount: '30',
    additionalLanguages: [],
    additionalCountries: []
  });

  const [copywritingEnabled, setCopywritingEnabled] = useState(false);
  const [sensitiveTopicEnabled, setSensitiveTopicEnabled] = useState(false);
  const [homepageAnnouncementFree, setHomepageAnnouncementFree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [isForModeration, setIsForModeration] = useState(false);
  const [showReModerationNotice, setShowReModerationNotice] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Categories list
  const categories = [
    'General', 'Business & Finance', 'Technology', 'Health & Fitness', 
    'Lifestyle', 'Education', 'Digital Marketing', 'News & Media', 
    'Home & Real Estate', 'Travel & Tourism', 'Sports & Entertainment', 
    'Environment & Sustainability', 'Automotive', 'Law & Legal', 
    'Science & Research', 'Religion & Spirituality', 'Personal Development', 
    'Relationships & Dating', 'Nonprofit & Charity', 'Art & Photography'
  ];

  // Sensitive topics list with mapping to backend enum values
  const sensitiveTopics = [
    { label: 'Casino Betting', value: 'legal_betting_casino' },
    { label: 'Forex Crypto', value: 'forex_brokers' },
    { label: 'CBD', value: 'lending_microloans' }
  ];

  // Languages list
  const languages = [
    'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 
    'Italian', 'Portuguese', 'Russian', 'Arabic', 'Hindi', 'Bengali', 'Urdu', 
    'Indonesian', 'Turkish', 'Dutch', 'Polish', 'Romanian', 'Thai', 'Vietnamese', 
    'Greek', 'Czech', 'Hungarian', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 
    'Hebrew', 'Persian', 'Swahili', 'Malay', 'Filipino', 'Ukrainian', 'Catalan', 
    'Croatian', 'Serbian', 'Bulgarian', 'Slovak', 'Slovenian', 'Lithuanian', 
    'Latvian', 'Estonian', 'Icelandic', 'Maltese', 'Irish', 'Welsh', 'Scottish Gaelic', 
    'Basque', 'Galician', 'Luxembourgish', 'Albanian', 'Macedonian', 'Bosnian', 
    'Montenegrin', 'Georgian', 'Armenian', 'Azerbaijani', 'Kazakh', 'Uzbek', 
    'Tajik', 'Kyrgyz', 'Turkmen', 'Mongolian', 'Nepali', 'Sinhala', 'Burmese', 
    'Khmer', 'Lao', 'Malagasy', 'Amharic', 'Yoruba', 'Igbo', 'Zulu', 'Xhosa', 
    'Afrikaans', 'Somali', 'Hausa', 'Swati', 'Tswana', 'Sotho', 'Tsonga'
  ];

  const handleCategoryChange = (categories) => {
    setFormData({
      ...formData,
      categories: categories.slice(0, 3) // Ensure max 3 selections
    });
  };

  const handleSensitiveTopicChange = (topics) => {
    setFormData({
      ...formData,
      sensitiveTopics: topics
    });
  };

  const handleLanguageChange = (languages) => {
    setFormData({
      ...formData,
      additionalLanguages: languages.slice(0, 3) // Ensure max 3 selections
    });
  };

  const handleCountryChange = (countries) => {
    setFormData({
      ...formData,
      additionalCountries: countries.slice(0, 3) // Ensure max 3 selections
    });
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Validation function
  const validateForm = () => {
    const errors = {};
    
    if (!formData.websiteName.trim()) {
      errors.websiteName = 'Website description is required';
    }
    
    if (!formData.country.trim()) {
      errors.country = 'Country is required';
    }
    
    if (!formData.language.trim()) {
      errors.language = 'Language is required';
    }
    
    if (!formData.categories || formData.categories.length === 0) {
      errors.categories = 'At least one category is required';
    }
    
    if (!formData.publicationSection.trim()) {
      errors.publicationSection = 'Publishing sections are required';
    }
    
    if (!formData.normalPrice || parseFloat(formData.normalPrice) <= 0) {
      errors.normalPrice = 'Normal price must be greater than 0';
    }
    
    if (copywritingEnabled && (!formData.copywritingPrice || parseFloat(formData.copywritingPrice) <= 0)) {
      errors.copywritingPrice = 'Copywriting price must be greater than 0 when enabled';
    }
    
    if (sensitiveTopicEnabled && (!formData.sensitiveTopicPrice || parseFloat(formData.sensitiveTopicPrice) <= 0)) {
      errors.sensitiveTopicPrice = 'Sensitive topic price must be greater than 0 when enabled';
    }
    
    // Validate maxAmount is between 1 and 4
    const maxAmountValue = parseInt(formData.maxAmount);
    if (isNaN(maxAmountValue) || maxAmountValue < 1 || maxAmountValue > 4) {
      errors.maxAmount = 'Maximum amount of links per post must be between 1 and 4';
    }
    
    // Validate placement requirement length
    if (formData.placementRequirement && formData.placementRequirement.length > 300) {
      errors.placementRequirement = 'Placement requirement must be 300 characters or less';
    }
    
    // Validate homepage announcement price
    if (!homepageAnnouncementFree && (!formData.homepageAnnouncementPrice || parseFloat(formData.homepageAnnouncementPrice) < 0)) {
      errors.homepageAnnouncementPrice = 'Homepage announcement price must be 0 or greater';
    }
    
    return errors;
  };

  // Initialize form with existing website data
  useEffect(() => {
    const website = location.state?.website;
    const editMode = location.state?.editMode;
    const forModeration = location.state?.forModeration;
    
    if (website) {
      setIsEditMode(!!editMode);
      setIsForModeration(!!forModeration);
      
      // Show re-moderation notice if editing an approved website
      if (editMode && website.status === 'approved') {
        setShowReModerationNotice(true);
      }
      
      // Map backend link type values to frontend values
      let linksAdmittedValue;
      switch (website.linkType) {
        case 'dofollow':
          linksAdmittedValue = 'Follow';
          break;
        case 'nofollow':
          linksAdmittedValue = 'No Follow';
          break;
        default:
          linksAdmittedValue = 'Follow';
      }
      
      // Map sensitive topics from backend values to frontend labels
      const sensitiveTopicLabels = website.acceptedSensitiveCategories?.map(topicValue => {
        const topic = sensitiveTopics.find(t => t.value === topicValue);
        return topic ? topic.label : topicValue;
      }) || [];
      
      // Parse categories from the category field
      const allCategories = website.allCategories || 
        (website.category ? website.category.split(', ').map(cat => cat.trim()) : []);
      
      setFormData({
        websiteName: website.siteDescription || '',
        placementRequirement: website.placementRequirement || '',
        publicationSection: website.publicationSection || '',
        country: website.country || '',
        language: website.mainLanguage || '',
        maxAmount: website.numberOfLinks?.toString() || '4',
        linksAdmitted: linksAdmittedValue,
        categories: allCategories,
        keywords: website.keywords?.join(', ') || '',
        sensitiveTopics: sensitiveTopicLabels,
        sponsorshipNotification: website.sponsorshipNotification || 'Always',
        normalPrice: website.publishingPrice?.toString() || '30',
        sensitiveTopicPrice: website.sensitiveContentExtraCharge?.toString() || '30',
        copywritingPrice: website.copywritingPrice?.toString() || '30',
        homepageAnnouncementPrice: website.homepageAnnouncementPrice?.toString() || '0',
        discount: website.discountPercentage?.toString() || '30',
        additionalLanguages: website.additionalLanguages || [],
        additionalCountries: website.additionalCountries || []
      });
      
      // Set homepage announcement free option based on price
      setHomepageAnnouncementFree(!website.homepageAnnouncementPrice || website.homepageAnnouncementPrice <= 0);
      
      // Set toggles based on existing data
      setCopywritingEnabled(website.copywritingPrice > 0);
      setSensitiveTopicEnabled(website.sensitiveContentExtraCharge > 0);
    }
  }, [location.state]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors({});

    try {
      // Validate form
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        throw new Error('Please fix the validation errors before submitting');
      }

      // Get websiteId from location state or localStorage as fallback
      const websiteId = location.state?.websiteId || localStorage.getItem('currentWebsiteId');
      
      if (!websiteId) {
        throw new Error('No website ID found. Please start the website addition process again.');
      }

      // Map frontend link type values to backend enum values
      let linkTypeValue;
      switch (formData.linksAdmitted.toLowerCase()) {
        case 'follow':
          linkTypeValue = 'dofollow';
          break;
        case 'no follow':
          linkTypeValue = 'nofollow';
          break;
        default:
          // For 'Sponsored' or any other value, default to 'dofollow'
          linkTypeValue = 'dofollow';
      }

      // Prepare data for submission
      const submissionData = {
        siteDescription: formData.websiteName.trim(),
        placementRequirement: formData.placementRequirement.trim(),
        publicationSection: formData.publicationSection.trim(),
        category: formData.categories.join(', ') || 'General', // Save all categories in main category field
        additionalCategories: [], // Remove additional categories
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
        country: formData.country.trim(),
        mainLanguage: formData.language.trim(),
        additionalCountries: formData.additionalCountries,
        additionalLanguages: formData.additionalLanguages,
        publishingPrice: parseFloat(formData.normalPrice),
        copywritingPrice: copywritingEnabled ? parseFloat(formData.copywritingPrice) : 0,
        homepageAnnouncementPrice: homepageAnnouncementFree ? 0 : parseFloat(formData.homepageAnnouncementPrice),
        linkType: linkTypeValue,
        numberOfLinks: parseInt(formData.maxAmount),
        discountPercentage: parseFloat(formData.discount),
        acceptedSensitiveCategories: formData.sensitiveTopics.map(topic => 
          sensitiveTopics.find(t => t.label === topic)?.value || topic
        ),
        sensitiveContentExtraCharge: sensitiveTopicEnabled ? parseFloat(formData.sensitiveTopicPrice) : 0,
        articleEditingPercentage: 10,
        publishingFormats: ['article'],
        hideDomain: false,
        advertisingRequirements: formData.placementRequirement || 'Standard requirements',
        publishingSections: formData.publicationSection || 'General content'
      };

      // Add status update based on workflow
      if (isForModeration && !isEditMode) {
        // When submitting for moderation from draft/verified state
        submissionData.status = 'submitted';
      } else if (isEditMode) {
        // When editing an already approved website
        // We don't change the status here as it should be handled by the admin
        // Add a flag to indicate this is an edit requiring re-moderation
        submissionData.needsReModeration = true;
        submissionData.status = 'submitted'; // Set status to submitted for re-moderation
      }

    

      // Update website with the form data
      const response = await websiteAPI.updateWebsite(websiteId, submissionData);
      
      if (response.data && response.data.ok) {
        console.log('Website updated successfully:', response.data);
        
        // Show success message for edit mode
        if (isEditMode) {
          // Show a message that the website is under re-moderation
          alert('Updated website settings are currently under moderation');
        }
        
        // Navigate to the websites list page
        navigate('/publisher/websites');
      } else {
        throw new Error(response.data?.message || 'Failed to update website');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      // Log more detailed error information
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
        
        // Provide more specific error message based on response
        let errorMessage = `Server error (${err.response.status})`;
        if (err.response.data?.message) {
          errorMessage += `: ${err.response.data.message}`;
        }
        if (err.response.data?.details) {
          errorMessage += `. Details: ${JSON.stringify(err.response.data.details)}`;
        }
        setError(errorMessage);
      } else {
        setError(err.message || 'Failed to submit form. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar - Made responsive */}
        <div className="mb-8 sm:mb-16">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="text-center flex-1 min-w-[100px] mb-2 sm:mb-0">
              <div className="text-base sm:text-lg font-medium text-[#bff747] mb-2">Add your Website</div>
            </div>
            <div className="text-center flex-1 min-w-[100px] mb-2 sm:mb-0">
              <div className="text-base sm:text-lg font-medium text-[#bff747] mb-2">Confirm your Ownership</div>
            </div>
            <div className="text-center flex-1 min-w-[100px] mb-2 sm:mb-0">
              <div className="text-base sm:text-lg font-medium text-[#bff747] mb-2">
                {isEditMode ? 'Edit Website' : 'Description and price'}
              </div>
            </div>
            <div className="text-center flex-1 min-w-[100px] mb-2 sm:mb-0">
              <div className="text-base sm:text-lg font-medium text-[#bff747] mb-2">Earn</div>
            </div>
          </div>
          
          <div className="relative">
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-[#bff747] z-10 relative" />
              <div className="flex-1 h-1 bg-[#bff747]" />
              <div className="w-5 h-5 rounded-full bg-[#bff747] z-10 relative" />
              <div className="flex-1 h-1 bg-[#bff747]" />
              <div className={`w-5 h-5 rounded-full z-10 relative ${isForModeration || isEditMode ? 'bg-[#bff747]' : 'bg-gray-600'}`} />
              <div className="flex-1 h-1 bg-gray-600" />
              <div className="w-5 h-5 rounded-full bg-gray-600 z-10 relative" />
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-[#0c0c0c] rounded-lg p-4 sm:p-8 border border-[#bff747]/30">
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {/* Re-moderation notice */}
          {showReModerationNotice && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-900/30 border border-yellow-500/30 text-yellow-300 rounded-lg text-sm">
              Updated website settings are currently under moderation
            </div>
          )}
          
          {/* Page Title */}
          <h2 className="text-xl font-medium text-[#bff747] mb-6 sm:mb-8 text-center">
            {isEditMode ? 'Edit Website Details' : 'Website Description and Pricing'}
          </h2>

          {/* Website Name */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-[#bff747] font-medium mb-2 text-sm sm:text-base">
              Website Description *
            </label>
            <textarea
              value={formData.websiteName}
              onChange={(e) => handleInputChange('websiteName', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none resize-none h-20 sm:h-24 bg-[#0c0c0c] text-[#bff747] text-sm sm:text-base ${
                validationErrors.websiteName 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-[#bff747]/30 focus:border-[#bff747]'
              }`}
              placeholder="Website description..."
              required
            />
            {validationErrors.websiteName && (
              <p className="mt-1 text-red-400 text-xs sm:text-sm">{validationErrors.websiteName}</p>
            )}
          </div>

          {/* Advertising Requirements */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-[#bff747] font-medium mb-2 text-sm sm:text-base">
              Advertising Requirements (maximum 300 words)
            </label>
            <textarea
              value={formData.placementRequirement}
              onChange={(e) => handleInputChange('placementRequirement', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none resize-none h-20 sm:h-24 bg-[#0c0c0c] text-[#bff747] text-sm sm:text-base ${
                validationErrors.placementRequirement 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-[#bff747]/30 focus:border-[#bff747]'
              }`}
              placeholder="Enter advertising requirements..."
            />
            <div className="flex justify-between items-center mt-1">
              <div className="text-xs text-gray-400">
                Maximum 300 characters
              </div>
              <div className="text-xs text-gray-400">
                {formData.placementRequirement.length}/300
              </div>
            </div>
            {validationErrors.placementRequirement && (
              <p className="mt-1 text-red-400 text-xs sm:text-sm">{validationErrors.placementRequirement}</p>
            )}
          </div>

          {/* Publishing Sections */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-[#bff747] font-medium mb-2 text-sm sm:text-base">
              Publishing Sections *
            </label>
            <textarea
              value={formData.publicationSection}
              onChange={(e) => handleInputChange('publicationSection', e.target.value)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none resize-none h-20 sm:h-24 bg-[#0c0c0c] text-[#bff747] text-sm sm:text-base ${
                validationErrors.publicationSection 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-[#bff747]/30 focus:border-[#bff747]'
              }`}
              placeholder="Enter publishing sections..."
              required
            />
            {validationErrors.publicationSection && (
              <p className="mt-1 text-red-400 text-xs sm:text-sm">{validationErrors.publicationSection}</p>
            )}
          </div>

          {/* Row 1: Country and Language - Made responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div>
              <label className="block text-[#bff747] font-medium mb-2 text-sm sm:text-base">
                Your main audience is from (country): *
              </label>
              <SearchableCountrySelect
                value={formData.country}
                onChange={(value) => handleInputChange('country', value)}
                placeholder="Select a country"
                className={validationErrors.country ? 'border-red-500' : ''}
              />
              {validationErrors.country && (
                <p className="mt-1 text-red-400 text-xs sm:text-sm">{validationErrors.country}</p>
              )}
            </div>
            <div>
              <label className="block text-[#bff747] font-medium mb-2 text-sm sm:text-base">
                Language *
              </label>
              <SearchableLanguageSelect
                options={languages}
                value={formData.language}
                onChange={(value) => handleInputChange('language', value)}
                placeholder="Select a language"
                className={validationErrors.language ? 'border-red-500' : ''}
              />
              {validationErrors.language && (
                <p className="mt-1 text-red-400 text-xs sm:text-sm">{validationErrors.language}</p>
              )}
            </div>
          </div>

          {/* Additional Countries */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-[#bff747] font-medium mb-2 text-sm sm:text-base">
              Additional Countries (Select up to 3)
            </label>
            <CheckboxGroup
              options={countries.getData().map(country => country.name)}
              selectedValues={formData.additionalCountries}
              onChange={handleCountryChange}
              maxSelections={3}
              searchable={true}
              placeholder="Search countries..."
            />
            {formData.additionalCountries.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.additionalCountries.map((country, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 bg-[#bff747]/20 text-[#bff747] text-xs rounded-full">
                    {country}
                    <button 
                      type="button" 
                      onClick={() => handleCountryChange(formData.additionalCountries.filter(c => c !== country))}
                      className="ml-1 text-[#bff747] hover:text-[#bff747]/80"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Additional Languages */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-[#bff747] font-medium mb-2 text-sm sm:text-base">
              Additional Languages (Select up to 3)
            </label>
            <CheckboxGroup
              options={languages}
              selectedValues={formData.additionalLanguages}
              onChange={handleLanguageChange}
              maxSelections={3}
              searchable={true}
              placeholder="Search languages..."
            />
            {formData.additionalLanguages.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.additionalLanguages.map((language, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 bg-[#bff747]/20 text-[#bff747] text-xs rounded-full">
                    {language}
                    <button 
                      type="button" 
                      onClick={() => handleLanguageChange(formData.additionalLanguages.filter(l => l !== language))}
                      className="ml-1 text-[#bff747] hover:text-[#bff747]/80"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-[#bff747] font-medium mb-2 text-sm sm:text-base">
              Select your website categories (maximum 3) *
            </label>
            <CheckboxGroup
              options={categories}
              selectedValues={formData.categories}
              onChange={handleCategoryChange}
              maxSelections={3}
              searchable={true}
              placeholder="Search categories..."
            />
            {validationErrors.categories && (
              <p className="mt-1 text-red-400 text-xs sm:text-sm">{validationErrors.categories}</p>
            )}
            {formData.categories.length > 0 && (
              <div className="mt-2 text-sm text-[#bff747]">
                Selected categories: {formData.categories.join(', ')}
              </div>
            )}
          </div>

          {/* Keywords */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-[#bff747] font-medium mb-2 text-sm sm:text-base">
              Add Keywords (Add up to 5)
            </label>
            <textarea
              value={formData.keywords}
              onChange={(e) => handleInputChange('keywords', e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#bff747]/30 rounded-lg focus:border-[#bff747] focus:outline-none resize-none h-20 sm:h-24 bg-[#0c0c0c] text-[#bff747]"
              placeholder="Enter keywords separated by commas..."
            />
          </div>

          {/* Sensitive Topics */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-[#bff747] font-medium mb-2 text-sm sm:text-base">
              Sensitive topics you do not accept *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2 border border-[#bff747]/30 rounded-lg bg-[#0c0c0c]">
              {sensitiveTopics.map((topic, index) => (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.sensitiveTopics.includes(topic.label)}
                    onChange={(e) => {
                      const newTopics = e.target.checked 
                        ? [...formData.sensitiveTopics, topic.label] 
                        : formData.sensitiveTopics.filter(t => t !== topic.label);
                      handleSensitiveTopicChange(newTopics);
                    }}
                    className="w-4 h-4 text-[#bff747] rounded focus:ring-[#bff747] bg-[#0c0c0c] border-[#bff747]/30"
                  />
                  <span className="text-sm text-gray-300">{topic.label}</span>
                </label>
              ))}
            </div>
            {formData.sensitiveTopics.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.sensitiveTopics.map((topicLabel, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 bg-[#bff747]/20 text-[#bff747] text-xs rounded-full">
                    {topicLabel}
                    <button 
                      type="button" 
                      onClick={() => handleSensitiveTopicChange(formData.sensitiveTopics.filter(t => t !== topicLabel))}
                      className="ml-1 text-[#bff747] hover:text-[#bff747]/80"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Row 4: Sponsorship Notification */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-[#bff747] font-medium mb-2 text-sm sm:text-base">
              Sponsorship notification *
            </label>
            <div className="relative">
              <select
                value={formData.sponsorshipNotification}
                onChange={(e) => handleInputChange('sponsorshipNotification', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#bff747]/30 rounded-lg focus:border-[#bff747] focus:outline-none appearance-none bg-[#0c0c0c] text-[#bff747]"
              >
                <option className="bg-[#0c0c0c] text-[#bff747]">Always</option>
                <option className="bg-[#0c0c0c] text-[#bff747]">Only when required</option>
                <option className="bg-[#0c0c0c] text-[#bff747]">Never</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#bff747]" />
            </div>
          </div>

          {/* Row 2: Max Amount and Links Admitted */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div>
              <label className="block text-[#bff747] font-medium mb-2 text-sm sm:text-base">
                Maximum Amount of link per post: *
              </label>
              <div className="relative">
                <select
                  value={formData.maxAmount}
                  onChange={(e) => handleInputChange('maxAmount', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none appearance-none bg-[#0c0c0c] text-[#bff747] ${
                    validationErrors.maxAmount 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-[#bff747]/30 focus:border-[#bff747]'
                  }`}
                >
                  {[1, 2, 3, 4].map(num => (
                    <option key={num} value={num} className="bg-[#0c0c0c] text-[#bff747]">{num}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#bff747]" />
              </div>
              {validationErrors.maxAmount && (
                <p className="mt-1 text-red-400 text-xs sm:text-sm">{validationErrors.maxAmount}</p>
              )}
            </div>
            <div>
              <label className="block text-[#bff747] font-medium mb-2 text-sm sm:text-base">
                Type of links admitted: *
              </label>
              <div className="relative">
                <select
                  value={formData.linksAdmitted}
                  onChange={(e) => handleInputChange('linksAdmitted', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#bff747]/30 rounded-lg focus:border-[#bff747] focus:outline-none appearance-none bg-[#0c0c0c] text-[#bff747]"
                >
                  <option className="bg-[#0c0c0c] text-[#bff747]">Follow</option>
                  <option className="bg-[#0c0c0c] text-[#bff747]">No Follow</option>
                  <option className="bg-[#0c0c0c] text-[#bff747]">Sponsored</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#bff747]" />
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div>
              <label className="block text-[#bff747] font-medium mb-2 text-sm sm:text-base">
                Normal Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#bff747]">$</span>
                <input
                  type="number"
                  value={formData.normalPrice}
                  onChange={(e) => handleInputChange('normalPrice', e.target.value)}
                  className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none bg-[#0c0c0c] text-[#bff747] ${
                    validationErrors.normalPrice 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-[#bff747]/30 focus:border-[#bff747]'
                  }`}
                />
              </div>
              {validationErrors.normalPrice && (
                <p className="mt-1 text-red-400 text-xs sm:text-sm">{validationErrors.normalPrice}</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[#bff747] font-medium text-sm sm:text-base">
                  Sensitive Topic Price (Optional)
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sensitiveTopicEnabled}
                    onChange={(e) => setSensitiveTopicEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#bff747]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#bff747] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#bff747]"></div>
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#bff747]">$</span>
                <input
                  type="number"
                  value={formData.sensitiveTopicPrice}
                  onChange={(e) => handleInputChange('sensitiveTopicPrice', e.target.value)}
                  disabled={!sensitiveTopicEnabled}
                  className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none ${
                    sensitiveTopicEnabled && validationErrors.sensitiveTopicPrice 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-[#bff747]/30 focus:border-[#bff747]'
                  } ${!sensitiveTopicEnabled ? 'bg-gray-800 text-gray-500' : 'bg-[#0c0c0c] text-[#bff747]'}`}
                />
              </div>
              {sensitiveTopicEnabled && validationErrors.sensitiveTopicPrice && (
                <p className="mt-1 text-red-400 text-xs sm:text-sm">{validationErrors.sensitiveTopicPrice}</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[#bff747] font-medium text-sm sm:text-base">
                  Copywriting Price
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={copywritingEnabled}
                    onChange={(e) => setCopywritingEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#bff747]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#bff747] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#bff747]"></div>
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#bff747]">$</span>
                <input
                  type="number"
                  value={formData.copywritingPrice}
                  onChange={(e) => handleInputChange('copywritingPrice', e.target.value)}
                  disabled={!copywritingEnabled}
                  className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none ${
                    copywritingEnabled && validationErrors.copywritingPrice 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-[#bff747]/30 focus:border-[#bff747]'
                  } ${!copywritingEnabled ? 'bg-gray-800 text-gray-500' : 'bg-[#0c0c0c] text-[#bff747]'}`}
                />
              </div>
              {copywritingEnabled && validationErrors.copywritingPrice && (
                <p className="mt-1 text-red-400 text-xs sm:text-sm">{validationErrors.copywritingPrice}</p>
              )}
            </div>
          </div>

          {/* Homepage Announcement Price - Moved to bottom */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[#bff747] font-medium text-sm sm:text-base">
                Homepage Announcement Price
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={homepageAnnouncementFree}
                  onChange={(e) => setHomepageAnnouncementFree(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#bff747]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#bff747] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#bff747]"></div>
              </label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#bff747]">$</span>
              <input
                type="number"
                value={formData.homepageAnnouncementPrice}
                onChange={(e) => handleInputChange('homepageAnnouncementPrice', e.target.value)}
                disabled={homepageAnnouncementFree}
                className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none ${
                  !homepageAnnouncementFree && validationErrors.homepageAnnouncementPrice 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-[#bff747]/30 focus:border-[#bff747]'
                } ${homepageAnnouncementFree ? 'bg-gray-800 text-gray-500' : 'bg-[#0c0c0c] text-[#bff747]'}`}
              />
            </div>
            {validationErrors.homepageAnnouncementPrice && (
              <p className="mt-1 text-red-400 text-xs sm:text-sm">{validationErrors.homepageAnnouncementPrice}</p>
            )}
          </div>

          {/* Discount Section */}
          <div className="mb-4 sm:mb-8">
            <label className="block text-[#bff747] font-medium mb-2 text-sm sm:text-base">
              I am ready to give a discount on publishing
            </label>
            <div className="flex">
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => handleInputChange('discount', e.target.value)}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-[#bff747]/30 rounded-l-lg focus:border-[#bff747] focus:outline-none bg-[#0c0c0c] text-[#bff747]"
              />
              <div className="px-3 sm:px-4 py-2 sm:py-3 bg-[#0c0c0c] border border-l-0 border-[#bff747]/30 rounded-r-lg flex items-center text-[#bff747]">
                %
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
           <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#bff747] hover:bg-[#bff747]/80 text-[#0c0c0c] px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#0c0c0c]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                Save Changes
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescriptionPricePage;