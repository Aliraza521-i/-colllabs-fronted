import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  BellIcon, 
  XMarkIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
  const { 
    notifications, 
    unreadCount, 
    loadNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotification();
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Only load notifications if user is authenticated and dropdown is open
    if (isOpen && isAuthenticated()) {
      loadNotifications({ limit: 10 });
    }
  }, [isOpen, loadNotifications, isAuthenticated]);

  const handleMarkAllAsRead = async () => {
    // Only mark all as read if user is authenticated
    if (!isAuthenticated()) return;
    
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    // Only mark as read if user is authenticated
    if (!isAuthenticated()) return;
    
    try {
      await markAsRead(notificationId);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read first
    if (notification.status === 'unread') {
      await handleMarkAsRead(notification._id);
    }
    
    // Navigate based on notification type and user role
    if (notification.type === 'message_received' && notification.data?.chatId) {
      // Check user role and navigate accordingly
      if (user && user.role === 'publisher') {
        // Publishers should go to their messages page with chatId as a query parameter
        navigate(`/publisher/messages?chatId=${notification.data.chatId}`);
      } else if (user && user.role === 'advertiser') {
        // Advertisers go to their messages page with chatId as a query parameter
        navigate(`/advertiser/messages?chatId=${notification.data.chatId}`);
      } else if (user && user.role === 'admin') {
        // Admins go to admin chat page with chatId as a route parameter
        navigate(`/admin/chat/${notification.data.chatId}`);
      } else {
        // Default fallback with chatId as a query parameter
        navigate(`/chat?chatId=${notification.data.chatId}`);
      }
    } else if (notification.actionUrl) {
      // Navigate to the action URL if provided
      navigate(notification.actionUrl);
    }
    
    // Close the dropdown
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    const iconClass = "h-5 w-5";
    
    switch (type) {
      case 'order_created':
      case 'order_approved':
      case 'order_rejected':
      case 'order_paid':
      case 'order_submitted':
      case 'order_completed':
      case 'order_disputed':
        return <DocumentTextIcon className={`${iconClass} text-blue-500`} />;
      
      case 'payment_received':
      case 'payment_failed':
      case 'escrow_released':
      case 'withdrawal_requested':
      case 'withdrawal_processed':
        return <CurrencyDollarIcon className={`${iconClass} text-green-500`} />;
      
      case 'message_received':
        return <ChatBubbleLeftRightIcon className={`${iconClass} text-purple-500`} />;
      
      case 'website_approved':
      case 'website_rejected':
        return <GlobeAltIcon className={`${iconClass} text-indigo-500`} />;
      
      case 'support_ticket_created':
      case 'support_ticket_updated':
        return <ChatBubbleLeftRightIcon className={`${iconClass} text-yellow-500`} />;
      
      case 'user_suspended':
      case 'user_verified':
        return <ExclamationTriangleIcon className={`${iconClass} text-red-500`} />;
 
      default:
        return <InformationCircleIcon className={`${iconClass} text-gray-500`} />;
    }
  };

  const getNotificationColor = (priority) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'border-l-4 border-l-red-500';
      case 'medium':
        return 'border-l-4 border-l-yellow-500';
      default:
        return 'border-l-4 border-l-blue-500';
    }
  };

  const formatNotificationTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 md:p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
      >
        <BellIcon className="h-5 w-5 md:h-6 md:w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 bg-red-500 text-white text-[8px] md:text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 md:w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {/* Header */}
            <div className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-900 border-b border-gray-200 flex justify-between items-center">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] md:text-xs text-blue-600 hover:text-blue-500"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-64 md:max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 md:py-8 text-center text-gray-500">
                  <BellIcon className="mx-auto h-6 w-6 md:h-8 md:w-8 text-gray-300" />
                  <p className="mt-1 md:mt-2 text-xs md:text-sm">No notifications</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification._id}
                    className={`px-3 md:px-4 py-2 md:py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                      notification.status === 'unread' ? 'bg-blue-50' : ''
                    } ${getNotificationColor(notification.priority)}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-2 md:space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-[10px] md:text-sm text-gray-500 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-[8px] md:text-xs text-gray-400 mt-1">
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                      </div>
                      {notification.status === 'unread' && (
                        <div className="flex-shrink-0">
                          <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-3 md:px-4 py-2 text-center border-t border-gray-200">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  navigate('/publisher/messages');
                }}
                className="text-xs md:text-sm text-blue-600 hover:text-blue-500"
              >
                View all notifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;