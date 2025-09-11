import React, { useState, useRef, useEffect } from 'react';
import { 
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminHeader = ({ setSidebarOpen, user, notifications }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // Only show unread notifications if user is authenticated
  const unreadNotifications = isAuthenticated() ? notifications.filter(n => !n.isRead) : [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type) => {
    const iconClass = "h-8 w-8 rounded-full flex items-center justify-center text-white text-sm";
    
    switch (type) {
      case 'user_registration':
        return <div className={`${iconClass} bg-green-500`}>👤</div>;
      case 'website_submission':
        return <div className={`${iconClass} bg-blue-500`}>🌐</div>;
      case 'order_dispute':
        return <div className={`${iconClass} bg-red-500`}>⚠️</div>;
      case 'withdrawal_request':
        return <div className={`${iconClass} bg-yellow-500`}>💰</div>;
      case 'support_ticket':
        return <div className={`${iconClass} bg-purple-500`}>🎫</div>;
      case 'illegal_activity_detected':
        return <div className={`${iconClass} bg-red-600`}>🚨</div>;
      default:
        return <div className={`${iconClass} bg-gray-500`}>📄</div>;
    }
  };

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow border-b border-gray-200">
      {/* Mobile menu button */}
      <button
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Search bar */}
      <div className="flex-1 px-4 flex justify-between items-center">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search users, orders, websites..."
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Right side - Notifications and User menu */}
        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          {/* Notifications - only show if user is authenticated */}
          {isAuthenticated() && (
            <div className="relative" ref={notificationRef}>
              <button
                className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <BellIcon className="h-6 w-6" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}
                  </span>
                )}
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-200">
                      Notifications
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((notification) => (
                          <div
                            key={notification._id}
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                              !notification.isRead ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatNotificationTime(notification.createdAt)}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="flex-shrink-0">
                                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 10 && (
                      <div className="px-4 py-2 text-center border-t border-gray-200">
                        <button className="text-sm text-blue-600 hover:text-blue-500">
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User menu - only show if user is authenticated */}
          {isAuthenticated() && (
            <div className="relative" ref={userMenuRef}>
              <button
                className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="sr-only">Open user menu</span>
                <div className="flex items-center space-x-3 px-3 py-2">
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role}
                    </p>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </div>
              </button>

              {/* User dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/admin/settings');
                      }}
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-3" />
                      Settings
                    </button>
                    
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;