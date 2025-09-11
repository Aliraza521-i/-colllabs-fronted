import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { websiteAPI, googleAuthAPI, handleApiError } from '../../../../services/api';

const VerificationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyWithTokens = async () => {
      // Parse query parameters
      const searchParams = new URLSearchParams(location.search);
      const websiteId = searchParams.get('websiteId');
      const method = searchParams.get('method');
      const tokensStr = searchParams.get('tokens');

      console.log('Verification parameters:', { websiteId, method, tokensStr });

      if (!websiteId || !method || !tokensStr) {
        setError('Missing verification parameters. Please try again.');
        setLoading(false);
        return;
      }

      try {
        // Parse tokens
        const tokens = JSON.parse(decodeURIComponent(tokensStr));
        console.log('Parsed tokens:', tokens);

        // Verify with Google tokens
        const response = await googleAuthAPI.verifyWithTokens(websiteId, {
          tokens,
          method
        });

        console.log('Full verification response:', response);
        
        // Handle axios response structure (response.data contains the actual API response)
        const apiResponse = response.data || response;
        console.log('API Response:', apiResponse);
        
        // Check for success in various possible response structures
        const isSuccess = apiResponse.ok === true || 
                         apiResponse.success === true || 
                         apiResponse.verified === true;

        if (isSuccess) {
          console.log('✅ Verification successful');
          setSuccess(true);
        } else {
          // Provide more detailed error message
          let errorMessage = apiResponse.message || apiResponse.error || 'Verification failed';
          
          // Add specific guidance based on the error
          if (errorMessage.includes('Google Analytics properties')) {
            errorMessage += ' Please make sure your website is properly set up in Google Analytics with the exact domain name you entered.';
          } else if (errorMessage.includes('Search Console')) {
            errorMessage += ' Please make sure your website is verified in Google Search Console.';
          }
          
          setError(errorMessage);
        }
      } catch (err) {
        const errorMessage = handleApiError(err);
        setError(`Verification error: ${errorMessage}`);
        console.error('Verification error:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyWithTokens();
  }, [location.search]);

  const continueToNextStep = () => {
    // Parse query parameters to get websiteUrl
    const searchParams = new URLSearchParams(location.search);
    const websiteId = searchParams.get('websiteId');
    const websiteUrl = searchParams.get('websiteUrl') || 'your website';
    
    navigate('/publisher/DescriptionPrice', {
      state: {
        websiteId,
        websiteUrl,
        verificationCompleted: true
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bff747] mx-auto mb-4"></div>
          <p className="text-gray-300">Verifying website ownership...</p>
          <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6 text-red-500">❌</div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Verification Failed</h2>
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
            <p className="text-gray-200 mb-3">
              <strong>Error Details:</strong>
            </p>
            <p className="text-gray-300 mb-4">
              {error}
            </p>
            <div className="text-sm text-gray-400">
              <p className="mb-1"><strong>Troubleshooting Tips:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                {error.includes('API has not been used') ? (
                  <>
                    <li className="text-red-400 font-medium">You need to enable the required Google APIs in your Google Cloud Console</li>
                    <li>Enable Google Analytics API: <a href="https://console.developers.google.com/apis/api/analytics.googleapis.com/overview?project=305901888028" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Enable Analytics API</a></li>
                    <li>Enable Google Search Console API: <a href="https://console.developers.google.com/apis/api/searchconsole.googleapis.com/overview?project=305901888028" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Enable Search Console API</a></li>
                    <li>Wait a few minutes after enabling for the changes to propagate</li>
                  </>
                ) : (
                  <>
                    <li>Make sure your website is properly set up in Google Analytics/Search Console</li>
                    <li>Check that the domain name matches exactly (including www or non-www)</li>
                    <li>Ensure you're using the Google account that has access to the property</li>
                    <li>Try refreshing your Google account and try again</li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="bg-[#bff747] text-[#0c0c0c] px-8 py-3 rounded-lg font-medium hover:bg-[#bff747]/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6 text-[#bff747]">✅</div>
          <h2 className="text-2xl font-bold text-green-400 mb-4">Verification Successful!</h2>
          <p className="text-gray-300 mb-8">
            Your website ownership has been verified successfully.
            You can now proceed to set up your website details and pricing.
          </p>
          <button
            onClick={continueToNextStep}
            className="bg-[#bff747] text-[#0c0c0c] px-8 py-3 rounded-lg font-medium hover:bg-[#bff747]/80 transition-colors"
          >
            Continue to Next Step
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default VerificationSuccess;