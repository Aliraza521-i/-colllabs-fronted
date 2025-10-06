import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  UsersIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const AdminSidebar = ({ open, setOpen, notifications }) => {
  const location = useLocation();

  // Filter notifications by type only if notifications array exists
  const getNotificationCount = (type) => {
    if (!notifications || !Array.isArray(notifications)) return 0;
    return notifications.filter(n => n.type === type).length;
  };

  const getUnreadCount = () => {
    if (!notifications || !Array.isArray(notifications)) return 0;
    return notifications.filter(n => !n.isRead).length;
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: HomeIcon,
      end: true
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: UsersIcon,
      badge: getNotificationCount('user_registration')
    },
    {
      name: 'Website Approval',
      href: '/admin/websites',
      icon: GlobeAltIcon,
      badge: getNotificationCount('website_submission')
    },
    {
      name: 'All Websites',
      href: '/admin/all-websites',
      icon: GlobeAltIcon,
      badge: 0
    },
    {
      name: 'Website Metrics',
      href: '/admin/website-metrics',
      icon: ChartBarIcon,
      badge: 0
    },
    {
      name: 'Order Management',
      href: '/admin/orders',
      icon: DocumentTextIcon,
      badge: getNotificationCount('order_dispute')
    },
    {
      name: 'Financial Management',
      href: '/admin/finance',
      icon: CurrencyDollarIcon,
      badge: getNotificationCount('withdrawal_request')
    },
    {
      name: 'Chats',
      href: '/admin/chats',
      icon: ChatBubbleLeftRightIcon,
      badge: getNotificationCount('illegal_activity_detected')
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: ChartBarIcon
    },
    
    {
      name: 'System Settings',
      href: '/admin/settings',
      icon: CogIcon
    }
  ];

  const isActivePath = (href, end = false) => {
    if (end) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">GP</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Guest Post Admin
                  </h2>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = isActivePath(item.href, item.end);
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    <span className="flex-1">{item.name}</span>
                    {item.badge > 0 && (
                      <span className="ml-3 inline-block py-0.5 px-2 text-xs rounded-full bg-red-100 text-red-800">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Notifications Summary - only show if notifications exist */}
            {notifications && Array.isArray(notifications) && (
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <BellIcon className="h-5 w-5 text-gray-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">
                      {notifications.length} Notifications
                    </p>
                    <p className="text-xs text-gray-500">
                      {getUnreadCount()} unread
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-30 w-64 bg-white transform transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile header */}
          <div className="flex items-center justify-between flex-shrink-0 px-4 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GP</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">Admin</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = isActivePath(item.href, item.end);
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.badge > 0 && (
                    <span className="ml-3 inline-block py-0.5 px-2 text-xs rounded-full bg-red-100 text-red-800">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;