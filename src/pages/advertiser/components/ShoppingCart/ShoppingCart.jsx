import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, ShoppingBagIcon, CheckCircleIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../../../contexts/CartContext';
// import { useCart } from '../../../contexts/CartContext';
import PublisherWriteArticleModal from './PublisherWriteArticleModal';
import { websiteAPI, orderAPI } from '../../../../services/api';

const ShoppingCart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateItemArticleStatus, updateItemPaymentStatus, updateItemOptions, clearCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [websiteData, setWebsiteData] = useState({});
  const [accountBalance, setAccountBalance] = useState(1000); // Mock account balance
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch website data for all items in the cart
  useEffect(() => {
    const fetchWebsiteData = async () => {
      if (cart.items && cart.items.length > 0) {
        try {
          const newData = {};
          
          // Fetch data for each website in the cart
          for (const item of cart.items) {
            try {
              const response = await websiteAPI.getWebsiteDetails(item.id);
              if (response.data?.data) {
                newData[item.id] = {
                  copywritingPrice: response.data.data.copywritingPrice || 0,
                  homepageAnnouncementPrice: response.data.data.homepageAnnouncementPrice || 0,
                  sensitiveContentExtraCharge: response.data.data.sensitiveContentExtraCharge || 0
                };
              } else {
                // Fallback data
                newData[item.id] = {
                  copywritingPrice: 0,
                  homepageAnnouncementPrice: 0,
                  sensitiveContentExtraCharge: 0
                };
              }
            } catch (error) {
              console.error(`Error fetching data for website ${item.id}:`, error);
              // Fallback data
              newData[item.id] = {
                copywritingPrice: 0,
                homepageAnnouncementPrice: 0,
                sensitiveContentExtraCharge: 0
              };
            }
          }
          
          setWebsiteData(newData);
        } catch (error) {
          console.error('Error fetching website data:', error);
        }
      }
    };

    fetchWebsiteData();
  }, [cart.items]);

  // Update cart items with website data when websiteData changes
  useEffect(() => {
    if (Object.keys(websiteData).length > 0) {
      cart.items.forEach(item => {
        const websitePrices = websiteData[item.id];
        if (websitePrices) {
          // Update the item with website pricing data if not already present
          if (item.copywritingPrice === undefined) {
            updateItemOptions(item.id, {
              copywritingPrice: websitePrices.copywritingPrice,
              homepageAnnouncementPrice: websitePrices.homepageAnnouncementPrice,
              sensitiveContentExtraCharge: websitePrices.sensitiveContentExtraCharge,
              sensitiveTopic: item.sensitiveTopic || false,
              homepageAnnouncement: item.homepageAnnouncement || false
            });
          }
        }
      });
    }
  }, [websiteData, cart.items, updateItemOptions]);

  // Safely calculate subtotal
  const calculateSubtotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + (item.price || 0), 0);
  };

  // Calculate sensitive topic total
  const calculateSensitiveTopicTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      if (item.sensitiveTopic && item.sensitiveContentExtraCharge) {
        return total + item.sensitiveContentExtraCharge;
      }
      return total;
    }, 0);
  };

  // Calculate homepage announcement total
  const calculateHomepageAnnouncementTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      if (item.homepageAnnouncement && item.homepageAnnouncementPrice) {
        return total + item.homepageAnnouncementPrice;
      }
      return total;
    }, 0);
  };

  // Calculate copywriting total
  const calculateCopywritingTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      if (item.articleType === 'publisher' && item.copywritingPrice) {
        return total + item.copywritingPrice;
      }
      return total;
    }, 0);
  };

  // Calculate total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const sensitiveTopicTotal = calculateSensitiveTopicTotal();
    const homepageAnnouncementTotal = calculateHomepageAnnouncementTotal();
    const copywritingTotal = calculateCopywritingTotal();
    return subtotal + sensitiveTopicTotal + homepageAnnouncementTotal + copywritingTotal;
  };

  const handleCheckout = () => {
    // In a real app, this would navigate to checkout or payment page
    alert('Proceeding to checkout!');
    // Update payment status for all items
    cart.items.forEach(item => {
      updateItemPaymentStatus(item.id, true);
    });
    navigate('/advertiser/orders');
  };

  const handleUseAccountBalance = async () => {
    const total = calculateTotal();
    if (accountBalance < total) {
      alert('Insufficient account balance!');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Prepare cart data for the API
      const cartData = {
        cartItems: cart.items.map(item => {
          // Ensure all required fields are present
          const preparedItem = {
            ...item,
            id: item.id, // Website ID
            copywritingPrice: item.copywritingPrice || 0,
            homepageAnnouncementPrice: item.homepageAnnouncementPrice || 0,
            sensitiveContentExtraCharge: item.sensitiveContentExtraCharge || 0,
            // Add required fields for order validation
            targetUrl: item.targetUrl || 'https://example.com',
            anchorText: item.anchorText || 'Example Anchor Text',
            articleRequirements: item.articleRequirements || '',
            // Include article data if it exists
            articleData: item.articleData || null
          };
          
          return preparedItem;
        })
      };

      // Call the new API endpoint to process orders with balance deduction
      const response = await orderAPI.processOrderWithBalance(cartData);
      
      if (response.data && response.data.ok) {
        // Success - clear cart and show success message
        clearCart();
        alert(`Payment of $${total.toFixed(2)} completed successfully! New balance: $${response.data.data.newBalance.toFixed(2)}`);
        navigate('/advertiser/orders');
      } else {
        alert('Failed to process payment: ' + (response.data?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('There was an error processing your payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeposit = () => {
    // Logic for depositing funds
    // alert('Redirecting to deposit page!');
    // Navigate to deposit page (you can adjust this route as needed)
    navigate('/advertiser/deposit');
  };

  const handleContinueBrowsing = () => {
    navigate('/advertiser/browse');
  };

  // Function for "Want publisher to write Article" button
  const handlePublisherWriteArticle = (item) => {
    // Check if copywriting price exists before allowing publisher to write article
    const websitePrices = websiteData[item.id];
    if (websitePrices && websitePrices.copywritingPrice > 0) {
      setSelectedItem(item);
      setIsModalOpen(true);
    } else {
      alert('Publisher has not set a copywriting price for this website.');
    }
  };

  // Function for "Write my own article" button
  const handleWriteOwnArticle = (item) => {
    // Navigate to write own article page with item data
    navigate(`/advertiser/write-own-article/${item.id}`, { state: { item } });
  };

  // Function for "View Article" button
  const handleViewArticle = (item) => {
    if (item.articleType === 'own') {
      // Navigate to view own article
      navigate(`/advertiser/write-own-article/${item.id}`, { state: { item, readOnly: true } });
    } else {
      // For publisher articles, show the existing modal
      setSelectedItem(item);
      setIsModalOpen(true);
    }
  };

  // Function for "Edit Article" button
  const handleEditArticle = (item) => {
    if (item.articleType === 'own') {
      // Navigate to edit own article
      navigate(`/advertiser/write-own-article/${item.id}`, { state: { item, readOnly: false } });
    } else {
      // For publisher articles, show the existing modal
      setSelectedItem(item);
      setIsModalOpen(true);
    }
  };

  // Handle sensitive topic checkbox change
  const handleSensitiveTopicChange = (itemId, checked) => {
    const websitePrices = websiteData[itemId];
    if (websitePrices && websitePrices.sensitiveContentExtraCharge > 0) {
      updateItemOptions(itemId, { sensitiveTopic: checked });
    } else {
      alert('No sensitive content extra charge set by publisher.');
    }
  };

  // Handle homepage announcement checkbox change
  const handleHomepageAnnouncementChange = (itemId, checked) => {
    const websitePrices = websiteData[itemId];
    if (websitePrices && websitePrices.homepageAnnouncementPrice > 0) {
      updateItemOptions(itemId, { homepageAnnouncement: checked });
    } else {
      alert('No homepage announcement price set by publisher.');
    }
  };

  // Handle form submission from the modal
  const handleModalSubmit = async (data) => {
    console.log('Publisher write article request:', data);
    try {
      // The modal already saves the article data, so we just need to update the UI
      if (selectedItem) {
        updateItemArticleStatus(selectedItem.id, 'publisher');
      }
      alert('Request submitted successfully! The publisher will write your article.');
    } catch (error) {
      console.error('Error handling modal submission:', error);
      alert('There was an error submitting your request. Please try again.');
    }
  };

  // Safely get cart items
  const cartItems = cart && cart.items ? cart.items : [];

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <ShoppingBagIcon className="h-8 w-8 text-[#bff747] mr-3" />
          <h1 className="text-3xl font-bold text-[#bff747]">Shopping Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-[#1a1a1a] rounded-lg border border-[#bff747]/30 p-12 text-center">
            <ShoppingBagIcon className="mx-auto h-16 w-16 text-[#bff747]/30 mb-4" />
            <h3 className="text-xl font-medium text-[#bff747] mb-2">Your cart is empty</h3>
            <p className="text-gray-400 mb-6">Looks like you haven't added any websites to your cart yet.</p>
            <button
              onClick={handleContinueBrowsing}
              className="px-6 py-3 bg-[#bff747] text-[#0c0c0c] font-medium rounded-lg hover:bg-[#a8e035] transition-colors"
            >
              Browse Websites
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-[#1a1a1a] rounded-lg border border-[#bff747]/30 overflow-hidden">
                <div className="border-b border-[#bff747]/30 p-4">
                  <h2 className="text-xl font-semibold text-[#bff747]">
                    Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                  </h2>
                </div>
                
                <div className="divide-y divide-[#bff747]/20">
                  {cartItems.map((item) => {
                    const websitePrices = websiteData[item.id] || {};
                    const showCopywritingOption = websitePrices.copywritingPrice > 0;
                    
                    return (
                      <div key={item.id} className="p-4 flex flex-col sm:flex-row">
                        <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
                          <img 
                            src={item.image} 
                            alt={item.websiteName} 
                            className="w-20 h-20 rounded-lg object-cover border border-[#bff747]/20"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/100x100?text=No+Image';
                            }}
                          />
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium text-white">{item.websiteName}</h3>
                              {/* Added advertising requirements display as requested */}
                              {item.advertisingRequirements && (
                                <p className="text-sm text-gray-400 mt-1">
                                  Requirements: {item.advertisingRequirements}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-col items-end">
                              <span className="text-lg font-semibold text-[#bff747]">${item.price || 0}</span>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="mt-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Remove from cart"
                              >
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Article options checkboxes for sensitive topic and homepage announcement */}
                          <div className="mt-3 space-y-2">
                            {websitePrices.sensitiveContentExtraCharge > 0 && (
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`sensitive-${item.id}`}
                                  checked={item.sensitiveTopic || false}
                                  onChange={(e) => handleSensitiveTopicChange(item.id, e.target.checked)}
                                  className="mr-2 h-4 w-4 text-[#bff747] rounded"
                                />
                                <label htmlFor={`sensitive-${item.id}`} className="text-sm text-gray-300">
                                  Sensitive Content (+${websitePrices.sensitiveContentExtraCharge})
                                </label>
                              </div>
                            )}
                            
                            {websitePrices.homepageAnnouncementPrice > 0 && (
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`homepage-${item.id}`}
                                  checked={item.homepageAnnouncement || false}
                                  onChange={(e) => handleHomepageAnnouncementChange(item.id, e.target.checked)}
                                  className="mr-2 h-4 w-4 text-[#bff747] rounded"
                                />
                                <label htmlFor={`homepage-${item.id}`} className="text-sm text-gray-300">
                                  Homepage Announcement (+${websitePrices.homepageAnnouncementPrice})
                                </label>
                              </div>
                            )}
                          </div>
                          
                          {/* Show article status if submitted */}
                          {item.articleSubmitted && (
                            <div className="mt-2 flex items-center text-sm text-[#bff747]">
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              <span>
                                {item.articleType === 'publisher' 
                                  ? 'Publisher will write article' 
                                  : 'You have provided your own article'}
                              </span>
                            </div>
                          )}
                          
                          {/* Show article buttons if not yet submitted */}
                          {!item.articleSubmitted && (
                            <div className="mt-4 flex flex-col sm:flex-row gap-2">
                              {showCopywritingOption && (
                                <button
                                  onClick={() => handlePublisherWriteArticle(item)}
                                  className="px-4 py-2 bg-[#bff747] text-[#0c0c0c] font-medium rounded-lg hover:bg-[#a8e035] transition-colors"
                                >
                                  Want publisher to write Article
                                </button>
                              )}
                              <button
                                onClick={() => handleWriteOwnArticle(item)}
                                className={`px-4 py-2 border font-medium rounded-lg transition-colors ${
                                  showCopywritingOption 
                                    ? 'border-[#bff747] text-[#bff747] hover:bg-[#bff747]/10' 
                                    : 'bg-[#bff747] text-[#0c0c0c] hover:bg-[#a8e035]'
                                }`}
                              >
                                Write my own article
                              </button>
                            </div>
                          )}
                          
                          {/* Show view and edit buttons if article is submitted */}
                          {item.articleSubmitted && (
                            <div className="mt-3 flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={() => handleViewArticle(item)}
                                className="px-3 py-1.5 bg-[#1a1a1a] border border-[#bff747]/30 text-[#bff747] font-medium rounded-lg hover:bg-[#bff747]/10 transition-colors flex items-center"
                              >
                                <EyeIcon className="h-4 w-4 mr-1" />
                                View
                              </button>
                              <button
                                onClick={() => handleEditArticle(item)}
                                className="px-3 py-1.5 bg-[#1a1a1a] border border-[#bff747]/30 text-[#bff747] font-medium rounded-lg hover:bg-[#bff747]/10 transition-colors flex items-center"
                              >
                                <PencilIcon className="h-4 w-4 mr-1" />
                                Edit
                              </button>
                            </div>
                          )}
                          
                          {/* Show sensitive topic and homepage announcement price displays */}
                          <div className="mt-2 text-sm text-gray-400">
                            {item.sensitiveTopic && websitePrices.sensitiveContentExtraCharge > 0 && (
                              <div>Sensitive Content: +${websitePrices.sensitiveContentExtraCharge}</div>
                            )}
                            {item.homepageAnnouncement && websitePrices.homepageAnnouncementPrice > 0 && (
                              <div>Homepage Announcement: +${websitePrices.homepageAnnouncementPrice}</div>
                            )}
                            {item.articleType === 'publisher' && websitePrices.copywritingPrice > 0 && (
                              <div>Copywriting: +${websitePrices.copywritingPrice}</div>
                            )}
                          </div>
                          
                          {/* Show payment status if article is submitted but payment not completed */}
                          {item.articleSubmitted && !item.paymentCompleted && (
                            <div className="mt-2 text-sm text-yellow-500">
                              Payment pending - Complete checkout to submit order to publisher
                            </div>
                          )}
                          
                          {/* Show order submitted status if both article and payment are completed */}
                          {item.articleSubmitted && item.paymentCompleted && (
                            <div className="mt-2 text-sm text-[#bff747]">
                              Order submitted to publisher
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div>
              <div className="bg-[#1a1a1a] rounded-lg border border-[#bff747]/30 p-6 sticky top-6">
                <h2 className="text-xl font-semibold text-[#bff747] mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  
                  {calculateSensitiveTopicTotal() > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sensitive Content</span>
                      <span className="text-white">${calculateSensitiveTopicTotal().toFixed(2)}</span>
                    </div>
                  )}
                  
                  {calculateHomepageAnnouncementTotal() > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Homepage Announcement</span>
                      <span className="text-white">${calculateHomepageAnnouncementTotal().toFixed(2)}</span>
                    </div>
                  )}
                  
                  {calculateCopywritingTotal() > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Copywriting</span>
                      <span className="text-white">${calculateCopywritingTotal().toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-[#bff747]/30 pt-4 flex justify-between">
                    <span className="text-lg font-medium text-white">Total</span>
                    <span className="text-xl font-bold text-[#bff747]">${calculateTotal().toFixed(2)}</span>
                  </div>
                  
                  {/* Account Balance Display */}
                  <div className="border-t border-[#bff747]/30 pt-4 flex justify-between">
                    <span className="text-gray-400">Account Balance</span>
                    <span className="text-white">${accountBalance.toFixed(2)}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleUseAccountBalance}
                  disabled={isProcessing}
                  className="w-full py-3 bg-[#bff747] text-[#0c0c0c] font-medium rounded-lg hover:bg-[#a8e035] transition-colors mb-4 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Use Account Balance'}
                </button>
                
                <button
                  onClick={handleDeposit}
                  className="w-full py-3 bg-transparent text-[#bff747] border border-[#bff747] font-medium rounded-lg hover:bg-[#bff747]/10 transition-colors"
                >
                  Deposit
                </button>
              </div>
              
              <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h3 className="font-medium text-blue-400 mb-2">Secure Checkout</h3>
                <p className="text-sm text-blue-300">
                  Your payment information is encrypted and secure. We protect your financial data with industry-standard security measures.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Publisher Write Article Modal */}
      <PublisherWriteArticleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default ShoppingCart;