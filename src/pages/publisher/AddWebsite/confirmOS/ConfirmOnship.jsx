import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { websiteAPI, googleAuthAPI, handleApiError } from '../../../../services/api';

const ConfirmOnship = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { websiteUrl, originalUrl, websiteId, existed } = location.state || {};
  
  console.log('Received props in ConfirmOnship:', { websiteUrl, originalUrl, websiteId, existed });
  
  const [selectedMethod, setSelectedMethod] = useState('');
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('select'); // 'select', 'verify', 'success'
  const [websiteDetails, setWebsiteDetails] = useState(null);
  const [anotherMethodReason, setAnotherMethodReason] = useState('');

  useEffect(() => {
    if (!websiteUrl) {
      console.log('No websiteUrl found, redirecting to addweb');
      navigate('/publisher/addweb');
    }
    
    // Fetch website details to check which verification methods are disabled
    if (websiteId) {
      console.log('Fetching website details for ID:', websiteId);
      fetchWebsiteDetails(websiteId);
    }
  }, [websiteUrl, websiteId, navigate]);

  const fetchWebsiteDetails = async (id) => {
    try {
      const response = await websiteAPI.getWebsite(id);
      console.log('Website details response:', response);
      if (response.ok) {
        setWebsiteDetails(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch website details:', err);
    }
  };

  // Filter verification methods based on website details
  const getAvailableVerificationMethods = () => {
    if (!websiteDetails) {
      // If we don't have website details yet, show all methods
      return [
        {
          id: 'google_analytics',
          title: 'Google Analytics',
          description: 'Verify ownership through your Google Analytics account',
          icon: '📊',
          requirements: 'Requires Google Analytics to be installed on your website',
          disabled: false
        },
        {
          id: 'google_search_console',
          title: 'Google Search Console',
          description: 'Verify ownership through Google Search Console',
          icon: '🔍',
          requirements: 'Requires your website to be added to Google Search Console',
          disabled: false
        },
        {
          id: 'html_file',
          title: 'HTML File Upload',
          description: 'Upload a verification file to your website root directory',
          icon: '📄',
          requirements: 'Requires FTP/SFTP access to upload files to your website',
          disabled: false
        },
        {
          id: 'another_method',
          title: 'Another method',
          description: 'Alternative verification method',
          icon: '🤔',
          requirements: 'Contact support for more information',
          disabled: false
        }
      ];
    }

    // If website is approved (in advertiser section), disable all verification methods
    if (websiteDetails.status === 'approved') {
      return [
        {
          id: 'google_analytics',
          title: 'Google Analytics',
          description: 'Verify ownership through your Google Analytics account',
          icon: '📊',
          requirements: 'Requires Google Analytics to be installed on your website',
          disabled: true
        },
        {
          id: 'google_search_console',
          title: 'Google Search Console',
          description: 'Verify ownership through Google Search Console',
          icon: '🔍',
          requirements: 'Requires your website to be added to Google Search Console',
          disabled: true
        },
        {
          id: 'html_file',
          title: 'HTML File Upload',
          description: 'Upload a verification file to your website root directory',
          icon: '📄',
          requirements: 'Requires FTP/SFTP access to upload files to your website',
          disabled: true
        },
        {
          id: 'another_method',
          title: 'Another method',
          description: 'Alternative verification method',
          icon: '🤔',
          requirements: 'Contact support for more information',
          disabled: true
        }
      ];
    }

    // If website exists, check which methods are disabled
    const isExistingWebsite = existed || websiteDetails.verificationStatus !== 'pending';
    
    return [
      {
        id: 'google_analytics',
        title: 'Google Analytics',
        description: 'Verify ownership through your Google Analytics account',
        icon: '📊',
        requirements: 'Requires Google Analytics to be installed on your website',
        disabled: isExistingWebsite && websiteDetails.disableGoogleAnalytics
      },
      {
        id: 'google_search_console',
        title: 'Google Search Console',
        description: 'Verify ownership through Google Search Console',
        icon: '🔍',
        requirements: 'Requires your website to be added to Google Search Console',
        disabled: isExistingWebsite && websiteDetails.disableGoogleSearchConsole
      },
      {
        id: 'html_file',
        title: 'HTML File Upload',
        description: 'Upload a verification file to your website root directory',
        icon: '📄',
        requirements: 'Requires FTP/SFTP access to upload files to your website',
        disabled: isExistingWebsite && websiteDetails.disableHtmlFile
      },
      {
        id: 'another_method',
        title: 'Another method',
        description: 'Alternative verification method',
        icon: '🤔',
        requirements: 'Contact support for more information',
        disabled: false
      }
    ];
  };

  const handleMethodSelect = (methodId) => {
    // Check if the method is disabled
    const method = getAvailableVerificationMethods().find(m => m.id === methodId);
    if (method && method.disabled) {
      setError('This verification method has been disabled for this website.');
      return;
    }
    
    setSelectedMethod(methodId);
    setError('');
  };

  const startVerification = async () => {
    if (!selectedMethod) {
      setError('Please select a verification method');
      return;
    }

    // Check if the method is disabled
    const method = getAvailableVerificationMethods().find(m => m.id === selectedMethod);
    if (method && method.disabled) {
      setError('This verification method has been disabled for this website.');
      return;
    }

    // If "Another method" is selected, go directly to the reason input screen
    if (selectedMethod === 'another_method') {
      setStep('verify');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // If we don't have a websiteId from the previous step, create a basic website entry
      let finalWebsiteId = websiteId;
      
      if (!finalWebsiteId) {
        const websiteData = {
          domain: websiteUrl,
          siteDescription: 'Pending verification',
          advertisingRequirements: 'Standard requirements',
          publishingSections: 'General content',
          category: 'General',
          keywords: [],
          country: 'US',
          mainLanguage: 'English',
          publishingPrice: 100,
          copywritingPrice: 50,
          linkType: 'dofollow',
          numberOfLinks: 1
        };

        console.log('Creating website with data:', websiteData);

        const websiteResponse = await websiteAPI.addWebsite(websiteData);
        
        console.log('Website creation response:', websiteResponse);
        
        // Handle both axios response structure and API response structure
        const apiResponse = websiteResponse.data || websiteResponse;
        
        if (!(apiResponse.ok || apiResponse.success)) {
          throw new Error(apiResponse.message || 'Failed to create website entry');
        }

        // Extract website ID from response (handle different response structures)
        if (apiResponse.data && apiResponse.data._id) {
          // Standard structure: { ok: true, data: { _id, ... } }
          finalWebsiteId = apiResponse.data._id;
        } else if (apiResponse._id) {
          // Direct website object: { ok: true, _id, ... }
          finalWebsiteId = apiResponse._id;
        } else {
          throw new Error('Failed to extract website ID from response');
        }
        
        console.log('Using website ID:', finalWebsiteId);
      }

      // Initiate verification process
      console.log('Initiating verification for website ID:', finalWebsiteId);
      const verificationResponse = await websiteAPI.initiateVerification(finalWebsiteId, {
        verificationMethod: selectedMethod
      });

      console.log('Verification response:', verificationResponse);
      
      // Handle verification response
      const verificationData = verificationResponse.data || verificationResponse;
      
      if (!(verificationData.ok || verificationData.success)) {
        throw new Error(verificationData.message || 'Failed to initiate verification');
      }

      setVerificationData(verificationData.data || verificationData);
      setStep('verify');

      // If it's a Google method, redirect to OAuth
      const responseData = verificationData.data || verificationData;
      if (selectedMethod.startsWith('google_') && responseData.authRequired) {
        window.location.href = responseData.googleAuthUrl;
      }

    } catch (err) {
      setError(handleApiError(err));
      console.error('Verification initiation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadVerificationFile = () => {
    if (!verificationData?.fileContent) return;

    const blob = new Blob([verificationData.fileContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = verificationData.fileName || 'verification.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const verifyHtmlFile = async () => {
    if (!websiteId || !verificationData?.verificationCode) {
      setError('Missing verification data');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await websiteAPI.verifyWebsite(websiteId, {
        googleTokens: null // Not needed for HTML verification
      });

      if (response.ok) {
        // Check if ownership was transferred
        if (response.data.ownershipTransferred) {
          // Show a special message for ownership transfer
          setStep('ownershipTransferred');
        } else {
          setStep('success');
        }
      } else {
        setError(response.message || 'Verification failed');
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const continueToNextStep = () => {
    const finalWebsiteId = websiteId || (websiteDetails ? websiteDetails._id : null);
    
    // Store websiteId in localStorage as fallback
    if (finalWebsiteId) {
      localStorage.setItem('currentWebsiteId', finalWebsiteId);
    }
    
    navigate('/publisher/DescriptionPrice', {
      state: {
        websiteId: finalWebsiteId,
        websiteUrl,
        verificationCompleted: true
      }
    });
  };

  const renderSelectMethod = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#bff747] mb-3 sm:mb-4">Confirm Website Ownership</h2>
        <p className="text-gray-300 text-sm sm:text-base">Choose a method to verify that you own: <strong className="text-[#bff747] break-all">{websiteUrl}</strong></p>
        {existed && websiteDetails && websiteDetails.status === 'approved' ? (
          <p className="text-red-400 mt-2 text-sm">Note: This website is already approved and in the advertiser section. All verification methods are disabled.</p>
        ) : existed ? (
          <p className="text-orange-400 mt-2 text-sm">Note: This website already exists in our database. Some verification methods may be disabled.</p>
        ) : null}
      </div>

      {websiteDetails && websiteDetails.status === 'approved' ? (
        <div className="text-center mb-6 sm:mb-8">
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Website Already Approved</h3>
            <p className="text-red-300 text-sm sm:text-base">
              This website is already approved and in the advertiser section. 
              All verification methods have been disabled. 
              You can continue to the next step to manage your website details.
            </p>
            <button
              onClick={continueToNextStep}
              className="mt-4 bg-[#bff747] text-[#0c0c0c] px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-[#bff747]/80 transition-colors text-sm sm:text-base"
            >
              Continue to Website Details
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {getAvailableVerificationMethods().map((method) => (
            <div
              key={method.id}
              onClick={() => !method.disabled && handleMethodSelect(method.id)}
              className={`cursor-pointer p-4 sm:p-6 rounded-lg border-2 transition-all hover:shadow-lg ${
                method.disabled 
                  ? 'opacity-50 cursor-not-allowed bg-[#0c0c0c] border-[#bff747]/10' 
                  : selectedMethod === method.id
                    ? 'border-[#bff747] bg-[#0c0c0c]'
                    : 'border-[#bff747]/30 hover:border-[#bff747] bg-[#0c0c0c]'
              }`}
            >
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 text-center">{method.icon}</div>
              <h3 className="text-base sm:text-lg font-semibold text-[#bff747] mb-2">{method.title}</h3>
              <p className="text-gray-300 text-xs sm:text-sm mb-2">{method.description}</p>
              <p className="text-xs text-gray-400">{method.requirements}</p>
              {method.disabled && (
                <div className="mt-2 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-500/30">
                    Disabled
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 sm:mb-6 text-red-400 text-sm bg-red-900/30 border border-red-500/30 rounded px-3 sm:px-4 py-2 sm:py-3">
          {error}
        </div>
      )}

      {!websiteDetails || websiteDetails.status !== 'approved' ? (
        <div className="text-center">
          <button
            onClick={startVerification}
            disabled={!selectedMethod || loading}
            className={`px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium transition-colors w-full sm:w-auto max-w-xs mx-auto block text-sm sm:text-base ${
              !selectedMethod || loading
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-[#bff747] hover:bg-[#bff747]/80 text-[#0c0c0c]'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2 justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0c0c0c]"></div>
                <span>Starting Verification...</span>
              </div>
            ) : (
              'Start Verification'
            )}
          </button>
        </div>
      ) : null}
    </div>
  );

  const renderVerifyStep = () => {
    if (selectedMethod === 'html_file') {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#bff747] mb-3 sm:mb-4">HTML File Verification</h2>
            <p className="text-gray-300 text-sm sm:text-base">Follow these steps to verify your website ownership:</p>
          </div>

          <div className="bg-[#0c0c0c] rounded-lg border border-[#bff747]/30 p-4 sm:p-6 mb-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-[#bff747] text-[#0c0c0c] rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-[#bff747] mb-2">Download the verification file</h3>
                  <p className="text-gray-300 text-xs sm:text-sm mb-3">Click the button below to download the HTML verification file.</p>
                  <button
                    onClick={downloadVerificationFile}
                    className="bg-[#bff747] text-[#0c0c0c] px-3 sm:px-4 py-2 rounded text-sm hover:bg-[#bff747]/80 transition-colors font-medium"
                  >
                    Download {verificationData?.fileName || 'verification.html'}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-[#bff747] text-[#0c0c0c] rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-[#bff747] mb-2">Upload to your website</h3>
                  <p className="text-gray-300 text-xs sm:text-sm">Upload the file to your website's root directory so it's accessible at:</p>
                  <div className="bg-[#0c0c0c] border border-[#bff747]/30 p-2 rounded mt-2 font-mono text-xs sm:text-sm break-all text-[#bff747]">
                    {originalUrl}/{verificationData?.fileName || 'verification.html'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-[#bff747] text-[#0c0c0c] rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-[#bff747] mb-2">Verify the file</h3>
                  <p className="text-gray-300 text-xs sm:text-sm mb-3">Once uploaded, click the verify button below.</p>
                  <button
                    onClick={verifyHtmlFile}
                    disabled={loading}
                    className={`px-4 sm:px-6 py-2 rounded font-medium transition-colors text-sm ${
                      loading
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {loading ? 'Verifying...' : 'Verify File'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/30 border border-red-500/30 rounded px-4 py-3">
              {error}
            </div>
          )}
        </div>
      );
    }

    if (selectedMethod === 'another_method') {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#bff747] mb-3 sm:mb-4">Alternative Verification Method</h2>
            <p className="text-gray-300 text-sm sm:text-base">Please provide a reason why you need to use an alternative verification method:</p>
          </div>

          <div className="bg-[#0c0c0c] rounded-lg border border-[#bff747]/30 p-4 sm:p-6 mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-[#bff747] mb-2">Reason for alternative verification</h3>
                <textarea
                  value={anotherMethodReason}
                  onChange={(e) => setAnotherMethodReason(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#bff747]/30 rounded-lg focus:border-[#bff747] focus:outline-none resize-none h-24 sm:h-32 bg-[#0c0c0c] text-[#bff747]"
                  placeholder="Please explain why you need to use an alternative verification method..."
                />
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={async () => {
                    if (!anotherMethodReason.trim()) {
                      setError('Please provide a reason for using an alternative verification method');
                      return;
                    }
                    
                    setLoading(true);
                    setError('');
                    
                    try {
                      // For "another_method", we need to:
                      // 1. Initiate verification first to set the method
                      // 2. Then verify the website to move it to "submitted" status
                      
                      // First, initiate verification
                      const initiateResponse = await websiteAPI.initiateVerification(websiteId, {
                        verificationMethod: 'another_method'
                      });
                      
                      if (!initiateResponse.ok) {
                        throw new Error(initiateResponse.message || 'Failed to initiate verification');
                      }
                      
                      // Then, verify the website with the "another_method"
                      const response = await websiteAPI.verifyWebsite(websiteId, {
                        googleTokens: null // Not needed for another method
                      });
                      
                      if (response.ok) {
                        setStep('success');
                      } else {
                        setError(response.message || 'Verification failed');
                      }
                    } catch (err) {
                      setError(handleApiError(err));
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className={`px-4 sm:px-6 py-2 rounded font-medium transition-colors text-sm ${
                    loading || !anotherMethodReason.trim()
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-[#bff747] hover:bg-[#bff747]/80 text-[#0c0c0c]'
                  }`}
                >
                  {loading ? 'Processing...' : 'Submit and Continue'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/30 border border-red-500/30 rounded px-4 py-3">
              {error}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-[#bff747] mb-3 sm:mb-4">Google Verification in Progress</h2>
        <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
          You should have been redirected to Google for authentication. 
          If not, please close this page and try again.
        </p>
        <p className="text-gray-400 text-xs sm:text-sm">
          After completing the Google authentication, you'll be redirected back to continue the verification process.
        </p>
      </div>
    );
  };

  const renderSuccess = () => (
    <div className="max-w-2xl mx-auto text-center">
      <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 text-[#bff747]">✅</div>
      <h2 className="text-xl sm:text-2xl font-bold text-green-400 mb-3 sm:mb-4">Verification Successful!</h2>
      <p className="text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base">
        Your ownership of <strong className="text-[#bff747] break-all">{websiteUrl}</strong> has been verified successfully.
        Your website is now awaiting moderation by our team. You'll be notified once it's approved.
      </p>
      {selectedMethod === 'another_method' && anotherMethodReason && (
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8 text-left">
          <h3 className="font-semibold text-blue-400 mb-2">Your Alternative Verification Reason:</h3>
          <p className="text-blue-300 text-sm">{anotherMethodReason}</p>
        </div>
      )}
      <button
        onClick={continueToNextStep}
        className="bg-[#bff747] text-[#0c0c0c] px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium hover:bg-[#bff747]/80 transition-colors text-sm sm:text-base"
      >
        Continue to Website Details
      </button>
    </div>
  );

  const renderOwnershipTransferred = () => (
    <div className="max-w-2xl mx-auto text-center">
      <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 text-[#bff747]">🔄</div>
      <h2 className="text-xl sm:text-2xl font-bold text-green-400 mb-3 sm:mb-4">Ownership Transferred!</h2>
      <p className="text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base">
        The website <strong className="text-[#bff747] break-all">{websiteUrl}</strong> was already verified by another user, 
        but ownership has been successfully transferred to you.
        You can now proceed to set up your website details and pricing.
      </p>
      <button
        onClick={continueToNextStep}
        className="bg-[#bff747] text-[#0c0c0c] px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium hover:bg-[#bff747]/80 transition-colors text-sm sm:text-base"
      >
        Continue to Next Step
      </button>
    </div>
  );

  if (!websiteUrl) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-4 sm:p-6">
      {/* Progress Bar - Made responsive */}
      <div className="max-w-4xl mx-auto mb-8 sm:mb-16">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="text-center flex-1 min-w-[100px] mb-2 sm:mb-0">
            <div className={`text-base sm:text-lg font-medium mb-2 ${
              step === 'select' || step === 'verify' || step === 'success' || step === 'ownershipTransferred' ? 'text-green-400' : 'text-[#bff747]'
            }`}>
              Add your Website {step !== 'select' && '✓'}
            </div>
          </div>
          <div className="text-center flex-1 min-w-[100px] mb-2 sm:mb-0">
            <div className={`text-base sm:text-lg font-medium mb-2 ${
              step === 'select' ? 'text-[#bff747]' : step === 'verify' || step === 'success' || step === 'ownershipTransferred' ? 'text-green-400' : 'text-gray-400'
            }`}>
              Confirm your Ownership {step !== 'select' && '✓'}
            </div>
          </div>
          <div className="text-center flex-1 min-w-[100px] mb-2 sm:mb-0">
            <div className={`text-base sm:text-lg font-medium mb-2 ${
              step === 'success' || step === 'ownershipTransferred' ? 'text-[#bff747]' : 'text-gray-400'
            }`}>
              Description and price
            </div>
          </div>
          <div className="text-center flex-1 min-w-[100px] mb-2 sm:mb-0">
            <div className="text-base sm:text-lg font-medium text-gray-400 mb-2">Earn</div>
          </div>
        </div>
        
        <div className="relative">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-green-500 z-10 relative" />
            <div className={`flex-1 h-1 ${
              step !== 'select' ? 'bg-green-500' : 'bg-gray-600'
            }`} />
            <div className={`w-5 h-5 rounded-full z-10 relative ${
              step !== 'select' ? 'bg-green-500' : 'bg-[#bff747]'
            }`} />
            <div className={`flex-1 h-1 ${
              step === 'success' || step === 'ownershipTransferred' ? 'bg-green-500' : 'bg-gray-600'
            }`} />
            <div className={`w-5 h-5 rounded-full z-10 relative ${
              step === 'success' || step === 'ownershipTransferred' ? 'bg-[#bff747]' : 'bg-gray-600'
            }`} />
            <div className="flex-1 h-1 bg-gray-600" />
            <div className="w-5 h-5 rounded-full bg-gray-600 z-10 relative" />
          </div>
        </div>
      </div>

      {/* Content based on step */}
      {step === 'select' && renderSelectMethod()}
      {step === 'verify' && renderVerifyStep()}
      {step === 'success' && renderSuccess()}
      {step === 'ownershipTransferred' && renderOwnershipTransferred()}
    </div>
  );
};

export default ConfirmOnship;