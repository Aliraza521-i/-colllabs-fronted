import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  // Load notifications
  const loadNotifications = async (params = {}) => {
    // Only load notifications if user is authenticated
    if (!isAuthenticated()) {
      return { notifications: [], pagination: {} };
    }
    
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications(params);
      setNotifications(response.data.notifications || []);
      return response.data;
    } catch (err) {
      // Only set error if it's not a 401 (which means user is not authenticated)
      if (err.response?.status !== 401) {
        setError(err.message || 'Failed to load notifications');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load unread count
  const loadUnreadCount = async () => {
    // Only load unread count if user is authenticated
    if (!isAuthenticated()) {
      setUnreadCount(0);
      return 0;
    }
    
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.count || 0);
      return response.data.count;
    } catch (err) {
      // Only log error if it's not a 401 (which means user is not authenticated)
      if (err.response?.status !== 401) {
        console.error('Failed to load unread count:', err);
      }
      setUnreadCount(0);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    // Only mark as read if user is authenticated
    if (!isAuthenticated()) return;
    
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, status: 'read' }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      // Only set error if it's not a 401 (which means user is not authenticated)
      if (err.response?.status !== 401) {
        setError(err.message || 'Failed to mark notification as read');
      }
      throw err;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    // Only mark all as read if user is authenticated
    if (!isAuthenticated()) return;
    
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, status: 'read' }))
      );
      setUnreadCount(0);
    } catch (err) {
      // Only set error if it's not a 401 (which means user is not authenticated)
      if (err.response?.status !== 401) {
        setError(err.message || 'Failed to mark all notifications as read');
      }
      throw err;
    }
  };

  // Archive notification
  const archiveNotification = async (notificationId) => {
    // Only archive if user is authenticated
    if (!isAuthenticated()) return;
    
    try {
      await notificationAPI.archiveNotification(notificationId);
      setNotifications(prev => 
        prev.filter(notification => notification._id !== notificationId)
      );
    } catch (err) {
      // Only set error if it's not a 401 (which means user is not authenticated)
      if (err.response?.status !== 401) {
        setError(err.message || 'Failed to archive notification');
      }
      throw err;
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    // Only delete if user is authenticated
    if (!isAuthenticated()) return;
    
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications(prev => 
        prev.filter(notification => notification._id !== notificationId)
      );
      // If it was unread, decrease the unread count
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && notification.status === 'unread') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      // Only set error if it's not a 401 (which means user is not authenticated)
      if (err.response?.status !== 401) {
        setError(err.message || 'Failed to delete notification');
      }
      throw err;
    }
  };

  // Load user preferences
  const loadPreferences = async () => {
    // Only load preferences if user is authenticated
    if (!isAuthenticated()) {
      setPreferences(null);
      return null;
    }
    
    try {
      console.log('Loading notification preferences...');
      const response = await notificationAPI.getPreferences();
      console.log('Preferences loaded successfully:', response.data);
      setPreferences(response.data.preferences);
      return response.data.preferences;
    } catch (err) {
      // Only log error if it's not a 401 (which means user is not authenticated)
      if (err.response?.status !== 401) {
        console.error('Failed to load preferences:', err);
        console.error('Error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            headers: err.config?.headers
          }
        });
        // Set default preferences in case of error
        const defaultPreferences = {
          email: { enabled: true, frequency: 'immediate' },
          sms: { enabled: false, frequency: 'immediate' },          
          push: { enabled: true, frequency: 'immediate' },
          inApp: { enabled: true, showBadge: true },
          categories: {
            orders: true,
            payments: true,
            websites: true,
            messages: true,
            support: true,
            system: true,
          },
          doNotDisturb: {
            enabled: false,
            startTime: '22:00',
            endTime: '08:00'
          },
          timezone: 'UTC'
        };
        setPreferences(defaultPreferences);
        return defaultPreferences;
      }
      setPreferences(null);
      return null;
    }
  };

  // Update user preferences
  const updatePreferences = async (preferencesData) => {
    // Only update preferences if user is authenticated
    if (!isAuthenticated()) return null;
    
    try {
      const response = await notificationAPI.updatePreferences(preferencesData);
      setPreferences(response.data.preferences);
      return response.data.preferences;
    } catch (err) {
      // Only set error if it's not a 401 (which means user is not authenticated)
      if (err.response?.status !== 401) {
        setError(err.message || 'Failed to update preferences');
      }
      throw err;
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Connect to socket
  useEffect(() => {
    let socketInstance;

    if (isAuthenticated() && token) {
      // Use import.meta.env instead of process.env for Vite
      let serverUrl = 'http://localhost:3000';
      
      try {
        // Check if import.meta.env is available (more compatible approach)
        if (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
          const baseUrl = import.meta.env.VITE_API_BASE_URL;
          serverUrl = baseUrl.replace('/api/v1', '') || serverUrl;
        }
      } catch (error) {
        console.warn('Could not access environment variables, using default URL:', error);
      }
      
      socketInstance = io(serverUrl, {
        auth: {
          token: token
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      });

      socketInstance.on('connect', () => {
        console.log('✅ Connected to notification server');
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('❌ Disconnected from notification server:', reason);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('❌ Notification connection error:', error);
      });

      // Handle new notifications
      socketInstance.on('new_notification', (notification) => {
        console.log('Received new notification:', notification);
        // Add the new notification to the beginning of the list
        setNotifications(prev => [notification, ...prev]);
        // Increase unread count
        setUnreadCount(prev => prev + 1);
      });

      setSocket(socketInstance);
    } else {
      // Reset state when user is not authenticated
      setUnreadCount(0);
      setPreferences(null);
      setNotifications([]);
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [isAuthenticated, token]); // Remove socket from dependencies

  // Load initial data only if user is authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      loadUnreadCount();
      loadPreferences();
    } else {
      // Reset state when user is not authenticated
      setUnreadCount(0);
      setPreferences(null);
      setNotifications([]);
    }
  }, [isAuthenticated]);

  const value = {
    // State
    notifications,
    unreadCount,
    preferences,
    loading,
    error,
    
    // Actions
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    loadPreferences,
    updatePreferences,
    clearError
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};