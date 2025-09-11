import React, { useState, useEffect } from 'react';
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
  DocumentTextIcon,
  ArchiveBoxIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow, format } from 'date-fns';

const NotificationList = () => {
  const { 
    notifications, 
    loadNotifications, 
    markAsRead, 
    markAllAsRead, 
    archiveNotification, 
    deleteNotification,
    loading,
    error
  } = useNotification();
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState(-1);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Only load notifications if user is authenticated
    if (isAuthenticated()) {
      loadNotifications({ 
        page, 
        limit: 20, 
        status: filter !== 'all' ? filter : undefined,
        sortBy,
        sortOrder
      }).then(data => {
        if (data.pagination) {
          setTotalPages(data.pagination.pages);
        }
      });
    }
  }, [filter, sortBy, sortOrder, page, loadNotifications, isAuthenticated]);

  const handleMarkAsRead = async (notificationId) => {
    // Only mark as read if user is authenticated
    if (!isAuthenticated()) return;
    
    try {
      await markAsRead(notificationId);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    // Only mark all as read if user is authenticated
    if (!isAuthenticated()) return;
    
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleArchive = async (notificationId) => {
    // Only archive if user is authenticated
    if (!isAuthenticated()) return;
    
    try {
      await archiveNotification(notificationId);
    } catch (err) {
      console.error('Failed to archive notification:', err);
    }
  };

  const handleDelete = async (notificationId) => {
    // Only delete if user is authenticated
    if (!isAuthenticated()) return;
    
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await deleteNotification(notificationId);
      } catch (err) {
        console.error('Failed to delete notification:', err);
      }
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
    } else if (notification.type === 'illegal_activity_detected' && notification.data?.chatId) {
      // Handle illegal activity notifications - redirect admin to the chat
      if (user && user.role === 'admin') {
        navigate(`/admin/chat/${notification.data.chatId}`);
      } else {
        // For other users, redirect to their respective chat pages
        if (user && user.role === 'publisher') {
          navigate(`/publisher/chat/${notification.data.chatId}`);
        } else if (user && user.role === 'advertiser') {
          navigate(`/advertiser/chat/${notification.data.chatId}`);
        } else {
          navigate(`/chat/${notification.data.chatId}`);
        }
      }
    } else if (notification.actionUrl) {
      // Navigate to the action URL if provided
      navigate(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type) => {
    const iconClass = "h-6 w-6";
    
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
    
    case 'illegal_activity_detected':
      return <ExclamationTriangleIcon className={`${iconClass} text-red-500`} />;
    
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

  if (loading && !notifications.length) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-red-500">
          <ExclamationTriangleIcon className="h-12 w-12 mx-auto text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-red-800">Error Loading Notifications</h3>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header with filters */}
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <BellIcon className="h-5 w-5 mr-2 text-gray-500" />
          Notifications
        </h3>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
          
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Mark All Read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-200">
        {notifications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any notifications yet.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div key={notification._id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 
                      className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {notification.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {notification.status === 'unread' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Unread
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                  <div 
                    className="mt-1 text-sm text-gray-600 cursor-pointer hover:text-gray-900"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <p>{notification.message}</p>
                  </div>
                  <div className="mt-3 flex items-center space-x-4">
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Mark as read
                    </button>
                    <button
                      onClick={() => handleArchive(notification._id)}
                      className="text-sm font-medium text-gray-600 hover:text-gray-500"
                    >
                      <ArchiveBoxIcon className="h-4 w-4 inline mr-1" />
                      Archive
                    </button>
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      <TrashIcon className="h-4 w-4 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{page}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === i + 1
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationList;