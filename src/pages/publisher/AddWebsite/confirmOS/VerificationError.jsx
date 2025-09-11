import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VerificationError = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse error message from query parameters
  const searchParams = new URLSearchParams(location.search);
  const errorMessage = searchParams.get('error') || 'An unknown error occurred during verification.';

  const tryAgain = () => {
    // Go back to the confirmation step
    window.history.back();
  };

  const goToDashboard = () => {
    navigate('/publisher');
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-6xl mb-6 text-red-500">❌</div>
        <h2 className="text-2xl font-bold text-red-400 mb-4">Verification Error</h2>
        <p className="text-gray-300 mb-8">
          {errorMessage}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={tryAgain}
            className="bg-[#bff747] text-[#0c0c0c] px-8 py-3 rounded-lg font-medium hover:bg-[#bff747]/80 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={goToDashboard}
            className="bg-gray-700 text-gray-300 px-8 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationError;