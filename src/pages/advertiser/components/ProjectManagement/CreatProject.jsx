import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, Globe, Tag, TrendingUp, DollarSign, Search, ChevronDown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    website: '',
    categories: [], // Changed to array for multiple categories
    budget: '',
    description: '',
    language: 'English', // New field for language selection
    minPostBudget: '',
    maxPostBudget: '',
    postsRequired: ''
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categorySelectRef = useRef(null);

  // Categories list (same as publisher categories)
  const categories = [
    'General', 'Business & Finance', 'Technology', 'Health & Fitness', 
    'Lifestyle', 'Education', 'Digital Marketing', 'News & Media', 
    'Home & Real Estate', 'Travel & Tourism', 'Sports & Entertainment', 
    'Environment & Sustainability', 'Automotive', 'Law & Legal', 
    'Science & Research', 'Religion & Spirituality', 'Personal Development', 
    'Relationships & Dating', 'Nonprofit & Charity', 'Art & Photography'
  ];

  // Languages list
  const languages = [
    'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 
    'Korean', 'Russian', 'Arabic', 'Hindi', 'Portuguese', 'Italian'
  ];

  // Sensitive topics list (same as publisher sensitive topics)
  const sensitiveTopics = [
    'Casino Betting', 
    'Forex Crypto', 
    'CBD'
  ];

  // Combine all categories for searching
  const allCategories = [...categories, ...sensitiveTopics];

  // Filter categories based on search term
  const filteredCategories = allCategories.filter(category => 
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categorySelectRef.current && !categorySelectRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCategorySelect = (category) => {
    // Allow up to 3 categories
    if (formData.categories.length < 3 && !formData.categories.includes(category)) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }));
      
      // Clear category error if exists
      if (errors.categories) {
        setErrors(prev => ({
          ...prev,
          categories: ''
        }));
      }
    }
    // Don't close dropdown immediately to allow selecting more categories
    setSearchTerm('');
  };

  const removeCategory = (categoryToRemove) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(category => category !== categoryToRemove)
    }));
    
    // Show error if removing last category and no categories remain
    if (formData.categories.length === 1 && errors.categories) {
      setErrors(prev => ({
        ...prev,
        categories: 'At least one category is required'
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    }
    
    if (!formData.website.trim()) {
      newErrors.website = 'Website URL is required';
    } else if (!/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL (include http:// or https://)';
    }
    
    if (formData.categories.length === 0) {
      newErrors.categories = 'At least one category is required';
    }
    
    if (!formData.budget.trim()) {
      newErrors.budget = 'Budget is required';
    } else if (isNaN(formData.budget) || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Please enter a valid budget amount';
    }
    
    // Validate minPostBudget
    if (formData.minPostBudget && (isNaN(formData.minPostBudget) || parseFloat(formData.minPostBudget) <= 0)) {
      newErrors.minPostBudget = 'Please enter a valid minimum post budget';
    }
    
    // Validate maxPostBudget
    if (formData.maxPostBudget && (isNaN(formData.maxPostBudget) || parseFloat(formData.maxPostBudget) <= 0)) {
      newErrors.maxPostBudget = 'Please enter a valid maximum post budget';
    }
    
    // Validate postsRequired
    if (!formData.postsRequired.trim()) {
      newErrors.postsRequired = 'Number of posts required is required';
    } else if (isNaN(formData.postsRequired) || parseInt(formData.postsRequired) <= 0) {
      newErrors.postsRequired = 'Please enter a valid number of posts';
    }
    
    // Validate that minPostBudget <= maxPostBudget if both are provided
    if (formData.minPostBudget && formData.maxPostBudget) {
      const min = parseFloat(formData.minPostBudget);
      const max = parseFloat(formData.maxPostBudget);
      if (min > max) {
        newErrors.minPostBudget = 'Minimum post budget cannot be greater than maximum post budget';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Create project object
      const newProject = {
        id: Date.now(), // Temporary ID
        title: formData.title,
        website: formData.website,
        category: formData.categories.join(', '), // Join categories for display
        categories: formData.categories, // Keep array for future use
        language: formData.language, // New field
        minPostBudget: formData.minPostBudget ? parseFloat(formData.minPostBudget) : null,
        maxPostBudget: formData.maxPostBudget ? parseFloat(formData.maxPostBudget) : null,
        postsRequired: parseInt(formData.postsRequired),
        status: 'Active',
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        stats: {
          finishedPosts: 0,
          activePosts: 0,
          pendingReviews: 0,
          totalOrders: 0
        },
        budget: parseFloat(formData.budget),
        description: formData.description
      };
      
      // Save to localStorage (temporary solution until backend is implemented)
      const existingProjects = JSON.parse(localStorage.getItem('advertiserProjects') || '[]');
      const updatedProjects = [...existingProjects, newProject];
      localStorage.setItem('advertiserProjects', JSON.stringify(updatedProjects));
      
      // Navigate back to projects dashboard with success message
      navigate('/advertiser/projects', { 
        state: { 
          message: 'Project created successfully!',
          type: 'success'
        } 
      });
    }
  };

  const handleCancel = () => {
    navigate('/advertiser/projects');
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] font-sans">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 bg-[#1a1a1a] rounded-lg shadow-sm p-6 border border-[#333]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#bff747] mb-2">Create New Project</h1>
              <p className="text-gray-400">Set up a new project to manage your guest posting campaigns</p>
            </div>
            <button 
              onClick={handleCancel}
              className="flex items-center gap-2 bg-[#1a1a1a] text-[#bff747] px-4 py-2 rounded border border-[#333] hover:bg-[#2a2a2a] transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Projects
            </button>
          </div>
        </div>

        {/* Create Project Form */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#333] p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Project Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-[#bff747] mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full bg-[#0c0c0c] border ${
                    errors.title ? 'border-red-500' : 'border-[#333]'
                  } rounded-lg px-4 py-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#bff747]`}
                  placeholder="Enter project title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>

              {/* Website URL */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-[#bff747] mb-2">
                  Website URL *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className={`w-full bg-[#0c0c0c] border ${
                      errors.website ? 'border-red-500' : 'border-[#333]'
                    } rounded-lg pl-10 pr-4 py-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#bff747]`}
                    placeholder="https://example.com"
                  />
                </div>
                {errors.website && <p className="mt-1 text-sm text-red-500">{errors.website}</p>}
              </div>

              {/* Language Selection */}
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-[#bff747] mb-2">
                  Language *
                </label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full bg-[#0c0c0c] border border-[#333] rounded-lg px-4 py-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                >
                  {languages.map((lang, index) => (
                    <option key={index} value={lang} className="bg-[#0c0c0c] text-gray-300">
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Multiple Category Selection (Box Type) */}
              <div>
                <label className="block text-sm font-medium text-[#bff747] mb-2">
                  Project Categories (Select 1-3) *
                </label>
                
                {/* Selected Categories Display */}
                {formData.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.categories.map((category, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-3 py-1 bg-[#bff747]/20 text-[#bff747] rounded-full text-sm"
                      >
                        {category}
                        {sensitiveTopics.includes(category) && (
                          <span className="ml-2 text-xs bg-red-500/30 text-red-400 px-2 py-0.5 rounded">
                            Sensitive
                          </span>
                        )}
                        <button 
                          type="button" 
                          onClick={() => removeCategory(category)}
                          className="ml-2 text-[#bff747] hover:text-[#bff747]/80"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Category Selection Box */}
                <div className="relative" ref={categorySelectRef}>
                  <div 
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none appearance-none flex items-center justify-between cursor-pointer bg-[#0c0c0c] text-[#bff747] ${
                      errors.categories 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-[#bff747]/30 focus:border-[#bff747]'
                    }`}
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  >
                    <span className={`text-base ${formData.categories.length > 0 ? "text-gray-400" : "text-gray-400"}`}>
                      {formData.categories.length > 0 
                        ? `${formData.categories.length} category(s) selected` 
                        : "Select 1-3 categories"}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Dropdown with Search and Category Display */}
                  {isCategoryDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-[#0c0c0c] border border-[#bff747]/30 rounded-lg shadow-lg">
                      {/* Search Input */}
                      <div className="p-2 border-b border-[#bff747]/30">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#bff747]" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search categories..."
                            className="w-full pl-10 pr-4 py-2 border border-[#bff747]/30 rounded-lg focus:border-[#bff747] focus:outline-none bg-[#0c0c0c] text-[#bff747]"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      
                      {/* Categories List */}
                      <div className="max-h-60 overflow-y-auto">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category, index) => (
                            <div
                              key={index}
                              onClick={() => handleCategorySelect(category)}
                              className={`px-4 py-3 cursor-pointer hover:bg-[#bff747]/10 text-base ${
                                formData.categories.includes(category) ? 'bg-[#bff747]/20' : ''
                              } ${formData.categories.length >= 3 && !formData.categories.includes(category) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-[#bff747]">{category}</span>
                                {formData.categories.includes(category) && (
                                  <span className="text-xs bg-green-500/30 text-green-400 px-2 py-0.5 rounded">
                                    Selected
                                  </span>
                                )}
                                {sensitiveTopics.includes(category) && (
                                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                                    Sensitive
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-400">No categories found</div>
                        )}
                      </div>
                      
                      {/* Selection Limit Info */}
                      <div className="px-4 py-2 text-xs text-gray-500 border-t border-[#bff747]/30">
                        {formData.categories.length}/3 categories selected (minimum 1 required)
                      </div>
                    </div>
                  )}
                </div>
                
                {errors.categories && <p className="mt-1 text-sm text-red-500">{errors.categories}</p>}
              </div>

              {/* Budget */}
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-[#bff747] mb-2">
                  Budget *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className={`w-full bg-[#0c0c0c] border ${
                      errors.budget ? 'border-red-500' : 'border-[#333]'
                    } rounded-lg pl-10 pr-4 py-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#bff747]`}
                    placeholder="300"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.budget && <p className="mt-1 text-sm text-red-500">{errors.budget}</p>}
              </div>

              {/* Post Budgets and Requirements Section */}
              <div className="bg-[#0c0c0c] rounded-lg p-4 border border-[#333]">
                <h3 className="text-lg font-medium text-[#bff747] mb-4">Post Requirements</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Minimum Post Budget */}
                  <div>
                    <label htmlFor="minPostBudget" className="block text-sm font-medium text-gray-300 mb-2">
                      Min Post Budget
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        type="number"
                        id="minPostBudget"
                        name="minPostBudget"
                        value={formData.minPostBudget}
                        onChange={handleChange}
                        className={`w-full bg-[#1a1a1a] border ${
                          errors.minPostBudget ? 'border-red-500' : 'border-[#333]'
                        } rounded-lg pl-8 pr-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#bff747] text-sm`}
                        placeholder="10"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {errors.minPostBudget && <p className="mt-1 text-xs text-red-500">{errors.minPostBudget}</p>}
                  </div>

                  {/* Maximum Post Budget */}
                  <div>
                    <label htmlFor="maxPostBudget" className="block text-sm font-medium text-gray-300 mb-2">
                      Max Post Budget
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        type="number"
                        id="maxPostBudget"
                        name="maxPostBudget"
                        value={formData.maxPostBudget}
                        onChange={handleChange}
                        className={`w-full bg-[#1a1a1a] border ${
                          errors.maxPostBudget ? 'border-red-500' : 'border-[#333]'
                        } rounded-lg pl-8 pr-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#bff747] text-sm`}
                        placeholder="50"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {errors.maxPostBudget && <p className="mt-1 text-xs text-red-500">{errors.maxPostBudget}</p>}
                  </div>

                  {/* Number of Posts Required */}
                  <div>
                    <label htmlFor="postsRequired" className="block text-sm font-medium text-gray-300 mb-2">
                      Posts Required *
                    </label>
                    <input
                      type="number"
                      id="postsRequired"
                      name="postsRequired"
                      value={formData.postsRequired}
                      onChange={handleChange}
                      className={`w-full bg-[#1a1a1a] border ${
                        errors.postsRequired ? 'border-red-500' : 'border-[#333]'
                      } rounded-lg px-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#bff747] text-sm`}
                      placeholder="5"
                      min="1"
                    />
                    {errors.postsRequired && <p className="mt-1 text-xs text-red-500">{errors.postsRequired}</p>}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-[#bff747] mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-[#0c0c0c] border border-[#333] rounded-lg px-4 py-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                  placeholder="Describe your project in more detail..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-[#333] text-gray-300 rounded-lg hover:bg-[#2a2a2a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#bff747] text-[#0c0c0c] font-medium rounded-lg hover:bg-[#a8e035] transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Create Project
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;