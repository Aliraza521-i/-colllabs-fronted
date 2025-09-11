import React, { useState, useRef, useEffect } from 'react';
import { 
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdvertiserHeader = ({ setSidebarOpen, user, walletBalance, onWalletUpdate }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const userMenuRef = useRef(null);
  const walletMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (walletMenuRef.current && !walletMenuRef.current.contains(event.target)) {
        setShowWalletMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/advertiser/browse?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(balance || 0);
  };

  const getBalanceColor = (balance) => {
    if (balance < 50) return 'text-red-400';
    if (balance < 200) return 'text-yellow-400';
    return 'text-[#bff747]';
  };

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-[#0c0c0c] shadow border-b border-[#bff747]/30">
      {/* Mobile menu button */}
      <button
        className="px-4 border-r border-[#bff747]/30 text-[#bff747] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#bff747] lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Search bar and actions */}
      <div className="flex-1 px-4 flex justify-between items-center">
        {/* Search bar */}
        <div className="flex-1 max-w-lg">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border border-[#bff747]/30 rounded-md leading-5 bg-[#1a1a1a] placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#bff747] focus:border-[#bff747] sm:text-sm text-white"
                placeholder="Search websites by niche, DA, price..."
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Right side - Quick actions and User menu */}
        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          {/* Quick Order Button */}
          <button
            onClick={() => navigate('/advertiser/browse')}
            className="hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[#0c0c0c] bg-[#bff747] hover:bg-[#a8e035] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bff747]"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Order
          </button>

          {/* Wallet Balance */}
          <div className="relative" ref={walletMenuRef}>
            <button
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#bff747]"
              onClick={() => setShowWalletMenu(!showWalletMenu)}
            >
              <CurrencyDollarIcon className="h-5 w-5 text-[#bff747]" />
              <span className={`font-semibold ${getBalanceColor(walletBalance)}`}>
                {formatBalance(walletBalance)}
              </span>
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>

            {/* Wallet dropdown menu */}
            {showWalletMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#1a1a1a] rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 border border-[#bff747]/30">
                <div className="py-1">
                  <div className="px-4 py-3 border-b border-[#bff747]/30">
                    <p className="text-sm font-medium text-[#bff747]">Wallet Balance</p>
                    <p className={`text-lg font-bold ${getBalanceColor(walletBalance)}`}>
                      {formatBalance(walletBalance)}
                    </p>
                  </div>
                  
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a]"
                    onClick={() => {
                      setShowWalletMenu(false);
                      navigate('/advertiser/wallet');
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-3 text-[#bff747]" />
                    Add Funds
                  </button>
                  
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a]"
                    onClick={() => {
                      setShowWalletMenu(false);
                      navigate('/advertiser/wallet?tab=history');
                    }}
                  >
                    <CurrencyDollarIcon className="h-4 w-4 mr-3 text-[#bff747]" />
                    Transaction History
                  </button>

                  {walletBalance < 50 && (
                    <div className="px-4 py-2 bg-red-900/30 border-t border-red-500/30">
                      <p className="text-xs text-red-400">
                        ⚠️ Low balance! Add funds to place orders.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <button
            className="relative p-2 text-[#bff747] hover:text-[#a8e035] focus:outline-none focus:ring-2 focus:ring-[#bff747] focus:ring-offset-2 rounded-full"
            onClick={() => navigate('/advertiser/notifications')}
          >
            <BellIcon className="h-6 w-6" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#bff747] text-[#0c0c0c] text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bff747]"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="flex items-center space-x-3 px-3 py-2">
                <UserCircleIcon className="h-8 w-8 text-[#bff747]" />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-[#bff747]">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    Advertiser
                  </p>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-[#bff747]" />
              </div>
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 border border-[#bff747]/30">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm border-b border-[#bff747]/30">
                    <p className="font-medium text-[#bff747]">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a]"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/advertiser/profile');
                    }}
                  >
                    <UserCircleIcon className="h-4 w-4 mr-3 text-[#bff747]" />
                    Profile Settings
                  </button>
                  
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a]"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/advertiser/settings');
                    }}
                  >
                    <Cog6ToothIcon className="h-4 w-4 mr-3 text-[#bff747]" />
                    Account Settings
                  </button>
                  
                  <div className="border-t border-[#bff747]/30">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a]"
                      onClick={handleLogout}
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 text-[#bff747]" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertiserHeader;