import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCardIcon, 
  ArrowDownTrayIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const DepositPage = () => {
  const navigate = useNavigate();
  const [showCryptoPanel, setShowCryptoPanel] = useState(false);
  const [amount, setAmount] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [screenshot, setScreenshot] = useState(null);
  const [transactionId, setTransactionId] = useState('');

  // Handle timer countdown
  useEffect(() => {
    let timer;
    if (showPopup && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer expired
      setShowPopup(false);
      setTimeLeft(30 * 60);
    }
    return () => clearTimeout(timer);
  }, [showPopup, timeLeft]);

  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate commissions and total
  const paymentCommission = amount ? (parseFloat(amount) * 0.01) : 0;
  const platformCommission = amount ? (parseFloat(amount) * 0.10) : 0;
  const totalAmount = amount ? (parseFloat(amount) + paymentCommission + platformCommission) : 0;

  const handleTopUp = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    setShowPopup(true);
  };

  const handleSend = () => {
    // In a real app, this would send the data to your backend
    console.log('Sending deposit request:', { amount, totalAmount, screenshot, transactionId });
    alert('Deposit request submitted successfully!');
    setShowPopup(false);
    setTimeLeft(30 * 60);
    setAmount('');
    setScreenshot(null);
    setTransactionId('');
  };

  const handleScreenshotChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <ArrowDownTrayIcon className="h-8 w-8 text-[#bff747] mr-3" />
          <h1 className="text-3xl font-bold text-[#bff747]">Deposit Funds</h1>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg border border-[#bff747]/30 p-6">
          <h2 className="text-2xl font-semibold text-[#bff747] mb-6">Select Payment Method</h2>
          
          {/* Crypto Section */}
          <div className="mb-8">
            <div 
              className="flex items-center justify-between p-4 bg-[#2a2a2a] rounded-lg border border-[#bff747]/30 cursor-pointer hover:bg-[#3a3a3a] transition-colors"
              onClick={() => setShowCryptoPanel(!showCryptoPanel)}
            >
              <div className="flex items-center">
                <CreditCardIcon className="h-6 w-6 text-[#bff747] mr-3" />
                <span className="text-lg font-medium text-white">Crypto</span>
              </div>
              <div className={`transform transition-transform ${showCryptoPanel ? 'rotate-180' : ''}`}>
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Side Panel for Crypto */}
            {showCryptoPanel && (
              <div className="mt-4 p-6 bg-[#2a2a2a] rounded-lg border border-[#bff747]/30">
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">Enter Amount (USD)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-3 bg-[#0c0c0c] border border-[#bff747]/30 rounded-lg text-[#bff747] focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                  />
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment System Commission (1%)</span>
                    <span className="text-white">${paymentCommission.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Platform Commission (10%)</span>
                    <span className="text-white">${platformCommission.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-[#bff747]/30 pt-3 flex justify-between">
                    <span className="text-lg font-medium text-white">Total</span>
                    <span className="text-xl font-bold text-[#bff747]">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleTopUp}
                  className="w-full py-3 bg-[#bff747] text-[#0c0c0c] font-medium rounded-lg hover:bg-[#a8e035] transition-colors"
                >
                  Top Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-lg border border-[#bff747]/30 w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b border-[#bff747]/30">
              <h3 className="text-xl font-semibold text-[#bff747]">Complete Your Deposit</h3>
              <button 
                onClick={() => setShowPopup(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <ClockIcon className="h-5 w-5 text-[#bff747] mr-2" />
                <span className="text-[#bff747] font-medium">Time remaining: {formatTime(timeLeft)}</span>
              </div>
              
              <div className="mb-6 p-4 bg-[#2a2a2a] rounded-lg">
                <div className="text-center">
                  <p className="text-gray-400 mb-1">Total Top Up Price</p>
                  <p className="text-2xl font-bold text-[#bff747]">${totalAmount.toFixed(2)}</p>
                </div>
                
                {/* Add USDT (TRC20) deposit address */}
                <div className="mt-4 p-3 bg-[#0c0c0c] rounded-lg border border-[#bff747]/30">
                  <p className="text-gray-400 text-sm mb-1">USDT (TRC20) Deposit Address</p>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[#bff747]">TAqP5QKj6qnVz1zq9M4G7CYfymJ8s7AzkW</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('TAqP5QKj6qnVz1zq9M4G7CYfymJ8s7AzkW');
                        alert('Address copied to clipboard!');
                      }}
                      className="ml-2 text-xs bg-[#bff747]/10 text-[#bff747] px-2 py-1 rounded hover:bg-[#bff747]/20"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Send Screenshot</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="w-full p-3 bg-[#0c0c0c] border border-[#bff747]/30 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Put Transaction ID</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter your transaction ID"
                  className="w-full p-3 bg-[#0c0c0c] border border-[#bff747]/30 rounded-lg text-[#bff747] focus:outline-none focus:ring-2 focus:ring-[#bff747]"
                />
              </div>
              
              <button
                onClick={handleSend}
                className="w-full py-3 bg-[#bff747] text-[#0c0c0c] font-medium rounded-lg hover:bg-[#a8e035] transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositPage;