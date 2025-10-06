import React from 'react';

const TableSettingsModal = ({ 
  showTableSettings, 
  setShowTableSettings, 
  tableSettings, 
  handleTableSettingsChange, 
  saveTableSettings, 
  resetTableSettings 
}) => {
  if (!showTableSettings) {
    return null;
  }

  // Handle backdrop click to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowTableSettings(false);
    }
  };

  // Prevent modal closing when clicking inside
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setShowTableSettings(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto  flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-[#1a1a1a] rounded-lg shadow-xl border border-[#bff747]/30 w-full max-w-md"
        onClick={handleModalClick}
      >
        {/* Modal header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#bff747]/30">
          <h3 className="text-lg font-medium text-[#bff747]">
            Table Settings
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-[#bff747] transition-colors focus:outline-none focus:ring-2 focus:ring-[#bff747]/50 rounded-full p-1"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal body */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-400 mb-4">
            Select which columns to display in the website table
          </p>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {Object.entries({
              domain: 'Domain/URL',
              categories: 'Categories',
              country: 'Country',
              language: 'Language',
              price: 'Price',
              da: 'Domain Authority (DA)',
              dr: 'Domain Rating (DR)',
              ahrefsTraffic: 'Ahrefs Traffic',
              semrushTraffic: 'SEMrush Traffic',
              sensitiveCategories: 'Sensitive Categories',
              linkType: 'Link Type',
              actions: 'Actions'
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between py-2">
                <label 
                  className="text-sm text-gray-300 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {label}
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id={`toggle-${key}`}
                    checked={tableSettings[key]}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleTableSettingsChange(key)(e);
                    }}
                    className="sr-only"
                  />
                  <label
                    htmlFor={`toggle-${key}`}
                    className={`block h-6 w-10 rounded-full cursor-pointer transition-colors ${
                      tableSettings[key] 
                        ? 'bg-[#bff747]' 
                        : 'bg-gray-600'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span
                      className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        tableSettings[key] 
                          ? 'transform translate-x-4' 
                          : ''
                      }`}
                    ></span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Modal footer */}
        <div className="bg-[#252525] px-6 py-4 flex flex-col sm:flex-row-reverse gap-3 border-t border-[#bff747]/30">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              saveTableSettings();
            }}
            className="w-full sm:w-auto px-4 py-2 bg-[#bff747] text-[#0c0c0c] font-medium rounded-md hover:bg-[#a8e035] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bff747]/50 focus:ring-offset-[#1a1a1a]"
          >
            Save
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              resetTableSettings();
            }}
            className="w-full sm:w-auto px-4 py-2 bg-[#0c0c0c] text-[#bff747] font-medium rounded-md border border-[#bff747]/30 hover:bg-[#2a2a2a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#bff747]/50"
          >
            Reset to Default
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-4 py-2 bg-[#0c0c0c] text-gray-300 font-medium rounded-md border border-gray-600 hover:bg-[#2a2a2a] transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableSettingsModal;