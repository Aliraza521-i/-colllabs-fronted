import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { advertiserAPI, walletAPI } from '../../../services/api';
import {
  ShoppingCartIcon,
  PlusIcon,
  TrashIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const BulkOrderManagement = () => {
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Bulk order state
  const [bulkOrders, setBulkOrders] = useState([
    {
      id: Date.now(),
      websiteId: '',
      title: '',
      description: '',
      wordCount: 800,
      targetUrl: '',
      anchorText: '',
      keywords: [''],
      deadline: '',
      rushOrder: false
    }
  ]);
  
  const [staggeredSchedule, setStaggeredSchedule] = useState(false);
  const [scheduleInterval, setScheduleInterval] = useState('daily');
  
  // Calculate totals
  const [totalCost, setTotalCost] = useState(0);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    fetchWalletBalance();
  }, []);

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

  const addOrder = () => {
    setBulkOrders([
      ...bulkOrders,
      {
        id: Date.now() + Math.random(),
        websiteId: '',
        title: '',
        description: '',
        wordCount: 800,
        targetUrl: '',
        anchorText: '',
        keywords: [''],
        deadline: '',
        rushOrder: false
      }
    ]);
  };

  const removeOrder = (id) => {
    if (bulkOrders.length > 1) {
      setBulkOrders(bulkOrders.filter(order => order.id !== id));
    }
  };

  const updateOrder = (id, field, value) => {
    setBulkOrders(bulkOrders.map(order => 
      order.id === id ? { ...order, [field]: value } : order
    ));
  };

  const updateKeyword = (orderId, index, value) => {
    setBulkOrders(bulkOrders.map(order => {
      if (order.id === orderId) {
        const newKeywords = [...order.keywords];
        newKeywords[index] = value;
        return { ...order, keywords: newKeywords };
      }
      return order;
    }));
  };

  const addKeyword = (orderId) => {
    setBulkOrders(bulkOrders.map(order => {
      if (order.id === orderId) {
        return { ...order, keywords: [...order.keywords, ''] };
      }
      return order;
    }));
  };

  const removeKeyword = (orderId, index) => {
    setBulkOrders(bulkOrders.map(order => {
      if (order.id === orderId && order.keywords.length > 1) {
        const newKeywords = order.keywords.filter((_, i) => i !== index);
        return { ...order, keywords: newKeywords };
      }
      return order;
    }));
  };

  const calculateTotals = () => {
    // In a real implementation, this would calculate based on website pricing
    // For now, we'll use a mock calculation
    const basePricePerOrder = 50; // Mock price
    const rushFee = 25; // Mock rush fee
    const subtotal = bulkOrders.reduce((total, order) => {
      let orderTotal = basePricePerOrder;
      if (order.rushOrder) {
        orderTotal += rushFee;
      }
      return total + orderTotal;
    }, 0);
    
    // Calculate discount based on number of orders
    let discountPercentage = 0;
    if (bulkOrders.length >= 20) discountPercentage = 15;
    else if (bulkOrders.length >= 10) discountPercentage = 10;
    else if (bulkOrders.length >= 5) discountPercentage = 5;
    
    const discountAmount = (subtotal * discountPercentage) / 100;
    const total = subtotal - discountAmount;
    
    setTotalCost(total);
    setDiscount(discountAmount);
  };

  useEffect(() => {
    calculateTotals();
  }, [bulkOrders]);

  const validateOrders = () => {
    for (const order of bulkOrders) {
      if (!order.websiteId) {
        setError('Please select a website for all orders');
        return false;
      }
      if (!order.title.trim()) {
        setError('Please enter a title for all orders');
        return false;
      }
      if (!order.targetUrl.trim()) {
        setError('Please enter a target URL for all orders');
        return false;
      }
      if (!order.anchorText.trim()) {
        setError('Please enter anchor text for all orders');
        return false;
      }
      if (order.keywords.filter(k => k.trim()).length === 0) {
        setError('Please enter at least one keyword for all orders');
        return false;
      }
      if (!order.deadline) {
        setError('Please select a deadline for all orders');
        return false;
      }
    }
    return true;
  };

  const submitBulkOrders = async () => {
    if (!validateOrders()) return;
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      // Prepare order data for submission
      const orders = bulkOrders.map(order => ({
        websiteId: order.websiteId,
        title: order.title,
        description: order.description,
        contentRequirements: {
          wordCount: order.wordCount,
          keywords: order.keywords.filter(k => k.trim()),
          targetUrl: order.targetUrl,
          anchorText: order.anchorText,
          linkType: 'dofollow'
        },
        deadline: order.deadline,
        rushOrder: order.rushOrder,
        additionalServices: {
          needsCopywriting: false
        }
      }));
      
      const response = await advertiserAPI.createBulkOrders({
        orders,
        staggeredSchedule,
        scheduleInterval
      });
      
      if (response.data) {
        setSuccess(`Successfully created ${response.data.orders.length} orders!`);
        // Refresh wallet balance
        fetchWalletBalance();
        // Reset form
        setBulkOrders([
          {
            id: Date.now(),
            websiteId: '',
            title: '',
            description: '',
            wordCount: 800,
            targetUrl: '',
            anchorText: '',
            keywords: [''],
            deadline: '',
            rushOrder: false
          }
        ]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create bulk orders. Please try again.');
      console.error('Error creating bulk orders:', err);
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

  return (
    <div className="bg-[#1a1a1a] rounded-lg shadow p-6 border border-[#bff747]/30">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#bff747]">Bulk Order Management</h2>
        <button
          onClick={() => navigate('/advertiser/browse')}
          className="bg-[#bff747] hover:bg-[#a8e035] text-[#0c0c0c] font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Websites
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-md">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-500/30 rounded-md">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Orders List */}
          <div className="space-y-6">
            {bulkOrders.map((order, index) => (
              <div key={order.id} className="border border-[#bff747]/30 rounded-lg p-6 bg-[#1a1a1a]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#bff747]">Order #{index + 1}</h3>
                  {bulkOrders.length > 1 && (
                    <button
                      onClick={() => removeOrder(order.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                    <select
                      value={order.websiteId}
                      onChange={(e) => updateOrder(order.id, 'websiteId', e.target.value)}
                      className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747]"
                    >
                      <option value="" className="bg-[#0c0c0c]">Select a website</option>
                      <option value="website1" className="bg-[#0c0c0c]">techblog.com</option>
                      <option value="website2" className="bg-[#0c0c0c]">healthsite.com</option>
                      <option value="website3" className="bg-[#0c0c0c]">financeblog.com</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                    <input
                      type="text"
                      value={order.title}
                      onChange={(e) => updateOrder(order.id, 'title', e.target.value)}
                      className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-white placeholder-gray-500"
                      placeholder="Enter article title"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={order.description}
                      onChange={(e) => updateOrder(order.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-white placeholder-gray-500"
                      placeholder="Enter order description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Word Count</label>
                    <select
                      value={order.wordCount}
                      onChange={(e) => updateOrder(order.id, 'wordCount', parseInt(e.target.value))}
                      className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747]"
                    >
                      <option value={500} className="bg-[#0c0c0c]">500 words</option>
                      <option value={800} className="bg-[#0c0c0c]">800 words</option>
                      <option value={1000} className="bg-[#0c0c0c]">1000 words</option>
                      <option value={1500} className="bg-[#0c0c0c]">1500 words</option>
                      <option value={2000} className="bg-[#0c0c0c]">2000 words</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Deadline</label>
                    <input
                      type="date"
                      value={order.deadline}
                      onChange={(e) => updateOrder(order.id, 'deadline', e.target.value)}
                      className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Target URL</label>
                    <input
                      type="url"
                      value={order.targetUrl}
                      onChange={(e) => updateOrder(order.id, 'targetUrl', e.target.value)}
                      className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-white placeholder-gray-500"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Anchor Text</label>
                    <input
                      type="text"
                      value={order.anchorText}
                      onChange={(e) => updateOrder(order.id, 'anchorText', e.target.value)}
                      className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-white placeholder-gray-500"
                      placeholder="Click here"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Keywords</label>
                    <div className="space-y-2">
                      {order.keywords.map((keyword, keywordIndex) => (
                        <div key={keywordIndex} className="flex space-x-2">
                          <input
                            type="text"
                            value={keyword}
                            onChange={(e) => updateKeyword(order.id, keywordIndex, e.target.value)}
                            className="flex-1 border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-white placeholder-gray-500"
                            placeholder={`Keyword ${keywordIndex + 1}`}
                          />
                          {order.keywords.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeKeyword(order.id, keywordIndex)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addKeyword(order.id)}
                        className="text-[#bff747] hover:text-[#a8e035] text-sm font-medium"
                      >
                        + Add Keyword
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={order.rushOrder}
                        onChange={(e) => updateOrder(order.id, 'rushOrder', e.target.checked)}
                        className="rounded border-[#bff747]/30 text-[#bff747] focus:ring-[#bff747] bg-[#0c0c0c]"
                      />
                      <span className="ml-2 text-sm text-gray-300">Rush Order (+$25)</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addOrder}
              className="w-full py-3 border-2 border-dashed border-[#bff747]/30 rounded-lg text-gray-400 hover:border-[#bff747]/50 hover:text-gray-300 flex items-center justify-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Another Order
            </button>
          </div>
        </div>

        <div>
          {/* Order Summary */}
          <div className="border border-[#bff747]/30 rounded-lg p-6 mb-6 bg-[#1a1a1a]">
            <h3 className="text-lg font-semibold text-[#bff747] mb-4">Order Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Number of Orders</span>
                <span className="font-medium text-[#bff747]">{bulkOrders.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Subtotal</span>
                <span className="font-medium text-[#bff747]">{formatPrice(totalCost + discount)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              
              <div className="border-t border-[#bff747]/30 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-medium text-[#bff747]">Total</span>
                  <span className="text-lg font-bold text-[#bff747]">{formatPrice(totalCost)}</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-[#2a2a2a] rounded-md border border-[#bff747]/20">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-[#bff747] mr-2" />
                  <span className="text-sm text-gray-300">
                    Wallet Balance: {formatPrice(walletBalance)}
                  </span>
                </div>
                {totalCost > walletBalance && (
                  <p className="text-red-400 text-sm mt-2">
                    Insufficient balance. Please add funds.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Scheduling Options */}
          <div className="border border-[#bff747]/30 rounded-lg p-6 mb-6 bg-[#1a1a1a]">
            <h3 className="text-lg font-semibold text-[#bff747] mb-4">Scheduling</h3>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={staggeredSchedule}
                  onChange={(e) => setStaggeredSchedule(e.target.checked)}
                  className="rounded border-[#bff747]/30 text-[#bff747] focus:ring-[#bff747] bg-[#0c0c0c]"
                />
                <span className="ml-2 text-sm text-gray-300">Staggered Publishing Schedule</span>
              </label>
              
              {staggeredSchedule && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Interval</label>
                  <select
                    value={scheduleInterval}
                    onChange={(e) => setScheduleInterval(e.target.value)}
                    className="w-full border border-[#bff747]/30 rounded-md px-3 py-2 focus:ring-[#bff747] focus:border-[#bff747] bg-[#0c0c0c] text-[#bff747]"
                  >
                    <option value="daily" className="bg-[#0c0c0c]">Daily</option>
                    <option value="weekly" className="bg-[#0c0c0c]">Weekly</option>
                    <option value="monthly" className="bg-[#0c0c0c]">Monthly</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={submitBulkOrders}
            disabled={submitting || totalCost > walletBalance}
            className="w-full bg-[#bff747] hover:bg-[#a8e035] text-[#0c0c0c] font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 flex items-center justify-center"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#0c0c0c]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                Create Bulk Orders
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkOrderManagement;