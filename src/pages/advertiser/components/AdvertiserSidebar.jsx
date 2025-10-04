import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  HeartIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  FolderIcon,
  // Removed StarIcon for campaigns since that component was removed
  DocumentCheckIcon
} from '@heroicons/react/24/outline';

const AdvertiserSidebar = ({ open, setOpen, walletBalance }) => {
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/advertiser',
      icon: HomeIcon,
      end: true
    },
    {
      name: 'Browse Websites',
      href: '/advertiser/browse',
      icon: GlobeAltIcon,
    },
    {
      name: 'My Orders',
      href: '/advertiser/orders',
      icon: DocumentTextIcon,
    },
    {
      name: 'Shopping Cart',
      href: '/advertiser/cart',
      icon: ShoppingCartIcon,
    },
    {
      name: 'Messages',
      href: '/advertiser/messages',
      icon: ChatBubbleLeftRightIcon,
    },
    // Added My Projects navigation item
    {
      name: 'My Projects',
      href: '/advertiser/projects',
      icon: FolderIcon,
    },


    {
      name: 'Wallet',
      href: '/advertiser/wallet',
      icon: CurrencyDollarIcon,
    }
  ];

  const isActivePath = (href, end = false) => {
    if (end) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(balance || 0);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-[#0c0c0c] border-r border-[#bff747]/30 pt-5 pb-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-[#bff747] rounded-lg flex items-center justify-center">
                    <span className="text-[#0c0c0c] font-bold text-sm">GP</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-semibold text-[#bff747]">
                    Advertiser Panel
                  </h2>
                </div>
              </div>
            </div>

            {/* Wallet Balance Card */}
            <div className="mx-4 mt-6 p-4 bg-[#1a1a1a] border border-[#bff747]/30 rounded-lg text-[#bff747]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Wallet Balance</p>
                  <p className="text-xl font-bold">{formatBalance(walletBalance)}</p>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 opacity-80 text-[#bff747]" />
              </div>
              <NavLink
                to="/advertiser/wallet"
                className="mt-2 inline-flex items-center text-sm text-[#0c0c0c] bg-[#bff747] px-3 py-1 rounded-md hover:bg-[#a8e035] transition-colors"
              >
                Manage Funds
              </NavLink>
            </div>

            {/* Navigation */}
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = isActivePath(item.href, item.end);
                // Safety check for icon component
                const IconComponent = item.icon && typeof item.icon === 'function' ? item.icon : HomeIcon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-3 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-[#bff747] text-[#0c0c0c]'
                        : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bff747]'
                    }`}
                  >
                    <IconComponent
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive ? 'text-[#0c0c0c]' : 'text-gray-400 group-hover:text-[#bff747]'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span>{item.name}</span>
                      </div>
                      {item.description && (
                        <p className={`text-xs mt-1 leading-tight ${isActive ? 'text-[#0c0c0c]/80' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </NavLink>
                );
              })}
            </nav>

            {/* Quick Actions - Removed Place New Order button */}
            <div className="flex-shrink-0 flex border-t border-[#bff747]/30 p-4">
              <div className="w-full">
                <NavLink
                  to="/advertiser/browse"
                  className="w-full flex items-center justify-center px-4 py-2 bg-[#bff747] text-[#0c0c0c] text-sm font-medium rounded-md hover:bg-[#a8e035] transition-colors"
                >
                  <ShoppingCartIcon className="h-4 w-4 mr-2 text-[#0c0c0c]" />
                  Browse Websites
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-30 w-64 bg-[#0c0c0c] transform transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile header */}
          <div className="flex items-center justify-between flex-shrink-0 px-4 py-4 border-b border-[#bff747]/30">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#bff747] rounded-lg flex items-center justify-center">
                <span className="text-[#0c0c0c] font-bold text-sm">GP</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-[#bff747]">Advertiser</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-md text-[#bff747] hover:text-[#a8e035] hover:bg-[#1a1a1a]"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile wallet balance */}
          <div className="mx-4 my-4 p-4 bg-[#1a1a1a] border border-[#bff747]/30 rounded-lg text-[#bff747]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Wallet Balance</p>
                <p className="text-lg font-bold">{formatBalance(walletBalance)}</p>
              </div>
              <CurrencyDollarIcon className="h-6 w-6 opacity-80 text-[#bff747]" />
            </div>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = isActivePath(item.href, item.end);
              // Safety check for icon component
              const IconComponent = item.icon && typeof item.icon === 'function' ? item.icon : HomeIcon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center px-2 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-[#bff747] text-[#0c0c0c]'
                      : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-[#bff747]'
                  }`}
                >
                  <IconComponent
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? 'text-[#0c0c0c]' : 'text-gray-400 group-hover:text-[#bff747]'
                    }`}
                  />
                  <div className="flex-1">
                    <span>{item.name}</span>
                    {item.description && (
                      <p className={`text-xs mt-1 ${isActive ? 'text-[#0c0c0c]/80' : 'text-gray-500'}`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </NavLink>
              );
            })}
          </nav>

          {/* Mobile quick action - Removed Place New Order button */}
          <div className="p-4 border-t border-[#bff747]/30">
            <NavLink
              to="/advertiser/browse"
              onClick={() => setOpen(false)}
              className="w-full flex items-center justify-center px-4 py-2 bg-[#bff747] text-[#0c0c0c] text-sm font-medium rounded-md hover:bg-[#a8e035] transition-colors"
            >
              <ShoppingCartIcon className="h-4 w-4 mr-2 text-[#0c0c0c]" />
              Browse Websites
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdvertiserSidebar;