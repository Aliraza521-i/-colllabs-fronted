import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { websiteAPI, handleApiError } from '../../../services/api';

const Addwebsite = () => {
  const [activeTab, setActiveTab] = useState('requirements');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateUrl = (url) => {
    const urlPattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:[0-9]+)?(\/.*)?$/;
    return urlPattern.test(url);
  };

  const cleanUrl = (url) => {
    // Remove protocol and www, trailing slashes and ensure lowercase
    let cleaned = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').toLowerCase();
    // Remove any trailing slashes that might remain
    cleaned = cleaned.replace(/\/+$/, '');
    console.log('Original URL:', url, 'Cleaned URL:', cleaned);
    return cleaned;
  };

  const handleSubmit = async () => {
    if (!url) {
      setError('Please enter a website URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cleanedUrl = cleanUrl(url);
      
      // Always attempt to add the website, regardless of existence
      const addResponse = await websiteAPI.addWebsite({
        domain: cleanedUrl,
        status: 'draft',
        verificationStatus: 'pending',
        siteDescription: 'Pending description',
        category: 'General',
        country: 'US',
        mainLanguage: 'English',
        advertisingRequirements: 'Standard requirements',
        publishingSections: 'General content',
        publishingPrice: 100,
        copywritingPrice: 50
      });
      
      console.log('Full add response:', JSON.stringify(addResponse, null, 2));
      
      // Handle axios response structure (response.data contains the actual API response)
      // The axios response structure is: { data: { ok, message, data, existed, nextStep }, status, statusText, headers, config, request }
      const apiResponse = addResponse.data || addResponse;
      console.log('API Response:', JSON.stringify(apiResponse, null, 2));
      
      // Check if response is successful
      if (apiResponse && (apiResponse.ok === true || apiResponse.success === true)) {
        // Extract website data
        let websiteData, websiteId, existed;
        
        // Handle different response structures
        if (apiResponse.data) {
          // Standard structure: { ok: true, message: "...", data: { _id, ... }, existed: true }
          websiteData = apiResponse.data;
          websiteId = websiteData._id || websiteData.id;
          existed = apiResponse.existed !== undefined ? apiResponse.existed : false;
        } else if (apiResponse._id || apiResponse.id) {
          // Direct website object structure
          websiteData = apiResponse;
          websiteId = apiResponse._id || apiResponse.id;
          existed = apiResponse.existed !== undefined ? apiResponse.existed : true;
        }
        
        console.log('Extracted data - websiteId:', websiteId, 'existed:', existed);
        
        if (websiteId) {
          // Store websiteId in localStorage as fallback
          localStorage.setItem('currentWebsiteId', websiteId);
          
          // Website added or already exists, proceed to ownership confirmation
          navigate("/publisher/confirmOwnership", { 
            state: { 
              websiteUrl: cleanedUrl,  // This is the cleaned domain
              originalUrl: url,        // This is the original URL entered by user
              websiteId: websiteId,
              existed: existed
            } 
          });
        } else {
          // Could not extract website ID
          console.log('Could not extract website ID from response');
          setError("Failed to process website. Please try again.");
        }
      } else {
        // Handle error case
        const errorMessage = apiResponse?.message || apiResponse?.error || "Failed to process website. Please try again.";
        console.log('API Error:', errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Website add error:', err);
      // Log the full error response for debugging
      console.error('Full error response:', err.response);
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
            <div className="text-center flex-1 min-w-[120px] mb-2 sm:mb-0">
              <div className="text-lg font-medium text-[#bff747] mb-2">Add your Website</div>
            </div>
            <div className="text-center flex-1 min-w-[120px] mb-2 sm:mb-0">
              <div className="text-lg font-medium text-[#bff747] mb-2">Confirm your Ownership</div>
            </div>
            <div className="text-center flex-1 min-w-[120px] mb-2 sm:mb-0">
              <div className="text-lg font-medium text-[#bff747] mb-2">Description and price</div>
            </div>
            <div className="text-center flex-1 min-w-[120px] mb-2 sm:mb-0">
              <div className="text-lg font-medium text-[#bff747] mb-2">Earn</div>
            </div>
          </div>
          
          <div className="relative">
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-[#bff747] z-10 relative" />
              <div className="flex-1 h-1 bg-[#bff747]" />
              <div className="w-5 h-5 rounded-full bg-gray-600 z-10 relative" />
              <div className="flex-1 h-1 bg-gray-600" />
              <div className="w-5 h-5 rounded-full bg-gray-600 z-10 relative" />
              <div className="flex-1 h-1 bg-gray-600" />
              <div className="w-5 h-5 rounded-full bg-gray-600 z-10 relative" />
            </div>
          </div>
        </div>

        {/* URL Input Section - Improved mobile responsiveness */}
        <div className="text-center mb-8 sm:mb-12">
          <label className="block text-[#bff747] font-medium mb-4">
            URL to your Website
          </label>
          <div className="mb-4">
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(''); // Clear error when typing
              }}
              className={`w-full max-w-md mx-auto px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors bg-[#0c0c0c] text-[#bff747] border-[#bff747]/30 focus:border-[#bff747] ${
                error 
                  ? 'border-red-500 focus:border-red-500' 
                  : ''
              }`}
              placeholder="Enter your website URL (e.g., example.com)"
              disabled={loading}
            />
            {error && (
              <div className="mt-2 text-red-400 text-sm bg-red-900/30 border border-red-500/30 rounded px-3 py-2 max-w-md mx-auto">
                {error}
              </div>
            )}
          </div>
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading || !url}
              className={`px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto max-w-xs mx-auto block ${
                loading || !url
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-[#bff747] hover:bg-[#bff747]/80 text-[#0c0c0c]'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2 justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0c0c0c]"></div>
                  <span>Checking...</span>
                </div>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </div>

        {/* Information Section - Improved mobile responsiveness */}
        <div className="bg-[#0c0c0c] rounded-lg p-4 sm:p-8 border border-[#bff747]/30">
          <h2 className="text-xl font-medium text-[#bff747] mb-6 sm:mb-8 text-center">
            Information for website owners
          </h2>

          {/* Tab Buttons - Made responsive */}
          <div className="flex justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
            <button
              onClick={() => setActiveTab('requirements')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                activeTab === 'requirements'
                  ? 'bg-[#bff747] text-[#0c0c0c]'
                  : 'bg-[#0c0c0c] text-[#bff747] border border-[#bff747]/30 hover:bg-[#bff747]/10'
              }`}
            >
              Requirements for websites
            </button>
            <button
              onClick={() => setActiveTab('benefits')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                activeTab === 'benefits'
                  ? 'bg-[#bff747] text-[#0c0c0c]'
                  : 'bg-[#0c0c0c] text-[#bff747] border border-[#bff747]/30 hover:bg-[#bff747]/10'
              }`}
            >
              Contlink Benefits
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'requirements' && (
            <div className="text-gray-300 space-y-4 sm:space-y-6">
              <p className="text-sm sm:text-base">Website traffic is the primary criterion for moderation.</p>
              <p className="text-sm sm:text-base">If your website has a genuine audience, we'd be happy to welcome it to our platform.</p>
              <p className="text-sm sm:text-base">Websites can be added by their owners or official representatives.</p>
              <p className="text-sm sm:text-base">Detailed instructions for verifying ownership are provided in the 'Verify Rights' step.</p>
              <div className="mt-6 sm:mt-8">
                <p className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">
                  When moderating submissions, we consider additional factors, including:
                </p>
                <ul className="space-y-2 ml-4 sm:ml-6 list-disc text-sm sm:text-base">
                  <li>Authority and trustworthiness</li>
                  <li>Niche relevance</li>
                  <li>Audience engagement</li>
                  <li>Design quality</li>
                  <li>Content structure and layout</li>
                  <li>Security measures</li>
                  <li>And more</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'benefits' && (
            <div className="text-gray-300 space-y-4 sm:space-y-6">
              <p className="text-sm sm:text-base">
                Joining Contlink provides numerous benefits for website owners looking to monetize their traffic and connect with quality advertisers.
              </p>
              <p className="text-sm sm:text-base">
                Our platform offers competitive rates, reliable payments, and comprehensive analytics to help you maximize your earning potential.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Addwebsite;