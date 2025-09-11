import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  LinkIcon,
  PhotoIcon,
  PaperClipIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  TagIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { advertiserAPI, walletAPI } from '../../../services/api';

const OrderPlacement = () => {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  
  const [website, setWebsite] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [orderData, setOrderData] = useState({
    contentType: 'article',
    title: '',
    wordCount: 800,
    targetUrl: '',
    anchorText: '',
    keywords: [''],
    contentBrief: '',
    specialInstructions: '',
    deadline: '',
    needsWriting: false,
    images: [],
    attachments: [],
    urgency: 'normal'
  });

  const [pricing, setPricing] = useState({
    basePrice: 0,
    writingPrice: 0,
    urgencyFee: 0,
    totalPrice: 0
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchWebsiteDetails();
    fetchWalletBalance();
  }, [websiteId]);

  useEffect(() => {
    calculatePricing();
  }, [orderData, website]);

  const fetchWebsiteDetails = async () => {
    try {
      setLoading(true);
      const response = await advertiserAPI.getWebsiteDetails(websiteId);
      if (response.data) {
        setWebsite(response.data);
        
        // Set default deadline (website's turnaround time + 2 days)
        const defaultDeadline = new Date();
        defaultDeadline.setDate(defaultDeadline.getDate() + (response.data.turnaroundTime || 7) + 2);
        setOrderData(prev => ({
          ...prev,
          deadline: defaultDeadline.toISOString().split('T')[0]
        }));
      }
    } catch (error) {
      console.error('Failed to fetch website details:', error);
      navigate('/advertiser/browse');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await walletAPI.getBalance();
      if (response.data) {
        setWalletBalance(response.data.balance);
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    }
  };

  const calculatePricing = () => {
    if (!website) return;

    let basePrice = website.publishingPrice;
    let writingPrice = orderData.needsWriting ? (website.copywritingPrice || 0) : 0;
    let urgencyFee = 0;

    // Calculate urgency fee
    if (orderData.urgency === 'rush') {
      urgencyFee = basePrice * 0.5; // 50% rush fee
    } else if (orderData.urgency === 'express') {
      urgencyFee = basePrice * 1.0; // 100% express fee
    }

    // Word count adjustment
    if (orderData.wordCount > 1000) {
      const extraWords = orderData.wordCount - 1000;
      writingPrice += Math.ceil(extraWords / 100) * 10; // $10 per 100 extra words
    }

    const totalPrice = basePrice + writingPrice + urgencyFee;

    setPricing({
      basePrice,
      writingPrice,
      urgencyFee,
      totalPrice
    });
  };

  const handleInputChange = (field, value) => {
    // Add length validation for certain fields
    if (field === 'specialInstructions' && value.length > 1000) {
      return; // Don't update if too long
    }
    
    if (field === 'title' && value.length > 200) {
      return; // Don't update if too long
    }
    
    if (field === 'anchorText' && value.length > 100) {
      return; // Don't update if too long
    }
    
    if (field === 'contentBrief' && value.length > 2000) {
      return; // Don't update if too long
    }
    
    // Validate URL format for targetUrl
    if (field === 'targetUrl') {
      try {
        if (value.trim() !== '') {
          new URL(value);
        }
      } catch (e) {
        // Don't update if invalid URL
        return;
      }
    }
    
    // Validate date format for deadline
    if (field === 'deadline') {
      try {
        if (value.trim() !== '') {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            // Don't update if invalid date
            return;
          }
        }
      } catch (e) {
        // Don't update if invalid date
        return;
      }
    }
    
    // Validate wordCount
    if (field === 'wordCount') {
      const wordCount = parseInt(value);
      if (isNaN(wordCount) || wordCount < 100 || wordCount > 5000) {
        // Don't update if invalid word count
        return;
      }
    }
    
    // Validate urgency
    if (field === 'urgency') {
      const validUrgencies = ['normal', 'rush', 'express'];
      if (!validUrgencies.includes(value)) {
        // Don't update if invalid urgency
        return;
      }
    }
    
    // Validate contentType
    if (field === 'contentType') {
      const validContentTypes = ['article', 'review', 'interview', 'news', 'tutorial'];
      if (!validContentTypes.includes(value)) {
        // Don't update if invalid content type
        return;
      }
    }
    
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleKeywordChange = (index, value) => {
    // Add length validation for keywords
    if (value.length > 50) {
      return; // Don't update if too long
    }
    
    const newKeywords = [...orderData.keywords];
    newKeywords[index] = value;
    setOrderData(prev => ({
      ...prev,
      keywords: newKeywords
    }));
  };

  const addKeyword = () => {
    if (orderData.keywords.length < 10) {
      setOrderData(prev => ({
        ...prev,
        keywords: [...prev.keywords, '']
      }));
    }
  };

  const removeKeyword = (index) => {
    if (orderData.keywords.length > 1) {
      const newKeywords = orderData.keywords.filter((_, i) => i !== index);
      setOrderData(prev => ({
        ...prev,
        keywords: newKeywords
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!orderData.title.trim()) newErrors.title = 'Title is required';
      if (orderData.title.length > 200) newErrors.title = 'Title must be less than 200 characters';
      if (!orderData.targetUrl.trim()) newErrors.targetUrl = 'Target URL is required';
      // Validate URL format
      try {
        new URL(orderData.targetUrl);
      } catch (e) {
        newErrors.targetUrl = 'Please enter a valid URL';
      }
      if (!orderData.anchorText.trim()) newErrors.anchorText = 'Anchor text is required';
      if (orderData.anchorText.length > 100) newErrors.anchorText = 'Anchor text must be less than 100 characters';
      if (orderData.keywords.filter(k => k.trim()).length === 0) {
        newErrors.keywords = 'At least one keyword is required';
      }
    }

    if (step === 2) {
      if (!orderData.contentBrief.trim()) newErrors.contentBrief = 'Content brief is required';
      if (orderData.contentBrief.length > 2000) newErrors.contentBrief = 'Content brief must be less than 2000 characters';
      if (!orderData.deadline) newErrors.deadline = 'Deadline is required';
      
      const selectedDate = new Date(orderData.deadline);
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + (website?.turnaroundTime || 7));
      
      if (selectedDate < minDate) {
        newErrors.deadline = `Deadline must be at least ${website?.turnaroundTime || 7} days from now`;
      }
    }

    if (step === 3) {
      if (pricing.totalPrice > walletBalance) {
        newErrors.balance = 'Insufficient wallet balance';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const previousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const submitOrder = async () => {
    if (!validateStep(3)) return;

    // Check if websiteId is valid
    if (!websiteId) {
      setErrors({ submit: 'Invalid website ID. Please go back and try again.' });
      return;
    }

    // Check if required fields are present
    if (!orderData.title || !orderData.targetUrl || !orderData.anchorText) {
      setErrors({ submit: 'Please fill in all required fields.' });
      return;
    }

    // Check if at least one keyword is provided
    if (!orderData.keywords || orderData.keywords.filter(k => k.trim()).length === 0) {
      setErrors({ submit: 'Please provide at least one keyword.' });
      return;
    }

    // Check if content brief is provided
    if (!orderData.contentBrief) {
      setErrors({ submit: 'Please provide a content brief.' });
      return;
    }

    // Check if deadline is provided
    if (!orderData.deadline) {
      setErrors({ submit: 'Please select a deadline.' });
      return;
    }

    try {
      setSubmitting(true);
      
      // Structure the data to match backend expectations
      const orderPayload = {
        websiteId,
        title: orderData.title,
        description: orderData.contentBrief,
        contentRequirements: {
          wordCount: orderData.wordCount,
          keywords: orderData.keywords.filter(k => k.trim()),
          targetUrl: orderData.targetUrl,
          anchorText: orderData.anchorText,
          linkType: 'dofollow', // Default value
          needsCopywriting: orderData.needsWriting,
          contentType: orderData.contentType
        },
        deadline: orderData.deadline,
        rushOrder: orderData.urgency === 'rush' || orderData.urgency === 'express'
      };

      console.log('Sending order payload:', orderPayload);

      const response = await advertiserAPI.createOrder(orderPayload);
      
      if (response.data) {
        navigate(`/advertiser/orders/${response.data._id}`, {
          state: { orderCreated: true }
        });
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      // More detailed error handling
      let errorMessage = 'Failed to create order. Please try again.';
      if (error.response) {
        // Server responded with error status
        console.error('Error response:', error.response);
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Server error: ${error.response.status} ${error.response.statusText}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error('Error request:', error.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something else happened
        console.error('Error message:', error.message);
        errorMessage = error.message || errorMessage;
      }
      setErrors({ submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bff747]"></div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-[#bff747]">Website not found</h3>
        <button
          onClick={() => navigate('/advertiser/browse')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[#0c0c0c] bg-[#bff747] hover:bg-[#a8e035]"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Browse
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/advertiser/browse')}
            className="flex items-center text-gray-400 hover:text-[#bff747] mb-2"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Browse
          </button>
          <h1 className="text-2xl font-bold text-[#bff747]">Place Order</h1>
          <p className="text-gray-400">Create a guest post order for {website.domain}</p>
        </div>
        
        {/* Wallet Balance */}
        <div className="text-right">
          <p className="text-sm text-gray-400">Wallet Balance</p>
          <p className={`text-lg font-semibold ${
            walletBalance < pricing.totalPrice ? 'text-red-400' : 'text-green-400'
          }`}>
            {formatPrice(walletBalance)}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-[#1a1a1a] rounded-lg shadow p-6 border border-[#bff747]/30">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 1 ? 'bg-[#bff747] text-[#0c0c0c]' : 'bg-[#2a2a2a] text-gray-400'
            }`}>
              1
            </div>
            <span className={`text-sm font-medium ${
              currentStep >= 1 ? 'text-[#bff747]' : 'text-gray-400'
            }`}>
              Order Details
            </span>
          </div>
          
          <div className="flex-1 h-1 mx-4 bg-[#2a2a2a]">
            <div className={`h-full bg-[#bff747] transition-all duration-300 ${
              currentStep >= 2 ? 'w-full' : 'w-0'
            }`}></div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 2 ? 'bg-[#bff747] text-[#0c0c0c]' : 'bg-[#2a2a2a] text-gray-400'
            }`}>
              2
            </div>
            <span className={`text-sm font-medium ${
              currentStep >= 2 ? 'text-[#bff747]' : 'text-gray-400'
            }`}>
              Content Brief
            </span>
          </div>
          
          <div className="flex-1 h-1 mx-4 bg-[#2a2a2a]">
            <div className={`h-full bg-[#bff747] transition-all duration-300 ${
              currentStep >= 3 ? 'w-full' : 'w-0'
            }`}></div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 3 ? 'bg-[#bff747] text-[#0c0c0c]' : 'bg-[#2a2a2a] text-gray-400'
            }`}>
              3
            </div>
            <span className={`text-sm font-medium ${
              currentStep >= 3 ? 'text-[#bff747]' : 'text-gray-400'
            }`}>
              Review & Pay
            </span>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <OrderDetailsStep
            orderData={orderData}
            website={website}
            errors={errors}
            onInputChange={handleInputChange}
            onKeywordChange={handleKeywordChange}
            addKeyword={addKeyword}
            removeKeyword={removeKeyword}
          />
        )}

        {currentStep === 2 && (
          <ContentBriefStep
            orderData={orderData}
            website={website}
            errors={errors}
            onInputChange={handleInputChange}
          />
        )}

        {currentStep === 3 && (
          <ReviewStep
            orderData={orderData}
            website={website}
            pricing={pricing}
            walletBalance={walletBalance}
            errors={errors}
            formatPrice={formatPrice}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-[#bff747]/30">
          <button
            onClick={previousStep}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-[#bff747]/30 text-[#bff747] rounded-md hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep < 3 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-[#bff747] text-[#0c0c0c] rounded-md hover:bg-[#a8e035]"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submitOrder}
              disabled={submitting || pricing.totalPrice > walletBalance}
              className="px-6 py-2 bg-green-900/30 text-green-400 rounded-md hover:bg-green-900/50 border border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating Order...' : 'Place Order'}
            </button>
          )}
        </div>

        {errors.submit && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500/30 rounded-md">
            <p className="text-red-400 text-sm">{errors.submit}</p>
          </div>
        )}
      </div>

      {/* Pricing Sidebar */}
      <div className="bg-[#1a1a1a] rounded-lg shadow p-6 sticky top-6 border border-[#bff747]/30">
        <h3 className="text-lg font-medium text-[#bff747] mb-4">Order Summary</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Publishing Fee</span>
            <span className="font-medium text-[#bff747]">{formatPrice(pricing.basePrice)}</span>
          </div>
          
          {orderData.needsWriting && (
            <div className="flex justify-between">
              <span className="text-gray-400">Content Writing</span>
              <span className="font-medium text-[#bff747]">{formatPrice(pricing.writingPrice)}</span>
            </div>
          )}
          
          {pricing.urgencyFee > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Urgency Fee</span>
              <span className="font-medium text-[#bff747]">{formatPrice(pricing.urgencyFee)}</span>
            </div>
          )}
          
          <div className="border-t border-[#bff747]/30 pt-3">
            <div className="flex justify-between">
              <span className="text-lg font-medium text-[#bff747]">Total</span>
              <span className="text-lg font-bold text-[#bff747]">
                {formatPrice(pricing.totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {pricing.totalPrice > walletBalance && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded-md">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-400 text-sm">Insufficient balance</p>
            </div>
            <button
              onClick={() => navigate('/advertiser/wallet')}
              className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
            >
              Add funds to wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Step Components
const OrderDetailsStep = ({ 
  orderData, 
  website, 
  errors, 
  onInputChange, 
  onKeywordChange, 
  addKeyword, 
  removeKeyword 
}) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-[#bff747] mb-4">Order Details</h3>
      
      {/* Content Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Content Type</label>
        <select
          value={orderData.contentType}
          onChange={(e) => onInputChange('contentType', e.target.value)}
          className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747]"
        >
          <option value="article" className="bg-[#0c0c0c]">Article</option>
          <option value="review" className="bg-[#0c0c0c]">Review</option>
          <option value="interview" className="bg-[#0c0c0c]">Interview</option>
          <option value="news" className="bg-[#0c0c0c]">News</option>
          <option value="tutorial" className="bg-[#0c0c0c]">Tutorial</option>
        </select>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Article Title *
        </label>
        <input
          type="text"
          value={orderData.title}
          onChange={(e) => onInputChange('title', e.target.value)}
          className={`w-full border rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500 ${
            errors.title ? 'border-red-500' : 'border-[#bff747]/30'
          }`}
          placeholder="Enter the title for your guest post"
        />
        {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Word Count */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Word Count</label>
        <select
          value={orderData.wordCount}
          onChange={(e) => onInputChange('wordCount', parseInt(e.target.value))}
          className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747]"
        >
          <option value={500} className="bg-[#0c0c0c]">500 words</option>
          <option value={800} className="bg-[#0c0c0c]">800 words</option>
          <option value={1000} className="bg-[#0c0c0c]">1000 words</option>
          <option value={1500} className="bg-[#0c0c0c]">1500 words</option>
          <option value={2000} className="bg-[#0c0c0c]">2000 words</option>
        </select>
      </div>

      {/* Target URL */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Target URL *
        </label>
        <input
          type="url"
          value={orderData.targetUrl}
          onChange={(e) => onInputChange('targetUrl', e.target.value)}
          className={`w-full border rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500 ${
            errors.targetUrl ? 'border-red-500' : 'border-[#bff747]/30'
          }`}
          placeholder="https://your-website.com/target-page"
        />
        {errors.targetUrl && <p className="text-red-400 text-sm mt-1">{errors.targetUrl}</p>}
      </div>

      {/* Anchor Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Anchor Text *
        </label>
        <input
          type="text"
          value={orderData.anchorText}
          onChange={(e) => onInputChange('anchorText', e.target.value)}
          className={`w-full border rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500 ${
            errors.anchorText ? 'border-red-500' : 'border-[#bff747]/30'
          }`}
          placeholder="Text that will be linked to your URL"
        />
        {errors.anchorText && <p className="text-red-400 text-sm mt-1">{errors.anchorText}</p>}
      </div>

      {/* Keywords */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Keywords * (Max 10)
        </label>
        {orderData.keywords.map((keyword, index) => (
          <div key={index} className="flex mb-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => onKeywordChange(index, e.target.value)}
              className="flex-1 border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
              placeholder={`Keyword ${index + 1}`}
            />
            {orderData.keywords.length > 1 && (
              <button
                type="button"
                onClick={() => removeKeyword(index)}
                className="ml-2 px-3 py-2 text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {orderData.keywords.length < 10 && (
          <button
            type="button"
            onClick={addKeyword}
            className="text-[#bff747] hover:text-[#a8e035] text-sm"
          >
            + Add Keyword
          </button>
        )}
        {errors.keywords && <p className="text-red-400 text-sm mt-1">{errors.keywords}</p>}
      </div>
    </div>
  </div>
);

const ContentBriefStep = ({ orderData, website, errors, onInputChange }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-[#bff747] mb-4">Content Brief</h3>
      
      {/* Content Brief */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Content Brief *
        </label>
        <textarea
          value={orderData.contentBrief}
          onChange={(e) => onInputChange('contentBrief', e.target.value)}
          rows={6}
          className={`w-full border rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500 ${
            errors.contentBrief ? 'border-red-500' : 'border-[#bff747]/30'
          }`}
          placeholder="Describe what you want the article to be about, key points to cover, tone, style, etc."
        />
        {errors.contentBrief && <p className="text-red-400 text-sm mt-1">{errors.contentBrief}</p>}
      </div>

      {/* Special Instructions */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Special Instructions
        </label>
        <textarea
          value={orderData.specialInstructions}
          onChange={(e) => onInputChange('specialInstructions', e.target.value)}
          rows={3}
          className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] placeholder-gray-500"
          placeholder="Any special requirements, formatting preferences, or additional notes"
        />
      </div>

      {/* Deadline */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Deadline *
        </label>
        <input
          type="date"
          value={orderData.deadline}
          onChange={(e) => onInputChange('deadline', e.target.value)}
          min={new Date(Date.now() + (website?.turnaroundTime || 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          className={`w-full border rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747] ${
            errors.deadline ? 'border-red-500' : 'border-[#bff747]/30'
          }`}
        />
        {errors.deadline && <p className="text-red-400 text-sm mt-1">{errors.deadline}</p>}
      </div>

      {/* Urgency */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Urgency</label>
        <select
          value={orderData.urgency}
          onChange={(e) => onInputChange('urgency', e.target.value)}
          className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747]"
        >
          <option value="normal" className="bg-[#0c0c0c]">Normal (No extra fee)</option>
          <option value="rush" className="bg-[#0c0c0c]">Rush (+50% fee)</option>
          <option value="express" className="bg-[#0c0c0c]">Express (+100% fee)</option>
        </select>
      </div>

      {/* Need Writing */}
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={orderData.needsWriting}
            onChange={(e) => onInputChange('needsWriting', e.target.checked)}
            className="h-4 w-4 text-[#bff747] focus:ring-[#bff747] border-[#bff747]/30 rounded bg-[#0c0c0c]"
          />
          <span className="ml-2 text-sm text-gray-300">
            I need content writing service (+${website?.copywritingPrice || 0})
          </span>
        </label>
      </div>
    </div>
  </div>
);

const ReviewStep = ({ orderData, website, pricing, walletBalance, errors, formatPrice }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-[#bff747] mb-4">Review Your Order</h3>
      
      <div className="bg-[#2a2a2a] rounded-lg p-6 space-y-4 border border-[#bff747]/20">
        <div>
          <h4 className="font-medium text-[#bff747]">Website</h4>
          <p className="text-gray-300">{website.domain}</p>
        </div>

        <div>
          <h4 className="font-medium text-[#bff747]">Content Details</h4>
          <div className="text-gray-300 space-y-1">
            <p>Type: {orderData.contentType}</p>
            <p>Title: {orderData.title}</p>
            <p>Word Count: {orderData.wordCount}</p>
            <p>Target URL: {orderData.targetUrl}</p>
            <p>Anchor Text: {orderData.anchorText}</p>
            <p>Keywords: {orderData.keywords.filter(k => k.trim()).join(', ')}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-[#bff747]">Timeline</h4>
          <p className="text-gray-300">Deadline: {new Date(orderData.deadline).toLocaleDateString()}</p>
          <p className="text-gray-300">Urgency: {orderData.urgency}</p>
        </div>

        <div>
          <h4 className="font-medium text-[#bff747]">Pricing Breakdown</h4>
          <div className="text-gray-300 space-y-1">
            <div className="flex justify-between">
              <span>Publishing Fee</span>
              <span className="text-[#bff747]">{formatPrice(pricing.basePrice)}</span>
            </div>
            {orderData.needsWriting && (
              <div className="flex justify-between">
                <span>Content Writing</span>
                <span className="text-[#bff747]">{formatPrice(pricing.writingPrice)}</span>
              </div>
            )}
            {pricing.urgencyFee > 0 && (
              <div className="flex justify-between">
                <span>Urgency Fee</span>
                <span className="text-[#bff747]">{formatPrice(pricing.urgencyFee)}</span>
              </div>
            )}
            <div className="border-t border-[#bff747]/30 pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-[#bff747]">{formatPrice(pricing.totalPrice)}</span>
            </div>
          </div>
        </div>

        {errors.balance && (
          <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-md">
            <p className="text-red-400 text-sm">{errors.balance}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default OrderPlacement;