import React from 'react';
import { 
  GlobeAltIcon, 
  EyeIcon, 
  ShoppingCartIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';

const WebsiteList = ({ websites, tableSettings, formatPrice, formatNumber, renderRating }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = (website) => {
    // Create cart item object with proper fallbacks
    const cartItem = {
      id: website._id || Date.now().toString(),
      websiteId: website._id || Date.now().toString(),
      websiteName: website.domain || website.url || 'Unknown Website',
      websiteUrl: website.url || '#',
      advertisingRequirements: website.advertisingRequirements || 'Not specified',
      price: website.publishingPrice || 0,
      category: website.category || website.Category || "General",
      traffic: website.metrics?.ahrefsTraffic ? `${website.metrics.ahrefsTraffic.toLocaleString()}/month` : 'N/A',
      image: website.domain ? `https://logo.clearbit.com/${website.domain}` : 'https://placehold.co/100x100?text=No+Image'
    };
    
    // Add to cart
    addToCart(cartItem);
    
    // Show confirmation
    alert(`${cartItem.websiteName} added to cart!`);
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg shadow overflow-hidden border border-[#bff747]/30">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#bff747]/30">
          <thead className="bg-[#252525]">
            <tr>
              {tableSettings.domain && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider w-4/12">
                  Website
                </th>
              )}
              {tableSettings.categories && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider w-2/12">
                  Categories
                </th>
              )}
              {tableSettings.country && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider w-1/12">
                  Country
                </th>
              )}
              {tableSettings.language && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider w-1/12">
                  Language
                </th>
              )}
              {tableSettings.price && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider w-2/12">
                  Price
                </th>
              )}
              {tableSettings.da && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider w-1/12">
                  DA
                </th>
              )}
              {tableSettings.dr && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider w-1/12">
                  DR
                </th>
              )}
              {tableSettings.ahrefsTraffic && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider w-2/12">
                  Ahrefs Traffic
                </th>
              )}
              {tableSettings.semrushTraffic && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider w-2/12">
                  SEMrush Traffic
                </th>
              )}
              {tableSettings.sensitiveCategories && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider w-1/12">
                  Sensitive
                </th>
              )}
              {tableSettings.linkType && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#bff747] uppercase tracking-wider w-1/12">
                  Link Type
                </th>
              )}
              {tableSettings.actions && (
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-[#bff747] uppercase tracking-wider w-1/12">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-[#1a1a1a] divide-y divide-[#bff747]/20">
            {websites.map((website) => (
              <React.Fragment key={website._id}>
                <tr className="hover:bg-[#252525]">
                  {tableSettings.domain && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-[#bff747]/20 to-[#bff747]/5 rounded-lg flex items-center justify-center">
                          <GlobeAltIcon className="h-5 w-5 text-[#bff747]" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-[#bff747] truncate max-w-[150px]">{website.domain || website.url || 'Unknown Website'}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[150px]">{website.url || ''}</div>
                          {/* Ratings and order count below website URL */}
                          <div className="mt-1 flex items-center">
                            {renderRating(website.stats?.rating)}
                            <span className="text-xs text-gray-500 ml-2">
                              ({website.stats?.completedOrders || 0} orders)
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                  )}
                  {tableSettings.categories && (
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto scrollbar-hide">
                        {(() => {
                          // Handle different category formats
                          let categories = [];
                          if (website.allCategories && website.allCategories.length > 0) {
                            categories = website.allCategories;
                          } else if (website.category) {
                            // Split comma-separated categories
                            categories = website.category.includes(',') 
                              ? website.category.split(',').map(cat => cat.trim())
                              : [website.category];
                          } else {
                            categories = ["General"];
                          }
                          
                          // Show all categories but limit height
                          return categories.slice(0, 3).map((cat, index) => (
                            <span 
                              key={index} 
                              className="text-xs bg-[#bff747]/20 text-[#bff747] px-2 py-0.5 rounded-full capitalize whitespace-nowrap"
                            >
                              {cat}
                            </span>
                          ));
                        })()}
                      </div>
                    </td>
                  )}
                  {tableSettings.country && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-400">
                        {(website.country || website.Country || website.cntry || (website.metrics && website.metrics.country) || (website.metrics && website.metrics.Country)) ? (
                          <span className="bg-green-900/40 text-green-300 px-2 py-0.5 rounded-full border border-green-700/50 text-xs">
                            {website.country || website.Country || website.cntry || (website.metrics && website.metrics.country) || (website.metrics && website.metrics.Country)}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">N/A</span>
                        )}
                      </div>
                    </td>
                  )}
                  {tableSettings.language && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-400">
                        {(website.mainLanguage || website.language || website.Language || website.lang || (website.metrics && website.metrics.language) || (website.metrics && website.metrics.Language)) ? (
                          <span className="bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded-full border border-blue-700/50 text-xs">
                            {website.mainLanguage || website.language || website.Language || website.lang || (website.metrics && website.metrics.language) || (website.metrics && website.metrics.Language)}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">N/A</span>
                        )}
                      </div>
                    </td>
                  )}
                  {tableSettings.price && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-bold text-[#bff747]">
                        {formatPrice(website.publishingPrice || 0)}
                      </div>
                      {website.copywritingPrice > 0 && (
                        <div className="text-xs text-gray-500">
                          +{formatPrice(website.copywritingPrice)} writing
                        </div>
                      )}
                    </td>
                  )}
                  {tableSettings.da && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-bold text-[#bff747]">
                        {website.metrics?.domainAuthority || website.metrics?.da || 'N/A'}
                      </div>
                    </td>
                  )}
                  {tableSettings.dr && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-bold text-[#bff747]">
                        {website.metrics?.dr || 'N/A'}
                      </div>
                    </td>
                  )}
                  {tableSettings.ahrefsTraffic && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-[#bff747]">
                        {formatNumber(website.metrics?.ahrefsTraffic)}
                      </div>
                    </td>
                  )}
                  {tableSettings.semrushTraffic && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-[#bff747]">
                        {formatNumber(website.metrics?.semrushTraffic)}
                      </div>
                    </td>
                  )}
                  {tableSettings.sensitiveCategories && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-400">
                        {website.acceptedSensitiveCategories && website.acceptedSensitiveCategories.length > 0 ? (
                          <span className="bg-red-900/40 text-red-300 px-2 py-0.5 rounded-full border border-red-700/50 text-xs">
                            Yes
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">No</span>
                        )}
                      </div>
                    </td>
                  )}
                  {tableSettings.linkType && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-400">
                        <span className="bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded-full border border-purple-700/50 text-xs">
                          {website.linkType || 'dofollow'}
                        </span>
                      </div>
                    </td>
                  )}
                  {tableSettings.actions && (
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      {/* Stack action buttons vertically - View on top, Add below */}
                      <div className="flex flex-col items-end space-y-1 min-w-[80px]">
                        <button
                          onClick={() => navigate(`/advertiser/browse/${website._id}`)}
                          className="inline-flex items-center px-2 py-1 border border-[#bff747]/30 text-xs rounded-md text-[#bff747] bg-[#2a2a2a] hover:bg-[#3a3a3a] w-full justify-center"
                        >
                          <EyeIcon className="h-3 w-3 mr-1" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleAddToCart(website)}
                          className="inline-flex items-center px-2 py-1 border border-[#bff747]/30 text-xs rounded-md text-[#bff747] bg-[#1a1a1a] hover:bg-[#2a2a2a] w-full justify-center"
                        >
                          <ShoppingCartIcon className="h-3 w-3 mr-1" />
                          <span>Add</span>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
                {/* Show SEO metrics row only if any SEO metrics are enabled */}
                {(tableSettings.da || tableSettings.dr || tableSettings.ahrefsTraffic || tableSettings.semrushTraffic) && (
                  <tr className="bg-[#1a1a1a] hover:bg-[#252525]">
                    <td colSpan={Object.values(tableSettings).filter(Boolean).length} className="px-4 py-2">
                      <div className="flex flex-wrap gap-8 justify-center">
                        {/* DA Metric - Logo/Icon -> DA -> Value */}
                        {tableSettings.da && (
                          <div className="flex items-center bg-[#252525] rounded-md border border-[#bff747]/10 px-3 py-1.5 min-w-[120px] hover:border-[#bff747]/20 transition-all">
                            <ChartBarIcon className="h-4 w-4 text-[#bff747] mr-2" />
                            <div className="flex items-center">
                              <span className="text-xs text-gray-400 mr-2">DA:</span>
                              <span className="text-sm font-bold text-[#bff747]">
                                {website.metrics?.domainAuthority || website.metrics?.da || 'N/A'}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* DR Metric - Logo/Icon -> DR -> Value */}
                        {tableSettings.dr && (
                          <div className="flex items-center bg-[#252525] rounded-md border border-[#bff747]/10 px-3 py-1.5 min-w-[120px] hover:border-[#bff747]/20 transition-all">
                            <ChartBarIcon className="h-4 w-4 text-[#bff747] mr-2" />
                            <div className="flex items-center">
                              <span className="text-xs text-gray-400 mr-2">DR:</span>
                              <span className="text-sm font-bold text-[#bff747]">
                                {website.metrics?.dr || 'N/A'}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Ahrefs Traffic - Logo -> Traffic -> Value */}
                        {tableSettings.ahrefsTraffic && (
                          <div className="flex items-center bg-[#252525] rounded-md border border-[#bff747]/10 px-3 py-1.5 min-w-[140px] hover:border-[#bff747]/20 transition-all">
                            <div className="mr-2 flex items-center justify-center">
                              <img 
                                src="https://ahrefs.com/assets/esbuild/primary-light-AK6KQQMG.png" 
                                alt="Ahrefs" 
                                className="h-4 w-4 object-contain"
                              />
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs text-gray-400 mr-2">Traffic:</span>
                              <span className="text-sm font-bold text-[#bff747]">
                                {formatNumber(website.metrics?.ahrefsTraffic)}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* SEMrush Traffic - Logo -> Traffic -> Value */}
                        {tableSettings.semrushTraffic && (
                          <div className="flex items-center bg-[#252525] rounded-md border border-[#bff747]/10 px-3 py-1.5 min-w-[140px] hover:border-[#bff747]/20 transition-all">
                            <div className="mr-2 flex items-center justify-center">
                              <img 
                                src="https://prowly-prod.s3.eu-west-1.amazonaws.com/uploads/60169/assets/601039/large-76a270657e9a0d62548da88a48ae0042.png" 
                                alt="SEMrush" 
                                className="h-4 w-4 object-contain"
                              />
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs text-gray-400 mr-2">Traffic:</span>
                              <span className="text-sm font-bold text-[#bff747]">
                                {formatNumber(website.metrics?.semrushTraffic)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WebsiteList;