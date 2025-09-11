import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  GlobeAltIcon, 
  CurrencyDollarIcon, 
  ChatBubbleLeftRightIcon,
  UserIcon,
  QuestionMarkCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigation = [
    { name: 'Dashboard', href: '/publisher/home', icon: HomeIcon },
    { name: 'My Websites', href: '/publisher/websites', icon: GlobeAltIcon },
    { name: 'Sales', href: '/publisher/sales', icon: CurrencyDollarIcon },
    { name: 'Messages', href: '/publisher/messages', icon: ChatBubbleLeftRightIcon },
    { name: 'Wallet', href: '/publisher/wallet', icon: CurrencyDollarIcon },
    { name: 'Contact', href: '/publisher/contact', icon: QuestionMarkCircleIcon },
    { name: 'Profile', href: '/publisher/profile', icon: UserIcon },
  ];

  return (
    <>
      {/* Mobile menu button - positioned absolutely within the layout */}
      <div className="lg:hidden absolute top-4 left-4 z-30">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-md text-[#bff747] hover:bg-[#1a1a1a] focus:outline-none"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div 
        className={`lg:hidden fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}></div>
        <div className="relative flex flex-col w-64 h-full bg-[#0c0c0c] border-r border-[#bff747]/30 shadow-xl">
          <div className="flex items-center justify-between h-16 bg-[#0c0c0c] border-b border-[#bff747]/30 px-4">
            <span className="text-[#bff747] font-bold text-lg">Publisher Panel</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-md text-[#bff747] hover:bg-[#1a1a1a]"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive
                      ? 'bg-[#bff747] text-[#0c0c0c]'
                      : 'text-[#bff747] hover:bg-[#bff747]/20'
                  }`}
                >
                  <item.icon className="flex-shrink-0 w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-[#0c0c0c] border-r border-[#bff747]/30 shadow-xl">
            <div className="flex items-center justify-center h-16 bg-[#0c0c0c] border-b border-[#bff747]/30">
              <span className="text-[#bff747] font-bold text-lg">Publisher Panel</span>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                      isActive
                        ? 'bg-[#bff747] text-[#0c0c0c]'
                        : 'text-[#bff747] hover:bg-[#bff747]/20'
                    }`}
                  >
                    <item.icon className="flex-shrink-0 w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;