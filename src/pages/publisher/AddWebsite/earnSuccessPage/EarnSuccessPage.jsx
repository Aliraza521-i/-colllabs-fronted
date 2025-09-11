import React from 'react';
import sucbage from "../../../../assets/images/successIocn.svg"

const EarnSuccessPage = () => {
  return (
    <div className="min-h-screen bg-[#0c0c0c] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <div className="text-lg font-medium text-[#bff747] mb-2">Add your Website</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-[#bff747] mb-2">Confirm your Ownership</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-[#bff747] mb-2">Description and price</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-[#bff747] mb-2">Earn</div>
            </div>
          </div>
          
          <div className="relative">
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-[#bff747] z-10 relative" />
              <div className="flex-1 h-1 bg-[#bff747]" />
              <div className="w-5 h-5 rounded-full bg-[#bff747] z-10 relative" />
              <div className="flex-1 h-1 bg-[#bff747]" />
              <div className="w-5 h-5 rounded-full bg-[#bff747] z-10 relative" />
              <div className="flex-1 h-1 bg-[#bff747]" />
              <div className="w-5 h-5 rounded-full bg-[#bff747] z-10 relative" />
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="flex justify-center mb-8">
          <img 
            src={sucbage}
            alt="Success" 
            className="w-48 h-48 object-contain"
          />
        </div>

        {/* Success Message */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#bff747] mb-6">
            Great Job!
          </h1>
          <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Thank you for adding your website and completing the details. Your website is now under review, and our team will take action shortly. You will be notified once the review is complete.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EarnSuccessPage;